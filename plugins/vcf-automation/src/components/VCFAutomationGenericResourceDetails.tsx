import { useEntity } from '@backstage/plugin-catalog-react';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
  StructuredMetadataTable,
} from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { vcfAutomationApiRef } from '../api/VcfAutomationClient';

const formatValue = (value: any): any => {
  if (value === null) return 'null';
  if (typeof value === 'undefined') return 'undefined';
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map(formatValue);
    }
    const formattedObj: Record<string, any> = {};
    Object.entries(value).forEach(([key, val]) => {
      formattedObj[key] = formatValue(val);
    });
    return formattedObj;
  }
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
    return new Date(value).toLocaleString();
  }
  return value;
};

export const VCFAutomationGenericResourceDetails = () => {
  const { entity } = useEntity();
  const vcfAutomationApi = useApi(vcfAutomationApiRef);
  const deploymentId = entity.spec?.system || '';
  const resourceId = entity.metadata.name;

  const { value: resourceData, loading, error } = useAsync(async () => {
    if (!deploymentId || !resourceId) return undefined;
    return await vcfAutomationApi.getGenericResourceDetails(deploymentId as string, resourceId as string);
  }, [deploymentId, resourceId]);

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (loading) {
    return <Progress />;
  }

  if (!deploymentId || !resourceId) {
    return (
      <InfoCard title="No Resource Information">
        This entity is not associated with a VCF resource.
      </InfoCard>
    );
  }

  if (!resourceData) {
    return <InfoCard title="No Data">No resource details available.</InfoCard>;
  }

  // Format all data for display
  const formattedData = formatValue(resourceData);

  return (
    <InfoCard title="Resource Details">
      <StructuredMetadataTable metadata={formattedData} />
    </InfoCard>
  );
}; 