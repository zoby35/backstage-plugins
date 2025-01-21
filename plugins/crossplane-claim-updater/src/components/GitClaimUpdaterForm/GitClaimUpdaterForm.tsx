import * as React from 'react';
import { useApi, fetchApiRef, githubAuthApiRef } from '@backstage/core-plugin-api';
import {
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { 
  FormControl, 
  TextField, 
  Typography, 
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
} from '@material-ui/core';
import { JsonObject } from '@backstage/types';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { parse as parseYaml } from 'yaml';
import { FieldExtensionComponentProps } from '@backstage/plugin-scaffolder-react';
import { ChangeEvent } from 'react';
import { scmIntegrationsApiRef } from '@backstage/integration-react';

type FormData = {
  sourceURI?: string;
};

type OpenAPISpec = {
  components: {
    schemas: {
      Resource: JsonObject;
    };
  };
};

type SchemaProperty = {
  type: string;
  title?: string;
  description?: string;
  properties?: Record<string, SchemaProperty>;
  items?: SchemaProperty;
  format?: string;
  enum?: any[];
};

const RenderField = ({
  prop,
  value,
  label,
  fullPath,
  onChange,
}: {
  prop: SchemaProperty;
  value: any;
  label: string;
  fullPath: string;
  onChange: (path: string, value: any) => void;
}) => {
  if (prop.enum) {
    return (
      <FormControl fullWidth margin="normal">
        <Select
          value={value === undefined ? '' : value}
          onChange={(e) => onChange(fullPath, e.target.value)}
          displayEmpty
          label={label}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {prop.enum.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  switch (prop.type) {
    case 'boolean':
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={value === undefined ? false : Boolean(value)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                onChange(fullPath, e.target.checked);
              }}
              color="primary"
            />
          }
          label={label}
        />
      );
    case 'integer':
    case 'number':
      return (
        <TextField
          label={label}
          helperText={prop.description}
          value={value === undefined ? '' : value.toString()}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const newValue = prop.type === 'integer' 
              ? parseInt(e.target.value, 10) 
              : parseFloat(e.target.value);
            onChange(fullPath, isNaN(newValue) ? '' : newValue);
          }}
          type="number"
          fullWidth
          margin="normal"
        />
      );
    default:
      return (
        <TextField
          label={label}
          helperText={prop.description}
          value={value === undefined ? '' : value.toString()}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(fullPath, e.target.value)}
          fullWidth
          margin="normal"
        />
      );
  }
};

const RenderFields = ({
  schema,
  formData,
  parentPath = '',
  onFieldChange,
}: {
  schema: Record<string, SchemaProperty>;
  formData: JsonObject;
  parentPath?: string;
  onFieldChange: (path: string, value: any) => void;
}) => {
  const getNestedValue = (data: JsonObject, path: string): any => {
    if (!path) return data;
    
    const parts = path.split('.');
    let current: any = data;
    
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    
    return current;
  };

  return (
    <>
      {Object.entries(schema).map(([key, prop]) => {
        const fullPath = parentPath ? `${parentPath}.${key}` : key;
        const value = getNestedValue(formData, fullPath);

        if (prop.type === 'object' && prop.properties) {
          return (
            <div key={key}>
              <Typography variant="subtitle1" style={{ marginTop: '16px' }}>
                {prop.title || key}
              </Typography>
              {prop.description && (
                <Typography variant="body2" color="textSecondary">
                  {prop.description}
                </Typography>
              )}
              <div style={{ marginLeft: '16px' }}>
                <RenderFields
                  schema={prop.properties}
                  formData={formData}
                  parentPath={fullPath}
                  onFieldChange={onFieldChange}
                />
              </div>
            </div>
          );
        }

        return (
          <RenderField
            key={fullPath}
            prop={prop}
            value={value}
            label={prop.title || key}
            fullPath={fullPath}
            onChange={onFieldChange}
          />
        );
      })}
    </>
  );
};

export const GitClaimUpdaterForm = ({
  onChange,
  formContext,
}: FieldExtensionComponentProps<JsonObject, FormData>): JSX.Element => {
  const [loading, setLoading] = React.useState(true);
  const [schema, setSchema] = React.useState<JsonObject | null>(null);
  const [formData, setFormData] = React.useState<JsonObject | null>(null);
  const [error, setError] = React.useState<Error>();
  const [manualSourceUrl, setManualSourceUrl] = React.useState<string>('');

  const fetchApi = useApi(fetchApiRef);
  const catalogApi = useApi(catalogApiRef);
  const scmIntegrations = useApi(scmIntegrationsApiRef);
  const githubAuth = useApi(githubAuthApiRef);

  const getEntityFromRef = React.useCallback(async (entityRef: string) => {
    try {
      const response = await catalogApi.getEntityByRef(entityRef);
      if (!response) {
        throw new Error('Entity not found');
      }
      return response;
    } catch (err) {
      throw new Error(`Failed to fetch entity: ${err}`);
    }
  }, [catalogApi]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const entityRef = formContext?.formData?.entity;
        
        let sourceURI: string | undefined;

        if (entityRef) {
          const entity = await getEntityFromRef(entityRef);
          sourceURI = entity.metadata.annotations?.['terasky.backstage.io/source-file-url'] || formContext?.formData?.sourceFileUrl;
        }

        // If no sourceURI from annotation, use manual input
        if (!sourceURI) {
          sourceURI = manualSourceUrl;
        }

        if (!sourceURI) {
          setLoading(false);
          return;
        }

        const scmIntegration = scmIntegrations.byUrl(sourceURI);
        
        if (!scmIntegration) {
          throw new Error('No matching SCM integration found for URL');
        }

        // Convert GitHub URLs to API URLs
        let fetchUrl = sourceURI;
        
        if (scmIntegration.type === 'github') {
          const match = sourceURI.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/);
          if (!match) {
            throw new Error('Invalid GitHub URL format');
          }
          const [, owner, repo, branch, path] = match;
          fetchUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
        }

        // Create headers with authentication token
        const headers: HeadersInit = {
          'Accept': 'application/vnd.github.v3.raw',
        };

        if (scmIntegration.type === 'github') {
          try {
            const token = await githubAuth.getAccessToken(['repo']);
            if (token) {
              headers.Authorization = `token ${token}`;
            }
          } catch (authError) {
            throw new Error('Failed to get GitHub authentication token');
          }
        }

        // Use Backstage's fetch API with auth headers
        const response = await fetchApi.fetch(fetchUrl, {
          headers: headers,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
        }

        const fileContent = await response.text();

        let yamlContent;
        try {
          yamlContent = parseYaml(fileContent.trim());
        } catch (error: any) {
          throw new Error(`Failed to parse YAML content: ${error.message}`);
        }

        if (!yamlContent || typeof yamlContent !== 'object') {
          throw new Error('Invalid YAML content: expected an object');
        }

        const { items: entities } = await catalogApi.getEntities({
          filter: {
            kind: 'API',
            'metadata.name': `${yamlContent.kind.toLowerCase()}-${yamlContent.apiVersion.split('/')[0].toLowerCase()}--${yamlContent.apiVersion.split('/')[1].toLowerCase()}`,
          },
        });

        if (entities.length === 0) {
          throw new Error('No matching API entity found');
        }

        const apiEntity = entities[0];
        const openApiSpec = typeof apiEntity?.spec?.definition === 'string' 
          ? parseYaml(apiEntity.spec.definition) 
          : apiEntity?.spec?.definition as OpenAPISpec;

        if (!openApiSpec?.components?.schemas?.Resource) {
          throw new Error('Invalid OpenAPI spec: missing Resource schema');
        }

        const resourceSchema = openApiSpec.components.schemas.Resource;
        const specSchema = resourceSchema.properties?.spec?.properties || {};

        setSchema(specSchema);
        setFormData(yamlContent.spec as JsonObject);
        setError(undefined);

      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formContext?.formData?.entity, manualSourceUrl, fetchApi, catalogApi, scmIntegrations, githubAuth, getEntityFromRef]);

  const handleFieldChange = (path: string, value: any) => {
    if (!formData) return;

    const pathParts = path.split('.');
    const newFormData = { ...formData };
    let current = newFormData;

    // Navigate to the nested object
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]] as JsonObject;
    }

    // Set the value
    current[pathParts[pathParts.length - 1]] = value;
    setFormData(newFormData);
    onChange(newFormData);
  };

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <>
      {!formContext?.formData?.entity && (
        <TextField
          label="Source File URL"
          helperText="The URL to the YAML file in your repository if not available in the entity annotations"
          value={manualSourceUrl}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setManualSourceUrl(e.target.value)}
          fullWidth
          margin="normal"
        />
      )}
      {schema && formData && (
        <FormControl margin="normal" fullWidth>
          <RenderFields
            schema={schema as Record<string, SchemaProperty>}
            formData={formData}
            onFieldChange={handleFieldChange}
          />
        </FormControl>
      )}
    </>
  );
}; 