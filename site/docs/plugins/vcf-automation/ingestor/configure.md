# Configuring the VCF Automation Ingestor Plugin

This guide covers the configuration options available for the VCF Automation Ingestor plugin.


## Simple Configuration

For a single VCF Automation instance you can provide config as follows:
  
Add the following to your `app-config.yaml`:

```yaml
vcfAutomation:
  name: my-vcf-01
  majorVersion: 8 # 9 is also supported
  baseUrl: 'https://your-vcf-automation-instance'
  orgName: my-org # This is needed only in VCFA 9 and above
  authentication:
    username: 'your-username'
    password: 'your-password'
    domain: 'your-domain' # This is needed only in Aria Automation 8.x
```

## Multi Instance Config

The plugin does support multi instance config in the following format:

```yaml
vcfAutomation:
  instances:
  - name: my-vcf-01
    baseUrl: 'https://your-vcf-automation-instance'
    majorVersion: 9
    orgName: my-org # This is needed only in VCFA 9 and above
    authentication:
      username: 'your-username'
      password: 'your-password'
      domain: 'your-domain' # This is needed only in Aria Automation 8.x
  - name: my-vcf-02
    baseUrl: 'https://your-vcf-02-automation-instance'
    majorVersion: 8
    authentication:
      username: 'your-username'
      password: 'your-password'
      domain: 'your-domain' # This is needed only in Aria Automation 8.x
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
