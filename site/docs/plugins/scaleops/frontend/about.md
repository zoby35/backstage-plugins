# ScaleOps Frontend Plugin

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-scaleops-frontend/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-scaleops-frontend)

## Overview

The ScaleOps frontend plugin provides a comprehensive interface for viewing and analyzing cost optimization data from ScaleOps within your Backstage instance. It enables teams to monitor resource utilization, track potential savings, and access detailed cost analysis directly from their service catalog.

## Features

### Cost Optimization Dashboard
- Potential savings analysis
- Realized savings tracking
- Resource utilization metrics
- Cost breakdown views
- Multi-cluster visibility

### Resource Monitoring
- Resource usage tracking
- Utilization patterns
- Optimization suggestions
- Performance metrics
- Trend analysis

### Integration Features
- ScaleOps dashboard links
- Authentication handling
- Multi-cluster support
- Real-time data updates
- Custom metric views

## Components

### ScaleOpsDashboard
The main component that provides:  
- Cost optimization overview  
- Resource utilization metrics  
- Savings analysis  
- Performance insights  

Example usage:
```typescript
import { ScaleOpsDashboard, isScaleopsAvailable } from '@terasky/backstage-plugin-scaleops-frontend';

const entityPage = (
  <EntityLayout>
    <EntityLayout.Route 
      path="/scaleops" 
      if={isScaleopsAvailable}
      title="ScaleOps"
    >
      <ScaleOpsDashboard />
    </EntityLayout.Route>
  </EntityLayout>
);
```

## Technical Details

### Integration Points
- ScaleOps API
- Authentication service
- Proxy configuration
- Entity catalog

### Authentication Methods
- Basic authentication
- Token-based auth
- Future auth options planned

### Data Visualization
- Cost metrics
- Resource usage
- Savings potential
- Performance data

## Use Cases

### Cost Optimization
1. Monitor resource costs
2. Identify savings opportunities
3. Track optimization progress
4. Analyze spending patterns

### Resource Management
1. Track utilization
2. Monitor performance
3. Optimize resources
4. Plan capacity

### Team Collaboration
1. Share insights
2. Track improvements
3. Plan optimizations
4. Document savings

## Example Integrations

### Basic Integration
```typescript
import {
  ScaleOpsDashboard,
  isScaleopsAvailable,
} from '@terasky/backstage-plugin-scaleops-frontend';

const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route 
      path="/scaleops" 
      if={isScaleopsAvailable}
      title="ScaleOps Dashboard"
    >
      <ScaleOpsDashboard />
    </EntityLayout.Route>
  </EntityLayout>
);
```

### Advanced Integration
```typescript
import {
  ScaleOpsDashboard,
  isScaleopsAvailable,
} from '@terasky/backstage-plugin-scaleops-frontend';

const scaleopsContent = (
  <>
    <EntitySwitch>
      <EntitySwitch.Case if={isScaleopsAvailable}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ScaleOpsDashboard />
          </Grid>
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
  </>
);

const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route 
      path="/cost-optimization" 
      title="Cost Optimization"
    >
      {scaleopsContent}
    </EntityLayout.Route>
  </EntityLayout>
);
```

## Screenshots

### Dashboard Overview
![ScaleOps Overview](../../../images/scaleops01.png)
*Main dashboard showing cost optimization opportunities*

### Detailed Analysis
![ScaleOps Details](../../../images/scaleops02.png)
*Detailed view of resource utilization and potential savings*

For installation and configuration details, refer to the [Installation Guide](./install.md) and [Configuration Guide](./configure.md).
