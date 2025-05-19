import { Key, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import { vcfAutomationApiRef } from '../api/VcfAutomationClient';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { Grid, Typography, Chip } from '@material-ui/core';
import useAsync from 'react-use/lib/useAsync';
import { usePermission } from '@backstage/plugin-permission-react';
import { viewProjectDetailsPermission } from '@terasky/backstage-plugin-vcf-automation-common';

export const VCFAutomationProjectOverview = () => {
  const { entity } = useEntity();
  const api = useApi(vcfAutomationApiRef);
  const projectId = entity.metadata.name;

  const { allowed: hasViewPermission, loading: permissionLoading } = usePermission({
    permission: viewProjectDetailsPermission,
  });

  const { value: project, loading, error } = useAsync(async () => {
    if (!projectId || !hasViewPermission) return undefined;
    return await api.getProjectDetails(projectId);
  }, [projectId, hasViewPermission]);

  if (!projectId) {
    return (
      <InfoCard title="VCF Automation Project">
        <Typography>No project ID found for this entity.</Typography>
      </InfoCard>
    );
  }

  if (loading || permissionLoading) {
    return (
      <InfoCard title="VCF Automation Project">
        <Progress />
      </InfoCard>
    );
  }

  if (!hasViewPermission) {
    return (
      <InfoCard title="VCF Automation Project">
        <Typography>You don't have permission to view project details.</Typography>
      </InfoCard>
    );
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (!project) {
    return (
      <InfoCard title="VCF Automation Project">
        <Typography>No project details available.</Typography>
      </InfoCard>
    );
  }

  return (
    <InfoCard title="VCF Automation Project">
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Name</Typography>
          <Typography>{project.name}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Description</Typography>
          <Typography>{project.description || 'No description'}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Administrators</Typography>
          <Grid container spacing={1}>
            {project.administrators.map((admin: { email: any; type: any; }) => (
              <Grid item key={`${admin.email}-${admin.type}`}>
                <Chip
                  label={`${admin.email} (${admin.type})`}
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Resource Allocation</Typography>
          {project.zones.map((zone: { id: Key | null | undefined; zoneId: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; allocatedInstancesCount: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; maxNumberInstances: any; allocatedMemoryMB: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; memoryLimitMB: any; allocatedCpu: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; cpuLimit: any; allocatedStorageGB: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; storageLimitGB: any; }) => (
            <Grid container spacing={2} key={zone.id}>
              <Grid item xs={12}>
                <Typography variant="body2">Zone: {zone.zoneId}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption">Instances</Typography>
                <Typography>
                  {zone.allocatedInstancesCount} / {zone.maxNumberInstances || 'Unlimited'}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption">Memory (MB)</Typography>
                <Typography>
                  {zone.allocatedMemoryMB} / {zone.memoryLimitMB || 'Unlimited'}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption">CPU</Typography>
                <Typography>
                  {zone.allocatedCpu} / {zone.cpuLimit || 'Unlimited'}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption">Storage (GB)</Typography>
                <Typography>
                  {zone.allocatedStorageGB} / {zone.storageLimitGB || 'Unlimited'}
                </Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Shared Resources</Typography>
          <Typography>{project.sharedResources ? 'Yes' : 'No'}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Placement Policy</Typography>
          <Typography>{project.placementPolicy}</Typography>
        </Grid>
      </Grid>
    </InfoCard>
  );
}; 