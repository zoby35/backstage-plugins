import { createPermission } from '@backstage/plugin-permission-common';

/**
 * Resource type for training portal specific permissions
 * @public
 */
export interface EducatesTrainingPortalResource {
  portalName: string;
}

/**
 * Resource type for workshop specific permissions
 * @public
 */
export interface EducatesWorkshopResource {
  portalName: string;
  workshopName: string;
}

/**
 * Resource type for workshop session specific permissions
 * @public
 */
export interface EducatesWorkshopSessionResource {
  portalName: string;
  workshopName: string;
  sessionId?: string;
}

/**
 * Permission to view the workshop catalog for specific training portals
 * @public
 */
export const EDUCATES_VIEW_WORKSHOPS = createPermission({
  name: 'educates.workshops.view',
  attributes: { action: 'read' },
});

/**
 * Permission to create new workshop sessions in specific training portals
 * @public
 */
export const EDUCATES_CREATE_WORKSHOP_SESSIONS = createPermission({
  name: 'educates.workshop-sessions.create',
  attributes: { action: 'create' },
});

/**
 * All permissions available in the Educates plugin
 * @public
 */
export const educatesPermissions = [
  EDUCATES_VIEW_WORKSHOPS,
  EDUCATES_CREATE_WORKSHOP_SESSIONS,
];