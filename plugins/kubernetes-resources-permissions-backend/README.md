# kubernetes-resources-permissions
Welcome to the kubernetes-resources-permissions backend plugin!

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-kubernetes-resources-permissions-backend/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-kubernetes-resources-permissions-backend)

## Description

The `kubernetes-resources-permissions` backend plugin for Backstage provides integration with kubernetes-resources, enabling permission management and access control for kubernetes-resources graph visualization. This plugin leverages Backstage's permission framework to enforce policies and manage access to Kubernetes resources.

## Installation

To install and configure the `kubernetes-resources-permissions` backend plugin in your Backstage instance, follow these steps:

  * Add the package
  ```bash
  yarn --cwd packages/backend add @terasky/backstage-plugin-kubernetes-resources-permissions-backend
  ```
  * Add to backend (packages/backend/src/index.ts)
  ```javascript
  backend.add(import('@terasky/backstage-plugin-kubernetes-resources-permissions-backend'));
  ```

## Usage
Once installed and configured, the kubernetes-resources-permissions plugin will provide endpoints for managing permissions and access control for kubernetes resources. You can access these endpoints via the configured routes in your Backstage backend.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License
This project is licensed under the Apache-2.0 License.