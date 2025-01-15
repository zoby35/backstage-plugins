# kyverno-common

Welcome to the common package for the kyverno plugin!

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-kyverno-common/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-kyverno-common)

## Description

The `@terasky/backstage-plugin-kyverno-common` package provides shared functionalities and permission definitions for the Kyverno plugins in Backstage. This package is used by both the frontend and backend Kyverno plugins to ensure consistent permission management and access control.

## Permissions

The `kyverno-common` package defines the following permissions for managing Kyverno resources:

- **View Overview Policy Report Data**: `kyverno.overview.view`
- **View Detailed Policy Report Data**: `kyverno.reports.view`
- **View The YAML manifest of the Kyverno Policy related to a report**: `kyverno.policy.view-yaml`
