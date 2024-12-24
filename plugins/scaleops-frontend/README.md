# scaleops-frontend

Welcome to the scaleops-frontend plugin!

[![npm latest version](https://img.shields.io/npm/v/@vrabbi/backstage-plugin-scaleops-frontend/latest.svg)](https://www.npmjs.com/package/@vrabbi/backstage-plugin-scaleops-frontend)

## Description

The `scaleops-frontend` plugin for Backstage displays basic data from ScaleOps regarding Kubernetes entities on your component. It shows potential and realized savings and can provide a link to the ScaleOps dashboard for more specific and broader data points. This plugin supports a single ScaleOps endpoint but does support multi-cluster features in ScaleOps allowing for end-to-end visibility.

## Installation

To install and configure the `scaleops-frontend` plugin in your Backstage instance, follow these steps:

* Add the package
  ```bash
  yarn --cwd packages/app add @vrabbi/backstage-plugin-scaleops-frontend
  ```
  * Add to Entity Page (packages/app/src/components/catalog/EntityPage.tsx)
  ```javascript
  import { ScaleopsCard, isScaleopsAvailable } from '@vrabbi/backstage-plugin-scaleops-frontend'


  const serviceEntityPage = (
  <EntityLayout>
    ...
    
    <EntityLayout.Route if={isScaleopsAvailable} path="/scaleops" title="ScaleOps">
      <ScaleopsCard />
    </EntityLayout.Route>

    ...
  </EntityLayout>
  );
  ```

## Configuration
* available config options:
```yaml
scaleops:
  baseUrl: url for your scaleops instance
  currencyPrefix: "$"
  linkToDashboard: true # Whether to add a clickable hardlink to the components resources in the scaleops dashboard
  useProxy: false # Whether to use the backstage proxy instead of a direct URL.
  authentication: 
    enabled: false # planned for future expansion in order to support authenticated scaleops instances. currently basic support for auth is available when using the proxy mode but not via the direct mode.
```

## Usage
Once installed and configured, the scaleops-frontend plugin will provide components for visualizing ScaleOps data in the Backstage UI.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License
This project is licensed under the Apache-2.0 License.