import {
  createBackendPlugin,
  coreServices,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { educatesPermissions } from '@terasky/backstage-plugin-educates-common';

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
        permissionsRegistry: coreServices.permissionsRegistry,
      },
      async init({
        httpRouter,
        logger,
        config,
        permissions,
        permissionsRegistry,
      }) {
        permissionsRegistry.addPermissions(Object.values(educatesPermissions));
        
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