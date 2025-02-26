import { createPermission } from '@backstage/plugin-permission-common';

export const showResourceGraph = createPermission({
  name: 'kubernetes-resources.graph.show',
  attributes: { action: 'read' },
});

export const kubernetesResourcesPermissions = [showResourceGraph];