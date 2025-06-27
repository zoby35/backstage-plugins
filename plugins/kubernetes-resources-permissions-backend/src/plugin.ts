import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { kubernetesResourcesPermissions } from '@terasky/backstage-plugin-kubernetes-resources-common';

/**
 * kubernetesResourcesPermissionsPlugin backend plugin
 *
 * @public
 */
export const kubernetesResourcesPermissionsPlugin = createBackendPlugin({
  pluginId: 'kubernetes-resources',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        permissions: coreServices.permissions,
        permissionsRegistry: coreServices.permissionsRegistry,
      },
      async init({
        httpRouter,
        logger,
        permissions,
        permissionsRegistry,
      }) {
        permissionsRegistry.addPermissions(Object.values(kubernetesResourcesPermissions));
        
        httpRouter.use(
          await createRouter({
            logger,
            permissions,
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
