# Configuring the ScaleOps Frontend Plugin

This guide covers the configuration options available for the ScaleOps frontend plugin.

## Configuration File

The plugin is configured through your `app-config.yaml`. Here's a comprehensive example:

```yaml
scaleops:
  # Base URL of your ScaleOps instance
  baseUrl: 'https://your-scaleops-instance.com'
  
  # Enable direct links to ScaleOps dashboard
  linkToDashboard: true
  
  # Authentication configuration
  authentication:
    enabled: true
    user: 'YOUR_USERNAME'
    password: 'YOUR_PASSWORD'
```

## Authentication Options

### Internal Authentication
```yaml
authentication:
  enabled: true
  user: 'username'
  password: 'password'
```

### No Authentication
```yaml
authentication:
  enabled: false
```

### Environment Variables
```yaml
authentication:
  enabled: true
  user: ${SCALEOPS_USERNAME}
  password: ${SCALEOPS_PASSWORD}
```

## Best Practices

1. **Authentication**
    - Use environment variables
    - Rotate credentials regularly
    - Implement proper secret management
    - Use secure authentication methods

2. **Performance**
    - Set appropriate refresh intervals
    - Configure caching if needed
    - Monitor API usage
    - Handle errors gracefully

3. **Integration**
    - Use consistent configuration
    - Document custom settings
    - Monitor dashboard performance
    - Maintain security standards

For installation instructions, refer to the [Installation Guide](./install.md).
