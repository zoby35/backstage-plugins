# Configuring the VCF Automation Backend Plugin

This guide covers the configuration options available for the VCF Automation backend plugin.

## Configuration File

The plugin is configured through your `app-config.yaml`. Here's the basic configuration:

```yaml
vcfAutomation:
  # Base URL of your VCF Automation service
  baseUrl: 'https://your-vcf-automation-instance'
  
  # Authentication configuration
  authentication:
    username: 'your-username'
    password: 'your-password'
    domain: 'your-domain'
```

## API Endpoints

The plugin exposes the following endpoints:

- `GET /api/vcf-automation/deployments/:id` - Get deployment details
- `GET /api/vcf-automation/resources/:id` - Get resource details
- `GET /api/vcf-automation/projects/:id` - Get project details
- `POST /api/vcf-automation/deployments/:id/operations` - Execute deployment operations
- `GET /api/vcf-automation/events` - Stream VCF events

## Links

- [Installation Guide](install.md)
- [About the plugin](about.md)
