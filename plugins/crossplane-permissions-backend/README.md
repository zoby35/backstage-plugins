# crossplane-permissions
Welcome to the crossplane-permissions backend plugin!

[![npm latest version](https://img.shields.io/npm/v/@vrabbi/backstage-plugin-crossplane-permissions-backend/latest.svg)](https://www.npmjs.com/package/@vrabbi/backstage-plugin-crossplane-permissions-backend)

## Description

The `crossplane-permissions` backend plugin for Backstage provides integration with Crossplane, enabling permission management and access control for Crossplane resources. This plugin leverages Backstage's permission framework to enforce policies and manage access to Crossplane resources.

## Installation

To install and configure the `crossplane-permissions` backend plugin in your Backstage instance, follow these steps:

  * Add the package
  ```bash
  yarn --cwd packages/backend add @vrabbi/backstage-plugin-crossplane-permissions-backend
  ```
  * Add to backend (packages/backend/src/index.ts)
  ```javascript
  backend.add(import('@vrabbi/backstage-plugin-crossplane-permissions-backend'));
  ```

## Usage
Once installed and configured, the crossplane-permissions plugin will provide endpoints for managing permissions and access control for Crossplane resources. You can access these endpoints via the configured routes in your Backstage backend.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License
This project is licensed under the Apache-2.0 License.