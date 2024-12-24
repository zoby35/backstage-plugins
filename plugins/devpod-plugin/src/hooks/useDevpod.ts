// filepath: /home/vrabbi/crossplane/bakstage-plugins/plugins/devpod-plugin/src/hooks/useDevpod.ts
import { useEntity } from '@backstage/plugin-catalog-react';
import { DevpodIDE } from '../types';
import { useState } from 'react';
import { Entity } from '@backstage/catalog-model';
import { useDevpodConfig } from '../components/DevpodProvider/DevpodProvider';

export const useDevpod = () => {
  const { entity } = useEntity();
  const { defaultIde } = useDevpodConfig();

  const [selectedIde, setSelectedIde] = useState<DevpodIDE>(defaultIde);

  const sourceAnnotation = (entity as Entity).metadata?.annotations?.['backstage.io/source-location'] || '';
  let gitUrl = sourceAnnotation.startsWith('url:') ? sourceAnnotation.substring(4) : undefined;
  if (gitUrl) {
    // Remove trailing slashes
    gitUrl = gitUrl.replace(/\/+$/, '');  
    // Check for tree pattern
    const treeMatch = gitUrl.match(/^(.+)\/tree\/([^/]+)(?:\/(.+))?$/);
    const blobMatch = gitUrl.match(/^(.+)\/blob\/([^/]+)(?:\/(.+))?$/);
    if (treeMatch) {
      const [_, baseUrl, branch, subPath] = treeMatch;
      if (branch === 'main' && subPath) {
        gitUrl = `${baseUrl}@subpath:${subPath}`;
      } else {
        gitUrl = `${baseUrl}@${branch}`;
      }
    }
    if (blobMatch) {
      const [_, baseUrl, branch, subPath] = blobMatch;
      if (branch === 'main' && subPath) {
        gitUrl = `${baseUrl}@subpath:${subPath}`;
      } else {
        gitUrl = `${baseUrl}@${branch}`;
      }
    }
  }
  const componentName = entity.metadata.name;
  const uuid = Math.random().toString(36).substring(2, 6);
  
  const devpodUrl = gitUrl 
    ? `https://devpod.sh/open#${encodeURIComponent(gitUrl)}&workspace=${componentName}-${uuid}&ide=${selectedIde}`
    : '';

  return {
    gitUrl,
    hasGitUrl: Boolean(gitUrl),
    componentName,
    selectedIde,
    setSelectedIde,
    devpodUrl,
  };
};