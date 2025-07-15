import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/**
 * AI Rules backend plugin
 *
 * @public
 */
export const aiRulesPlugin = createBackendPlugin({
  pluginId: 'ai-rules',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        urlReader: coreServices.urlReader,
      },
      async init({
        httpRouter,
        logger,
        config,
        discovery,
        urlReader,
      }) {
        httpRouter.use(
          (await createRouter({
            logger,
            config,
            discovery,
            urlReader,
          })) as any,
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
}); 