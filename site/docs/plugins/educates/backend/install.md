# Installing the Educates Backend Plugin

This guide will help you install and set up the Educates backend plugin in your Backstage instance.

## Prerequisites

Before installing the plugin, ensure you have:

1. A running Backstage backend instance
2. Access to one or more Educates training portals
3. Required credentials for each training portal

## Installation Steps

### 1. Add the Package

Install the plugin package using yarn:

```bash
yarn --cwd packages/backend add @terasky/backstage-plugin-educates-backend
```

### 2. Add Plugin to Backend

Modify your `packages/backend/src/index.ts` to include the plugin:

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// ... other backend plugins

backend.add(import('@terasky/plugin-educates-backend'));

backend.start();
```

### 3. Configure Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Example portal configuration
EDUCATES_EXAMPLE_ROBOT_PASSWORD=your-robot-password
EDUCATES_EXAMPLE_ROBOT_CLIENT_ID=your-client-id
EDUCATES_EXAMPLE_ROBOT_CLIENT_SECRET=your-client-secret
```

### 4. Add Base Configuration

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

## Verification

After installation, verify that:

1. The plugin appears in your package.json dependencies
2. The backend starts without errors
3. The plugin endpoints are accessible
4. Training portal connections are successful

### Testing the Installation

1. Check the plugin health:
```bash
curl http://localhost:7007/api/educates/health
```

2. List training portals:
```bash
curl http://localhost:7007/api/educates/workshops/\<TRAINING PORTAL NAME\>/
```

## Troubleshooting

Common issues and solutions:

1. **Connection Errors**
    - Verify portal URL is correct
    - Check credentials in environment variables
    - Ensure portal is accessible from backend

2. **Authentication Issues**
    - Confirm robot credentials are valid
    - Check client ID and secret
    - Verify token refresh is working

3. **Plugin Not Loading**
    - Check backend plugin registration
    - Verify package installation
    - Review backend logs for errors

For configuration options and customization, proceed to the [Configuration Guide](./configure.md).
