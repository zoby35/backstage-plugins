import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const kubernetesResourcesPlugin = createPlugin({
  id: 'kubernetes-resources',
  routes: {
    root: rootRouteRef,
  },
});

export const KubernetesResourceGraph = kubernetesResourcesPlugin.provide(
  createComponentExtension({
    name: 'KubernetesResourceGraph',
    component: {
      lazy: () => import('./components/KubernetesResourceGraph').then(m => m.default),
    },
  }),
);

export const KubernetesResourcesPage = kubernetesResourcesPlugin.provide(
  createComponentExtension({
    name: 'KubernetesResourcesPage',
    component: {
      lazy: () => import('./components/KubernetesResourcesPage').then(m => m.default),
    },
  }),
);