import { Config } from '@backstage/config';
import express from 'express';
import { LoggerService, PermissionsService } from '@backstage/backend-plugin-api';
import { VcfAutomationService } from './services/VcfAutomationService';
export interface RouterOptions {
  logger: LoggerService;
  config: Config;
  permissions: PermissionsService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = express.Router();
  router.use(express.json());

  const vcfService = new VcfAutomationService(config, logger);

  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  router.get('/deployments/:deploymentId/history', async (req, res) => {
    const { deploymentId } = req.params;
    const history = await vcfService.getDeploymentHistory(deploymentId);
    res.json(history);
  });

  router.get('/deployments/:deploymentId/events', async (req, res) => {
    const { deploymentId } = req.params;
    const events = await vcfService.getDeploymentEvents(deploymentId);
    res.json(events);
  });

  router.get('/deployments/:deploymentId/resources/:resourceId', async (req, res) => {
    const { deploymentId, resourceId } = req.params;
    const resource = await vcfService.getResourceDetails(deploymentId, resourceId);
    res.json(resource);
  });

  router.get('/projects/:projectId', async (req, res) => {
    const { projectId } = req.params;
    const project = await vcfService.getProjectDetails(projectId);
    res.json(project);
  });

  router.get('/deployments/:deploymentId', async (req, res) => {
    const { deploymentId } = req.params;
    const deployment = await vcfService.getDeploymentDetails(deploymentId);
    res.json(deployment);
  });

  return router;
}
