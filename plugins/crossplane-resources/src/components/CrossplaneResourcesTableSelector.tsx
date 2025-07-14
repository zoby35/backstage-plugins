import { useEntity } from '@backstage/plugin-catalog-react';
import CrossplaneV1ResourcesTable from './CrossplaneV1ResourceTable';
import CrossplaneV2ResourcesTable from './CrossplaneV2ResourceTable';

const CrossplaneResourcesTableSelector = () => {
  const { entity } = useEntity();
  const version = entity?.metadata?.annotations?.['terasky.backstage.io/crossplane-version'];

  if (version === 'v2') {
    return <CrossplaneV2ResourcesTable />;
  }
  // Default to v1
  return <CrossplaneV1ResourcesTable />;
};

export default CrossplaneResourcesTableSelector; 