# kubernetes-resources-common

Welcome to the common package for the kubernetes-resources plugin!

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-kubernetes-resources-common/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-kubernetes-resources-common)

## Description

The `@terasky/backstage-plugin-kubernetes-resources-common` package provides shared functionalities and permission definitions for the kubernetes-resources plugins in Backstage. This package is used by both the frontend and backend kubernetes-resources plugins to ensure consistent permission management and access control.

## Permissions

The `kubernetes-resources-common` package defines the following permissions for managing kubernetes-resources:

- **List Kubernetes Resources**: `kubernetes-resources.resources.list`
  - Controls whether a user can list and view Kubernetes resources
- **List Kubernetes Secrets**: `kubernetes-resources.secrets.list`
  - Controls whether a user can list and view Secret resources
- **View Secret YAML**: `kubernetes-resources.secrets.view-yaml`
  - Controls whether a user can view the YAML content of Secret resources
- **View Resource YAML**: `kubernetes-resources.yaml.view`
  - Controls whether a user can view the YAML content of Kubernetes resources
- **View Resource Events**: `kubernetes-resources.events.show`
  - Controls whether a user can view events related to Kubernetes resources
- **View Resource Graph**: `kubernetes-resources.graph.show`
  - Controls whether a user can view the resource dependency graph