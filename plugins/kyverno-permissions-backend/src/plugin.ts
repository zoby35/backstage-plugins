import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { kyvernoPermissions } from '@terasky/backstage-plugin-kyverno-common';

/**
 * crossplanePermissionsPlugin backend plugin
 *
 * @public
 */
export const kyvernoPermissionsPlugin = createBackendPlugin({
  pluginId: 'kyverno',
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
        permissionsRegistry.addPermissions(Object.values(kyvernoPermissions));
        
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
