# Configuring the AI Coding Rules Frontend Plugin

This guide covers the configuration options available for the AI Coding Rules frontend plugin.

## Plugin Configuration

### Basic Configuration

Configure the plugin behavior in your `app-config.yaml`:

```yaml
aiRules:
  # Configure which rule types to look for
  allowedRuleTypes:
    - cursor
    - copilot
    - cline
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `allowedRuleTypes` | `string[]` | `["cursor", "copilot"]` | Array of rule types to search for and display |

### Supported Rule Types

- `cursor`: Cursor IDE rules from `.cursor/rules/*.mdc` files
- `copilot`: GitHub Copilot rules from `.github/copilot-instructions.md`
- `cline`: Cline AI rules from `.clinerules/*.md` files

## Component Configuration

### AIRulesComponent Props

The main component accepts the following props:

```typescript
interface AIRulesComponentProps {
  title?: string;
}
```

### Usage Examples

#### Default Configuration
```typescript
<EntityLayout.Route path="/ai-rules" title="AI Rules">
  <AIRulesComponent />
</EntityLayout.Route>
```

#### Custom Title
```typescript
<EntityLayout.Route path="/coding-rules" title="Coding Rules">
  <AIRulesComponent title="Development Guidelines" />
</EntityLayout.Route>
```

#### Multiple Instances
```typescript
// Different sections with different titles
<EntityLayout.Route path="/cursor-rules" title="Cursor Rules">
  <AIRulesComponent title="Cursor IDE Rules" />
</EntityLayout.Route>

<EntityLayout.Route path="/copilot-rules" title="Copilot Rules">
  <AIRulesComponent title="GitHub Copilot Guidelines" />
</EntityLayout.Route>
```

## Entity Configuration

### Required Annotations

Entities must have source location information for the plugin to work:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    # Required: Source location pointing to Git repository
    backstage.io/source-location: url:https://github.com/org/my-repo
spec:
  type: service
  lifecycle: production
  owner: team-a
```

### Optional Entity Configuration

```yaml
metadata:
  annotations:
    # Optional: Specific branch to check for rules
    backstage.io/source-location: url:https://github.com/org/my-repo/tree/main
    
    # Optional: Subdirectory if rules are in a specific path
    backstage.io/source-location: url:https://github.com/org/my-repo/tree/main/services/api
```

## Rule File Configuration

### Cursor Rules (.cursor/rules/*.mdc)

Cursor rule files support frontmatter for metadata:

```markdown
---
description: "TypeScript coding standards"
globs: ["*.ts", "*.tsx"]
alwaysApply: true
---

# TypeScript Rules

Use strict typing and avoid any types.
Follow naming conventions for interfaces and types.
```

### GitHub Copilot Rules (.github/copilot-instructions.md)

Simple markdown file with sections automatically split by empty lines:

```markdown
# Copilot Instructions

Use TypeScript for all new code.
Follow existing code patterns.

Prefer functional components in React.
Use hooks instead of class components.
```

### Cline Rules (.clinerules/*.md)

Markdown files with automatic section extraction:

```markdown
# Development Guidelines

## Code Style
- Use ESLint and Prettier
- Follow team conventions

## Testing
- Write unit tests for all functions
- Use Jest for testing framework
```

## Advanced Configuration

### Custom Rule Type Configuration

If you want to limit to specific rule types for certain environments:

```yaml
# Development environment - show all types
aiRules:
  allowedRuleTypes:
    - cursor
    - copilot
    - cline

# Production environment - only show official guidelines
aiRules:
  allowedRuleTypes:
    - copilot
```

### Environment-Specific Configuration

```yaml
# app-config.yaml (base configuration)
aiRules:
  allowedRuleTypes:
    - cursor
    - copilot

---
# app-config.development.yaml
aiRules:
  allowedRuleTypes:
    - cursor
    - copilot
    - cline

---
# app-config.production.yaml
aiRules:
  allowedRuleTypes:
    - copilot
```

## Styling and Theming

The plugin uses Material-UI components and respects your Backstage theme configuration. It automatically adapts to:

- Light/dark theme modes
- Custom color schemes
- Typography settings
- Component spacing


## Performance Considerations

### Rule File Size
- Keep rule files reasonably sized (< 100KB recommended)
- Split large rule sets into multiple files
- Use clear file names for better organization

### Repository Access
- Ensure backend has efficient access to repositories
- Consider caching for frequently accessed rules
- Monitor API rate limits for external repositories

### Component Usage
- Avoid placing the component on high-traffic pages if not needed
- Consider lazy loading for large rule sets
- Use appropriate tab placement for user workflow

## Troubleshooting Configuration

### Rule Types Not Showing
1. Check `allowedRuleTypes` configuration
2. Verify rule files exist in expected locations
3. Confirm file naming follows conventions
4. Check backend logs for parsing errors

### Performance Issues
1. Review rule file sizes
2. Check repository access performance
3. Monitor network requests in browser dev tools
4. Consider component placement optimization

### Access Issues
1. Verify entity source location annotations
2. Check SCM integration configuration
3. Confirm repository permissions
4. Test backend API endpoints directly 