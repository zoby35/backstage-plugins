import { createPlugin } from '@backstage/core-plugin-api';
import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { createScaffolderFieldExtension } from '@backstage/plugin-scaffolder-react';
import { GitClaimUpdaterForm } from './components/GitClaimUpdaterForm';
import { GitClaimUpdaterSchema } from './components/GitClaimUpdaterForm';

export const crossplaneClaimUpdaterPlugin = createPlugin({
  id: 'crossplane-claim-updater',
});

export const GitClaimUpdaterExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
    name: 'GitClaimUpdater',
    component: GitClaimUpdaterForm,
    schema: GitClaimUpdaterSchema,
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