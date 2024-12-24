# entity-scaffolder-content

Welcome to the entity-scaffolder-content plugin!

[![npm latest version](https://img.shields.io/npm/v/@vrabbi/backstage-plugin-entity-scaffolder-content/latest.svg)](https://www.npmjs.com/package/@vrabbi/backstage-plugin-entity-scaffolder-content)

## Description

The `entity-scaffolder-content` plugin for Backstage allows embedding a tab with scaffolder templates on a component. This can also populate the list of templates and data in the templates based on the context from which it is run.

## Installation

To install and configure the `entity-scaffolder-content` plugin in your Backstage instance, follow these steps:

  * Add the package
  ```bash
  yarn --cwd packages/app add @vrabbi/backstage-plugin-entity-scaffolder-content
  ```
  * Add to Entity Page (packages/app/src/components/catalog/EntityPage.tsx)
  ```javascript
  import { EntityScaffolderContent } from '@vrabbi/backstage-plugin-entity-scaffolder-content';
  
  ...

  const systemPage = (
  <EntityLayout>
    ...
    
    <EntityLayout.Route path="/scaffolder" title="Crossplane Scaffolder">
        <EntityScaffolderContent
          templateGroupFilters={[
            {
              title: 'Crossplane Claims',
              filter: (entity, template) =>
                template.metadata?.labels?.forEntity === 'system' &&
                entity.spec?.type === 'kubernetes-namespace',
            },
          ]}
          buildInitialState={entity => ({
              xrNamespace: entity.metadata.name,
              clusters: [entity.metadata?.annotations?.['backstage.io/managed-by-location']?.split(": ")[1] ?? '']
            }
          )}
        />
    </EntityLayout.Route>

    ...
  </EntityLayout>
  );

  ```

## Usage
Once installed and configured, the entity-scaffolder-content plugin will provide components for embedding scaffolder templates on a component in the Backstage UI.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License
This project is licensed under the Apache-2.0 License.