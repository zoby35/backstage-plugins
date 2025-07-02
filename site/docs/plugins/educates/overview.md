# Educates Plugin

The Educates plugin for Backstage provides seamless integration with Educates training portals, enabling users to discover, access, and manage educational workshops directly within the Backstage interface.

## Plugin Components

### Frontend Plugin
The frontend plugin provides a user interface for:

- Browsing available workshops across multiple training portals
- Viewing detailed workshop information
- Launching workshop sessions
- Managing active workshop sessions

[Learn more about the frontend plugin](./frontend/about.md)

### Backend Plugin
The backend plugin handles:

- Integration with Educates training portals
- Authentication and session management
- Workshop session operations
- API endpoints for workshop data

[Learn more about the backend plugin](./backend/about.md)

## Features

- **Multi-Portal Support**: Connect to multiple training portals simultaneously
- **Workshop Discovery**: Browse and search available workshops
- **Detailed Information**: View comprehensive workshop details including:
    - Title and description
    - Difficulty level
    - Duration
    - Tags and labels
    - Capacity and availability
- **Session Management**: Launch and track workshop sessions
- **Permission Controls**: Built-in support for Backstage's permission framework

## Documentation Structure

Frontend Plugin

  - [About](./frontend/about.md)
  - [Installation](./frontend/install.md)
  - [Configuration](./frontend/configure.md)

Backend Plugin

  - [About](./backend/about.md)
  - [Installation](./backend/install.md)
  - [Configuration](./backend/configure.md)

## Available Permissions

The plugin provides the following permissions:

- `educates.workshops.view`: Access to view the workshop catalog
- `educates.workshop-sessions.create`: Ability to request workshop sessions

## Getting Started

To get started with the Educates plugin:

1. Install and configure the backend plugin
2. Set up the frontend components
3. Configure your training portal connections
4. Start discovering and launching workshops

For detailed installation and configuration instructions, refer to the frontend and backend documentation linked above.
