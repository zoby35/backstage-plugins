import { useEntity } from '@backstage/plugin-catalog-react';
import CrossplaneV1ResourceGraph from './CrossplaneV1ResourceGraph';
import CrossplaneV2ResourceGraph from './CrossplaneV2ResourceGraph';

const CrossplaneResourceGraphSelector = () => {
  const { entity } = useEntity();
  const version = entity?.metadata?.annotations?.['terasky.backstage.io/crossplane-version'];

  if (version === 'v2') {
    return <CrossplaneV2ResourceGraph />;
  }
  // Default to v1
  return <CrossplaneV1ResourceGraph />;
};

export default CrossplaneResourceGraphSelector; 