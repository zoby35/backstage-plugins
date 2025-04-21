export interface VcfPageable {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface VcfPageResponse<T> {
  content: T[];
  pageable: VcfPageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface VcfDeploymentHistory {
  id: string;
  name: string;
  requestedBy: string;
  actionId: string;
  deploymentId: string;
  resourceIds: string[];
  status: string;
  details: string;
  createdAt: string;
  updatedAt: string;
  totalTasks: number;
  completedTasks: number;
}

export interface VcfDeploymentEvent {
  id: string;
  requestId: string;
  requestedBy: string;
  resourceIds: string[];
  name: string;
  details: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface VcfResourceDisk {
  vm: string;
  name: string;
  type: string;
  shares?: string;
  vcUuid: string;
  diskFile?: string;
  bootOrder?: number;
  encrypted: boolean;
  limitIops?: string;
  capacityGb: number;
  persistent: boolean;
  independent?: string;
  sharesLevel?: string;
  endpointType: string;
  resourceLink: string;
  vmFolderPath?: string;
  controllerKey: string;
  diskPlacementRef?: string;
  existingResource: string;
  provisioningType?: string;
  controllerUnitNumber: string;
}

export interface VcfResourceNetwork {
  id: string;
  name: string;
  address: string;
  network: string;
  assignment: string;
  deviceIndex: number;
  external_id: string;
  mac_address: string;
  resourceName: string;
  ipv6Addresses?: string[];
}

export interface VcfResourceExpense {
  totalExpense: number;
  computeExpense: number;
  storageExpense: number;
  additionalExpense: number;
  unit: string;
  lastUpdatedTime: string;
}

export interface VcfResource {
  id: string;
  name: string;
  type: string;
  properties: {
    [key: string]: any;
    storage?: {
      disks: VcfResourceDisk[];
    };
    networks?: VcfResourceNetwork[];
  };
  createdAt: string;
  syncStatus: string;
  expense: VcfResourceExpense;
  origin: string;
  dependsOn: string[];
  state: string;
}

export interface VcfProjectZone {
  zoneId: string;
  priority: number;
  maxNumberInstances: number;
  allocatedInstancesCount: number;
  memoryLimitMB: number;
  allocatedMemoryMB: number;
  cpuLimit: number;
  allocatedCpu: number;
  storageLimitGB: number;
  allocatedStorageGB: number;
  id: string;
}

export interface VcfProject {
  machineNamingTemplate: string;
  administrators: Array<{ email: string; type: string; }>;
  members: Array<{ email: string; type: string; }>;
  viewers: Array<{ email: string; type: string; }>;
  supervisors: Array<{ email: string; type: string; }>;
  zones: VcfProjectZone[];
  constraints: Record<string, unknown>;
  operationTimeout: number;
  sharedResources: boolean;
  placementPolicy: string;
  customProperties: Record<string, unknown>;
  name: string;
  description: string;
  id: string;
  organizationId: string;
  orgId: string;
  _links: {
    self: {
      href: string;
    };
  };
} 