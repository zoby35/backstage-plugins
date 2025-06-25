# educates-backend

Welcome to the educates-backend plugin!

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-educates-backend/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-educates-backend)

## Description

The `educates-backend` plugin provides the backend services required for the Educates frontend plugin. It handles API integration with Educates training portals, manages authentication, and processes workshop session operations.

## Prerequisites

Before installing this plugin, ensure you have:

1. A running Backstage backend instance
2. Access to one or more Educates training portals
3. [Educates Common Package](../educates-common/README.md) - Required for shared types and utilities

## Installation

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @terasky/backstage-plugin-educates-backend
```

## Configuration

Add the following to your `app-config.yaml`:

```yaml
educates:
  trainingPortals:
    - name: example-portal
      url: https://example-training-portal.com
      robotUsername: robot@educates
      robotPassword: ${EDUCATES_EXAMPLE_ROBOT_PASSWORD}
      clientId: ${EDUCATES_EXAMPLE_ROBOT_CLIENT_ID}
      clientSecret: ${EDUCATES_EXAMPLE_ROBOT_CLIENT_SECRET}
```

## Integration

Add the plugin to your backend by modifying `packages/backend/src/index.ts`:

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// ... other backend plugins

backend.add(import('@terasky/plugin-educates-backend'));

backend.start();
```

## Features

- **API Integration**: Seamless integration with Educates training portals
- **Authentication Management**: Handles token-based authentication and caching
- **Multi-Portal Support**: Support for multiple training portal configurations
- **Session Management**: Processes workshop session requests and status updates
- **Error Handling**: Comprehensive error handling and logging
- **Permission Integration**: Built-in support for Backstage's permission framework

## API Endpoints

The plugin exposes the following endpoints:

- `GET /api/educates/training-portals` - List all configured training portals
- `GET /api/educates/training-portals/:portalName/workshops` - List workshops from a training portal
- `GET /api/educates/training-portals/:portalName/workshops/:workshopName` - Get workshop details
- `POST /api/educates/training-portals/:portalName/workshops/:workshopName/sessions` - Request a workshop session
- `GET /api/educates/training-portals/:portalName/workshops/:workshopName/sessions/:sessionId` - Get session status
- `DELETE /api/educates/training-portals/:portalName/workshops/:workshopName/sessions/:sessionId` - End a workshop session

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the Apache-2.0 License. 