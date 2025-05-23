import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import yaml from 'js-yaml';
import fs from 'fs-extra';
import path from 'path';

export function createCrdTemplateAction({config}: {config: any}) {
  return createTemplateAction<{
    ownerParam: any;
    parameters: Record<string, any>;
    nameParam: string;
    namespaceParam?: string;
    excludeParams: string[];
    apiVersion: string;
    kind: string;
    removeEmptyParams?: boolean;
    clusters: string[];
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
            default: 'namespace'
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
            minItems: 1,
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
      const sourceInfo = {
        pushToGit: ctx.input.parameters.pushToGit,
        gitBranch: ctx.input.parameters.targetBranch || config.getOptionalString('kubernetesIngestor.crossplane.xrds.publishPhase.git.targetBranch'),
        gitRepo: ctx.input.parameters.repoUrl || config.getOptionalString('kubernetesIngestor.crossplane.xrds.publishPhase.git.repoUrl'),
        gitLayout: ctx.input.parameters.manifestLayout,
        basePath: ctx.input.parameters.manifestLayout === 'custom' 
          ? ctx.input.parameters.basePath 
          : ctx.input.parameters.manifestLayout === 'namespace-scoped'
            ? `${ctx.input.parameters[ctx.input.namespaceParam || 'namespace']}`
            : `${ctx.input.clusters[0]}/${ctx.input.parameters[ctx.input.namespaceParam || 'namespace']}/${ctx.input.kind}`
      }
      let sourceFileUrl = '';
      if (ctx.input.parameters.pushToGit && sourceInfo.gitRepo) {
        const gitUrl = new URL("https://" + sourceInfo.gitRepo);
        const owner = gitUrl.searchParams.get('owner');
        const repo = gitUrl.searchParams.get('repo');
        if (owner && repo) {
          sourceFileUrl = `https://${gitUrl.host}/${owner}/${repo}/blob/${sourceInfo.gitBranch}/${sourceInfo.basePath}/${ctx.input.parameters[ctx.input.nameParam]}.yaml`;
        }
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
          annotations: {
            'terasky.backstage.io/source-info': JSON.stringify(sourceInfo),
            'terasky.backstage.io/add-to-catalog': "true",
            'terasky.backstage.io/owner': ctx.input.parameters[ctx.input.ownerParam],
            'terasky.backstage.io/system': ctx.input.parameters[ctx.input.namespaceParam || 'namespace'],
            ...(sourceFileUrl && { 'terasky.backstage.io/source-file-url': sourceFileUrl }),
          },
        },
        spec: filteredParameters,
      };

      // Convert manifest to YAML
      const manifestYaml = yaml.dump(manifest);

      // Handle cluster-specific paths or default path
      const filePaths: string[] = [];
      ctx.input.clusters.forEach(cluster => {
        const filePath = path.join(
          cluster,
          ctx.input.parameters[ctx.input.namespaceParam || 'namespace'],
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