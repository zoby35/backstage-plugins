import { Entity } from '@backstage/catalog-model';



export const isKubernetesResourcesAvailable = (entity: Entity): boolean => {
  return Boolean(entity.metadata.annotations?.['terasky.backstage.io/kubernetes-resource-name']);
};