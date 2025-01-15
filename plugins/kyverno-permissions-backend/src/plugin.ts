import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

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
      },
      async init({
        httpRouter,
        logger,
        permissions,
      }) {
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
