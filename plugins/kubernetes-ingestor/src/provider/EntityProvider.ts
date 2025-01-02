import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';
import { SchedulerServiceTaskRunner } from '@backstage/backend-plugin-api';
import { KubernetesDataProvider } from './KubernetesDataProvider';
import { XrdDataProvider } from './XrdDataProvider';
import { Config } from '@backstage/config';
import { CatalogApi } from '@backstage/catalog-client';
import { PermissionEvaluator } from '@backstage/plugin-permission-common';
import {
  LoggerService,
  DiscoveryService,
  HttpAuthService,
  AuthService,
} from '@backstage/backend-plugin-api';
import yaml from 'js-yaml';

export class XRDTemplateEntityProvider implements EntityProvider {
  private readonly taskRunner: SchedulerServiceTaskRunner;
  private connection?: EntityProviderConnection;
  logger: LoggerService;
  config: Config;
  catalogApi: CatalogApi;
  permissions: PermissionEvaluator;
  discovery: DiscoveryService;
  auth: AuthService;
  httpAuth: HttpAuthService;

  constructor(
    taskRunner: SchedulerServiceTaskRunner,
    logger: LoggerService,
    config: Config,
    catalogApi: CatalogApi,
    discovery: DiscoveryService,
    permissions: PermissionEvaluator,
    auth: AuthService,
    httpAuth: HttpAuthService,
  ) {
    this.taskRunner = taskRunner;
    this.logger = logger;
    this.config = config;
    this.catalogApi = catalogApi;
    this.permissions = permissions;
    this.discovery = discovery;
    this.auth = auth;
    this.httpAuth = httpAuth;
  }

  getProviderName(): string {
    return 'XRDTemplateEntityProvider';
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    await this.taskRunner.run({
      id: this.getProviderName(),
      fn: async () => {
        await this.run();
      },
    });
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Connection not initialized');
    }
    try {
      const templateDataProvider = new XrdDataProvider(
        this.logger,
        this.config,
        this.catalogApi,
        this.discovery,
        this.permissions,
        this.auth,
        this.httpAuth,
      );
      if (this.config.getOptionalBoolean('kubernetesIngestor.crossplane.xrds.enabled')) {
        const xrdData = await templateDataProvider.fetchXRDObjects();
        const entities = xrdData.flatMap(xrd =>
          this.translateXRDVersionsToTemplates(xrd),
        );

        await this.connection.applyMutation({
          type: 'full',
          entities: entities.map(entity => ({
            entity,
            locationKey: `provider:${this.getProviderName()}`,
          })),
        });
      }
    } catch (error) {
      this.logger.error(`Failed to run XRDTemplateEntityProvider: ${error}`);
    }
  }

  private translateXRDVersionsToTemplates(xrd: any): Entity[] {
    if (!xrd?.metadata || !xrd?.spec?.versions) {
      throw new Error('Invalid XRD object');
    }

    const clusters = xrd.clusters || ["kubetopus"];

    return xrd.spec.versions.map((version: { name: any }) => {
      const parameters = this.extractParameters(version, clusters, xrd);
      const steps = this.extractSteps(version, xrd);
      if (this.config.getOptionalString('kubernetesIngestor.crossplane.xrds.publishPhase.target')?.toLowerCase() === 'yaml') {
        return {
          apiVersion: 'scaffolder.backstage.io/v1beta3',
          kind: 'Template',
          metadata: {
            name: `${xrd.metadata.name}-${version.name}`,
            title: `${xrd.spec.claimNames.kind}`,
            description: `A template to create a ${xrd.metadata.name} instance`,
            annotations: {
              'backstage.io/managed-by-location': `cluster origin: ${xrd.clusterName}`,
              'backstage.io/managed-by-origin-location': `cluster origin: ${xrd.clusterName}`,
              'terasky.backstage.io/crossplane-claim': 'true',
            },
          },
          spec: {
            type: xrd.metadata.name,
            parameters,
            steps,
            output: {
              links: [
                {
                  title: 'Download YAML Manifest',
                  url: 'data:application/yaml;charset=utf-8,${{ steps.generateManifest.output.manifest }}'
                }
              ]
            },
          },
        };
      }
      else if (this.config.getOptionalString('kubernetesIngestor.crossplane.xrds.publishPhase.target')?.toLowerCase() === 'github') {
        return {
          apiVersion: 'scaffolder.backstage.io/v1beta3',
          kind: 'Template',
          metadata: {
            name: `${xrd.metadata.name}-${version.name}`,
            title: `${xrd.spec.claimNames.kind}`,
            description: `A template to create a ${xrd.metadata.name} instance`,
            labels: {
              forEntity: "system",
              language: "python",
            },
            annotations: {
              'backstage.io/managed-by-location': `cluster origin: ${xrd.clusterName}`,
              'backstage.io/managed-by-origin-location': `cluster origin: ${xrd.clusterName}`,
            },
          },
          spec: {
            type: xrd.metadata.name,
            parameters,
            steps,
            output: {
              links: [
                {
                  title: "Pull Request",
                  url: "${{ steps['create-pull-request'].output.remoteUrl }}"
                },
                {
                  title: 'Download YAML Manifest',
                  url: 'data:application/yaml;charset=utf-8,${{ steps.generateManifest.output.manifest }}'
                }
              ]
            },
          },
        };
      }
      else if (this.config.getOptionalString('kubernetesIngestor.crossplane.xrds.publishPhase.target')?.toLowerCase() === 'bitbucket') {
        return {
          apiVersion: 'scaffolder.backstage.io/v1beta3',
          kind: 'Template',
          metadata: {
            name: `${xrd.metadata.name}-${version.name}`,
            title: `${xrd.spec.claimNames.kind}`,
            description: `A template to create a ${xrd.metadata.name} instance`,
            annotations: {
              'backstage.io/managed-by-location': `cluster origin: ${xrd.clusterName}`,
              'backstage.io/managed-by-origin-location': `cluster origin: ${xrd.clusterName}`,
            },
          },
          spec: {
            type: xrd.metadata.name,
            parameters,
            steps,
            output: {
              links: [
                {
                  title: "Pull Request",
                  url: "${{ steps['create-pull-request'].output.pullRequestUrl }}"
                },
                {
                  title: 'Download YAML Manifest',
                  url: 'data:application/yaml;charset=utf-8,${{ steps.generateManifest.output.manifest }}'
                }
              ]
            },
          },
        };
      }
      else if (this.config.getOptionalString('kubernetesIngestor.crossplane.xrds.publishPhase.target')?.toLowerCase() === 'gitlab') {
        return {
          apiVersion: 'scaffolder.backstage.io/v1beta3',
          kind: 'Template',
          metadata: {
            name: `${xrd.metadata.name}-${version.name}`,
            title: `${xrd.spec.claimNames.kind}`,
            description: `A template to create a ${xrd.metadata.name} instance`,
            annotations: {
              'backstage.io/managed-by-location': `cluster origin: ${xrd.clusterName}`,
              'backstage.io/managed-by-origin-location': `cluster origin: ${xrd.clusterName}`,
            },
          },
          spec: {
            type: xrd.metadata.name,
            parameters,
            steps,
            output: {
              links: [
                {
                  title: "Merge Request",
                  url: "${{ steps['create-pull-request'].output.mergeRequestUrl }}"
                },
                {
                  title: 'Download YAML Manifest',
                  url: 'data:application/yaml;charset=utf-8,${{ steps.generateManifest.output.manifest }}'
                }
              ]
            },
          },
        };
      }
      
        return {
          apiVersion: 'scaffolder.backstage.io/v1beta3',
          kind: 'Template',
          metadata: {
            name: `${xrd.metadata.name}-${version.name}`,
            title: `${xrd.spec.claimNames.kind}`,
            description: `A template to create a ${xrd.metadata.name} instance`,
            annotations: {
              'backstage.io/managed-by-location': `cluster origin: ${xrd.clusterName}`,
              'backstage.io/managed-by-origin-location': `cluster origin: ${xrd.clusterName}`,
            },
          },
          spec: {
            type: xrd.metadata.name,
            parameters,
            steps,
            output: {
              links: [
                {
                  title: 'Download YAML Manifest',
                  url: 'data:application/yaml;charset=utf-8,${{ steps.generateManifest.output.manifest }}'
                }
              ]
            },
          },
        };
      
    });
  }


  private extractParameters(version: any, clusters: string[], xrd: any): any[] {
    // Define the title and properties for xrName and xrNamespace
    const mainParameterGroup = {
      title: 'Resource Metadata',
      required: ['xrName', 'xrNamespace'],
      properties: {
        xrName: {
          title: 'Name',
          description: 'The name of the resource',
          pattern: "^[a-z0-9]([-a-z0-9]*[a-z0-9])?$",
          maxLength: 63,
          type: 'string',
        },
        xrNamespace: {
          title: 'Namespace',
          description: 'The namespace in which to create the resource',
          pattern: "^[a-z0-9]([-a-z0-9]*[a-z0-9])?$",
          maxLength: 63,
          type: 'string',
        },
      },
      type: 'object',
    };

    
    const processProperties = (properties: Record<string, any>): Record<string, any> => {
      const processedProperties: Record<string, any> = {};
    
      for (const [key, value] of Object.entries(properties)) {
        const typedValue = value as Record<string, any>;
        if (typedValue.type === 'object' && typedValue.properties) {
          const subProperties = processProperties(typedValue.properties);
          processedProperties[key] = { ...typedValue, properties: subProperties };
    
          if (typedValue.properties.enabled && typedValue.properties.enabled.type === 'boolean') {
            const siblingKeys = Object.keys(typedValue.properties).filter(k => k !== 'enabled');
            processedProperties[key].dependencies = {
              enabled: {
                if: {
                  properties: {
                    enabled: { const: true },
                  },
                },
                then: {
                  properties: siblingKeys.reduce((acc, k) => ({ ...acc, [k]: typedValue.properties[k] }), {}),
                },
              },
            };
            siblingKeys.forEach(k => delete processedProperties[key].properties[k]);
          }
        } else {
          processedProperties[key] = typedValue;
        }
      }
    
      return processedProperties;
    };
    
    // Extract additional parameters as a separate titled object
    const processedSpec = version.schema?.openAPIV3Schema?.properties?.spec
      ? processProperties(version.schema.openAPIV3Schema.properties.spec.properties)
      : {};
    
    const additionalParameters = {
      title: 'Resource Spec',
      properties: processedSpec,
      type: 'object',
    };
    const crossplaneParameters = {
      title: "Crossplane Settings",
      properties: {
        writeConnectionSecretToRef: {
          title: "Crossplane Configuration Details",
          properties: {
            name: {
              title: "Connection Secret Name",
              type: "string"
            }
          },
          type: "object"
        },
        compositeDeletePolicy: {
          title: "Composite Delete Policy",
          default: "Background",
          enum: [
            "Background",
            "Foreground"
          ],
          type: "string"
        },
        compositionUpdatePolicy: {
          title: "Composition Update Policy",
          enum: [
            "Automatic",
            "Manual"
          ],
          type: "string"
        },
        compositionSelectionStrategy: {
          title: "Composition Selection Strategy",
          description: "How the composition should be selected.",
          enum: [
            "runtime",
            "direct-reference",
            "label-selector"
          ],
          default: "runtime",
          type: "string"
        }
      },
      dependencies: {
        compositionSelectionStrategy: {
          oneOf: [
            {
              properties: {
                compositionSelectionStrategy: {
                  enum: [
                    "runtime"
                  ]
                }
              }
            },
            {
              properties: {
                compositionSelectionStrategy: {
                  enum: [
                    "direct-reference"
                  ]
                },
                compositionRef: {
                  title: "Composition Reference",
                  properties: {
                    name: {
                      type: "string",
                      title: "Select A Composition By Name",
                      enum: xrd.compositions ? xrd.compositions : [],
                      ...(xrd.spec?.defaultCompositionRef?.name && { default: xrd.spec.defaultCompositionRef.name })
                    }
                  },
                  required: [
                    "name"
                  ],
                  type: "object"
                }
              }
            },
            {
              properties: {
                compositionSelectionStrategy: {
                  enum: [
                    "label-selector"
                  ]
                },
                compositionSelector: {
                  title: "Composition Selector",
                  properties: {
                    matchLabels: {
                      title: "Match Labels",
                      additionalProperties: {
                        type: "string"
                      },
                      type: "object"
                    }
                  },
                  required: [
                    "matchLabels"
                  ],
                  type: "object"
                }
              }
            }
          ]
        }
      }
    };
    let allowedHosts: string[] = [];
    const publishPhaseTarget = this.config.getOptionalString('kubernetesIngestor.crossplane.xrds.publishPhase.target')?.toLowerCase();
    const allowedTargets = this.config.getOptionalStringArray('kubernetesIngestor.crossplane.xrds.publishPhase.allowedTargets');

    if (allowedTargets) {
      allowedHosts = allowedTargets;
    } else {
      switch (publishPhaseTarget) {
        case 'github':
          allowedHosts = ['github.com'];
          break;
        case 'gitlab':
          allowedHosts = ['gitlab.com'];
          break;
        case 'bitbucket':
          allowedHosts = ['only-bitbucket-server-is-allowed'];
          break;
        default:
          allowedHosts = [];
      }
    }

    const publishParameters = {
      title: "Creation Settings",
      properties: {
        pushToGit: {
          title: "Push Manifest to GitOps Repository",
          type: "boolean",
          default: true
        }
      },
      dependencies: {
        pushToGit: {
          oneOf: [
            {
              properties: {
                pushToGit: {
                  enum: [
                    false
                  ]
                }
              }
            },
            {
              properties: {
                pushToGit: {
                  enum: [
                    true
                  ]
                },
                repoUrl: {
                  content: {
                    type: "string"
                  },
                  description: "Name of repository",
                  "ui:field": "RepoUrlPicker",
                  "ui:options": {
                    allowedHosts: allowedHosts
                  }
                },
                targetBranch: {
                  type: "string",
                  description: "Target Branch for the PR",
                  default: "main"
                },
                manifestLayout: {
                  type: "string",
                  description: "Layout of the manifest",
                  default: "cluster-scoped",
                  "ui:help": "Choose how the manifest should be generated in the repo.\n* Cluster-scoped - a manifest is created for each selected cluster under the root directory of the clusters name\n* namespace-scoped - a manifest is created for the resource under the root directory with the namespace name\n* custom - a manifest is created under the specified base path",
                  enum: [
                    "cluster-scoped",
                    "namespace-scoped",
                    "custom"
                  ]
                }
              },
              dependencies: {
                manifestLayout: {
                  oneOf: [
                    {
                      properties: {
                        manifestLayout: {
                          enum: [
                            "cluster-scoped"
                          ]
                        },
                        clusters: {
                          title: "Target Clusters",
                          description: "The target clusters to apply the resource to",
                          type: "array",
                          minItems: 1,
                          items: {
                            enum: clusters,
                            type: 'string',
                          },
                          uniqueItems: true,
                          'ui:widget': 'checkboxes',
                        },
                      },
                      type: 'object',
                      required: [
                        "clusters"
                      ]
                    },
                    {
                      properties: {
                        manifestLayout: {
                          enum: [
                            "custom"
                          ]
                        },
                        basePath: {
                          type: "string",
                          description: "Base path in GitOps repository to push the manifest to"
                        }
                      },
                      required: [
                        "basePath"
                      ]
                    },
                    {
                      properties: {
                        manifestLayout: {
                          enum: [
                            "namespace-scoped"
                          ]
                        }
                      }
                    }
                  ]
                }
              }
            }
          ]
        }
      }
    };
    if (this.config.getOptionalBoolean('kubernetesIngestor.crossplane.xrds.publishPhase.allowRepoSelection')) {
      return additionalParameters ? [mainParameterGroup, additionalParameters, crossplaneParameters, publishParameters] : [mainParameterGroup, crossplaneParameters, publishParameters];
    }
    
      return additionalParameters ? [mainParameterGroup, additionalParameters, crossplaneParameters] : [mainParameterGroup, crossplaneParameters];
    
  }

  private extractSteps(version: any, xrd: any): any[] {
    // Define default steps template with placeholders for dynamic values
    const baseStepsYaml = `
    - id: generateManifest
      name: Generate Kubernetes Resource Manifest
      action: terasky:claim-template
      input:
        parameters: \${{ parameters }}
        nameParam: xrName
        namespaceParam: xrNamespace
        excludeParams: ['compositionSelectionStrategy','pushToGit','basePath','manifestLayout','_editData', 'targetBranch', 'repoUrl', 'clusters', "xrName", "xrNamespace"]
        apiVersion: {API_VERSION}
        kind: {KIND}
        clusters: \${{ parameters.clusters if parameters.manifestLayout === 'cluster-scoped' and parameters.pushToGit else ['temp'] }}
        removeEmptyParams: true
    - id: moveNamespacedManifest
      name: Move and Rename Manifest
      if: \${{ parameters.manifestLayout === 'namespace-scoped' }}
      action: fs:rename
      input:
        files:
          - from: \${{ steps.generateManifest.output.filePaths[0] }}
            to: "./\${{ parameters.xrNamespace }}/\${{ steps.generateManifest.input.kind }}/\${{ steps.generateManifest.output.filePaths[0].split('/').pop() }}"
    - id: moveCustomManifest
      name: Move and Rename Manifest
      if: \${{ parameters.manifestLayout === 'custom' }}
      action: fs:rename
      input:
        files:
          - from: \${{ steps.generateManifest.output.filePaths[0] }}
            to: "./\${{ parameters.basePath }}/\${{ parameters.xrName }}.yaml"
  `;
    const publishPhaseTarget = this.config.getOptionalString('kubernetesIngestor.crossplane.xrds.publishPhase.target')?.toLowerCase();
    let action = '';
    switch (publishPhaseTarget) {
      case 'gitlab':
        action = 'publish:gitlab:merge-request';
        break;
      case 'bitbucket':
        action = 'publish:bitbucketServer:pull-request';
        break;
      case 'github':
      default:
        action = 'publish:github:pull-request';
        break;
    }
    const repoSelectionStepsYaml = `
    - id: create-pull-request
      name: create-pull-request
      action: ${action}
      if: \${{ parameters.pushToGit }}
      input:
        repoUrl: \${{ parameters.repoUrl }}
        branchName: create-\${{ parameters.xrName }}-resource
        title: Create {KIND} Resource \${{ parameters.xrName }}
        description: Create {KIND} Resource \${{ parameters.xrName }}
        targetBranchName: \${{ parameters.targetBranch }}
  `;

    let defaultStepsYaml = baseStepsYaml;

    if (publishPhaseTarget !== 'yaml') {
      if (this.config.getOptionalBoolean('kubernetesIngestor.crossplane.xrds.publishPhase.allowRepoSelection')) {
        defaultStepsYaml += repoSelectionStepsYaml;
      }
      else {
        const repoHardcodedStepsYaml = `
    - id: create-pull-request
      name: create-pull-request
      action: ${action}
      if: \${{ parameters.pushToGit }}
      input:
        repoUrl: ${this.config.getOptionalString('kubernetesIngestor.crossplane.xrds.publishPhase.git.repoUrl')}
        branchName: create-\${{ parameters.xrName }}-resource
        title: Create {KIND} Resource \${{ parameters.xrName }}
        description: Create {KIND} Resource \${{ parameters.xrName }}
        targetBranchName: ${this.config.getOptionalString('kubernetesIngestor.crossplane.xrds.publishPhase.git.targetBranch')}
      `;
        defaultStepsYaml += repoHardcodedStepsYaml;
      }
    }

    // Replace placeholders in the default steps YAML with XRD details
    const apiVersion = `${xrd.spec.group}/${version.name}`;
    const kind = xrd.spec.claimNames?.kind;

    const populatedStepsYaml = defaultStepsYaml
      .replaceAll('{API_VERSION}', apiVersion)
      .replaceAll('{KIND}', kind);

    // Parse the populated default steps YAML string
    const defaultSteps = yaml.load(populatedStepsYaml) as any[];

    // Retrieve additional steps from the version if defined
    const additionalStepsYamlString = version.schema?.openAPIV3Schema?.properties?.steps?.default;
    const additionalSteps = additionalStepsYamlString
      ? yaml.load(additionalStepsYamlString) as any[]
      : [];

    // Combine default steps with any additional steps
    return [...defaultSteps, ...additionalSteps];
  }

}

export class KubernetesEntityProvider implements EntityProvider {
  private readonly taskRunner: SchedulerServiceTaskRunner;
  private connection?: EntityProviderConnection;
  private readonly logger: LoggerService;
  private readonly config: Config;
  private readonly catalogApi: CatalogApi;
  private readonly permissions: PermissionEvaluator;
  private readonly discovery: DiscoveryService;

  constructor(
    taskRunner: SchedulerServiceTaskRunner,
    logger: LoggerService,
    config: Config,
    catalogApi: CatalogApi,
    permissions: PermissionEvaluator,
    discovery: DiscoveryService
  ) {
    this.taskRunner = taskRunner;
    this.logger = logger;
    this.config = config;
    this.catalogApi = catalogApi;
    this.permissions = permissions;
    this.discovery = discovery;
  }

  getProviderName(): string {
    return 'KubernetesEntityProvider';
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    await this.taskRunner.run({
      id: this.getProviderName(),
      fn: async () => {
        await this.run();
      },
    });
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Connection not initialized');
    }
    try {
      const kubernetesDataProvider = new KubernetesDataProvider(
        this.logger,
        this.config,
        this.catalogApi,
        this.permissions,
        this.discovery
      );

      if (this.config.getOptionalBoolean('kubernetesIngestor.components.enabled')) {
        // Fetch all Kubernetes resources and build a CRD mapping
        const kubernetesData = await kubernetesDataProvider.fetchKubernetesObjects();
        const crdMapping = await kubernetesDataProvider.fetchCRDMapping();

        const entities = kubernetesData.flatMap(k8s => {
          if (k8s.spec?.resourceRef) {
            this.logger.debug(`Processing Crossplane Claim: ${JSON.stringify(k8s)}`);
            return this.translateCrossplaneClaimToEntity(k8s, k8s.clusterName, crdMapping);
          } 
            this.logger.debug(`Processing Kubernetes Object: ${JSON.stringify(k8s)}`);
            return this.translateKubernetesObjectsToEntities(k8s);
          
        });

        await this.connection.applyMutation({
          type: 'full',
          entities: entities.map(entity => ({
            entity,
            locationKey: `provider:${this.getProviderName()}`,
          })),
        });
      }
    } catch (error) {
      this.logger.error(`Failed to run KubernetesEntityProvider: ${error}`);
    }
  }

  private translateKubernetesObjectsToEntities(resource: any): Entity[] {
    const namespace = resource.metadata.namespace || 'default';
    const annotations = resource.metadata.annotations || {};
    const systemName = annotations['terasky.backstage.io/system'] || namespace;

    const systemEntity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'System',
      metadata: {
        name: systemName,
        namespace: annotations['terasky.backstage.io/backstage-namespace'] || 'default',
        annotations: this.extractCustomAnnotations(annotations, resource.clusterName),
      },
      spec: {
        owner: annotations['terasky.backstage.io/owner'] || 'kubernetes-auto-ingested',
        type: annotations['terasky.backstage.io/system-type'] || 'kubernetes-namespace',
        ...(annotations['terasky.backstage.io/domain']
          ? { domain: annotations['terasky.backstage.io/domain'] }
          : {}),
      },
    };

    const customAnnotations = this.extractCustomAnnotations(annotations, resource.clusterName);

    // Add logic for source-location
    if (annotations['terasky.backstage.io/source-code-repo-url']) {
      const repoUrl = `url:${  annotations['terasky.backstage.io/source-code-repo-url']}`;
      customAnnotations['backstage.io/source-location'] = repoUrl;

      // Construct techdocs-ref
      const branch = annotations['terasky.backstage.io/source-branch'] || 'main';
      const techdocsPath = annotations['terasky.backstage.io/techdocs-path'];

      if (techdocsPath) {
        customAnnotations['backstage.io/techdocs-ref'] = `${repoUrl}/blob/${branch}/${techdocsPath}`;
      }
    }

    // Add the Kubernetes label selector annotation if present
    if (!annotations['terasky.backstage.io/kubernetes-label-selector']) {
      const commonLabels = this.findCommonLabels(resource);
      if (commonLabels) {
        customAnnotations['backstage.io/kubernetes-label-selector'] = commonLabels;
      }
    }
    else {
      customAnnotations['backstage.io/kubernetes-label-selector'] = annotations['terasky.backstage.io/kubernetes-label-selector'];
    }

    const componentEntity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: resource.metadata.name,
        namespace: annotations['terasky.backstage.io/backstage-namespace'] || 'default',
        annotations: customAnnotations,
      },
      spec: {
        type: annotations['terasky.backstage.io/component-type'] || 'service',
        lifecycle: annotations['terasky.backstage.io/lifecycle'] || 'production',
        owner: annotations['terasky.backstage.io/owner'] || 'kubernetes-auto-ingested',
        system: systemName,
        dependsOn: annotations['terasky.backstage.io/dependsOn']?.split(','),
        providesApis: annotations['terasky.backstage.io/providesApis']?.split(','),
        consumesApis: annotations['terasky.backstage.io/consumesApis']?.split(','),
      },
    };

    return [systemEntity, componentEntity];
  }

  private findCommonLabels(resource: any): string | null {
    const highLevelLabels = resource.metadata.labels || {};
    const podLabels = resource.spec?.template?.metadata?.labels || {};

    const commonLabels = Object.keys(highLevelLabels).filter(label => podLabels[label]);
    if (commonLabels.length > 0) {
      return commonLabels.map(label => `${label}=${highLevelLabels[label]}`).join(',');
    } else if (Object.keys(highLevelLabels).length > 0) {
      return Object.keys(highLevelLabels).map(label => `${label}=${highLevelLabels[label]}`).join(',');
    }

    return null;
  }

  private translateCrossplaneClaimToEntity(claim: any, clusterName: string, crdMapping: Record<string, string>): Entity {
    const annotations = claim.metadata.annotations || {};

    // Extract CR values
    const [crGroup, crVersion] = claim.apiVersion.split('/');
    const crKind = claim.kind;
    const crPlural = crdMapping[crKind] || ''; // Fetch plural from CRD mapping

    // Extract Composite values from `spec.resourceRef`
    const compositeRef = claim.spec?.resourceRef || {};
    const compositeKind = compositeRef.kind || '';
    const compositeName = compositeRef.name || '';
    const compositeGroup = compositeRef.apiVersion?.split('/')?.[0] || '';
    const compositeVersion = compositeRef.apiVersion?.split('/')?.[1] || '';
    const compositePlural = compositeKind ? crdMapping[compositeKind] || '' : ''; // Fetch plural for composite kind
    const compositionData = claim.compositionData || {};
    const compositionName = compositionData.name || '';
    const compositionFunctions = compositionData.usedFunctions || [];
    // Add Crossplane claim annotations
    annotations['terasky.backstage.io/claim-kind'] = crKind;
    annotations['terasky.backstage.io/claim-version'] = crVersion;
    annotations['terasky.backstage.io/claim-group'] = crGroup;
    annotations['terasky.backstage.io/claim-plural'] = crPlural;
    annotations['terasky.backstage.io/crossplane-resource'] = "true";

    annotations['terasky.backstage.io/composite-kind'] = compositeKind;
    annotations['terasky.backstage.io/composite-name'] = compositeName;
    annotations['terasky.backstage.io/composite-group'] = compositeGroup;
    annotations['terasky.backstage.io/composite-version'] = compositeVersion;
    annotations['terasky.backstage.io/composite-plural'] = compositePlural;
    annotations['terasky.backstage.io/composition-name'] = compositionName;
    annotations['terasky.backstage.io/composition-functions'] = compositionFunctions.join(',');
    annotations['backstage.io/kubernetes-label-selector'] = `crossplane.io/claim-name=${claim.metadata.name},crossplane.io/claim-namespace=${claim.metadata.namespace},crossplane.io/composite=${compositeName}`

    return {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: claim.metadata.name,
        namespace: 'default',
        annotations: {
          ...annotations,
          'terasky.backstage.io/component-type': 'crossplane-claim',
          'backstage.io/managed-by-location': `cluster origin: ${clusterName}`,
          'backstage.io/managed-by-origin-location': `cluster origin: ${clusterName}`,
        },
      },
      spec: {
        type: 'crossplane-claim',
        lifecycle: annotations['terasky.backstage.io/lifecycle'] || 'production',
        owner: annotations['terasky.backstage.io/owner'] || 'kubernetes-auto-ingested',
        system: annotations['terasky.backstage.io/system'] || claim.metadata.namespace || 'default',
      },
    };
  }

  private extractCustomAnnotations(annotations: Record<string, string>, clusterName: string): Record<string, string> {
    const customAnnotationsKey = 'terasky.backstage.io/component-annotations';
    const defaultAnnotations: Record<string, string> = {
      'backstage.io/managed-by-location': `cluster origin: ${clusterName}`,
      'backstage.io/managed-by-origin-location': `cluster origin: ${clusterName}`,
    };

    if (!annotations[customAnnotationsKey]) {
      return defaultAnnotations;
    }

    const customAnnotations = annotations[customAnnotationsKey].split(',').reduce((acc, pair) => {
      const [key, value] = pair.split('=').map(s => s.trim());
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, defaultAnnotations);

    return customAnnotations;
  }
}
