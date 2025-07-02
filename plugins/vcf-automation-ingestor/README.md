# VCF Automation Ingestor Plugin for Backstage

Welcome to the Ingestor plugin for VCF Automation!

[![npm latest version](https://img.shields.io/npm/v/@terasky/backstage-plugin-vcf-automation-ingestor/latest.svg)](https://www.npmjs.com/package/@terasky/backstage-plugin-vcf-automation-ingestor)

This plugin ingests VCF Automation deployments into the Backstage catalog. It creates the following entity types:

- **Systems**: Created from VCF Automation deployments
- **Components**: Created from VCF Automation resources of type `Cloud.vSphere.Machine`
- **Resources**: Created from all other VCF Automation resource types
- **Domains**: Created from VCF Automation projects

For detailed docs go to https://terasky-oss.github.io/backstage-plugins/plugins/vcf-automation/overview

## Contributing
Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License
This project is licensed under the Apache-2.0 License.