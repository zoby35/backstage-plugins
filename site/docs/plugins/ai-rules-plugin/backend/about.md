# AI Coding Rules Backend Plugin

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-ai-rules-backend/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-ai-rules-backend)

## Overview

The AI Coding Rules backend plugin provides the server-side functionality required to fetch and parse AI coding rules from Git repositories. It handles integration with Backstage's SCM integrations, parses various rule file formats, and exposes REST API endpoints for the frontend plugin to consume.

## Features

### Repository Integration
- Seamless integration with all Backstage SCM integrations
- Support for GitHub, GitLab, Bitbucket, and Azure DevOps
- Handles both public and private repositories
- Efficient file fetching and caching

### Rule Type Support
- **Cursor Rules**: Parse `.mdc` files from `.cursor/rules/` directories
- **GitHub Copilot Rules**: Process `.github/copilot-instructions.md` files  
- **Cline Rules**: Extract content from `.clinerules/*.md` files
- Configurable rule type filtering

### Content Processing
- Frontmatter metadata parsing for Cursor rules
- Automatic section splitting for Copilot instructions
- Markdown section extraction for Cline rules
- Content validation and error handling

### API Endpoints
- RESTful API for rule data retrieval
- Entity-based rule fetching
- Configurable rule type filtering
- Structured JSON responses

## Technical Details

### Integration Points
- Backstage SCM integrations
- Catalog client for entity resolution
- Configuration service for rule type settings
- Logging service for debugging and monitoring

### Supported File Patterns
- **Cursor**: `.cursor/rules/*.mdc` with frontmatter support
- **Copilot**: `.github/copilot-instructions.md` with automatic parsing
- **Cline**: `.clinerules/*.md` with section extraction

### Content Parsing

#### Cursor Rules
Parses frontmatter metadata including:
```yaml
---
description: "Rule description"
globs: ["*.ts", "*.tsx"]
alwaysApply: true
---
```

#### Copilot Rules
Automatically splits content by empty lines to create logical sections

#### Cline Rules
Extracts markdown sections and headers for organized rule presentation

## API Reference

### GET /api/ai-rules/rules

Fetches AI rules for a given entity.

#### Query Parameters
- `entityRef` (required): Entity reference in format `kind:namespace/name`
- `ruleTypes` (optional): Comma-separated list of rule types to fetch

#### Response Format
```json
{
  "rules": [
    {
      "type": "cursor",
      "id": "cursor-rule-1", 
      "filePath": ".cursor/rules/typescript.mdc",
      "fileName": "typescript",
      "content": "TypeScript coding standards...",
      "description": "TypeScript rules",
      "globs": ["*.ts", "*.tsx"],
      "alwaysApply": true
    },
    {
      "type": "copilot",
      "id": "copilot-rule-1",
      "filePath": ".github/copilot-instructions.md",
      "fileName": "copilot-instructions",
      "content": "Use functional components...",
      "description": "Generated from copilot-instructions.md",
      "section": 1
    }
  ],
  "totalCount": 2,
  "ruleTypes": ["cursor", "copilot"]
}
```

#### Error Responses
- `400 Bad Request`: Missing or invalid entityRef
- `404 Not Found`: Entity not found or no source location
- `500 Internal Server Error`: Repository access or parsing errors

## Architecture

### Components

#### API Router
- Route registration and handling
- Request validation and parsing
- Response formatting and error handling
- Query parameter processing

#### Rule Fetcher
- Repository file discovery and fetching
- SCM integration abstraction
- File content retrieval and validation
- Error handling for inaccessible repositories

#### Content Parser
- Rule type detection and parsing
- Frontmatter extraction for Cursor rules
- Section splitting for different rule types
- Content validation and sanitization

#### Configuration Manager
- Rule type configuration handling
- Default value management
- Environment-specific settings
- Validation of configuration options

## Dependencies

### Core Dependencies
- `@backstage/backend-plugin-api`: Backend plugin framework
- `@backstage/catalog-client`: Entity resolution
- `@backstage/integration`: SCM integrations
- `@backstage/config`: Configuration management

### Parsing Dependencies  
- `gray-matter`: Frontmatter parsing for Cursor rules
- `node-fetch`: HTTP requests for file fetching
- `express`: REST API framework
- `winston`: Logging functionality

## Error Handling

### Repository Access Errors
- Network connectivity issues
- Authentication failures
- Repository not found
- Permission denied

### File Parsing Errors
- Invalid frontmatter syntax
- Malformed file content
- Unsupported file formats
- Encoding issues

### Configuration Errors
- Invalid rule type specifications
- Missing required configuration
- Type validation failures

## Security Considerations

### Repository Access
- Respects SCM integration authentication
- No additional credentials required
- Uses existing Backstage permissions
- Secure token handling

### Content Processing
- Input validation for all file content
- Safe frontmatter parsing
- Protection against malicious content
- Content size limits

### API Security
- Entity reference validation
- Parameter sanitization
- Rate limiting considerations
- Error message sanitization

## Performance Considerations

### Caching Strategy
- File content caching for frequently accessed rules
- Entity resolution caching
- Repository metadata caching
- Configurable cache TTL

### Resource Management
- Efficient file fetching algorithms
- Memory-conscious content processing
- Connection pooling for repository access
- Graceful degradation under load

### Monitoring
- API endpoint performance metrics
- Repository access timing
- Error rate tracking
- Cache hit rate monitoring 