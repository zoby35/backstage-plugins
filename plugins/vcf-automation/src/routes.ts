import { createRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'vcf-automation',
});

export const deploymentRouteRef = createRouteRef({
  id: 'vcf-automation:deployment',
  params: ['deploymentId'],
});

export const resourceRouteRef = createRouteRef({
  id: 'vcf-automation:resource',
  params: ['deploymentId', 'resourceId'],
});

export const projectRouteRef = createRouteRef({
  id: 'vcf-automation:project',
  params: ['projectId'],
});
