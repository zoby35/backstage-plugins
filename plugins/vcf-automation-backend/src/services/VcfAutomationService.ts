import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import fetch from 'node-fetch';

interface VcfAuthResponse {
  cspAuthToken: string;
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

  private async authenticate(): Promise<void> {
    try {
      if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
        this.logger.debug('Using existing valid token');
        return;
      }

      this.logger.debug('Authenticating with VCF Automation');
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
    } catch (error) {
      this.logger.error('Authentication failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async makeAuthorizedRequest(path: string): Promise<any> {
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
  }

  async getDeploymentHistory(deploymentId: string) {
    return this.makeAuthorizedRequest(`/deployment/api/deployments/${deploymentId}/requests`);
  }
  
  async getDeploymentDetails(deploymentId: string) {
    return this.makeAuthorizedRequest(`/deployment/api/deployments/${deploymentId}`);
  }

  async getDeploymentEvents(deploymentId: string) {
    return this.makeAuthorizedRequest(`/deployment/api/deployments/${deploymentId}/userEvents`);
  }

  async getResourceDetails(deploymentId: string, resourceId: string) {
    return this.makeAuthorizedRequest(`/deployment/api/deployments/${deploymentId}/resources/${resourceId}`);
  }

  async getProjectDetails(projectId: string) {
    return this.makeAuthorizedRequest(`/iaas/api/projects/${projectId}`);
  }
} 