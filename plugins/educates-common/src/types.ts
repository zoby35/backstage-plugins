// Backend-only types
export interface TrainingPortalAuthConfig {
  robotUsername: string;
  robotPassword: string;
  clientId: string;
  clientSecret: string;
}

export interface TrainingPortalBackendConfig {
  name: string;
  url: string;
  auth: TrainingPortalAuthConfig;
}

// Frontend-safe types
export interface TrainingPortalInfo {
  name: string;
  url: string;
}

export interface TrainingPortalStatus {
  name: string;
  title?: string;
  url: string;
  uid: string;
  generation: number;
  logo?: string;
  labels: Record<string, string>;
  sessions: {
    maximum: number;
    registered: number;
    anonymous: number;
    allocated: number;
  };
}

export interface WorkshopEnvironment {
  name: string;
  state: string;
  duration: number;
  capacity: number;
  reserved: number;
  allocated: number;
  available: number;
}

export interface Workshop {
  name: string;
  title: string;
  description: string;
  vendor: string;
  authors: string[];
  difficulty: string;
  duration: string;
  tags: string[];
  labels: Record<string, string>;
  logo: string;
  url: string;
  environment: WorkshopEnvironment;
}

export interface WorkshopsCatalogResponse {
  portal: TrainingPortalStatus;
  workshops: Workshop[];
}

export interface WorkshopSession {
  /**
   * The full URL to the workshop session, including the training portal base URL
   */
  url: string;
  token?: string;
  expiry?: string;
} 