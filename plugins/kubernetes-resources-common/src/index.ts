import { createPermission } from '@backstage/plugin-permission-common';

export const showResourceGraphPermission = createPermission({
  name: 'kubernetes-resources.graph.show',
  attributes: { action: 'read' },
});

export const listSecretsPermission = createPermission({
  name: 'kubernetes-resources.secrets.list',
  attributes: { action: 'read' },
});
export const viewSecretsPermission = createPermission({
  name: 'kubernetes-resources.secrets.view-yaml',
  attributes: { action: 'read' },
});

export const listResourcesPermission = createPermission({
  name: 'kubernetes-resources.resources.list',
  attributes: { action: 'read' },
});

export const showEventsResourcesPermission = createPermission({
  name: 'kubernetes-resources.events.show',
  attributes: { action: 'read' },
});

export const viewYamlResourcesPermission = createPermission({
  name: 'kubernetes-resources.yaml.view',
  attributes: { action: 'read' },
});
export const kubernetesResourcesPermissions = [showResourceGraphPermission, listSecretsPermission, viewSecretsPermission, listResourcesPermission, showEventsResourcesPermission, viewYamlResourcesPermission];