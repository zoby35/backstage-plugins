# Configuring the VCF Automation Ingestor Plugin

This guide covers the configuration options available for the VCF Automation Ingestor plugin.

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

## Authentication

The plugin uses bearer token authentication with the VCF Automation API. It automatically handles token refresh when needed. The token is obtained by making a POST request to `/csp/gateway/am/api/login` with the configured credentials.

## Refresh Schedule

The plugin refreshes the entities every 30 minutes by default. Each refresh:  
1. Authenticates with the VCF Automation API  
2. Fetches all deployments using pagination  
3. Transforms the deployments and their resources into Backstage entities  
4. Updates the Backstage catalog  

## Links

- [Installation Guide](install.md)
- [About the plugin](about.md)
