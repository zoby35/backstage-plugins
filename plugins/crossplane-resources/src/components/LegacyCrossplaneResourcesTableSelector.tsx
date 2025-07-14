import { useEntity } from '@backstage/plugin-catalog-react';
import LegacyCrossplaneV1ResourcesTable from './LegacyCrossplaneV1ResourcesTable';
import LegacyCrossplaneV2ResourcesTable from './LegacyCrossplaneV2ResourcesTable';

const LegacyCrossplaneResourcesTableSelector = () => {
  const { entity } = useEntity();
  const version = entity?.metadata?.annotations?.['terasky.backstage.io/crossplane-version'];

  if (version === 'v2') {
    return <LegacyCrossplaneV2ResourcesTable />;
  }
  // Default to v1
  return <LegacyCrossplaneV1ResourcesTable />;
};

export default LegacyCrossplaneResourcesTableSelector; 