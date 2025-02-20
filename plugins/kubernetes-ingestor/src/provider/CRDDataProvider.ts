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

      const crdTargets = this.config.getOptionalStringArray('kubernetesIngestor.genericCRDTemplates.crds') || [];
      if (crdTargets.length === 0) {
        return [];
      }

      const crdMap = new Map<string, any>();

      for (const cluster of clusters) {
        const token = cluster.authMetadata.serviceAccountToken;
        if (!token) {
          this.logger.warn(`Cluster ${cluster.name} does not have a valid service account token.`);
          continue;
        }

        try {
          for (const crdTarget of crdTargets) {
            const parts = crdTarget.split('.');
            const plural = parts[0];
            const group = parts.slice(1).join('.');

            const objectTypesToFetch: Set<ObjectToFetch> = new Set([
              {
                group: 'apiextensions.k8s.io',
                apiVersion: 'v1',
                plural: 'customresourcedefinitions',
                objectType: 'customresources' as KubernetesObjectTypes,
              },
            ]);

            const fetchedObjects = await fetcher.fetchObjectsForService({
              serviceId: 'crdServiceId',
              clusterDetails: cluster,
              credential: { type: 'bearer token', token },
              objectTypesToFetch,
              labelSelector: ``,
              customResources: [],
            });

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
}

type ObjectToFetch = {
  group: string;
  apiVersion: string;
  plural: string;
  objectType: KubernetesObjectTypes;
}; 