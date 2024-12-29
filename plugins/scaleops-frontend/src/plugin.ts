import {
  createComponentExtension,
  createPlugin,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const scaleopsPlugin = createPlugin({
  id: 'scaleops',
  routes: {
    root: rootRouteRef,
  },
});

export const ScaleopsCard = scaleopsPlugin.provide(
  createComponentExtension({
    name: 'ScaleopsCard',
    component: {
      lazy: () => import('./components/ScaleopsCard').then(m => m.ScaleopsCard),
    },
  }),
);

export const ScaleOpsDashboard = scaleopsPlugin.provide(
  createComponentExtension({
    name: 'ScaleOpsDashboard',
    component: {
      lazy: () => import('./components/ScaleOpsDashboard').then(m => m.ScaleOpsDashboard),
    },
  }),
);
