# Kubernetes GitOps Manifest Updater Plugin

Welcome to the gitops-manifest-updater plugin!

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-gitops-manifest-updater/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-gitops-manifest-updater)

The Kubernetes GitOps Manifest Updater plugin provides a form component for updating Kubernetes manifests in Git repositories. It uses the OpenAPI schema from the corresponding CRD to generate a dynamic form for updating manifest specifications.

## Features

- Dynamic form generation based on CRD OpenAPI schemas
- Support for GitHub repositories through Backstage's SCM integration
- Automatic PR creation with changes
- Support for both entity annotations and manual URL input
- Preserves file paths and directory structure

## Installation
From your Backstage root directory, run:
```bash
yarn add --cwd packages/app @terasky/backstage-plugin-gitops-manifest-updater
```
Adding the plugins field extension to your Backstage apps scaffolder route:
```typescript
// packages/app/src/App.tsx
import { GitOpsManifestUpdaterExtension } from '@terasky/backstage-plugin-gitops-manifest-updater';
import { ScaffolderFieldExtensions } from '@backstage/plugin-scaffolder-react';

const routes = (
  <FlatRoutes>
    ...
    <Route path="/create" element={<ScaffolderPage />}>
      <ScaffolderFieldExtensions>
        <GitOpsManifestUpdaterExtension />
      </ScaffolderFieldExtensions>
    </Route>
    ...
  </FlatRoutes>
);
```
Integrate the plugin with the entity scaffolder plugin:
```typescript
// packages/app/src/components/catalog/EntityPage.tsx
import { GitOpsManifestUpdaterExtension } from '@terasky/backstage-plugin-gitops-manifest-updater';
import { ScaffolderFieldExtensions } from '@backstage/plugin-scaffolder-react';

const serviceEntityPage = (
  <EntityLayout>
    ...
    <EntityLayout.Route path="/scaffolder" title="Entity Scaffolder">
        <EntityScaffolderContent
          templateGroupFilters={[
            {
              title: 'Management Templates',
              filter: (entity, template) =>
                template.metadata?.labels?.target === 'component' &&
                entity.metadata?.annotations?.['backstage.io/managed-by-location']?.split(":")[0] === 'cluster origin',
            },
          ]}
          buildInitialState={entity => ({
              entity: stringifyEntityRef(entity)
            }
          )}
          ScaffolderFieldExtensions={
            <ScaffolderFieldExtensions>
              <RepoUrlPickerFieldExtension />
              <EntityPickerFieldExtension />
              <GitOpsManifestUpdaterExtension />
            </ScaffolderFieldExtensions>
          }
        />
    </EntityLayout.Route>
    ...
  </EntityLayoutWrapper>
);

const crossplaneEntityPage = (
  <EntityLayout>
    ...
    <EntityLayout.Route path="/scaffolder" title="Entity Scaffolder">
        <EntityScaffolderContent
          templateGroupFilters={[
            {
              title: 'Management Templates',
              filter: (entity, template) =>
                template.metadata?.labels?.target === 'component' &&
                entity.metadata?.annotations?.['backstage.io/managed-by-location']?.split(":")[0] === 'cluster origin',
            },
          ]}
          buildInitialState={entity => ({
              entity: stringifyEntityRef(entity)
            }
          )}
          ScaffolderFieldExtensions={
            <ScaffolderFieldExtensions>
              <RepoUrlPickerFieldExtension />
              <EntityPickerFieldExtension />
              <GitOpsManifestUpdaterExtension />
            </ScaffolderFieldExtensions>
          }
        />
    </EntityLayout.Route>
    ...
  </EntityLayoutWrapper>
);
```

## Add the Example Template to your Backstage app
The example template is located in the templates directory.
This template utilizes the GitOpsManifestUpdaterExtension to update a manifest in a GitHub repository.