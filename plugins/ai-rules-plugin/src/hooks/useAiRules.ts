import { useEntity } from '@backstage/plugin-catalog-react';
import { AIRuleType, AIRulesResponse, AIRule } from '../types';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApi, configApiRef, discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';

export const useAiRules = () => {
  const { entity } = useEntity();
  const configApi = useApi(configApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  
  const [rules, setRules] = useState<AIRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRuleTypes, setSelectedRuleTypes] = useState<AIRuleType[]>([]);

  // Stabilize allowed rule types
  const allowedRuleTypes = useMemo(() => {
    return configApi.getOptionalStringArray('aiRules.allowedRuleTypes') as AIRuleType[] || [AIRuleType.CURSOR, AIRuleType.COPILOT];
  }, [configApi]);

  // Extract stable entity properties
  const entityData = useMemo(() => {
    const sourceAnnotation = entity.metadata?.annotations?.['backstage.io/source-location'] || '';
    const hasGitUrl = sourceAnnotation.startsWith('url:');
    
    let gitUrl = hasGitUrl ? sourceAnnotation.substring(4) : undefined;
    if (gitUrl) {
      // Remove trailing slashes and normalize URL
      gitUrl = gitUrl.replace(/\/+$/, '');
      // Handle GitHub tree/blob URLs - extract base repo URL
      const treeMatch = gitUrl.match(/^(.+)\/tree\/([^/]+)(?:\/(.+))?$/);
      const blobMatch = gitUrl.match(/^(.+)\/blob\/([^/]+)(?:\/(.+))?$/);
      if (treeMatch) {
        gitUrl = treeMatch[1]; // Just the base repo URL
      }
      if (blobMatch) {
        gitUrl = blobMatch[1]; // Just the base repo URL  
      }
    }

    return {
      kind: entity.kind,
      namespace: entity.metadata.namespace || 'default',
      name: entity.metadata.name,
      sourceAnnotation,
      hasGitUrl,
      gitUrl,
    };
  }, [entity.kind, entity.metadata.namespace, entity.metadata.name, entity.metadata?.annotations?.['backstage.io/source-location']]);

  // Initialize selected rule types only once
  useEffect(() => {
    setSelectedRuleTypes(allowedRuleTypes);
  }, []); // Empty dependency - only run once

  // Stable fetch function
  const fetchAiRules = useCallback(async (ruleTypes: AIRuleType[]) => {
    if (!entityData.hasGitUrl || !entityData.gitUrl) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = await discoveryApi.getBaseUrl('ai-rules');
      const url = new URL(`${baseUrl}/rules`);
      
      // Send the Git URL directly to the backend
      url.searchParams.append('gitUrl', entityData.gitUrl);
      if (ruleTypes.length > 0) {
        url.searchParams.append('ruleTypes', ruleTypes.join(','));
      }

      console.log('Fetching AI rules from:', url.toString());

      const response = await fetchApi.fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Failed to fetch AI rules: ${response.statusText}`);
      }

      const data: AIRulesResponse = await response.json();
      console.log('Received AI rules:', data);
      setRules(data.rules);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching AI rules:', errorMessage);
      setError(errorMessage);
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, [entityData.hasGitUrl, entityData.gitUrl, discoveryApi, fetchApi]);

  // Fetch rules when dependencies change
  useEffect(() => {
    if (selectedRuleTypes.length > 0) {
      fetchAiRules(selectedRuleTypes);
    }
  }, [fetchAiRules, selectedRuleTypes]);

  const rulesByType = useMemo(() => {
    return rules.reduce((acc, rule) => {
      if (!acc[rule.type]) {
        acc[rule.type] = [];
      }
      acc[rule.type].push(rule);
      return acc;
    }, {} as Record<AIRuleType, AIRule[]>);
  }, [rules]);

  return {
    rules,
    rulesByType,
    loading,
    error,
    hasGitUrl: entityData.hasGitUrl,
    componentName: entityData.name,
    allowedRuleTypes,
    selectedRuleTypes,
    setSelectedRuleTypes,
    totalRules: rules.length,
  };
};