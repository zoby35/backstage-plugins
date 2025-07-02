# Crossplane Permissions Backend Plugin

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-crossplane-permissions-backend/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-crossplane-permissions-backend)

## Overview

The Crossplane Permissions backend plugin provides comprehensive permission management and access control for Crossplane resources within your Backstage instance. It integrates seamlessly with Backstage's permission framework to enforce fine-grained access policies for different types of Crossplane resources.

## Features

### Permission Management
- Fine-grained access control for Crossplane resources
- Support for different resource types:
  - Claims
  - Composite Resources (XRs)
  - Managed Resources
  - Additional Resources (XRD, Composition, Function)

### Access Control
- Resource-level permissions
- Action-based permissions (list, view YAML, show events)
- Integration with Backstage's permission framework

### API Endpoints
- Permission check endpoints
- Resource access validation
- Policy enforcement endpoints

## Technical Architecture

### Integration Points
- Backstage Permission Framework
- Crossplane Resources Frontend Plugin

### Permission Model
The plugin implements a comprehensive permission model covering:

1. **Resource Types**
    - Claims
    - Composite Resources
    - Managed Resources
    - Additional Resources

2. **Action Types**
    - List resources
    - View YAML configurations
    - Show resource events
    - View resource graphs

3. **Permission Scopes**
    - Global permissions
    - Resource-specific permissions
    - Action-specific permissions

### Security Considerations
- Secure permission validation
- Token-based authentication
- Role-based access control
- Audit logging capabilities

## Integration Benefits

1. **Enhanced Security**
    - Granular access control
    - Consistent permission enforcement
    - Audit trail capabilities

2. **Improved Compliance**
    - Policy-based access control
    - Resource usage tracking
    - Access pattern monitoring

3. **Better User Experience**
    - Seamless integration with frontend
    - Consistent permission behavior
    - Clear access control feedback

## Use Cases

### Resource Access Control
- Control who can view different resource types
- Manage access to sensitive configurations
- Restrict event viewing capabilities

### Compliance Management
- Enforce organizational policies
- Track resource access patterns
- Maintain audit trails

### Team Collaboration
- Define team-specific access levels
- Share resources securely
- Manage cross-team permissions
