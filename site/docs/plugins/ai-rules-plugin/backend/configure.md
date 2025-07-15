# Configuring the AI Coding Rules Backend Plugin

This guide covers the configuration options available for the AI Coding Rules backend plugin.

## Basic Configuration

### Rule Types Configuration

Configure which rule types the backend should search for in your `app-config.yaml`:

```yaml
aiRules:
  allowedRuleTypes:
    - cursor
    - copilot
    - cline
```

### Configuration Schema

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `allowedRuleTypes` | `string[]` | `["cursor", "copilot"]` | Array of rule types to search for and parse |

### Default Configuration

If no configuration is provided, the plugin defaults to:

```yaml
aiRules:
  allowedRuleTypes:
    - cursor
    - copilot
```

## SCM Integration Requirements

### GitHub Configuration

For GitHub repositories:

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
    # For GitHub Enterprise
    - host: github.enterprise.com
      token: ${GITHUB_ENTERPRISE_TOKEN}
      apiBaseUrl: https://github.enterprise.com/api/v3
```

### GitLab Configuration

For GitLab repositories:

```yaml
integrations:
  gitlab:
    - host: gitlab.com
      token: ${GITLAB_TOKEN}
    # For self-hosted GitLab
    - host: gitlab.company.com
      token: ${GITLAB_COMPANY_TOKEN}
      apiBaseUrl: https://gitlab.company.com/api/v4
```

### Azure DevOps Configuration

For Azure DevOps repositories:

```yaml
integrations:
  azure:
    - host: dev.azure.com
      token: ${AZURE_TOKEN}
    # For Azure DevOps Server
    - host: tfs.company.com
      token: ${TFS_TOKEN}
```

### Bitbucket Configuration

For Bitbucket repositories:

```yaml
integrations:
  bitbucket:
    - host: bitbucket.org
      username: ${BITBUCKET_USERNAME}
      appPassword: ${BITBUCKET_APP_PASSWORD}
    # For Bitbucket Server
    - host: bitbucket.company.com
      token: ${BITBUCKET_SERVER_TOKEN}
```

## Rule Type Specifications

### Cursor Rules

Cursor rules are found in `.cursor/rules/*.mdc` files with optional frontmatter:

```yaml
# Configuration
aiRules:
  allowedRuleTypes:
    - cursor

# Rule file structure
# .cursor/rules/typescript.mdc
---
description: "TypeScript coding standards"
globs: ["*.ts", "*.tsx"]
alwaysApply: true
---

# TypeScript Rules
Use strict typing and avoid any types.
```

### GitHub Copilot Rules

Copilot rules are found in `.github/copilot-instructions.md`:

```yaml
# Configuration
aiRules:
  allowedRuleTypes:
    - copilot

# Rule file structure  
# .github/copilot-instructions.md
# Development Guidelines

Use TypeScript for all new code.
Follow existing code patterns.

Prefer functional components in React.
Use hooks instead of class components.
```

### Cline Rules

Cline rules are found in `.clinerules/*.md` files:

```yaml
# Configuration
aiRules:
  allowedRuleTypes:
    - cline

# Rule file structure
# .clinerules/development.md
# Development Guidelines

## Code Style
- Use ESLint and Prettier
- Follow team conventions

## Testing
- Write unit tests for all functions
```

## Environment-Specific Configuration

### Development Environment

```yaml
# app-config.development.yaml
aiRules:
  allowedRuleTypes:
    - cursor
    - copilot
    - cline

backend:
  logger:
    level: debug # Enable debug logging
```

### Production Environment

```yaml
# app-config.production.yaml
aiRules:
  allowedRuleTypes:
    - copilot # Only official guidelines in production

backend:
  logger:
    level: info # Standard logging level
```

### Testing Environment

```yaml
# app-config.test.yaml
aiRules:
  allowedRuleTypes:
    - cursor
    - copilot
    - cline

# Mock SCM integrations for testing
integrations:
  github:
    - host: github.com
      token: mock-token
```

## Security Configuration

### Token Security

Store authentication tokens securely:

```bash
# Environment variables
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
export GITLAB_TOKEN=glpat-xxxxxxxxxxxxxxxxxxxx
export AZURE_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxx
```

### Repository Access Control

Ensure tokens have minimal required permissions:

- **GitHub**: `repo` scope for private repos, or `public_repo` for public repos
- **GitLab**: `read_repository` permission
- **Azure DevOps**: `Code (read)` permission
- **Bitbucket**: `Repositories: Read` permission


## Monitoring and Observability

### Health Checks

The plugin provides health check endpoints:

```bash
# Check plugin health
curl http://localhost:7007/api/ai-rules/health
```

### Metrics

Monitor these key metrics:

- API request rate and latency
- Repository access success/failure rates
- Rule parsing success/failure rates
- Cache hit rates (when implemented)

### Error Tracking

Common error scenarios to monitor:

1. **Repository Access Errors**
   - Authentication failures
   - Network timeouts
   - Repository not found

2. **Content Parsing Errors**
   - Invalid frontmatter syntax
   - File encoding issues
   - Content too large

3. **Entity Resolution Errors**
   - Invalid entity references
   - Missing source locations
   - Catalog synchronization issues

## Troubleshooting Configuration

### Validation

Validate your configuration:

```typescript
// Check configuration loading
import { Config } from '@backstage/config';

const config = /* your config instance */;
const allowedRuleTypes = config.getOptionalStringArray('aiRules.allowedRuleTypes') 
  ?? ['cursor', 'copilot'];

console.log('Configured rule types:', allowedRuleTypes);
```

### Common Configuration Issues

#### Invalid Rule Types
```yaml
# Incorrect - unsupported rule type
aiRules:
  allowedRuleTypes:
    - cursor
    - copilot
    - invalid-type # This will be ignored

# Correct
aiRules:
  allowedRuleTypes:
    - cursor
    - copilot
    - cline
```

#### Missing SCM Integration
```yaml
# Incomplete - missing required token
integrations:
  github:
    - host: github.com
      # Missing token

# Complete
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
```

#### Environment Variable Issues
```bash
# Check if environment variables are set
echo $GITHUB_TOKEN
echo $GITLAB_TOKEN

# Set if missing
export GITHUB_TOKEN=your_token_here
```

### Configuration Testing

Test your configuration:

```bash
# Start backend in debug mode
LOG_LEVEL=debug yarn dev

# Test API with configuration
curl "http://localhost:7007/api/ai-rules/rules?entityRef=component:default/test-service&ruleTypes=cursor,copilot"
```

## Best Practices

### Configuration Management
1. Use environment variables for sensitive data
2. Use separate config files for different environments
3. Validate configuration in CI/CD pipelines
4. Document all configuration options

### Security
1. Rotate tokens regularly
2. Use minimal required permissions
3. Monitor token usage
4. Secure configuration files

### Performance
1. Monitor API response times
2. Track repository access patterns
3. Plan for caching implementation
4. Set appropriate timeouts

### Maintenance
1. Keep SCM integrations updated
2. Monitor for deprecated configuration options
3. Review and update rule types as needed
4. Test configuration changes in staging 