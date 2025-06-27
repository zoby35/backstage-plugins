import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { crossplanePermissions } from '@terasky/backstage-plugin-crossplane-common';

/**
 * crossplanePermissionsPlugin backend plugin
 *
 * @public
 */
export const crossplanePermissionsPlugin = createBackendPlugin({
  pluginId: 'crossplane',
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
        permissionsRegistry.addPermissions(Object.values(crossplanePermissions));
        
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
