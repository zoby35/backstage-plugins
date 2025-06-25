import express from 'express';
import Router from 'express-promise-router';
import { Config } from '@backstage/config';
import { LoggerService, PermissionsService } from '@backstage/backend-plugin-api';
import fetch from 'node-fetch';
import { educatesPermissions } from '@terasky/backstage-plugin-educates-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
  permissions: PermissionsService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;
  const router = Router();
  router.use(express.json());
  const permissionRouter = createPermissionIntegrationRouter({
    permissions: Object.values(educatesPermissions),
  });
  router.use(permissionRouter);
  const trainingPortals = config.getConfigArray('educates.trainingPortals').map(portal => ({
    name: portal.getString('name'),
    url: portal.getString('url'),
    auth: {
      robotUsername: portal.getConfig('auth').getString('robotUsername'),
      robotPassword: portal.getConfig('auth').getString('robotPassword'),
      clientId: portal.getConfig('auth').getString('clientId'),
      clientSecret: portal.getConfig('auth').getString('clientSecret'),
    },
  }));

  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  // Helper function to get access token
  const getAccessToken = async (portal: typeof trainingPortals[0]) => {
    const tokenResponse = await fetch(`${portal.url}/oauth2/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${portal.auth.clientId}:${portal.auth.clientSecret}`).toString('base64')}`,
      },
      body: `grant_type=password&username=${encodeURIComponent(portal.auth.robotUsername)}&password=${encodeURIComponent(portal.auth.robotPassword)}`,
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get access token: ${tokenResponse.statusText}`);
    }

    return await tokenResponse.json();
  };

  router.get('/workshops/:portalName', async (req, res) => {
    const { portalName } = req.params;
    const portal = trainingPortals.find(p => p.name === portalName);
    if (!portal) {
      res.status(404).json({ error: 'Training portal not found' });
      return;
    }

    try {
      // Get access token
      const tokenData = await getAccessToken(portal);
      const accessToken = tokenData.access_token;

      // Get workshops catalog
      const catalogResponse = await fetch(`${portal.url}/workshops/catalog/workshops/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!catalogResponse.ok) {
        throw new Error(`Failed to get workshops catalog: ${catalogResponse.statusText}`);
      }

      const catalogData = await catalogResponse.json();
      res.json(catalogData);
    } catch (err) {
      logger.error(`Failed to get workshops catalog: ${err}`);
      res.status(500).json({ error: 'Failed to get workshops catalog' });
    }
  });

  router.post('/workshops/:portalName/token', async (req, res) => {
    const { portalName } = req.params;
    const portal = trainingPortals.find(p => p.name === portalName);
    if (!portal) {
      res.status(404).json({ error: 'Training portal not found' });
      return;
    }

    try {
      const tokenData = await getAccessToken(portal);
      res.json(tokenData);
    } catch (err) {
      logger.error(`Failed to get access token: ${err}`);
      res.status(500).json({ error: 'Failed to get access token' });
    }
  });

  router.post('/workshops/:portalName/:workshopName/request', async (req, res) => {
    const { portalName, workshopName } = req.params;
    const portal = trainingPortals.find(p => p.name === portalName);
    if (!portal) {
      res.status(404).json({ error: 'Training portal not found' });
      return;
    }

    try {
      // Get access token
      const tokenData = await getAccessToken(portal);
      const accessToken = tokenData.access_token;

      // Get the app base URL from config
      const appBaseUrl = config.getString('app.baseUrl');
      const indexUrl = `${appBaseUrl}/educates`;

      // Request the workshop session
      const sessionResponse = await fetch(`${portal.url}/workshops/environment/${workshopName}/request/?index_url=${encodeURIComponent(indexUrl)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!sessionResponse.ok) {
        throw new Error(`Failed to request workshop: ${sessionResponse.statusText}`);
      }

      const sessionData = await sessionResponse.json();
      // Add the portal URL to the response
      res.json({
        ...sessionData,
        url: `${portal.url}${sessionData.url}`,
      });
    } catch (err) {
      logger.error(`Failed to request workshop: ${err}`);
      res.status(500).json({ error: 'Failed to request workshop' });
    }
  });

  return router;
} 