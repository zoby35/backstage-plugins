# scaffolder-backend-module-terasky-utils

Welcome to the scaffolder-backend-module-terasky-utils plugin!

[![npm latest version](https://img.shields.io/npm/v/@vrabbi/backstage-plugin-scaffolder-backend-module-terasky-utils/latest.svg)](https://www.npmjs.com/package/@vrabbi/backstage-plugin-scaffolder-backend-module-terasky-utils)

## Description

The `scaffolder-backend-module-terasky-utils` plugin for Backstage is a package of multiple scaffolder actions. These actions include:

- **terasky:claim-template**: This action converts input parameters into a Kubernetes YAML manifest for the Crossplane claim and writes it to the filesystem of the action based on the format "<cluster>/<namespace>/<kind>/<name>.yaml".
- **terasky:catalog-info-cleaner**: This action takes a Backstage entity and cleans up runtime information and then outputs as a catalog-info.yaml file on the filesystem of the action the cleaned up manifest. This is useful for auto-ingested components that you want to enable a push to git of the manifest to allow for a full git-based catalog management when needed.

## Installation

To install and configure the `scaffolder-backend-module-terasky-utils` plugin in your Backstage instance, follow these steps:

  * Add the package
  ```bash
  yarn --cwd packages/backend add @vrabbi/backstage-plugin-scaffolder-backend-module-terasky-utils
  ```
  * Add to backend (packages/backend/src/index.ts)
  ```javascript
  backend.add(import('@vrabbi/backstage-plugin-scaffolder-backend-module-terasky-utils'));
  ```

## Usage
Once installed and configured, the scaffolder-backend-module-terasky-utils plugin will provide scaffolder actions for managing Kubernetes resources and Backstage entities.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License
This project is licensed under the Apache-2.0 License.
