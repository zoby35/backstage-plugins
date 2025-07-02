# VCF Automation Frontend Plugin

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-vcf-automation/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-vcf-automation)

## Overview

The VCF Automation plugin for Backstage provides visibility into VCF deployments, resources, and projects. It offers detailed views of deployment operations, resource states, and project configurations. The plugin integrates with Backstage's permission framework to ensure secure access control.

## Features

### VSphere VM Management
- Detailed view of VM configurations and status
- VM monitoring and overview
- Configuration management

### Deployment Operations
- Track deployment status and history
- Deployment overview and details
- Operation monitoring

### Resource Management
- Monitor various VCF resource types
- Resource configuration views
- Status tracking

### Project Administration
- Manage VCF project settings
- Resource organization
- Project overview and details

### Permission Integration
- Built-in support for Backstage's permission framework
- Secure access control
- Role-based permissions

## Components

The plugin provides several components for different entity types:

### Project (Domain) Components
- `VCFAutomationProjectOverview`: High-level project summary
- `VCFAutomationProjectDetails`: Detailed project information

### Deployment Components
- `VCFAutomationDeploymentOverview`: Quick deployment status
- `VCFAutomationDeploymentDetails`: In-depth deployment information

### VSphere VM Components
- `VCFAutomationVSphereVMOverview`: VM status overview
- `VCFAutomationVSphereVMDetails`: Detailed VM configurations

### Generic Resource Components
- `VCFAutomationGenericResourceOverview`: Resource summary
- `VCFAutomationGenericResourceDetails`: Detailed resource information

## Entity Integration

The plugin integrates with the following entity types:

### VSphere VM Component
```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-vm
spec:
  type: Cloud.vSphere.Machine
  system: my-deployment  # References parent deployment
```

### VCF Deployment
```yaml
apiVersion: backstage.io/v1alpha1
kind: System
metadata:
  name: my-deployment
  annotations:
    terasky.backstage.io/vcf-automation-deployment-status: 'true'
```

### Generic Resource
```yaml
apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  name: my-resource
  annotations:
    terasky.backstage.io/vcf-automation-resource-type: 'network'
```

### Project (Domain)
```yaml
apiVersion: backstage.io/v1alpha1
kind: Domain
metadata:
  name: my-project
```

## Links

- [Installation Guide](install.md)
- [Configuration Guide](configure.md)
