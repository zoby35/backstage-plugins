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
import pluralize from 'pluralize';

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
        const APIEntites = xrdData.flatMap(xrd =>
          this.translateXRDVersionsToAPI(xrd),
        );
        const allEntities = entities.concat(APIEntites);
        await this.connection.applyMutation({
          type: 'full',
          entities: allEntities.map(entity => ({
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

  private translateXRDVersionsToAPI(xrd: any): Entity[] {
    if (!xrd?.metadata || !xrd?.spec?.versions) {
      throw new Error('Invalid XRD object');
    }
     
    return xrd.spec.versions.map((version: any = {}) => {
      let xrdOpenAPIDoc: any = {};
      xrdOpenAPIDoc.openapi = "3.0.0";
      xrdOpenAPIDoc.info = {
        title: `${xrd.spec.claimNames.plural}.${xrd.spec.group}`,
        version: version.name,
      };
      xrdOpenAPIDoc.servers = xrd.clusterDetails.map((cluster: any) => ({
        url: cluster.url,
        description: cluster.name,
      }));
      xrdOpenAPIDoc.tags = [
        {
          name: "Cluster Scoped Operations",
          description: "Operations on the cluster level"
        },
        {
          name: "Namespace Scoped Operations",
          description: "Operations on the namespace level"
        },
        {
          name: "Specific Object Scoped Operations",
          description: "Operations on a specific resource"
        }
      ]
      // TODO(vrabbi) Add Paths To API for XRD
    xrdOpenAPIDoc.paths = {
      [`/apis/${xrd.spec.group}/${version.name}/${xrd.spec.claimNames.plural}`]: {
        get: {
          tags: ["Cluster Scoped Operations"],
          summary: `List all ${xrd.spec.claimNames.plural} in all namespaces`,
          operationId: `list${xrd.spec.claimNames.plural}AllNamespaces`,
          responses: {
            "200": {
              description: `List of ${xrd.spec.claimNames.plural} in all namespaces`,
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: `#/components/schemas/Resource`
                    }
                  }
                }
              }
            }
          }
        }
      },
      [`/apis/${xrd.spec.group}/${version.name}/namespaces/{namespace}/${xrd.spec.claimNames.plural}`]: {
        get: {
          tags: ["Namespace Scoped Operations"],
          summary: `List all ${xrd.spec.claimNames.plural} in a namespace`,
          operationId: `list${xrd.spec.claimNames.plural}`,
          parameters: [
            {
              name: "namespace",
              in: "path",
              required: true,
              schema: {
                type: "string"
              }
            }
          ],
          responses: {
            "200": {
              description: `List of ${xrd.spec.claimNames.plural}`,
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: `#/components/schemas/Resource`
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ["Namespace Scoped Operations"],
          summary: "Create a resource",
          operationId: "createResource",
          parameters: [
            { name: "namespace", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  $ref: `#/components/schemas/Resource`
                }
              },
            },
          },
          responses: {
            "201": { description: "Resource created" },
          },
        },
      },
      [`/apis/${xrd.spec.group}/${version.name}/namespaces/{namespace}/${xrd.spec.claimNames.plural}/{name}`]: {
        get: {
          tags: ["Specific Object Scoped Operations"],
          summary: `Get a ${xrd.spec.claimNames.kind}`,
          operationId: `get${xrd.spec.claimNames.kind}`,
          parameters: [
            { name: "namespace", in: "path", required: true, schema: { type: "string" } },
            { name: "name", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": {
              description: "Resource details",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    $ref: `#/components/schemas/Resource`
                  },
                },
              },
            },
          },
        },
        put: {
          tags: ["Specific Object Scoped Operations"],
          summary: "Update a resource",
          operationId: "updateResource",
          parameters: [
            { name: "namespace", in: "path", required: true, schema: { type: "string" } },
            { name: "name", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  $ref: `#/components/schemas/Resource`
                },
              },
            },
          },
          responses: {
            "200": { description: "Resource updated" },
          },
        },
        delete: {
          tags: ["Specific Object Scoped Operations"],
          summary: "Delete a resource",
          operationId: "deleteResource",
          parameters: [
            { name: "namespace", in: "path", required: true, schema: { type: "string" } },
            { name: "name", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "Resource deleted" },
          },
        },
      },
    };
      xrdOpenAPIDoc.components = {
        schemas: {
          Resource: {
            type: "object",
            properties: version.schema.openAPIV3Schema.properties
          }
        },
        securitySchemes: {
          bearerHttpAuthentication: {
            description: "Bearer token using a JWT",
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      };
      xrdOpenAPIDoc.security = [
        {
          bearerHttpAuthentication: []
        }
      ]
      return {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'API',
          metadata: {
            name: `${xrd.spec.claimNames.kind.toLowerCase()}-${xrd.spec.group}--${version.name}`,
            title: `${xrd.spec.claimNames.kind.toLowerCase()}-${xrd.spec.group}--${version.name}`,
            annotations: {
              'backstage.io/managed-by-location': `cluster origin: ${xrd.clusterName}`,
              'backstage.io/managed-by-origin-location': `cluster origin: ${xrd.clusterName}`,
            },
          },
          spec: {
            type: "openapi",
            lifecycle: "production",
            owner: "kubernetes-auto-ingested",
            system: "kubernets-auto-ingested",
            definition: yaml.dump(xrdOpenAPIDoc),
          },
        };
      }
    );
  }

  private extractParameters(version: any, clusters: string[], xrd: any): any[] {
    // Define the title and properties for xrName and xrNamespace
    const mainParameterGroup = {
      title: 'Resource Metadata',
      required: ['xrName', 'xrNamespace', 'owner'],
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
        owner: {
          title: 'Owner',
          description: 'The owner of the resource',
          type: 'string',
          'ui:field': 'OwnerPicker',
          'ui:options': {
            'catalogFilter': {
              'kind': 'Group',
            },
          },
        }
      },
      type: 'object',
    };

    
    const convertDefaultValuesToPlaceholders = this.config.getOptionalBoolean('kubernetesIngestor.crossplane.xrds.convertDefaultValuesToPlaceholders');

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
          if (convertDefaultValuesToPlaceholders && typedValue.default !== undefined && typedValue.type !== 'boolean') {
            processedProperties[key] = { ...typedValue, 'ui:placeholder': typedValue.default };
            delete processedProperties[key].default;
          } else {
            processedProperties[key] = typedValue;
          }
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
    const publishParametersNoGitSelection = {
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
    
      return additionalParameters ? [mainParameterGroup, additionalParameters, crossplaneParameters, publishParametersNoGitSelection] : [mainParameterGroup, crossplaneParameters, publishParametersNoGitSelection];
    
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
        ownerParam: owner
        excludeParams: ['owner', 'compositionSelectionStrategy','pushToGit','basePath','manifestLayout','_editData', 'targetBranch', 'repoUrl', 'clusters', "xrName", "xrNamespace"]
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
          if (k8s?.spec?.resourceRef) {
            this.logger.debug(`Processing Crossplane Claim: ${JSON.stringify(k8s)}`);
            return this.translateCrossplaneClaimToEntity(k8s, k8s.clusterName, crdMapping);
          } 
          else if (k8s) {
            this.logger.debug(`Processing Kubernetes Object: ${JSON.stringify(k8s)}`);
            return this.translateKubernetesObjectsToEntities(k8s);
          }
          else {
            return [];
          }
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
    const systemNamespaceModel = this.config.getOptionalString('kubernetesIngestor.mappings.namespaceModel')?.toLowerCase() || 'default';
    let systemNamespaceValue = '';
    if (systemNamespaceModel === 'cluster') {
      systemNamespaceValue = resource.clusterName;
    } else if (systemNamespaceModel === 'namespace') {
      systemNamespaceValue = resource.metadata.namespace || 'default';
    } else {
      systemNamespaceValue = 'default';
    }
    const systemNameModel = this.config.getOptionalString('kubernetesIngestor.mappings.systemModel')?.toLowerCase() || 'namespace';
    let systemNameValue = '';
    if (systemNameModel === 'cluster') {
      systemNameValue = resource.clusterName;
    } else if (systemNameModel === 'namespace') {
      systemNameValue = resource.metadata.namespace || resource.metadata.name;
    } else if (systemNameModel === 'cluster-namespace') {
      if (resource.metadata.namespace) {
        systemNameValue = `${resource.clusterName}-${resource.metadata.namespace}`;
      } else {
        systemNameValue = `${resource.clusterName}`;
      }
    } else {
      systemNameValue = 'default';
    }
    const systemReferencesNamespaceModel = this.config.getOptionalString('kubernetesIngestor.mappings.referencesNamespaceModel')?.toLowerCase() || 'default';
    let systemReferencesNamespaceValue = '';
    if (systemReferencesNamespaceModel === 'same') {
      systemReferencesNamespaceValue = resource.metadata.name;
    } else if (systemReferencesNamespaceModel === 'default') {
      systemReferencesNamespaceValue = 'default';
    }

    const systemEntity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'System',
      metadata: {
        name: systemNameValue,
        namespace: annotations['terasky.backstage.io/backstage-namespace'] || systemNamespaceValue,
        annotations: this.extractCustomAnnotations(annotations, resource.clusterName),
      },
      spec: {
        owner: annotations['terasky.backstage.io/owner'] ? `${systemReferencesNamespaceValue}/${annotations['terasky.backstage.io/owner']}` : `${systemReferencesNamespaceValue}/kubernetes-auto-ingested`,
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
      if (resource.kind.toLowerCase() === 'deployment' || resource.kind.toLowerCase() === 'statefulset' || resource.kind.toLowerCase() === 'daemonset' || resource.kind.toLowerCase() === 'cronjob') {
        const commonLabels = this.findCommonLabels(resource);
        if (commonLabels) {
          customAnnotations['backstage.io/kubernetes-label-selector'] = commonLabels;
        }
      }
    } else {
      customAnnotations['backstage.io/kubernetes-label-selector'] = annotations['terasky.backstage.io/kubernetes-label-selector'];
    }
    const apiGroup = resource.apiVersion.split('/')[0];
    const version = resource.apiVersion.split('/')[1];
    const kindPlural = pluralize(resource.kind.toLowerCase());
    const objectName = resource.metadata.name;
    const customWorkloadUri = resource.metadata.namespace
      ? `/apis/${apiGroup}/${version}/namespaces/${namespace}/${kindPlural}/${objectName}`
      : `/apis/${apiGroup}/${version}/${kindPlural}/${objectName}`;
    customAnnotations['terasky.backstage.io/custom-workload-uri'] = customWorkloadUri;
    const namespaceModel = this.config.getOptionalString('kubernetesIngestor.mappings.namespaceModel')?.toLowerCase() || 'default';
    const nameModel = this.config.getOptionalString('kubernetesIngestor.mappings.nameModel')?.toLowerCase() || 'name';
    const titleModel = this.config.getOptionalString('kubernetesIngestor.mappings.titleModel')?.toLowerCase() || 'name';
    const systemModel = this.config.getOptionalString('kubernetesIngestor.mappings.systemModel')?.toLowerCase() || 'namespace';
    const referencesNamespaceModel = this.config.getOptionalString('kubernetesIngestor.mappings.referencesNamespaceModel')?.toLowerCase() || 'default';
    let systemValue = '';
    let namespaceValue = '';
    let nameValue = '';
    let titleValue = '';
    let referencesNamespaceValue = '';
    if (namespaceModel === 'cluster') {
      namespaceValue = resource.clusterName;
    } else if (namespaceModel === 'namespace') {
      namespaceValue = resource.metadata.namespace || 'default';
    } else {
      namespaceValue = 'default';
    }
    if (referencesNamespaceModel === 'same') {
      referencesNamespaceValue = resource.metadata.namespace;
    } else if (referencesNamespaceModel === 'default') {
      referencesNamespaceValue = 'default';
    }
    if (nameModel === 'name-cluster') {
      nameValue = `${resource.metadata.name}-${resource.clusterName}`;
    } else if (nameModel === 'name-namespace') {
      if (resource.metadata.namespace) {
        nameValue = `${resource.metadata.name}-${resource.metadata.namespace}`;   
      } else {
        nameValue = `${resource.metadata.name}`;
      }
    } else {
      nameValue = resource.metadata.name;
    }
    if (titleModel === 'name-cluster') {
      titleValue = `${resource.metadata.name}-${resource.clusterName}`;
    } else if (titleModel === 'name-namespace') {
      if (resource.metadata.namespace) {
        titleValue = `${resource.metadata.name}-${resource.metadata.namespace}`;
      } else {
        titleValue = `${resource.metadata.name}`;
      }
    } else {
      titleValue = resource.metadata.name;
    }
    if (systemModel === 'cluster') {
      systemValue = resource.clusterName;
    } else if (systemModel === 'namespace') {
      systemValue = resource.metadata.namespace || 'default';
    } else if (systemModel === 'cluster-namespace') {
      if (resource.metadata.namespace) {
        systemValue = `${resource.clusterName}-${resource.metadata.namespace}`;
      } else {
        systemValue = `${resource.clusterName}`;
      }
    } else {
      systemValue = 'default';
    }

    const componentEntity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: nameValue,
        title: titleValue,
        description: `${resource.kind} ${resource.metadata.name} from ${resource.clusterName}`,
        namespace: annotations['terasky.backstage.io/backstage-namespace'] || namespaceValue,
        annotations: {
          ...customAnnotations,
          ...(systemModel === 'cluster-namespace' || namespaceModel === 'cluster' || nameModel === 'name-cluster' ? {
            'backstage.io/kubernetes-cluster': resource.clusterName,
          } : {})
        },
        tags: [`cluster:${resource.clusterName}`, `kind:${resource.kind}`],
      },
      spec: {
        type: annotations['terasky.backstage.io/component-type'] || 'service',
        lifecycle: annotations['terasky.backstage.io/lifecycle'] || 'production',
        owner: annotations['terasky.backstage.io/owner'] ? `${referencesNamespaceModel}/${annotations['terasky.backstage.io/owner']}` : `${referencesNamespaceValue}/kubernetes-auto-ingested`,
        system: `${referencesNamespaceValue}/${systemValue}`,
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

  private translateCrossplaneClaimToEntity(claim: any, clusterName: string, crdMapping: Record<string, string>): Entity {
    const annotations = claim.metadata.annotations || {};

    // Extract CR values
    const [crGroup, crVersion] = claim.apiVersion.split('/');
    const crKind = claim.kind;
    const crPlural = crdMapping[crKind] || pluralize(claim.kind.toLowerCase()); // Fetch plural from CRD mapping

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
    annotations['terasky.backstage.io/claim-name'] = claim.metadata.name;
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
    const resourceAnnotations = claim.metadata.annotations || {};
    const customAnnotations = this.extractCustomAnnotations(resourceAnnotations, clusterName);
    const namespaceModel = this.config.getOptionalString('kubernetesIngestor.mappings.namespaceModel')?.toLowerCase() || 'default';
    const nameModel = this.config.getOptionalString('kubernetesIngestor.mappings.nameModel')?.toLowerCase() || 'name';
    const titleModel = this.config.getOptionalString('kubernetesIngestor.mappings.titleModel')?.toLowerCase() || 'name';
    const systemModel = this.config.getOptionalString('kubernetesIngestor.mappings.systemModel')?.toLowerCase() || 'namespace';
    const referencesNamespaceModel = this.config.getOptionalString('kubernetesIngestor.mappings.referencesNamespaceModel')?.toLowerCase() || 'default';
    let systemValue = '';
    let namespaceValue = '';
    let nameValue = '';
    let titleValue = '';
    let referencesNamespaceValue = '';
    if (namespaceModel === 'cluster') {
      namespaceValue = clusterName;
    } else if (namespaceModel === 'namespace') {
      namespaceValue = claim.metadata.namespace || 'default';
    } else {
      namespaceValue = 'default';
    }
    if (referencesNamespaceModel === 'same') {
      referencesNamespaceValue = claim.metadata.namespace || 'default';
    } else if (referencesNamespaceModel === 'default') {
      referencesNamespaceValue = 'default';
    }
    if (nameModel === 'name-cluster') {
      nameValue = `${claim.metadata.name}-${clusterName}`;
    } else if (nameModel === 'name-namespace') {
      if (claim.metadata.namespace) {
        nameValue = `${claim.metadata.name}-${claim.metadata.namespace}`;
      } else {
        nameValue = `${claim.metadata.name}`;
      }
    } else {
      nameValue = claim.metadata.name;
    }
    if (titleModel === 'name-cluster') {
      titleValue = `${claim.metadata.name}-${clusterName}`;
    } else if (titleModel === 'name-namespace') {
      if (claim.metadata.namespace) {
        titleValue = `${claim.metadata.name}-${claim.metadata.namespace}`;
      } else {
        titleValue = `${claim.metadata.name}`;
      }
    } else {
      titleValue = claim.metadata.name;
    }
    if (systemModel === 'cluster') {
      systemValue = clusterName;
    } else if (systemModel === 'namespace') {
      systemValue = claim.metadata.namespace || 'default';
    } else if (systemModel === 'cluster-namespace') {
      if (claim.metadata.namespace) {
        systemValue = `${clusterName}-${claim.metadata.namespace}`;
      } else {
        systemValue = `${clusterName}`;
      }
    } else {
      systemValue = 'default';
    }

    return {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: nameValue,
        title: titleValue,
        description: `${claim.kind} ${claim.metadata.name} from ${clusterName}`,
        tags: [`cluster:${clusterName}`, `kind:${claim.kind}`, 'crossplane-claim'],
        namespace: namespaceValue,
        annotations: {
          ...annotations,
          'terasky.backstage.io/component-type': 'crossplane-claim',
          ...(systemModel === 'cluster-namespace' || namespaceModel === 'cluster' || nameModel === 'name-cluster' ? {
            'backstage.io/kubernetes-cluster': clusterName,
          } : {}),
          ...customAnnotations,
        },
      },
      spec: {
        type: 'crossplane-claim',
        lifecycle: annotations['terasky.backstage.io/lifecycle'] || 'production',
        owner: annotations['terasky.backstage.io/owner'] ? `${referencesNamespaceModel}/${annotations['terasky.backstage.io/owner']}` : `${referencesNamespaceValue}/kubernetes-auto-ingested`,
        system: annotations['terasky.backstage.io/system'] || `${referencesNamespaceValue}/${systemValue}`,
        consumesApis: [`${referencesNamespaceValue}/${claim.kind}-${claim.apiVersion.split('/').join('--')}`],
      },
    };
  }
}
