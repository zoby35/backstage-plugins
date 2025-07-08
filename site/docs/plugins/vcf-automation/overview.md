# VCF Automation Plugins

The VCF Automation plugins provide comprehensive visibility and management capabilities for VMware Cloud Foundation (VCF) deployments within Backstage. It enables teams to monitor deployments, manage resources, and oversee project configurations through an intuitive interface.
The plugins support Aria Automation 8.x as well as VCF Automation 9.x.

## Features

- **Deployment Monitoring**: Track VCF deployment status and operations
- **Resource Management**: Manage vSphere VMs and other VCF resources
- **Project Configuration**: Configure and monitor VCF projects
- **Permission Controls**: Fine-grained access control integration
- **Entity Integration**: Seamless catalog entity synchronization
- **Status Tracking**: Real-time deployment and resource status

## Plugin Components

### Frontend Plugin
The plugin provides frontend components for:  
- Deployment visualization  
- Resource management  
- Project configuration  
- Status monitoring  

[Learn more about the frontend plugin](./frontend/about.md)

### Backend Plugin
The plugin provides a backend deployment that:  
- Handles API integration  
- Manages permissions  
- Processes operations  
- Tracks resources  

[Learn more about the backend plugin](./backend/about.md)

### Ingestor Plugin
The plugin provides a backend that:  
- Discovers entities in your VCF Automation environment  
- Generates the relevant Backstage entities to represent the VCF Automation resources  
- Adds required metadata to the generated entities to allow the frontend plugin to pull runtime data  
- Adds, updates and deletes the entities in the Backstage catalog based on the current state in VCF Automation
  
[Learn more about the ingestor plugin](./ingestor/about.md)
  
## Available Components

### Deployment Components
- `VCFAutomationDeploymentOverview`: High-level deployment status
- `VCFAutomationDeploymentDetails`: Detailed deployment information

### VM Components
- `VCFAutomationVSphereVMOverview`: VM status overview
- `VCFAutomationVSphereVMDetails`: Detailed VM configuration

### Resource Components
- `VCFAutomationGenericResourceOverview`: Resource status
- `VCFAutomationGenericResourceDetails`: Resource configuration

### Project Components
- `VCFAutomationProjectOverview`: Project status overview
- `VCFAutomationProjectDetails`: Project configuration details


## Prerequisites

Before getting started, ensure you have:

1. VCF Automation Backend Plugin installed
2. VCF Ingestor Plugin configured
3. Access to VCF deployments
4. Proper permissions setup

## Getting Started

To get started with the VCF Automation plugin:

1. Install frontend and backend plugins
2. Configure API integration
3. Set up entity synchronization
4. Configure permissions
5. Add components to entity pages

For detailed installation and configuration instructions, refer to the frontend and backend documentation linked above.
