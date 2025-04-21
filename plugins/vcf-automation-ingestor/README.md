# VCF Automation Ingestor Plugin for Backstage

This plugin ingests VCF Automation deployments into the Backstage catalog. It creates the following entity types:

- **Systems**: Created from VCF Automation deployments
- **Components**: Created from VCF Automation resources of type `Cloud.vSphere.Machine`
- **Resources**: Created from all other VCF Automation resource types
- **Domains**: Created from VCF Automation projects

## Installation

1. Install the plugin package in your Backstage backend:

```bash
yarn add --cwd packages/backend @terasky/backstage-plugin-vcf-automation-ingestor
```

2. Configure the plugin in your `app-config.yaml`:

```yaml
vcfAutomation:
  baseUrl: 'https://your-vcf-automation-instance'
  authentication:
    username: 'your-username'
    password: 'your-password'
    domain: 'your-domain'
```

3. Import and register the plugin in your `packages/backend/index.ts`:

```typescript
backend.add(import('@terasky/backstage-plugin-vcf-automation-ingestor'));
```

## Entity Types

### Systems
Systems are created from VCF Automation deployments. Each deployment becomes a system with the following properties:
- `name`: The deployment ID
- `owner`: The deployment owner in the format `{ownerType}:{ownedBy}`
- `domain`: The project ID

### Components
Components are created from VCF Automation resources of type `Cloud.vSphere.Machine`. Each VM resource becomes a component with:
- `title`: The resource name
- `name`: The resource ID
- `type`: The resource type (`Cloud.vSphere.Machine`)
- `owner`: The deployment owner
- `system`: The parent deployment
- `lifecycle`: Set to 'production'
- `dependsOn`: List of dependent resources

### Resources
Resources are created from all other VCF Automation resource types. Each resource becomes a resource entity with:
- `title`: The resource name
- `name`: The resource ID
- `type`: The resource type
- `owner`: The deployment owner
- `system`: The parent deployment ID
- `dependsOn`: List of dependent resource IDs

### Domains
Domains are created from VCF Automation projects. Each project becomes a domain with:
- `name`: The project ID
- `owner`: The project owner

## Authentication

The plugin uses bearer token authentication with the VCF Automation API. It automatically handles token refresh when needed. The token is obtained by making a POST request to `/csp/gateway/am/api/login` with the configured credentials.

## Refresh Schedule

The plugin refreshes the entities every 30 minutes by default. Each refresh:
1. Authenticates with the VCF Automation API
2. Fetches all deployments using pagination
3. Transforms the deployments and their resources into Backstage entities
4. Updates the Backstage catalog
