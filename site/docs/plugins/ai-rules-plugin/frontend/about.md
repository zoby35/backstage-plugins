# AI Coding Rules Frontend Plugin

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-ai-rules/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-ai-rules)

## Overview

The AI Coding Rules frontend plugin provides a comprehensive interface for visualizing AI coding rules from various sources within Backstage. It enables users to discover, view, and manage coding guidelines from Cursor, GitHub Copilot, and Cline, all integrated seamlessly into the Backstage interface.

## Features

### Rule Visualization
- Display rules from multiple AI coding assistant sources
- Modern and clean UI with expandable rule cards
- Organized presentation of rule content and metadata
- Support for markdown formatting in rule content

### Filtering and Search
- Filter rules by type (Cursor, Copilot, Cline)
- Toggle visibility of different rule types

### Statistics and Overview
- Total rule count display
- Breakdown by rule type
- Visual statistics cards
- Quick overview of available rules

### Rule Content Management
- Expandable rule cards for detailed viewing
- Metadata display including file paths and descriptions
- Support for frontmatter in Cursor rules

## Components

### AIRulesComponent
The main component that provides:

- Rule visualization and management interface
- Filter controls for rule types
- Statistics display
- Error handling and loading states

Example usage:
```typescript
import { AIRulesComponent } from '@terasky/backstage-plugin-ai-rules';

// Default title "AI Coding Rules"
<AIRulesComponent />

// Custom title
<AIRulesComponent title="Development Guidelines" />
```

### Component Props
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | `string` | `"AI Coding Rules"` | The title displayed at the top of the component |

## Technical Details

### Integration Points
- Backstage catalog entities
- AI Rules backend plugin
- Repository source locations
- Entity metadata

### Supported Rule Types
- **Cursor**: `.mdc` files with frontmatter metadata
- **Copilot**: Markdown instructions with automatic section parsing  
- **Cline**: Markdown files with section extraction

### Rule Detection
The plugin automatically detects components with:
- Git source locations in entity metadata
- Repository annotations
- Supported rule file patterns

### Error Handling
- Clear error messages for missing rules
- Loading states during rule fetching
- Graceful degradation for unsupported repositories

## Use Cases

### Development Team Guidelines
1. Centralize AI coding rules across projects
2. Ensure consistent AI assistant configurations
3. Share best practices for AI-assisted development
4. Maintain rule documentation alongside code

### Rule Management
1. Discover existing AI rules in repositories
2. Validate rule configurations
3. Monitor rule adoption across teams
4. Track rule evolution over time

### Code Quality Assurance
1. Enforce coding standards through AI rules
2. Maintain consistency across AI assistants
3. Document preferred coding patterns
4. Share domain-specific guidelines 