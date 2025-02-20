import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import yaml from 'js-yaml';
import fs from 'fs-extra';
import path from 'path';

export function createCrdTemplateAction() {
  return createTemplateAction<{
    parameters: Record<string, any>;
    nameParam: string;
    namespaceParam?: string;
    excludeParams: string[];
    apiVersion: string;
    kind: string;
    removeEmptyParams?: boolean;
    clusters?: string[];
  }>({
    id: 'terasky:crd-template',
    description: 'Templates a CRD manifest based on input parameters',
    schema: {
      input: {
        type: 'object',
        required: ['parameters', 'nameParam', 'excludeParams', 'apiVersion', 'kind'],
        properties: {
          parameters: {
            title: 'Pass through of input parameters',
            description: "Pass through of input parameters",
            type: 'object',
          },
          nameParam: {
            title: 'Template parameter to map to the name of the resource',
            description: "Template parameter to map to the name of the resource",
            type: 'string',
            default: 'name'
          },
          namespaceParam: {
            title: 'Template parameter to map to the namespace of the resource',
            description: "Template parameter to map to the namespace of the resource",
            type: 'string',
          },
          excludeParams: { 
            title: 'Template parameters to exclude from the manifest',
            description: "Template parameters to exclude from the manifest",
            type: 'array',
            items: {
              type: 'string',
            },
            default: ['_editData']
          },
          apiVersion: {
            title: 'API Version of the resource',
            description: "API Version of the resource",
            type: 'string',
          },
          kind: {
            title: 'Kind of the resource',
            description: "Kind of the resource",
            type: 'string',
          },
          removeEmptyParams: {
            title: 'Remove Empty Parameters',
            description: 'If set to false, empty parameters will be rendered in the manifest. by default they are removed',
            type: 'boolean',
            default: true,
          },
          clusters: {
            title: 'Target Clusters',
            description: 'List of clusters to generate manifests for',
            type: 'array',
            items: {
              type: 'string',
            },
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
        `Running CRD template with parameters: ${JSON.stringify(ctx.input.parameters)}`,
      );

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
          name: ctx.input.parameters[ctx.input.nameParam],
          ...(ctx.input.namespaceParam && {
            namespace: ctx.input.parameters[ctx.input.namespaceParam],
          }),
        },
        spec: filteredParameters,
      };

      // Convert manifest to YAML
      const manifestYaml = yaml.dump(manifest);

      // Handle cluster-specific paths or default path
      const filePaths: string[] = [];
      if (ctx.input.clusters && ctx.input.clusters.length > 0) {
        for (const cluster of ctx.input.clusters) {
          const clusterPath = path.join(
            cluster,
            ctx.input.parameters[ctx.input.nameParam],
            'manifest.yaml'
          );
          const destFilepath = resolveSafeChildPath(ctx.workspacePath, clusterPath);
          fs.outputFileSync(destFilepath, manifestYaml);
          filePaths.push(clusterPath);
          ctx.logger.info(`Manifest written to ${destFilepath}`);
        }
      } else {
        const filePath = path.join(
          ctx.input.parameters[ctx.input.nameParam],
          'manifest.yaml'
        );
        const destFilepath = resolveSafeChildPath(ctx.workspacePath, filePath);
        fs.outputFileSync(destFilepath, manifestYaml);
        filePaths.push(filePath);
        ctx.logger.info(`Manifest written to ${destFilepath}`);
      }

      // Output the manifest and file paths
      ctx.output('manifest', manifestYaml);
      ctx.output('filePaths', filePaths);
    },
  });
} 