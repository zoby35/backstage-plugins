import { createPlugin } from '@backstage/core-plugin-api';
import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { createScaffolderFieldExtension } from '@backstage/plugin-scaffolder-react';
import { GitOpsManifestUpdaterForm } from './components/GitOpsManifestUpdaterForm';
import { GitOpsManifestUpdaterSchema } from './components/GitOpsManifestUpdaterForm';

export const gitopsManifestUpdaterPlugin = createPlugin({
  id: 'gitops-manifest-updater',
});

export const GitOpsManifestUpdaterExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
    name: 'GitOpsManifestUpdater',
    component: GitOpsManifestUpdaterForm,
    schema: GitOpsManifestUpdaterSchema,
    validation: (formData, validation) => {
      // Add your validation logic here
      // Example:
      if (!formData) {
        validation.addError('Spec is required');
      }
      // Add more validation rules as needed
    },
  }),
); 