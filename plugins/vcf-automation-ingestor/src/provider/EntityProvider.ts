import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { Config } from '@backstage/config';
import { LoggerService, SchedulerService } from '@backstage/backend-plugin-api';
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  ComponentEntity,
  DomainEntity,
  ResourceEntity,
  SystemEntity,
} from '@backstage/catalog-model';
import fetch from 'node-fetch';

/**
 * Represents a resource in a VCF Automation deployment
 */
interface VcfDeploymentResource {
  id: string;
  name: string;
  type: string;
  properties: {
    [key: string]: any;
  };
  dependsOn?: string[];
  metadata: {
    [key: string]: any;
  };
  createdAt: string;
  origin: string;
  syncStatus: string;
  state: string;
}

interface VcfDeploymentLastRequest {
  id: string;
  name: string;
  requestedBy: string;
  actionId: string;
  deploymentId: string;
  resourceIds: string[];
  status: string;
  details: string;
  createdAt: string;
  updatedAt: string;
  totalTasks: number;
  completedTasks: number;
}

interface VcfDeploymentExpense {
  totalExpense: number;
  computeExpense: number;
  storageExpense: number;
  additionalExpense: number;
  unit: string;
  lastUpdatedTime: string;
}

/**
 * Represents a VCF Automation deployment
 */
interface VcfDeployment {
  id: string;
  name: string;
  ownedBy: string;
  ownerType: string;
  project: {
    id: string;
    name: string;
  };
  resources: VcfDeploymentResource[];
  status: string;
  expense: VcfDeploymentExpense;
  createdAt: string;
  createdBy: string;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
  lastRequest: VcfDeploymentLastRequest;
}

interface VcfDeploymentResponse {
  content: VcfDeployment[];
  totalPages: number;
  number: number;
}

export class VcfAutomationEntityProvider implements EntityProvider {
  private readonly config: Config;
  private readonly scheduler: SchedulerService;
  private connection?: EntityProviderConnection;
  private readonly logger: LoggerService;
  private token?: string;
  private tokenExpiry?: Date;

  constructor(config: Config, scheduler: SchedulerService, logger: LoggerService) {
    this.config = config;
    this.scheduler = scheduler;
    this.logger = logger;
    this.logger.info('VcfAutomationEntityProvider initialized');
  }

  getProviderName(): string {
    return 'vcf-automation';
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.logger.info('Connecting VcfAutomationEntityProvider');
    this.connection = connection;
    
    try {
      await this.scheduler.scheduleTask({
        id: 'refresh_vcf_automation_entities',
        frequency: { minutes: 30 },
        timeout: { minutes: 10 },
        fn: async () => {
          this.logger.info('Starting scheduled refresh of VCF Automation entities');
          await this.refresh();
        },
      });
      this.logger.info('Successfully scheduled refresh task');
      
      // Trigger an initial refresh
      await this.refresh();
    } catch (error) {
      this.logger.error('Failed to schedule refresh task', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async authenticate(): Promise<void> {
    try {
      if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
        this.logger.debug('Using existing valid token');
        return;
      }

      this.logger.debug('Authenticating with VCF Automation');
      const baseUrl = this.config.getString('vcfAutomation.baseUrl');
      const auth = this.config.getConfig('vcfAutomation.authentication');
      
      const response = await fetch(`${baseUrl}/csp/gateway/am/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: auth.getString('username'),
          password: auth.getString('password'),
          domain: auth.getString('domain'),
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed with VCF Automation with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.token = data.cspAuthToken;
      this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      this.logger.debug('Successfully authenticated with VCF Automation');
    } catch (error) {
      this.logger.error('Authentication failed with VCF Automation', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async fetchDeployments(): Promise<VcfDeployment[]> {
    try {
      await this.authenticate();
      const baseUrl = this.config.getString('vcfAutomation.baseUrl');
      const deployments: VcfDeployment[] = [];
      let page = 0;
      let hasMorePages = true;

      this.logger.info('Starting to fetch deployments from VCF Automation');

      while (hasMorePages) {
        this.logger.debug(`Fetching deployments page ${page + 1} of VCF Automation response`);
        const response = await fetch(
          `${baseUrl}/deployment/api/deployments?page=${page}&size=10&sort=createdAt%2CDESC&expand=blueprint&expand=catalog&expand=lastRequest&expand=project&expand=resources&expand=metadata&expand=user&deleted=false`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        );

        // If we get a 404, it means we've gone past the last page
        if (response.status === 404) {
          this.logger.debug(`No more pages available after page ${page} of VCF Automation response`);
          break;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch deployments page ${page + 1} of VCF Automation response with status ${response.status}: ${response.statusText}`);
        }

        const data: VcfDeploymentResponse = await response.json();
        
        if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
          this.logger.debug(`No more deployments found after page ${page} of VCF Automation response`);
          break;
        }

        this.logger.debug(`Retrieved ${data.content.length} deployments from page ${page + 1} of VCF Automation response`);
        deployments.push(...data.content);

        // Check if we've reached the last page
        if (page >= data.totalPages - 1 || data.content.length === 0) {
          hasMorePages = false;
        } else {
          page++;
        }
      }

      this.logger.info(`Successfully fetched ${deployments.length} deployments in total from VCF Automation`);
      return deployments;
    } catch (error) {
      this.logger.error('Failed to fetch deployments from VCF Automation', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async refresh(): Promise<void> {
    if (!this.connection) {
      this.logger.error('Cannot refresh - provider not initialized');
      throw new Error('Not initialized');
    }

    try {
      this.logger.info('Starting refresh of VCF Automation entities');
      const deployments = await this.fetchDeployments();
      this.logger.debug(`Transforming ${deployments.length} deployments into entities`);
      const entities = this.transformToEntities(deployments);
      this.logger.debug(`Created ${entities.length} entities, applying mutation`);
      
      await this.connection.applyMutation({
        type: 'full',
        entities: entities.map(entity => ({
          entity,
          locationKey: `url:${this.config.getString('vcfAutomation.baseUrl')}/vcf-automation`,
        })),
      });
      
      this.logger.info('Successfully completed refresh of VCF Automation entities');
    } catch (error) {
      this.logger.error('Failed to refresh VCF Automation entities', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private transformToEntities(deployments: VcfDeployment[]) {
    const entities: Array<SystemEntity | ComponentEntity | ResourceEntity | DomainEntity> = [];
    const domains = new Set<string>();
    const locationRef = `url:${this.config.getString('vcfAutomation.baseUrl')}/vcf-automation`;
    const baseUrl = this.config.getString('vcfAutomation.baseUrl');

    // First, create a map of ALL resource IDs to their types and names
    const resourceMap = new Map<string, { type: string; name: string; deploymentId: string }>();
    // Create a map of resource names to their IDs within each deployment
    const deploymentResourceNameMap = new Map<string, Map<string, string>>();

    for (const deployment of deployments) {
      // Initialize the name-to-id map for this deployment
      const nameToIdMap = new Map<string, string>();
      for (const resource of deployment.resources) {
        resourceMap.set(resource.id, {
          type: resource.type,
          name: resource.name,
          deploymentId: deployment.id,
        });
        // Map the resource name to its ID within this deployment
        nameToIdMap.set(resource.name, resource.id);
      }
      deploymentResourceNameMap.set(deployment.id, nameToIdMap);
    }

    this.logger.debug(`Created resource map with ${resourceMap.size} resources`);

    // Helper function to get the entity reference with the correct kind
    const getEntityRef = (resourceId: string): string => {
      const resource = resourceMap.get(resourceId);
      if (!resource) {
        this.logger.warn(`Could not find resource info for ${resourceId} in map of ${resourceMap.size} resources`);
        return `resource:default/unknown-resource`;
      }
      return resource.type === 'Cloud.vSphere.Machine'
        ? `component:default/${resourceId.toLowerCase()}`
        : `resource:default/${resourceId.toLowerCase()}`;
    };

    for (const deployment of deployments) {
      // Create Domain (Project) entity if not already created
      if (!domains.has(deployment.project.id)) {
        domains.add(deployment.project.id);
        entities.push({
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Domain',
          metadata: {
            name: deployment.project.id.toLowerCase(),
            title: deployment.project.name,
            annotations: {
              [ANNOTATION_LOCATION]: locationRef,
              [ANNOTATION_ORIGIN_LOCATION]: locationRef,
              'backstage.io/view-url': `${baseUrl}/automation/#/service/catalog/consume/deployment?projects=%5B"${deployment.project.id}"%5D`,
            },
            links: [
              {
                url: `${baseUrl}/automation/#/service/catalog/consume/deployment?projects=%5B"${deployment.project.id}"%5D`,
                title: 'Open in VCF Automation',
              },
            ],
          },
          spec: {
            owner: deployment.ownedBy,
            type: 'vcf-automation-project',
          },
        });
      }

      // Create System entity for the deployment
      const systemEntity: SystemEntity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'System',
        metadata: {
          name: deployment.id.toLowerCase(),
          title: deployment.name,
          annotations: {
            [ANNOTATION_LOCATION]: locationRef,
            [ANNOTATION_ORIGIN_LOCATION]: locationRef,
            'terasky.backstage.io/vcf-automation-deployment-status': deployment.status,
            'terasky.backstage.io/vcf-automation-deployment-cost': JSON.stringify(deployment.expense),
            'terasky.backstage.io/vcf-automation-deployment-created-at': deployment.createdAt,
            'terasky.backstage.io/vcf-automation-deployment-created-by': deployment.createdBy,
            'terasky.backstage.io/vcf-automation-deployment-last-updated': deployment.lastUpdatedAt,
            'terasky.backstage.io/vcf-automation-deployment-last-updated-by': deployment.lastUpdatedBy,
            'terasky.backstage.io/vcf-automation-deployment-last-request': JSON.stringify(deployment.lastRequest),
            'backstage.io/view-url': `${baseUrl}/automation/#/service/catalog/consume/deployment/${deployment.id}`,
          },
          links: [
            {
              url: `${baseUrl}/automation/#/service/catalog/consume/deployment/${deployment.id}`,
              title: 'Open in VCF Automation',
            },
          ],
        },
        spec: {
          owner: `${deployment.ownerType.toLowerCase()}:${deployment.ownedBy.toLowerCase()}`,
          domain: deployment.project.id.toLowerCase(),
        },
      };
      entities.push(systemEntity);

      // Get the name-to-id map for this deployment
      const nameToIdMap = deploymentResourceNameMap.get(deployment.id);

      // Create Component and Resource entities for each resource
      for (const resource of deployment.resources) {
        // Log dependency resolution for debugging
        if (resource.dependsOn && resource.dependsOn.length > 0) {
          this.logger.debug(
            `Resolving dependencies for resource ${resource.id} (${resource.name}): ${resource.dependsOn.join(', ')}`,
          );
        }

        const baseEntity = {
          metadata: {
            name: resource.id.toLowerCase(),
            title: resource.name,
            annotations: {
              [ANNOTATION_LOCATION]: locationRef,
              [ANNOTATION_ORIGIN_LOCATION]: locationRef,
              'terasky.backstage.io/vcf-automation-resource-type': resource.type,
              'terasky.backstage.io/vcf-automation-resource-properties': JSON.stringify(resource.properties),
              'terasky.backstage.io/vcf-automation-resource-created-at': resource.createdAt,
              'terasky.backstage.io/vcf-automation-resource-origin': resource.origin,
              'terasky.backstage.io/vcf-automation-resource-sync-status': resource.syncStatus,
              'terasky.backstage.io/vcf-automation-resource-state': resource.state,
              'backstage.io/view-url': `${baseUrl}/automation/#/service/catalog/consume/deployment/${deployment.id}`,
            },
            links: [
              {
                url: `${baseUrl}/automation/#/service/catalog/consume/deployment/${deployment.id}`,
                title: 'Open in VCF Automation',
              },
            ],
          },
          spec: {
            owner: `${deployment.ownerType.toLowerCase()}:${deployment.ownedBy.toLowerCase()}`,
            type: resource.type,
            system: deployment.id.toLowerCase(),
            dependsOn: resource.dependsOn?.map(depName => {
              // Look up the resource ID using the name from the same deployment
              const depId = nameToIdMap?.get(depName);
              if (!depId) {
                this.logger.warn(`Failed to resolve dependency name ${depName} to ID for resource ${resource.id} (${resource.name})`);
                return undefined;
              }
              return getEntityRef(depId);
            }).filter((ref): ref is string => ref !== undefined) || [],
          },
        };

        if (resource.type === 'Cloud.vSphere.Machine') {
          entities.push({
            apiVersion: 'backstage.io/v1alpha1',
            kind: 'Component',
            ...baseEntity,
            metadata: {
              ...baseEntity.metadata,
              links: [
                ...baseEntity.metadata.links,
                {
                  url: `${baseUrl}/provisioning-ui/#/machines/remote-console/${resource.id}`,
                  title: 'Open Remote Console',
                },
              ],
            },
            spec: {
              ...baseEntity.spec,
              lifecycle: 'production',
            },
          });
        } else {
          entities.push({
            apiVersion: 'backstage.io/v1alpha1',
            kind: 'Resource',
            ...baseEntity,
          });
        }
      }
    }

    return entities;
  }
}
