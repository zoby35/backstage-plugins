import { createPlugin, createComponentExtension } from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const aiRulesPlugin = createPlugin({
  id: 'ai-rules',
  routes: {
    root: rootRouteRef,
  },
});

export const AIRulesComponent = aiRulesPlugin.provide(
  createComponentExtension({
    name: 'AIRulesComponent',
    component: {
      lazy: () => import('./components/AiRulesComponent/AiRulesComponent').then(m => m.AIRulesComponent),
    },
  }),
);