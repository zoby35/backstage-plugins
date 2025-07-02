# Configuring the Educates Backend Plugin

This guide covers the configuration options available for the Educates backend plugin.

## Configuration File

The plugin is configured through your `app-config.yaml`. Here's a comprehensive example:

```yaml
educates:
  # Required: Training portal configurations
  trainingPortals:
    - name: example-portal
      url: https://example-training-portal.com
      robotUsername: robot@educates
      robotPassword: ${EDUCATES_EXAMPLE_ROBOT_PASSWORD}
      clientId: ${EDUCATES_EXAMPLE_ROBOT_CLIENT_ID}
      clientSecret: ${EDUCATES_EXAMPLE_ROBOT_CLIENT_SECRET}
```

## Environment Variables

Required environment variables for each training portal:

```bash
EDUCATES_<PORTAL_NAME>_ROBOT_PASSWORD=your-robot-password
EDUCATES_<PORTAL_NAME>_ROBOT_CLIENT_ID=your-client-id
EDUCATES_<PORTAL_NAME>_ROBOT_CLIENT_SECRET=your-client-secret
```

## Portal Configuration

### Basic Portal Setup

Minimum required configuration for each portal:

```yaml
educates:
  trainingPortals:
    - name: portal-name
      url: https://portal-url.com
      robotUsername: robot@educates
      robotPassword: ${EDUCATES_PORTAL_NAME_ROBOT_PASSWORD}
      clientId: ${EDUCATES_PORTAL_NAME_ROBOT_CLIENT_ID}
      clientSecret: ${EDUCATES_PORTAL_NAME_ROBOT_CLIENT_SECRET}
```

For installation instructions, refer to the [Installation Guide](./install.md).
