import { useEntity } from '@backstage/plugin-catalog-react';
import LegacyCrossplaneV1ResourceGraph from './LegacyCrossplaneV1ResourceGraph';
import LegacyCrossplaneV2ResourceGraph from './LegacyCrossplaneV2ResourceGraph';

const LegacyCrossplaneResourceGraphSelector = () => {
  const { entity } = useEntity();
  const version = entity?.metadata?.annotations?.['terasky.backstage.io/crossplane-version'];

  if (version === 'v2') {
    return <LegacyCrossplaneV2ResourceGraph />;
  }
  // Default to v1
  return <LegacyCrossplaneV1ResourceGraph />;
};

export default LegacyCrossplaneResourceGraphSelector; 