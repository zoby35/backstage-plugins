# educates

Welcome to the educates plugin!

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-educates/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-educates)

## Description

The `educates` plugin for Backstage provides a frontend interface for browsing and accessing Educates workshops within Backstage. It enables users to discover, view, and launch educational workshops from multiple training portals, all integrated seamlessly into the Backstage interface.

## Prerequisites

Before installing this plugin, ensure you have:

1. [Educates Backend Plugin](../educates-backend/README.md) - Required for API integration
2. Access to one or more Educates training portals

## Installation

### 1. Install the Plugin

Add the plugin to your Backstage project:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @terasky/backstage-plugin-educates
```

### 2. Add to your App.tsx file

```typescript
import { EducatesPage } from '@terasky/backstage-plugin-educates';

const routes = (
  <FlatRoutes>
    {/* ... other routes */}
    <Route path="/educates" element={<EducatesPage />} />
  </FlatRoutes>
);
```

### 3. Add to your Sidebar

Add the Educates link to your sidebar in `packages/app/src/components/Root/Root.tsx`:

```typescript
import { SchoolIcon } from '@material-ui/icons';

export const Root = () => (
  <SidebarPage>
    <Sidebar>
      {/* ... other sidebar items */}
      <SidebarItem icon={SchoolIcon} to="/educates" text="Workshops" />
    </Sidebar>
  </SidebarPage>
);
```

### 4. Configure Backend Integration

Add the following to your `app-config.yaml`:

```yaml
educates:
  trainingPortals:
    - name: example-portal
      url: https://example-training-portal.com
      robotUsername: robot@educates
      robotPassword: ${EDUCATES_EXAMPLE_ROBOT_PASSWORD}
      clientId: ${EDUCATES_EXAMPLE_ROBOT_CLIENT_ID}
      clientSecret: ${EDUCATES_EXAMPLE_ROBOT_CLIENT_SECRET}
```

## Features

- **Workshop Discovery**: Browse available workshops from multiple training portals
- **Workshop Details**: View comprehensive workshop information including:
  - Title and description
  - Difficulty level
  - Duration
  - Tags and labels
  - Capacity and availability
- **Workshop Launch Options**:
  - New browser tab launch
- **Responsive Design**: Follows Backstage's material design patterns
- **Multi-Portal Support**: Connect to multiple training portals simultaneously
- **Session Management**: Track and manage workshop sessions
- **Permission Integration**: Built-in support for Backstage's permission framework

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the Apache-2.0 License. 