import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const crossplaneResourcesPlugin = createPlugin({
  id: 'crossplane-resources',
  routes: {
    root: rootRouteRef,
  },
});

// new components with v1 and v2 support
export const CrossplaneResourcesTableSelector = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'CrossplaneResourcesTableSelector',
    component: {
      lazy: () => import('./components/CrossplaneResourcesTableSelector').then(m => m.default),
    },
  }),
);

export const CrossplaneResourceGraphSelector = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'CrossplaneResourceGraphSelector',
    component: {
      lazy: () => import('./components/CrossplaneResourceGraphSelector').then(m => m.default),
    },
  }),
);

export const CrossplaneOverviewCardSelector = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'CrossplaneOverviewCardSelector',
    component: {
      lazy: () => import('./components/CrossplaneOverviewCardSelector').then(m => m.default),
    },
  }),
);

// Crossplane v1 specific components
export const CrossplaneV1OverviewCard = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'CrossplaneV1OverviewCard',
    component: {
      lazy: () => import('./components/CrossplaneV1OverviewCard').then(m => m.default),
    },
  }),
);

export const CrossplaneV1ResourceGraph = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'CrossplaneV1ResourceGraph',
    component: {
      lazy: () => import('./components/CrossplaneV1ResourceGraph').then(m => m.default),
    },
  }),
);

export const CrossplaneV1ResourcesTable = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'CrossplaneV1ResourcesTable',
    component: {
      lazy: () => import('./components/CrossplaneV1ResourceTable').then(m => m.default),
    },
  }),
);

// Crossplane v2 specific components
export const CrossplaneV2OverviewCard = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'CrossplaneV2OverviewCard',
    component: {
      lazy: () => import('./components/CrossplaneV2OverviewCard').then(m => m.default),
    },
  }),
);

export const CrossplaneV2ResourceGraph = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'CrossplaneV2ResourceGraph',
    component: {
      lazy: () => import('./components/CrossplaneV2ResourceGraph').then(m => m.default),
    },
  }),
);

export const CrossplaneV2ResourcesTable = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'CrossplaneV2ResourcesTable',
    component: {
      lazy: () => import('./components/CrossplaneV2ResourceTable').then(m => m.default),
    },
  }),
);

// Legacy components with crossplane v1 and v2 support
export const LegacyCrossplaneResourceGraphSelector = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'LegacyCrossplaneResourceGraphSelector',
    component: {
      lazy: () => import('./components/LegacyCrossplaneResourceGraphSelector').then(m => m.default),
    },
  }),
);

export const LegacyCrossplaneResourcesTableSelector = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'LegacyCrossplaneResourcesTableSelector',
    component: {
      lazy: () => import('./components/LegacyCrossplaneResourcesTableSelector').then(m => m.default),
    },
  }),
);

// Legacy components for crossplane v1
export const LegacyCrossplaneV1ResourcesTable = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'LegacyCrossplaneV1ResourcesTable',
    component: {
      lazy: () => import('./components/LegacyCrossplaneV1ResourcesTable').then(m => m.default),
    },
  }),
);

export const LegacyCrossplaneV1ResourceGraph = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'LegacyCrossplaneV1ResourceGraph',
    component: {
      lazy: () => import('./components/LegacyCrossplaneV1ResourceGraph').then(m => m.default),
    },
  }),
);

export const LegacyCrossplaneV1CompositeResourcesTable = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'LegacyCrossplaneV1CompositeResourcesTable',
    component: {
      lazy: () => import('./components/LegacyCrossplaneV1CompositeResourcesTable').then(m => m.default),
    },
  }),
);

export const LegacyCrossplaneV1ManagedResources = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'LegacyCrossplaneV1ManagedResources',
    component: {
      lazy: () => import('./components/LegacyCrossplaneV1ManagedResources').then(m => m.default),
    },
  }),
);

export const LegacyCrossplaneV1ClaimResourcesTable = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'LegacyCrossplaneV1ClaimResourcesTable',
    component: {
      lazy: () => import('./components/LegacyCrossplaneV1ClaimResourcesTable').then(m => m.default),
    },
  }),
);

export const LegacyCrossplaneV1UsedResourcesTable = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'LegacyCrossplaneV1UsedResourcesTable',
    component: {
      lazy: () => import('./components/LegacyCrossplaneV1UsedResourcesTable').then(m => m.default),
    },
  }),
);

// Legacy components for crossplane v2
export const LegacyCrossplaneV2ResourcesTable = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'LegacyCrossplaneV2ResourcesTable',
    component: {
      lazy: () => import('./components/LegacyCrossplaneV2ResourcesTable').then(m => m.default),
    },
  }),
);

export const LegacyCrossplaneV2ResourceGraph = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'LegacyCrossplaneV2ResourceGraph',
    component: {
      lazy: () => import('./components/LegacyCrossplaneV2ResourceGraph').then(m => m.default),
    },
  }),
);

export const LegacyCrossplaneV2CompositeResourcesTable = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'LegacyCrossplaneV2CompositeResourcesTable',
    component: {
      lazy: () => import('./components/LegacyCrossplaneV2CompositeResourcesTable').then(m => m.default),
    },
  }),
);

export const LegacyCrossplaneV2ManagedResources = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'LegacyCrossplaneV2ManagedResources',
    component: {
      lazy: () => import('./components/LegacyCrossplaneV2ManagedResources').then(m => m.default),
    },
  }),
);

export const LegacyCrossplaneV2UsedResourcesTable = crossplaneResourcesPlugin.provide(
  createComponentExtension({
    name: 'LegacyCrossplaneV2UsedResourcesTable',
    component: {
      lazy: () => import('./components/LegacyCrossplaneV2UsedResourcesTable').then(m => m.default),
    },
  }),
);