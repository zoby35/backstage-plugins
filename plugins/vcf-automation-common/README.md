# vcf-automation-common

Welcome to the common package for the VCF Automation plugins!

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-vcf-automation-common/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-vcf-automation-common)

## Description

The `@terasky/backstage-plugin-vcf-automation-common` package provides shared functionalities and permission definitions for the VCF Automation plugins in Backstage. This package is used by both the frontend and backend VCF Automation plugins to ensure consistent permission management and access control.

## Permissions

The `vcf-automation-common` package defines the following permissions for managing Kyverno resources:

- **View Project Details**: `vcf-automation.project-details.view`
- **View Detailed Historical Data For Deployments**: `vcf-automation.deployments-history.view`
- **View All User Requests made against the deployment and the details**: `vcf-automation.deployments-user-events.view`
- **View Resource details for vSphere VMs**: `vcf-automation.deployment-resources-data.view`
