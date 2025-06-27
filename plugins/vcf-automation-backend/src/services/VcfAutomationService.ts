import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import fetch from 'node-fetch';

interface VcfAuthResponse {
  cspAuthToken: string;
}

interface VcfErrorResponse {
  error: string;
  status: 'error';
}

export class VcfAutomationService {
  private token?: string;
  private tokenExpiry?: Date;
  private readonly baseUrl: string;
  private readonly auth: {
    username: string;
    password: string;
    domain: string;
  };

  constructor(config: Config, private readonly logger: LoggerService) {
    this.baseUrl = config.getString('vcfAutomation.baseUrl');
    const auth = config.getConfig('vcfAutomation.authentication');
    this.auth = {
      username: auth.getString('username'),
      password: auth.getString('password'),
      domain: auth.getString('domain'),
    };
  }

  private async authenticate(retries = 3): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
          this.logger.debug('Using existing valid token');
          return;
        }

        this.logger.debug(`Authentication attempt ${attempt} of ${retries}`);
        const response = await fetch(`${this.baseUrl}/csp/gateway/am/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.auth),
        });

        if (!response.ok) {
          throw new Error(`Authentication failed with status ${response.status}: ${response.statusText}`);
        }

        const data = (await response.json()) as VcfAuthResponse;
        this.token = data.cspAuthToken;
        this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token valid for 24 hours
        this.logger.debug('Successfully authenticated with VCF Automation');
        return;
      } catch (error) {
        this.logger.warn(`Authentication attempt ${attempt} failed`, {
          error: error instanceof Error ? error.message : String(error),
        });
        
        if (attempt === retries) {
          this.logger.error('All authentication attempts failed');
          throw new Error('Failed to authenticate with VCF Automation after multiple attempts');
        }
        
        // Wait before retrying (with exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  private async makeAuthorizedRequest(path: string): Promise<any> {
    try {
      await this.authenticate();
      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      this.logger.error(`Failed to make authorized request to ${path}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(`VCF Automation service unavailable: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getDeploymentHistory(deploymentId: string): Promise<any | VcfErrorResponse> {
    try {
      return await this.makeAuthorizedRequest(`/deployment/api/deployments/${deploymentId}/requests`);
    } catch (error) {
      this.logger.error(`Failed to get deployment history for ${deploymentId}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      return { error: 'Service temporarily unavailable', status: 'error' };
    }
  }
  
  async getDeploymentDetails(deploymentId: string): Promise<any | VcfErrorResponse> {
    try {
      return await this.makeAuthorizedRequest(`/deployment/api/deployments/${deploymentId}`);
    } catch (error) {
      this.logger.error(`Failed to get deployment details for ${deploymentId}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      return { error: 'Service temporarily unavailable', status: 'error' };
    }
  }

  async getDeploymentEvents(deploymentId: string): Promise<any | VcfErrorResponse> {
    try {
      return await this.makeAuthorizedRequest(`/deployment/api/deployments/${deploymentId}/userEvents`);
    } catch (error) {
      this.logger.error(`Failed to get deployment events for ${deploymentId}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      return { error: 'Service temporarily unavailable', status: 'error' };
    }
  }

  async getResourceDetails(deploymentId: string, resourceId: string): Promise<any | VcfErrorResponse> {
    try {
      return await this.makeAuthorizedRequest(`/deployment/api/deployments/${deploymentId}/resources/${resourceId}`);
    } catch (error) {
      this.logger.error(`Failed to get resource details for deployment ${deploymentId}, resource ${resourceId}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      return { error: 'Service temporarily unavailable', status: 'error' };
    }
  }

  async getProjectDetails(projectId: string): Promise<any | VcfErrorResponse> {
    try {
      return await this.makeAuthorizedRequest(`/iaas/api/projects/${projectId}`);
    } catch (error) {
      this.logger.error(`Failed to get project details for ${projectId}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      return { error: 'Service temporarily unavailable', status: 'error' };
    }
  }
} 