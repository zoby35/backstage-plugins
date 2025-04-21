import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import { vcfAutomationApiRef } from '../api/VcfAutomationClient';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { Grid, Typography } from '@material-ui/core';
import useAsync from 'react-use/lib/useAsync';
import { usePermission } from '@backstage/plugin-permission-react';
import { viewDeploymentHistoryPermission } from '@terasky/backstage-plugin-vcf-automation-common';

export const VCFAutomationDeploymentOverview = () => {
  const { entity } = useEntity();
  const api = useApi(vcfAutomationApiRef);
  const deploymentId = entity.metadata.name;

  const { allowed: hasViewPermission, loading: permissionLoading } = usePermission({
    permission: viewDeploymentHistoryPermission,
  });

  const { value: deploymentDetails, loading, error } = useAsync(async () => {
    if (!deploymentId || !hasViewPermission) {
      return undefined;
    }
    return await api.getDeploymentDetails(deploymentId);
  }, [deploymentId, hasViewPermission]);

  if (!deploymentId) {
    return (
      <InfoCard title="VCF Automation Deployment">
        <Typography>No deployment ID found for this entity.</Typography>
      </InfoCard>
    );
  }

  if (loading || permissionLoading) {
    return (
      <InfoCard title="VCF Automation Deployment">
        <Progress />
      </InfoCard>
    );
  }

  if (!hasViewPermission) {
    return (
      <InfoCard title="VCF Automation Deployment">
        <Typography>You don't have permission to view deployment details.</Typography>
      </InfoCard>
    );
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (!deploymentDetails) {
    return (
      <InfoCard title="VCF Automation Deployment">
        <Typography>No deployment details available.</Typography>
      </InfoCard>
    );
  }

  return (
    <InfoCard title="VCF Automation Deployment">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">Deployment Information</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Name</Typography>
          <Typography>{deploymentDetails.name}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Status</Typography>
          <Typography>{deploymentDetails.status}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Created By</Typography>
          <Typography>{deploymentDetails.createdBy}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Created At</Typography>
          <Typography>
            {new Date(deploymentDetails.createdAt).toLocaleString()}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Last Updated By</Typography>
          <Typography>{deploymentDetails.lastUpdatedBy}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Last Updated At</Typography>
          <Typography>
            {new Date(deploymentDetails.lastUpdatedAt).toLocaleString()}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Expenses</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="subtitle2">Total</Typography>
          <Typography>
            {deploymentDetails.expense.totalExpense} {deploymentDetails.expense.unit}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="subtitle2">Compute</Typography>
          <Typography>
            {deploymentDetails.expense.computeExpense} {deploymentDetails.expense.unit}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="subtitle2">Storage</Typography>
          <Typography>
            {deploymentDetails.expense.storageExpense} {deploymentDetails.expense.unit}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="subtitle2">Additional</Typography>
          <Typography>
            {deploymentDetails.expense.additionalExpense} {deploymentDetails.expense.unit}
          </Typography>
        </Grid>
      </Grid>
    </InfoCard>
  );
}; 