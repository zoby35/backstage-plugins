import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
  StructuredMetadataTable,
} from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { vcfAutomationApiRef } from '../api/VcfAutomationClient';
import { showDeploymentResourcesDataPermission } from '@terasky/backstage-plugin-vcf-automation-common';
import { usePermission } from '@backstage/plugin-permission-react';

export const VCFAutomationVSphereVMDetails = () => {
  const { entity } = useEntity();
  const vcfAutomationApi = useApi(vcfAutomationApiRef);
  const deploymentId = entity.spec?.system || '';
  const resourceId = entity.metadata.name;

  const { allowed } = usePermission({
    permission: showDeploymentResourcesDataPermission,
  });

  const { value, loading, error } = useAsync(async () => {
    if (!resourceId || !deploymentId || !allowed) return undefined;
    return await vcfAutomationApi.getVSphereVMDetails(deploymentId as string, resourceId);
  }, [resourceId, deploymentId, allowed]);

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (loading) {
    return <Progress />;
  }

  if (!resourceId || !deploymentId) {
    return <InfoCard title="No resource ID found">This entity is not associated with a VCF resource or deployment.</InfoCard>;
  }

  if (!allowed) {
    return <InfoCard title="Permission Denied">You don't have permission to view resource details.</InfoCard>;
  }

  if (!value) {
    return <InfoCard title="No Data">No resource details available.</InfoCard>;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <InfoCard title="Resource Status">
          <StructuredMetadataTable
            metadata={{
              Name: value.name,
              Type: value.type,
              State: value.state,
              'Sync Status': value.syncStatus,
              'Created At': new Date(value.createdAt).toLocaleString(),
              Origin: value.origin,
              'Depends On': value.dependsOn,
            }}
          />
        </InfoCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <InfoCard title="VM Properties">
          <StructuredMetadataTable
            metadata={{
              'Power State': value.properties.powerState,
              Zone: value.properties.zone,
              Environment: value.properties.environmentName,
              'Host Type': value.properties.computeHostType,
              'Memory (GB)': value.properties.memoryGB,
              'CPU Count': value.properties.cpuCount,
              'Total Memory (MB)': value.properties.totalMemoryMB,
              'OS Type': value.properties.osType,
              Region: value.properties.region,
              'Host Name': value.properties.hostName,
              'Data Center': value.properties.datacenter,
              'Datastore': value.properties.datastoreName,
            }}
          />
        </InfoCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <InfoCard title="Storage Configuration">
          <StructuredMetadataTable
            metadata={{
              'Primary Disk': {
                Name: value.properties.storage?.disks[0]?.name || 'N/A',
                'Capacity (GB)': value.properties.storage?.disks[0]?.capacityGb || 'N/A',
                Type: value.properties.storage?.disks[0]?.type || 'N/A',
                'Provisioning': value.properties.storage?.disks[0]?.provisioningType || 'N/A',
              },
            }}
          />
        </InfoCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <InfoCard title="Network Configuration">
          <StructuredMetadataTable
            metadata={{
              'Primary Network': value.properties.networks?.[0] ? {
                Name: value.properties.networks[0].name,
                Address: value.properties.networks[0].address,
                'MAC Address': value.properties.networks[0].mac_address,
                Assignment: value.properties.networks[0].assignment,
                'IPv6 Addresses': value.properties.networks[0].ipv6Addresses || [],
              } : 'No network configuration available',
            }}
          />
        </InfoCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <InfoCard title="Expense Information">
          <StructuredMetadataTable
            metadata={{
              'Total Expense': `$${value.expense.totalExpense.toFixed(2)}`,
              'Compute Expense': `$${value.expense.computeExpense.toFixed(2)}`,
              'Storage Expense': `$${value.expense.storageExpense.toFixed(2)}`,
              'Additional Expense': `$${value.expense.additionalExpense.toFixed(2)}`,
              'Currency': value.expense.unit,
              'Last Updated': new Date(value.expense.lastUpdatedTime).toLocaleString(),
            }}
          />
        </InfoCard>
      </Grid>
    </Grid>
  );
}; 