import { createBackendModule } from "@backstage/backend-plugin-api";
import { scaffolderActionsExtensionPoint  } from '@backstage/plugin-scaffolder-node/alpha';
import { createCrossplaneClaimAction } from "./actions/claim-templating";
import { createCatalogInfoCleanerAction } from "./actions/catalog-info-cleaner";
/**
 * A backend module that registers the action into the scaffolder
 */
export const scaffolderModule = createBackendModule({
  moduleId: 'crossplane-claim-action',
  pluginId: 'scaffolder',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolderActions: scaffolderActionsExtensionPoint
      },
      async init({ scaffolderActions}) {
        scaffolderActions.addActions(createCrossplaneClaimAction());
        scaffolderActions.addActions(createCatalogInfoCleanerAction());
      }
    });
  },
})
