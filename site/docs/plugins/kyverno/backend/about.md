# Kyverno Permissions Backend Plugin

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-kyverno-permissions-backend/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-kyverno-permissions-backend)

## Overview

The Kyverno Permissions backend plugin provides integration with Backstage's permission framework to enable fine-grained access control for Kyverno policy reports. This plugin ensures secure and controlled access to policy information within your Backstage instance.

## Features

### Permission Management
- Integration with Backstage's permission framework
- Fine-grained access control for policy reports
- Configurable permission policies

### Access Control
- Policy report viewing permissions
- YAML manifest access control
- Overview data access management

### API Integration
- Secure endpoints for policy data
- Permission validation middleware
- Integration with frontend components

## Technical Details

### Available Permissions

The plugin provides three main permission types:

1. **Overview Access** (`kyverno.overview.view`)
    - Access to summary policy report data
    - High-level compliance metrics
    - Component status overview

2. **Report Access** (`kyverno.reports.view`)
    - Access to detailed policy reports
    - Resource-specific compliance data
    - Policy violation details

3. **Policy YAML Access** (`kyverno.policy.view-yaml`)
    - Access to policy YAML manifests
    - Policy configuration details
    - Rule specifications

### Integration Points

- Backstage Permission Framework
- Kyverno Policy Reports Frontend
- Kubernetes API Server
- Backstage Catalog

### Security Considerations

- Role-based access control
- Permission validation
- Secure data handling
- Audit trail capabilities
