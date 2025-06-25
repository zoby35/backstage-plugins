# educates-common

Welcome to the common package for the Educates plugins!

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-educates-common/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-educates-common)

## Description

The `@terasky/backstage-plugin-educates-common` package provides shared functionalities, types, and permission definitions for the Educates plugins in Backstage. This package is used by both the frontend and backend Educates plugins to ensure consistent type definitions, permission management, and access control.

## Installation

```bash
# From your Backstage root directory
yarn add @terasky/backstage-plugin-educates-common
```

## Types

The package exports the following types:

- **TrainingPortalConfig**: Configuration for a training portal
- **EducatesConfig**: Plugin configuration
- **Workshop**: Workshop details and metadata
- **WorkshopEnvironment**: Workshop environment status and configuration
- **TrainingPortalStatus**: Training portal status and health information
- **WorkshopsCatalogResponse**: API response for workshops catalog
- **WorkshopSession**: Workshop session details and state

## Permissions

The `educates-common` package defines the following permissions for managing Educates resources:

- **View Workshop Catalog**: `educates.workshops.view`
- **Request Workshop Sessions**: `educates.workshop-sessions.create`

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the Apache-2.0 License. 