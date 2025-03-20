import {
  KubernetesBuilder,
  KubernetesObjectTypes,
} from '@backstage/plugin-kubernetes-backend';
import { CatalogApi } from '@backstage/catalog-client';
import { PermissionEvaluator } from '@backstage/plugin-permission-common';
import { Config } from '@backstage/config';
import {
  LoggerService,
  DiscoveryService,
} from '@backstage/backend-plugin-api';
import { ClusterDetails } from '@backstage/plugin-kubernetes-node';

// Add new type definitions for auth providers
type AuthProvider = 'serviceAccount' | 'google' | 'aws' | 'azure' | 'oidc';

// Auth metadata type definitions
type AuthMetadataValue = string | Record<string, unknown>;

// Define the shape of auth metadata with a string index signature that allows undefined
interface KubernetesAuthMetadata {
  [key: string]: AuthMetadataValue | undefined;
}

// Define specific auth metadata interface that extends the base one
interface ExtendedKubernetesAuthMetadata extends KubernetesAuthMetadata {
  serviceAccountToken?: string;
  google?: Record<string, unknown>;
  azure?: Record<string, unknown>;
  oidc?: Record<string, unknown>;
  'kubernetes.io/aws-assume-role'?: string;
  'kubernetes.io/aws-external-id'?: string;
  'kubernetes.io/x-k8s-aws-id'?: string;
}

interface KubernetesClusterDetails extends Omit<ClusterDetails, 'authMetadata'> {
  authProvider?: AuthProvider;
  authMetadata: ExtendedKubernetesAuthMetadata;
}

export class CRDDataProvider {
  logger: LoggerService;
  config: Config;
  catalogApi: CatalogApi;
  permissions: PermissionEvaluator;
  discovery: DiscoveryService;

  constructor(
    logger: LoggerService,
    config: Config,
    catalogApi: CatalogApi,
    discovery: DiscoveryService,
    permissions: PermissionEvaluator,
  ) {
    this.logger = logger;
    this.config = config;
    this.catalogApi = catalogApi;
    this.permissions = permissions;
    this.discovery = discovery;
  }

  async fetchCRDObjects(): Promise<any[]> {
    try {
      const builder = KubernetesBuilder.createBuilder({
        logger: this.logger,
        config: this.config,
        catalogApi: this.catalogApi,
        permissions: this.permissions,
        discovery: this.discovery,
      });

      const { fetcher, clusterSupplier } = await builder.build();
      const credentials = {
        $$type: '@backstage/BackstageCredentials' as const,
        principal: 'anonymous',
      };

      const clusters = await clusterSupplier.getClusters({ credentials });
      if (clusters.length === 0) {
        this.logger.warn('No clusters found.');
        return [];
      }

      const crdTargets = this.config.getOptionalStringArray('kubernetesIngestor.genericCRDTemplates.crds');
      const labelSelector = this.config.getOptionalConfig('kubernetesIngestor.genericCRDTemplates.crdLabelSelector');
      if (!crdTargets && !labelSelector) {
        return [];
      }

      if (crdTargets && labelSelector) {
        this.logger.warn('Both CRD targets and label selector are configured. Only one should be used. Using CRD targets.');
        return [];
      }

      const crdMap = new Map<string, any>();

      for (const cluster of clusters) {
        // Get the auth provider type from the cluster config
        const typedCluster = cluster as KubernetesClusterDetails;
        const authProvider = typedCluster.authProvider || 'serviceAccount';

        // Get the auth credentials based on the provider type
        let credential;
        try {
          credential = await this.getAuthCredential(typedCluster, authProvider);
        } catch (error) {
          if (error instanceof Error) {
            this.logger.error(`Failed to get auth credentials for cluster ${cluster.name} with provider ${authProvider}:`, error);
          } else {
            this.logger.error(`Failed to get auth credentials for cluster ${cluster.name} with provider ${authProvider}:`, {
              error: String(error),
            });
          }
          continue;
        }

        try {
          const objectTypesToFetch: Set<ObjectToFetch> = new Set([
            {
              group: 'apiextensions.k8s.io',
              apiVersion: 'v1',
              plural: 'customresourcedefinitions',
              objectType: 'customresources' as KubernetesObjectTypes,
            },
          ]);
          
          let labelSelectorString = '';
          if (labelSelector) {
            const key = labelSelector.getString('key');
            const value = labelSelector.getString('value');
            labelSelectorString = `${key}=${value}`;
          }

          const fetchedObjects = await fetcher.fetchObjectsForService({
            serviceId: 'crdServiceId',
            clusterDetails: cluster,
            credential,
            objectTypesToFetch,
            labelSelector: labelSelectorString,
            customResources: [],
          });

          if (crdTargets) {
            // Process specific CRD targets
            for (const crdTarget of crdTargets) {
              const parts = crdTarget.split('.');
              const plural = parts[0];
              const group = parts.slice(1).join('.');

              const filteredCRDs = fetchedObjects.responses
                .flatMap(response => response.resources)
                .filter(crd => 
                  crd.spec.group === group && 
                  crd.spec.names.plural === plural
                )
                .map(crd => ({
                  ...crd,
                  clusterName: cluster.name,
                  clusterEndpoint: cluster.url,
                }));

              filteredCRDs.forEach(crd => {
                const crdKey = `${crd.spec.group}/${crd.spec.names.plural}`;
                if (!crdMap.has(crdKey)) {
                  crdMap.set(crdKey, {
                    ...crd,
                    clusters: [cluster.name],
                    clusterDetails: [{name: cluster.name, url: cluster.url}],
                  });
                } else {
                  const existingCrd = crdMap.get(crdKey);
                  if (!existingCrd.clusters.includes(cluster.name)) {
                    existingCrd.clusters.push(cluster.name);
                    existingCrd.clusterDetails.push({name: cluster.name, url: cluster.url});
                  }
                }
              });
            }
          } else {
            // Process CRDs based on label selector
            const labeledCRDs = fetchedObjects.responses
              .flatMap(response => response.resources)
              .map(crd => ({
                ...crd,
                clusterName: cluster.name,
                clusterEndpoint: cluster.url,
              }));
            labeledCRDs.forEach(crd => {
              const crdKey = `${crd.spec.group}/${crd.spec.names.plural}`;
              if (!crdMap.has(crdKey)) {
                crdMap.set(crdKey, {
                  ...crd,
                  clusters: [cluster.name],
                  clusterDetails: [{name: cluster.name, url: cluster.url}],
                });
              } else {
                const existingCrd = crdMap.get(crdKey);
                if (!existingCrd.clusters.includes(cluster.name)) {
                  existingCrd.clusters.push(cluster.name);
                  existingCrd.clusterDetails.push({name: cluster.name, url: cluster.url});
                }
              }
            });
          }
        } catch (error) {
          this.logger.error(`Failed to fetch CRD objects for cluster ${cluster.name}: ${error}`);
        }
      }
      return Array.from(crdMap.values());
    } catch (error) {
      this.logger.error('Error fetching CRD objects');
      throw error;
    }
  }

  private async getAuthCredential(cluster: KubernetesClusterDetails, authProvider: AuthProvider): Promise<any> {
    switch (authProvider) {
      case 'serviceAccount':
        const token = cluster.authMetadata?.serviceAccountToken;
        if (!token) {
          throw new Error('Service account token not found in cluster auth metadata');
        }
        return { type: 'bearer token', token };

      case 'google':
        // For Google authentication (both client and server-side)
        const googleAuth = cluster.authMetadata?.google;
        if (googleAuth) {
          return {
            type: 'google',
            ...googleAuth,
          };
        }
        throw new Error('Google auth metadata not found in cluster configuration');

      case 'aws':
        // For AWS authentication
        const awsRole = cluster.authMetadata?.['kubernetes.io/aws-assume-role'];
        if (!awsRole) {
          throw new Error('AWS role ARN not found in cluster auth metadata');
        }
        return {
          type: 'aws',
          assumeRole: awsRole,
          externalId: cluster.authMetadata?.['kubernetes.io/aws-external-id'],
          clusterAwsId: cluster.authMetadata?.['kubernetes.io/x-k8s-aws-id'],
        };

      case 'azure':
        // For Azure authentication (both AKS and server-side)
        const azureAuth = cluster.authMetadata?.azure || {};
        return {
          type: 'azure',
          ...azureAuth,
        };

      case 'oidc':
        // For OIDC authentication
        const oidcAuth = cluster.authMetadata?.oidc;
        if (!oidcAuth) {
          throw new Error('OIDC configuration not found in cluster auth metadata');
        }
        return {
          type: 'oidc',
          ...oidcAuth,
        };

      default:
        throw new Error(`Unsupported authentication provider: ${authProvider}`);
    }
  }
}

type ObjectToFetch = {
  group: string;
  apiVersion: string;
  plural: string;
  objectType: KubernetesObjectTypes;
}; 