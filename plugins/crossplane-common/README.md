# crossplane-common

Welcome to the common package for the crossplane plugin!

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-crossplane-common/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-crossplane-common)

## Description

The `@terasky/backstage-plugin-crossplane-common` package provides shared functionalities and permission definitions for the Crossplane plugins in Backstage. This package is used by both the frontend and backend Crossplane plugins to ensure consistent permission management and access control.

## Permissions

The `crossplane-common` package defines the following permissions for managing Crossplane resources:

- **List Crossplane Claims**: `crossplane.claims.list`
- **View YAML of Crossplane Claims**: `crossplane.claims.view-yaml`
- **View Events of Crossplane Claims**: `crossplane.claims.show-events`
- **List Crossplane Composite Resources**: `crossplane.composite-resources.list`
- **View YAML of Crossplane Composite Resources**: `crossplane.composite-resources.view-yaml`
- **View Events of Crossplane Composite Resources**: `crossplane.composite-resources.show-events`
- **List Crossplane Managed Resources**: `crossplane.managed-resources.list`
- **View YAML of Crossplane Managed Resources**: `crossplane.managed-resources.view-yaml`
- **View Events of Crossplane Managed Resources**: `crossplane.managed-resources.show-events`
- **View Resource Graph of Crossplane Resources**: `crossplane.resource-graph.show`
