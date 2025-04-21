# vcf-automation-backend

Welcome to the vcf-automation-backend plugin!

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-vcf-automation-backend/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-vcf-automation-backend)

## Description

The `vcf-automation-backend` plugin provides the backend services required for the VCF Automation frontend plugin. It handles API integration with VCF services, manages permissions, and processes deployment and resource operations.

## Prerequisites

Before installing this plugin, ensure you have:

1. A running Backstage backend instance
2. Access to a VCF Automation service
3. [VCF Ingestor Plugin](../vcf-ingestor/README.md) - Required for entity synchronization

## Installation

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @terasky/backstage-plugin-vcf-automation-backend
```

## Configuration

Add the following to your `app-config.yaml`:

```yaml
vcfAutomation:
  baseUrl: 'https://your-vcf-automation-instance'
  authentication:
    username: 'your-username'
    password: 'your-password'
    domain: 'your-domain'
```

## Integration

Add the plugin to your backend by modifying `packages/backend/src/index.ts`:

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// ... other backend plugins

backend.add(import('@terasky/plugin-vcf-automation-backend'));

backend.start();
```

## Features

- **API Integration**: Seamless integration with VCF Automation services
- **Permission Management**: Built-in support for Backstage's permission framework
- **Entity Processing**: Handles entity relationship mapping and updates
- **Operation Management**: Processes deployment and resource operations
- **Event Handling**: Manages VCF events and notifications

## API Endpoints

The plugin exposes the following endpoints:

- `GET /api/vcf-automation/deployments/:id` - Get deployment details
- `GET /api/vcf-automation/resources/:id` - Get resource details
- `GET /api/vcf-automation/projects/:id` - Get project details
- `POST /api/vcf-automation/deployments/:id/operations` - Execute deployment operations
- `GET /api/vcf-automation/events` - Stream VCF events

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the Apache-2.0 License.
