import {
  createBackendPlugin,
  coreServices,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/**
 * The Educates backend plugin provides API endpoints for managing Educates workshops.
 * @public
 */
export const educatesPlugin = createBackendPlugin({
  pluginId: 'educates',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        permissions: coreServices.permissions,
      },
      async init({
        httpRouter,
        logger,
        config,
        permissions,
      }) {

        httpRouter.use(
          await createRouter({
            logger,
            config,
            permissions,
          }),
        );
      },
    });
  },
}); 