import {
  createBackendPlugin,
  coreServices,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
/**
 * The VCF Automation backend plugin provides API endpoints for managing VCF Automation resources.
 * @public
 */
export const vcfAutomationPlugin = createBackendPlugin({
  pluginId: 'vcf-automation',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        permissions: coreServices.permissions,
        config: coreServices.rootConfig,
      },
      async init({
        httpRouter,
        logger,
        permissions,
        config,
      }) {
        httpRouter.use(
          await createRouter({
            logger,
            permissions,
            config,
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