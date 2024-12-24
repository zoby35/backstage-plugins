import { Config, JsonObject } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { KubernetesBuilder } from '@backstage/plugin-kubernetes-backend';
import { CatalogApi } from '@backstage/catalog-client';
import { PermissionEvaluator } from '@backstage/plugin-permission-common';
import { DiscoveryService, BackstageCredentials } from '@backstage/backend-plugin-api';
import { KubernetesObjectTypes } from '@backstage/plugin-kubernetes-node';
type ObjectToFetch = {
  group: string;
  apiVersion: string;
  plural: string;
  objectType: KubernetesObjectTypes;
};

export class KubernetesDataProvider {
  logger: LoggerService;
  config: Config;
  catalogApi: CatalogApi;
  permissions: PermissionEvaluator;
  discovery: DiscoveryService;

  constructor(
    logger: LoggerService,
    config: Config,
    catalogApi: CatalogApi,
    permissions: PermissionEvaluator,
    discovery: DiscoveryService
  ) {
    this.logger = logger;
    this.config = config;
    this.catalogApi = catalogApi;
    this.permissions = permissions;
    this.discovery = discovery;
  }

  async fetchKubernetesObjects(): Promise<any[]> {
    try {
      const builder = KubernetesBuilder.createBuilder({
        logger: this.logger,
        config: this.config,
        catalogApi: this.catalogApi,
        permissions: this.permissions,
        discovery: this.discovery,
      });

      const { fetcher, clusterSupplier } = await builder.build();

      const credentials: BackstageCredentials = {
        $$type: '@backstage/BackstageCredentials',
        principal: 'anonymous',
      };

      const clusters = await clusterSupplier.getClusters({ credentials });

      if (clusters.length === 0) {
        this.logger.warn('No clusters found.');
        return [];
      }

      const disableDefaultWorkloadTypes = this.config.getOptionalBoolean('kubernetesIngestor.components.disableDefaultWorkloadTypes') ?? false;

      const defaultWorkloadTypes: ObjectToFetch[] = [
        { group: 'apps', apiVersion: 'v1', plural: 'deployments', objectType: 'deployments' },
        { group: 'apps', apiVersion: 'v1', plural: 'statefulsets', objectType: 'statefulsets' },
        { group: 'apps', apiVersion: 'v1', plural: 'daemonsets', objectType: 'daemonsets' },
        { group: 'batch', apiVersion: 'v1', plural: 'cronjobs', objectType: 'cronjobs' },
      ];

      const customWorkloadTypes = this.config.getOptionalConfigArray('kubernetesIngestor.components.customWorkloadTypes')?.map(type => ({
        group: type.getString('group'),
        apiVersion: type.getString('apiVersion'),
        plural: type.getString('plural'),
        objectType: type.getString('plural') as KubernetesObjectTypes,
      })) || [];

      const objectTypesToFetch: Set<ObjectToFetch> = new Set([
        ...(disableDefaultWorkloadTypes ? [] : defaultWorkloadTypes),
        ...customWorkloadTypes,
      ]);

      const excludedNamespaces = new Set(
        this.config.getOptionalStringArray('kubernetesIngestor.components.excludedNamespaces') || [
          'default',
          'kube-public',
          'kube-system',
        ]
      );

      const ingestAllCrossplaneClaims = this.config.getOptionalBoolean('kubernetesIngestor.crossplane.claims.ingestAllClaims') ?? false;

      let allFetchedObjects: any[] = [];

      const onlyIngestAnnotatedResources =
        this.config.getOptionalBoolean('kubernetesIngestor.components.onlyIngestAnnotatedResources') ?? false;

      for (const cluster of clusters) {
        const token = cluster.authMetadata.serviceAccountToken;

        if (!token) {
          this.logger.warn(`Cluster ${cluster.name} does not have a valid service account token.`);
          continue;
        }

        try {
          if (ingestAllCrossplaneClaims) {
            const claimCRDs = await this.fetchCRDsForCluster(fetcher, cluster, token);
            claimCRDs.forEach(crd => {
              objectTypesToFetch.add({
                group: crd.group,
                apiVersion: crd.version,
                plural: crd.plural,
                objectType: 'customresources' as KubernetesObjectTypes,
              });
            });
          }

          const fetchedObjects = await fetcher.fetchObjectsForService({
            serviceId: cluster.name,
            clusterDetails: cluster,
            credential: { type: 'bearer token', token },
            objectTypesToFetch,
            customResources: [],
          });

          const filteredObjects = fetchedObjects.responses.flatMap(response =>
            response.resources.filter(resource => {
              if (resource.metadata.annotations?.['terasky.backstage.io/exclude-from-catalog']) {
                return false;
              }

              if (onlyIngestAnnotatedResources) {
                return resource.metadata.annotations?.['terasky.backstage.io/add-to-catalog'];
              }

              return !excludedNamespaces.has(resource.metadata.namespace);
            }).map(resource => ({
              ...resource,
              clusterName: cluster.name, // Attach the cluster name to the resource
            }))
          );

          allFetchedObjects = allFetchedObjects.concat(filteredObjects);

          this.logger.debug(`Crossplane Fetched ${filteredObjects.length} objects from cluster: ${cluster.name}`);
        } catch (clusterError) {
          if (clusterError instanceof Error) {
            this.logger.error(`Failed to fetch objects for cluster ${cluster.name}: ${clusterError.message}`, clusterError);
          } else {
            this.logger.error(`Failed to fetch objects for cluster ${cluster.name}:`, {
              error: String(clusterError),
            });
          }
        }
      }

      this.logger.debug(`Total fetched Kubernetes objects: ${allFetchedObjects.length}`);
      return allFetchedObjects;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Error fetching Kubernetes objects', error);
      } else if (typeof error === 'object') {
        this.logger.error('Error fetching Kubernetes objects', error as JsonObject);
      } else {
        this.logger.error('Unknown error occurred while fetching Kubernetes objects', {
          message: String(error),
        });
      }
      return []; // Add this return statement
    }
  }

  async fetchCRDMapping(): Promise<Record<string, string>> {
    try {
      const builder = KubernetesBuilder.createBuilder({
        logger: this.logger,
        config: this.config,
        catalogApi: this.catalogApi,
        permissions: this.permissions,
        discovery: this.discovery,
      });

      const { fetcher, clusterSupplier } = await builder.build();

      const credentials: BackstageCredentials = {
        $$type: '@backstage/BackstageCredentials',
        principal: 'anonymous',
      };

      const clusters = await clusterSupplier.getClusters({ credentials });

      if (clusters.length === 0) {
        this.logger.warn('No clusters found for CRD mapping.');
        return {};
      }

      const crdMapping: Record<string, string> = {};

      for (const cluster of clusters) {
        const token = cluster.authMetadata.serviceAccountToken;

        if (!token) {
          this.logger.warn(`Cluster ${cluster.name} does not have a valid service account token.`);
          continue;
        }

        const crds = await fetcher.fetchObjectsForService({
          serviceId: cluster.name,
          clusterDetails: cluster,
          credential: { type: 'bearer token', token },
          objectTypesToFetch: new Set([
            {
              group: 'apiextensions.k8s.io',
              apiVersion: 'v1',
              plural: 'customresourcedefinitions',
              objectType: 'customresources' as KubernetesObjectTypes,
            },
          ]),
          customResources: [],
        });

        crds.responses.flatMap(response => response.resources).forEach(crd => {
          const kind = crd.spec?.names?.kind;
          const plural = crd.spec?.names?.plural;
          if (kind && plural) {
            crdMapping[kind] = plural;
          }
        });
      }

      return crdMapping;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Error fetching Kubernetes objects', error);
      } else if (typeof error === 'object') {
        this.logger.error('Error fetching Kubernetes objects', error as JsonObject);
      } else {
        this.logger.error('Unknown error occurred while fetching Kubernetes objects', {
          message: String(error),
        });
      }
      return {};
    }
  }

  private async fetchCRDsForCluster(fetcher: any, cluster: any, token: string): Promise<{ group: string; version: string; plural: string }[]> {
    const claimCRDs = await fetcher.fetchObjectsForService({
      serviceId: cluster.name,
      clusterDetails: cluster,
      credential: { type: 'bearer token', token },
      objectTypesToFetch: new Set([
        {
          group: 'apiextensions.k8s.io',
          apiVersion: 'v1',
          plural: 'customresourcedefinitions',
          objectType: 'customresources' as KubernetesObjectTypes,
        },
      ]),
      customResources: [],
    });

    return claimCRDs.responses
      .flatMap((response: { resources: any; }) => response.resources)
      .filter((resource: { spec: { names: { categories: string | string[]; }; }; }) => resource?.spec?.names?.categories?.includes('claim'))
      .map((crd: { spec: { group: any; versions: { name: any; }[]; names: { plural: any; }; }; }) => ({
        group: crd.spec.group,
        version: crd.spec.versions[0]?.name || '',
        plural: crd.spec.names.plural,
      }));
  }
}