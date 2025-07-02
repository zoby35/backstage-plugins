# Educates Backend Plugin

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-educates-backend/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-educates-backend)

## Overview

The Educates backend plugin provides the server-side functionality required to integrate Educates training portals with Backstage. It handles API communication, authentication, session management, and exposes endpoints for the frontend plugin to consume.

## Features

### API Integration
- Seamless communication with Educates training portals
- Support for multiple portal configurations
- Secure API token management
- Error handling and retries

### Authentication Management
- Token-based authentication
- Automatic token refresh
- Secure credential storage
- Session persistence

### Workshop Management
- Workshop catalog retrieval
- Workshop metadata handling
- Session creation and tracking

### Multi-Portal Support
- Multiple portal configurations out of the box


## Technical Details

### Integration Points
- Educates Training Portal API
- Backstage backend services
- Permission framework
- Authentication system

### Type Definitions
Utilizes shared types from the common package:

- `TrainingPortalConfig`
- `EducatesConfig`
- `Workshop`
- `WorkshopEnvironment`
- `TrainingPortalStatus`
- `WorkshopSession`

### Error Handling
- Comprehensive error types
- Detailed error messages
- Automatic retries
- Rate limiting protection

### Security
- Secure credential management
- Token-based authentication
- Permission-based access control
- Request validation

## Architecture

### Components
1. **API Router**
    - Endpoint registration
    - Request handling
    - Response formatting

2. **Portal Manager**
    - Portal configuration
    - Health monitoring
    - Connection management

3. **Session Controller**
    - Session lifecycle
    - Resource allocation

4. **Authentication Handler**
    - Token management
    - Credential storage
    - Permission checks

### Data Flow
1. Request received from frontend
2. Authentication and permission validation
3. Portal communication
4. Response processing
5. Result returned to client


For installation and configuration details, refer to the [Installation Guide](./install.md) and [Configuration Guide](./configure.md).
