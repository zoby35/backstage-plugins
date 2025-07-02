# Installing the VCF Automation Frontend Plugin

This guide will help you install and set up the VCF Automation frontend plugin in your Backstage instance.

## Prerequisites

Before installing this plugin, ensure you have:

1. [VCF Automation Backend Plugin](../backend/about.md) - Required for API integration
2. [VCF Ingestor Plugin](../ingestor/about.md) - Required for entity synchronization

## Installation Steps

### 1. Install the Plugin

Add the plugin to your Backstage project:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @terasky/backstage-plugin-vcf-automation
```

### 2. Register the Plugin

Add the plugin to your app's APIs in `packages/app/src/apis.ts`:

```typescript
import {
  vcfAutomationApiRef,
  VcfAutomationClient,
} from '@terasky/backstage-plugin-vcf-automation';

export const apis: AnyApiFactory[] = [
  // ... other API factories
  createApiFactory({
    api: vcfAutomationApiRef,
    deps: { discoveryApi: discoveryApiRef, identityApi: identityApiRef },
    factory: ({ discoveryApi, identityApi }) => 
      new VcfAutomationClient({ discoveryApi, identityApi }),
  }),
];
```

### 3. Add to App.tsx

Add the plugin to your `packages/app/src/App.tsx`:

```typescript
import { vcfAutomationPlugin } from '@terasky/backstage-plugin-vcf-automation';

const app = createApp({
  apis,
  bindRoutes({ bind }) {
    // ... other bindings
    bind(vcfAutomationPlugin.externalRoutes, {
      catalogIndex: catalogPlugin.routes.catalogIndex,
    });
  },
});
```

### 4. Add Components to Entity Pages

Add the VCF Automation components to your entity pages in `packages/app/src/components/catalog/EntityPage.tsx`:

```typescript
import {
  VCFAutomationDeploymentOverview,
  VCFAutomationDeploymentDetails,
  VCFAutomationVSphereVMOverview,
  VCFAutomationVSphereVMDetails,
  VCFAutomationGenericResourceOverview,
  VCFAutomationGenericResourceDetails,
  VCFAutomationProjectOverview,
  VCFAutomationProjectDetails,
} from '@terasky/backstage-plugin-vcf-automation';
import { Entity } from '@backstage/catalog-model';

// For VSphere VMs
const vcfAutomationVSphereVMPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <EntityAboutCard variant="gridItem" />
        </Grid>
        <Grid item md={6}>
          <VCFAutomationVSphereVMOverview />
        </Grid>
      </Grid>
    </EntityLayout.Route>
    <EntityLayout.Route path="/vcf-automation" title="VCF Automation">
      <VCFAutomationVSphereVMDetails />
    </EntityLayout.Route>
  </EntityLayout>
);

// Add to your component page switch
const componentPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={isComponentType('Cloud.vSphere.Machine')}>
      {vcfAutomationVSphereVMPage}
    </EntitySwitch.Case>
    // ... other cases
  </EntitySwitch>
);

// For VCF Deployments
const hasVcfAutomationDeploymentStatus = (entity: Entity): boolean => 
  Boolean(entity.metadata?.annotations?.['terasky.backstage.io/vcf-automation-deployment-status']);

const vcfAutomationDeploymentPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <VCFAutomationDeploymentOverview />
        </Grid>
      </Grid>
    </EntityLayout.Route>
    <EntityLayout.Route path="/vcf-automation" title="VCF Automation">
      <VCFAutomationDeploymentDetails />
    </EntityLayout.Route>
  </EntityLayout>
);

// For Generic Resources
const hasVcfAutomationResourceType = (entity: Entity): boolean => 
  Boolean(entity.metadata?.annotations?.['terasky.backstage.io/vcf-automation-resource-type']);

const vcfAutomationGenericResourcePage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <VCFAutomationGenericResourceOverview />
        </Grid>
      </Grid>
    </EntityLayout.Route>
    <EntityLayout.Route path="/vcf-automation" title="VCF Automation">
      <VCFAutomationGenericResourceDetails />
    </EntityLayout.Route>
  </EntityLayout>
);

// For Projects (in Domain page)
const domainPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <VCFAutomationProjectOverview />
        </Grid>
      </Grid>
    </EntityLayout.Route>
    <EntityLayout.Route path="/vcf-automation" title="VCF Automation">
      <VCFAutomationProjectDetails />
    </EntityLayout.Route>
  </EntityLayout>
);

// Add a Resources Page
const resourcePage = (
  <EntitySwitch>
    <EntitySwitch.Case if={hasVcfAutomationResourceType}>
      {vcfAutomationGenericResourcePage}
    </EntitySwitch.Case>
    <EntitySwitch.Case>
      {defaultEntityPage}
    </EntitySwitch.Case>
  </EntitySwitch>
);

// Update the entityPage constant to include the resource page
export const entityPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={isKind('resource')} children={resourcePage} />
    // ... other cases
  </EntitySwitch>
);
```

## What's Next?

- [Configure the plugin](configure.md)
- [Learn about the plugin's features](about.md)
