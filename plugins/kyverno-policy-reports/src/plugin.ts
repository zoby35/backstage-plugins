import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const kyvernoPolicyReportsPlugin = createPlugin({
  id: 'kyverno-policy-reports',
  routes: {
    root: rootRouteRef,
  },
});

export const KyvernoPolicyReportsTable = kyvernoPolicyReportsPlugin.provide(
  createComponentExtension({
    name: 'KyvernoPolicyReportsTable',
    component: {
      lazy: () => import('./components/KyvernoPolicyReportsTable').then(m => m.default),
    },
  }),
);

export const KyvernoOverviewCard = kyvernoPolicyReportsPlugin.provide(
  createComponentExtension({
    name: 'KyvernoOverviewCard',
    component: {
      lazy: () => import('./components/KyvernoOverviewCard').then(m => m.default),
    },
  }),
);