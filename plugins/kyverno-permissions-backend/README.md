# Kyverno Permissions
Welcome to the kyverno-permissions backend plugin!

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-kyverno-permissions-backend/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-kyverno-permissions-backend)

## Description

The `kyverno-permissions` backend plugin for Backstage provides integration with Kyverno, enabling permission management and access control for Kyverno Policy Reports. This plugin leverages Backstage's permission framework to enforce policies and manage access to Kyverno Reports.

## Installation

To install and configure the `kyverno-permissions` backend plugin in your Backstage instance, follow these steps:

  * Add the package
  ```bash
  yarn --cwd packages/backend add @terasky/backstage-plugin-kyverno-permissions-backend
  ```
  * Add to backend (packages/backend/src/index.ts)
  ```javascript
  backend.add(import('@terasky/backstage-plugin-kyverno-permissions-backend'));
  ```

## Usage
Once installed and configured, the kyverno-permissions plugin will provide endpoints for managing permissions and access control for Kyverno policy reports. You can access these endpoints via the configured routes in your Backstage backend.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License
This project is licensed under the Apache-2.0 License.