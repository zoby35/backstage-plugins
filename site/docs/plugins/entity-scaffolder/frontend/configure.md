# Configuring the Entity Scaffolder Content Frontend Plugin

This guide covers the configuration options available for the Entity Scaffolder Content frontend plugin.

## Component Configuration

### EntityScaffolderContent Props

The main component accepts the following configuration props:

```typescript
interface EntityScaffolderContentProps {
  // Define template filtering and grouping
  templateGroupFilters: Array<{
    title: string;
    filter: (entity: Entity, template: Template) => boolean;
  }>;
  
  // Map entity data to template fields
  buildInitialState?: (entity: Entity) => Record<string, unknown>;
  
  // Additional template filtering
  additionalTemplateFilters?: Array<(template: Template) => boolean>;
  
  // Default template category
  defaultCategory?: string;
}
```

### Template Group Filters

Configure how templates are filtered and grouped based on entity context:

```typescript
const templateGroupFilters = [
  {
    title: 'Kubernetes Resources',
    filter: (entity, template) =>
      template.metadata?.labels?.type === 'kubernetes' &&
      entity.spec?.type === 'kubernetes-namespace',
  },
  {
    title: 'Application Templates',
    filter: (entity, template) =>
      template.metadata?.labels?.type === 'application' &&
      entity.spec?.type === 'service',
  },
];
```

### Initial State Builder

Define how entity data maps to template form fields:

```typescript
const buildInitialState = (entity: Entity) => ({
  // Basic metadata mapping
  name: entity.metadata.name,
  namespace: entity.metadata.namespace,
  
  // Extract from annotations
  cluster: entity.metadata?.annotations?.['backstage.io/managed-by-location']?.split(": ")[1],
  
  // Custom transformations
  labels: Object.entries(entity.metadata.labels || {}).map(
    ([key, value]) => `${key}=${value}`
  ),
});
```

### Additional Template Filters

Add extra filtering rules beyond group filters:

```typescript
const additionalTemplateFilters = [
  // Filter out deprecated templates
  (template) => !template.metadata?.labels?.deprecated,
  
  // Only show templates with specific tag
  (template) => template.metadata?.tags?.includes('approved'),
];
```

## Entity Page Integration

### Basic Integration

Add the plugin to an entity page:

```typescript
import { EntityScaffolderContent } from '@terasky/backstage-plugin-entity-scaffolder-content';

const entityPage = (
  <EntityLayout>
    <EntityLayout.Route 
      path="/scaffolder" 
      title="Templates"
    >
      <EntityScaffolderContent
        templateGroupFilters={templateGroupFilters}
        buildInitialState={buildInitialState}
      />
    </EntityLayout.Route>
  </EntityLayout>
);
```

### Advanced Integration

Configure for multiple entity types:

```typescript
const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route 
      path="/scaffolder" 
      title="Service Templates"
    >
      <EntityScaffolderContent
        templateGroupFilters={[
          {
            title: 'Service Templates',
            filter: (entity, template) =>
              template.metadata?.labels?.type === 'service' &&
              entity.spec?.type === 'service',
          },
        ]}
        buildInitialState={entity => ({
          serviceName: entity.metadata.name,
          owner: entity.spec?.owner,
          type: entity.spec?.type,
        })}
        defaultCategory="Service Templates"
      />
    </EntityLayout.Route>
  </EntityLayout>
);

const systemEntityPage = (
  <EntityLayout>
    <EntityLayout.Route 
      path="/scaffolder" 
      title="System Templates"
    >
      <EntityScaffolderContent
        templateGroupFilters={[
          {
            title: 'System Resources',
            filter: (entity, template) =>
              template.metadata?.labels?.type === 'system' &&
              entity.spec?.type === 'system',
          },
        ]}
        buildInitialState={entity => ({
          systemName: entity.metadata.name,
          environment: entity.spec?.environment,
        })}
        defaultCategory="System Resources"
      />
    </EntityLayout.Route>
  </EntityLayout>
);
```

## Best Practices

1. **Template Filtering**
    - Use clear, descriptive group titles
    - Keep filter conditions simple and maintainable
    - Consider template metadata structure
    - Handle edge cases gracefully

2. **Data Mapping**
    - Validate entity data before mapping
    - Provide sensible defaults
    - Document data transformations
    - Handle missing data gracefully

3. **Entity Integration**
    - Use consistent route paths
    - Group related templates logically
    - Consider user workflow
    - Maintain clear navigation

For installation instructions, refer to the [Installation Guide](./install.md). 