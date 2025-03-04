import { CustomFieldExtensionSchema } from '@backstage/plugin-scaffolder-react';

export const GitOpsManifestUpdaterSchema: CustomFieldExtensionSchema = {
  uiOptions: {
    type: 'object',
    properties: {},
  },
  returnValue: {
    type: 'object',
  },
}; 