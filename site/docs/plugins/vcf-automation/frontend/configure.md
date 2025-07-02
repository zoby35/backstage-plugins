# Configuring the VCF Automation Frontend Plugin

This guide covers the configuration options available for the VCF Automation frontend plugin.

## Configuration

Add the following to your `app-config.yaml`:

```yaml
vcfAutomation:
  baseUrl: http://your-vcf-automation-service
  # Enable permission checks
  enablePermissions: true
  # Auth details
  authentication:
    username: 'your-username'
    password: 'your-password'
    domain: 'your-domain'
```

## Links

- [Installation Guide](install.md)
- [About the plugin](about.md)

## Configuration File

The plugin is configured through your `app-config.yaml`. Here's a comprehensive example:

```yaml
vcfAutomation:
  # Base URL of your VCF Automation service
  baseUrl: http://your-vcf-automation-service
  
  # Enable permission checks
  enablePermissions: true
  # Auth details
  authentication:
    username: 'your-username'
    password: 'your-password'
    domain: 'your-domain'

```
  
## Best Practices

1. **Component Configuration**
     - Set appropriate refresh intervals
     - Handle errors gracefully
     - Use consistent styling
     - Implement proper validation

2. **Permission Management**
     - Define clear role boundaries
     - Implement least privilege
     - Document access levels
     - Regular permission audits

3. **Performance Optimization**
     - Cache API responses
     - Minimize refresh frequency
     - Implement error boundaries
     - Monitor resource usage

4. **Security**
     - Use secure tokens
     - Implement HTTPS
     - Validate input data
     - Regular security audits
  
For installation instructions, refer to the [Installation Guide](./install.md).
