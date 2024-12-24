import { Entity } from '@backstage/catalog-model';



export const isCrossplaneAvailable = (entity: Entity): boolean => {
  return Boolean(entity.metadata.annotations?.['terasky.backstage.io/crossplane-resource']);
};