import { createPlugin, createComponentExtension } from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const devpodPlugin = createPlugin({
  id: 'backstage-plugin-devpod',
  routes: {
    root: rootRouteRef,
  },
});

export const DevpodProvider = devpodPlugin.provide(
  createComponentExtension({
    name: 'DevpodProvider',
    component: {
      lazy: () => import('./components/DevpodProvider').then(m => m.DevpodProvider as any),
    },
  }),
);

export const DevpodComponent = devpodPlugin.provide(
  createComponentExtension({
    name: 'DevpodComponent',
    component: {
      lazy: () => import('./components/DevpodComponent').then(m => m.DevpodComponent),
    },
  }),
);