import {
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
  createApiFactory,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { EducatesClient, educatesApiRef } from './api/EducatesClient';

export const educatesPlugin = createPlugin({
  id: 'educates',
  apis: [
    createApiFactory({
      api: educatesApiRef,
      deps: { 
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) => new EducatesClient({ discoveryApi, fetchApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const EducatesPage = educatesPlugin.provide(
  createRoutableExtension({
    name: 'EducatesPage',
    component: () =>
      import('./components/EducatesPage').then(m => m.EducatesPage),
    mountPoint: rootRouteRef,
  }),
);