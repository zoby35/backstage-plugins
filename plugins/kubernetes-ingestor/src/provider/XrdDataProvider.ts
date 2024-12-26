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
  HttpAuthService,
  AuthService,
} from '@backstage/backend-plugin-api';

type ObjectToFetch = {
  group: string;
  apiVersion: string;
  plural: string;
  objectType: KubernetesObjectTypes;
};

export class XrdDataProvider {
  logger: LoggerService;
  config: Config;
  catalogApi: CatalogApi;
  permissions: PermissionEvaluator;
  discovery: DiscoveryService;
  auth: AuthService;
  httpAuth: HttpAuthService;

  constructor(
    logger: LoggerService,
    config: Config,
    catalogApi: CatalogApi,
    discovery: DiscoveryService,
    permissions: PermissionEvaluator,
    auth: AuthService,
    httpAuth: HttpAuthService
  ) {
    this.logger = logger;
    this.config = config;
    this.catalogApi = catalogApi;
    this.permissions = permissions;
    this.discovery = discovery;
    this.auth = auth;
    this.httpAuth = httpAuth;
  }

  async fetchXRDObjects(): Promise<any[]> {
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

      const ingestAllXRDs = this.config.getOptionalBoolean('kubernetesIngestor.crossplane.xrds.ingestAllXRDs') ?? false;

      let allFetchedObjects: any[] = [];

      for (const cluster of clusters) {
        const token = cluster.authMetadata.serviceAccountToken;

        if (!token) {
          this.logger.warn(`Cluster ${cluster.name} does not have a valid service account token.`);
          continue;
        }

        try {
          const objectTypesToFetch: Set<ObjectToFetch> = new Set([
            {
              group: 'apiextensions.crossplane.io',
              apiVersion: 'v1',
              plural: 'compositeresourcedefinitions',
              objectType: 'customresources' as KubernetesObjectTypes,
            },
          ]);

          const fetchedObjects = await fetcher.fetchObjectsForService({
            serviceId: 'xrdServiceId',
            clusterDetails: cluster,
            credential: { type: 'bearer token', token },
            objectTypesToFetch,
            labelSelector: '',
            customResources: [],
          });

          const fetchedResources = fetchedObjects.responses.flatMap(response =>
            response.resources.map(resource => ({
              ...resource,
              clusterName: cluster.name,
            })),
          );

            const filteredObjects = fetchedResources.filter(resource => {
            if (resource.metadata.annotations?.['terasky.backstage.io/exclude-from-catalog']) {
              return false;
            }

            if (!ingestAllXRDs && !resource.metadata.annotations?.['terasky.backstage.io/add-to-catalog']) {
              return false;
            }

            if (!resource.spec?.claimNames?.kind) {
              return false;
            }

            return true;
            }).map(resource => ({
            ...resource,
            clusterName: cluster.name, // Attach the cluster name to the resource
            }));

          allFetchedObjects = allFetchedObjects.concat(filteredObjects);

          this.logger.debug(
            `Fetched ${filteredObjects.length} objects from cluster: ${cluster.name}`,
          );

          // Fetch all compositions from the cluster
          const compositions = await fetcher.fetchObjectsForService({
            serviceId: 'compositionServiceId',
            clusterDetails: cluster,
            credential: { type: 'bearer token', token },
            objectTypesToFetch: new Set([
              {
                group: 'apiextensions.crossplane.io',
                apiVersion: 'v1',
                plural: 'compositions',
                objectType: 'customresources' as KubernetesObjectTypes,
              },
            ]),
            labelSelector: '',
            customResources: [],
          });

          const fetchedCompositions = compositions.responses.flatMap(response =>
            response.resources.map(resource => ({
              ...resource,
              clusterName: cluster.name,
            })),
          );

          // Group XRDs by their name and add clusters and compositions information
          const xrdMap = new Map<string, any>();
          allFetchedObjects.forEach(xrd => {
            const xrdName = xrd.metadata.name;
            if (!xrdMap.has(xrdName)) {
              xrdMap.set(xrdName, { ...xrd, clusters: [xrd.clusterName], compositions: [] });
            } else {
              const existingXrd = xrdMap.get(xrdName);
              existingXrd.clusters.push(xrd.clusterName);
            }
          });

          // Add compositions to the corresponding XRDs
          fetchedCompositions.forEach(composition => {
            const { apiVersion, kind } = composition.spec.compositeTypeRef;
            xrdMap.forEach((xrd) => {
              const { apiVersion: xrdApiVersion, kind: xrdKind } = xrd.status.controllers.compositeResourceType;
              if (apiVersion === xrdApiVersion && kind === xrdKind) {
                xrd.compositions.push(composition.metadata.name);
              }
            });
          });

          return Array.from(xrdMap.values());
        } catch (clusterError) {
          if (clusterError instanceof Error) {
            this.logger.error(`Failed to fetch XRD objects for cluster ${cluster.name}: ${clusterError.message}`, clusterError);
          } else {
            this.logger.error(`Failed to fetch XRD objects for cluster ${cluster.name}:`, {
              error: String(clusterError),
            });
          }
        }
      }

      this.logger.debug(`Total fetched XRD objects: ${allFetchedObjects.length}`);

      // Group XRDs by their name and add clusters information
      const xrdMap = new Map<string, any>();
      allFetchedObjects.forEach(xrd => {
        const xrdName = xrd.metadata.name;
        if (!xrdMap.has(xrdName)) {
          xrdMap.set(xrdName, { ...xrd, clusters: [xrd.clusterName] });
        } else {
          const existingXrd = xrdMap.get(xrdName);
          existingXrd.clusters.push(xrd.clusterName);
        }
      });

      return Array.from(xrdMap.values());
    } catch (error) {
      this.logger.error('Error fetching XRD objects');
      throw error;
    }
  }
}