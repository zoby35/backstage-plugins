import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import yaml from 'js-yaml';
import fs from 'fs-extra';
import path from 'path';

export function createCrossplaneClaimAction() {
  return createTemplateAction<{
    parameters: Record<string, any>;
    nameParam: string;
    namespaceParam: string;
    excludeParams: string[];
    apiVersion: string;
    kind: string;
    clusters: string[];
    removeEmptyParams?: boolean;
    ownerParam: string;
  }>({
    id: 'terasky:claim-template',
    description: 'Templates a claim manifest based on input parameters',
    schema: {
      input: {
        type: 'object',
        required: ['parameters', 'nameParam', 'namespaceParam', 'excludeParams', 'apiVersion', 'kind', 'clusters'],
        properties: {
          parameters: {
            title: 'Pass through of input parameters',
            description: "Pass through of input parameters",
            type: 'object',
          },
          nameParam: {
            title: 'Template parameter to map to the name of the claim',
            description: "Template parameter to map to the name of the claim",
            type: 'string',
            default: 'xrName'
          },
          namespaceParam: {
            title: 'Template parameter to map to the namespace of the claim',
            description: "Template parameter to map to the namespace of the claim",
            type: 'string',
            default: 'xrNamespace'
          },
          excludeParams: { 
            title: 'Template parameters to exclude from the claim',
            description: "Template parameters to exclude from the claim",
            type: 'array',
            items: {
              type: 'string',
            },
            default: ['xrName', 'xrNamespace', 'clusters', 'targetBranch', 'repoUrl', '_editData']
          },
          apiVersion: {
            title: 'API Version of the claim',
            description: "API Version of the claim",
            type: 'string',
          },
          kind: {
            title: 'Kind of the claim',
            description: "Kind of the claim",
            type: 'string',
          },
          clusters: {
            title: 'Target clusters',
            description: 'The target clusters to apply the resource to',
            type: 'array',
            items: {
              type: 'string',
            },
            minItems: 1,
          },
          removeEmptyParams: {
            title: 'Remove Empty Parameters',
            description: 'If set to false, empty parameters will be rendered in the manifest. by default they are removed',
            type: 'boolean',
            default: true,
          },
          ownerParam: {
            title: 'Template parameter to map to the owner of the claim',
            description: "Template parameter to map to the owner of the claim",
            type: 'string',
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          manifest: {
            title: 'Manifest',
            description: 'The templated Kubernetes resource manifest',
            type: 'string',
          },
          filePaths: {
            title: 'File paths',
            description: 'The file paths of the written manifests',
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
    async handler(ctx) {
      ctx.logger.info(
        `Running example template with parameters: ${JSON.stringify(ctx.input.parameters)}`,
      );

      if (ctx.input.parameters[ctx.input.nameParam] === 'foo') {
        throw new Error(`myParameter cannot be 'foo'`);
      }

      // Remove excluded parameters
      const filteredParameters = { ...ctx.input.parameters };
      ctx.input.excludeParams.forEach(param => {
        delete filteredParameters[param];
      });

      // Remove empty parameters if removeEmptyParams is true
      if (ctx.input.removeEmptyParams) {
        const removeEmpty = (obj: any) => {
          Object.keys(obj).forEach(key => {
            if (obj[key] && typeof obj[key] === 'object') {
              removeEmpty(obj[key]);
              if (Object.keys(obj[key]).length === 0) {
                delete obj[key];
              }
            } else if (obj[key] === null || obj[key] === undefined || obj[key] === '' || (Array.isArray(obj[key]) && obj[key].length === 0)) {
              delete obj[key];
            }
          });
        };
        removeEmpty(filteredParameters);
      }

      // Template the Kubernetes resource manifest
      const manifest = {
        apiVersion: ctx.input.apiVersion,
        kind: ctx.input.kind,
        metadata: {
          annotations: {
            'terasky.backstage.io/add-to-catalog': "true",
            'terasky.backstage.io/owner': ctx.input.parameters[ctx.input.ownerParam],
            'terasky.backstage.io/system': ctx.input.parameters[ctx.input.namespaceParam],
          },
          name: ctx.input.parameters[ctx.input.nameParam],
          namespace: ctx.input.parameters[ctx.input.namespaceParam],
        },
        spec: filteredParameters,
      };

      // Convert manifest to YAML
      const manifestYaml = yaml.dump(manifest);

      // Write the manifest to the file system for each cluster
      const filePaths: string[] = [];
      ctx.input.clusters.forEach(cluster => {
        const filePath = path.join(
          cluster,
          ctx.input.parameters[ctx.input.namespaceParam],
          ctx.input.kind,
          `${ctx.input.parameters[ctx.input.nameParam]}.yaml`
        );
        const destFilepath = resolveSafeChildPath(ctx.workspacePath, filePath);
        fs.outputFileSync(destFilepath, manifestYaml);
        ctx.logger.info(`Manifest written to ${destFilepath}`);
        filePaths.push(destFilepath);
      });

      // Output the manifest and file paths
      ctx.output('manifest', manifestYaml);
      ctx.output('filePaths', filePaths);
    },
  });
}