import {
  createBackendPlugin,
  coreServices,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { vcfAutomationPermissions } from '@terasky/backstage-plugin-vcf-automation-common';
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
        permissionsRegistry: coreServices.permissionsRegistry,
      },
      async init({
        httpRouter,
        logger,
        permissions,
        config,
        permissionsRegistry,
      }) {
        permissionsRegistry.addPermissions(Object.values(vcfAutomationPermissions));
        
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