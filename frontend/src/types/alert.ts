// Alert types for frontend
export interface Alert {
  id: string;
  title: string;
  description: string;
  category: AlertCategory;
  priority: AlertPriority;
  status: AlertStatus;
  reporterId: string;
  reporterInfo?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  departmentId: string;
  departmentInfo?: {
    number: string;
    building: string;
  };
  assignedTo?: string;
  assignedToInfo?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  images: string[];
  notes: AlertNote[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface AlertNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export enum AlertCategory {
  MANTENIMIENTO = 'MANTENIMIENTO',
  LIMPIEZA = 'LIMPIEZA',
  SEGURIDAD = 'SEGURIDAD',
  SERVICIOS = 'SERVICIOS',
  RUIDO = 'RUIDO',
  OTRO = 'OTRO'
}

export enum AlertPriority {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE'
}

export enum AlertStatus {
  PENDIENTE = 'PENDIENTE',
  EN_PROGRESO = 'EN_PROGRESO',
  RESUELTO = 'RESUELTO',
  CANCELADO = 'CANCELADO'
}

// Form data interfaces
export interface CreateAlertData {
  title: string;
  description: string;
  category: AlertCategory;
  priority: AlertPriority;
  departmentId: string;
  images?: File[];
}

export interface UpdateAlertStatusData {
  status: AlertStatus;
  notes?: string;
}

export interface AddAlertNoteData {
  note: string;
}

// Filter and query interfaces
export interface AlertFilters {
  status?: AlertStatus | AlertStatus[];
  category?: AlertCategory | AlertCategory[];
  priority?: AlertPriority | AlertPriority[];
  departmentId?: string;
  assignedTo?: string;
  isActive?: boolean;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface AlertQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedAlerts {
  alerts: Alert[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Statistics interface
export interface AlertStats {
  total: number;
  byStatus: {
    [key in AlertStatus]: number;
  };
  byCategory: {
    [key in AlertCategory]: number;
  };
  byPriority: {
    [key in AlertPriority]: number;
  };
  monthlyTrend: Array<{
    month: string;
    count: number;
    resolved: number;
  }>;
  averageResolutionTime: number; // in hours
  overdueCount: number;
}

// Category and Priority labels for UI
export const ALERT_CATEGORY_LABELS: Record<AlertCategory, string> = {
  [AlertCategory.MANTENIMIENTO]: 'Mantenimiento',
  [AlertCategory.LIMPIEZA]: 'Limpieza',
  [AlertCategory.SEGURIDAD]: 'Seguridad',
  [AlertCategory.SERVICIOS]: 'Servicios',
  [AlertCategory.RUIDO]: 'Ruido',
  [AlertCategory.OTRO]: 'Otro'
};

export const ALERT_PRIORITY_LABELS: Record<AlertPriority, string> = {
  [AlertPriority.BAJA]: 'Baja',
  [AlertPriority.MEDIA]: 'Media',
  [AlertPriority.ALTA]: 'Alta',
  [AlertPriority.URGENTE]: 'Urgente'
};

export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
  [AlertStatus.PENDIENTE]: 'Pendiente',
  [AlertStatus.EN_PROGRESO]: 'En Progreso',
  [AlertStatus.RESUELTO]: 'Resuelto',
  [AlertStatus.CANCELADO]: 'Cancelado'
};

// Priority colors for UI
export const ALERT_PRIORITY_COLORS: Record<AlertPriority, string> = {
  [AlertPriority.BAJA]: 'bg-green-100 text-green-800',
  [AlertPriority.MEDIA]: 'bg-yellow-100 text-yellow-800', 
  [AlertPriority.ALTA]: 'bg-orange-100 text-orange-800',
  [AlertPriority.URGENTE]: 'bg-red-100 text-red-800'
};

// Status colors for UI
export const ALERT_STATUS_COLORS: Record<AlertStatus, string> = {
  [AlertStatus.PENDIENTE]: 'bg-gray-100 text-gray-800',
  [AlertStatus.EN_PROGRESO]: 'bg-blue-100 text-blue-800',
  [AlertStatus.RESUELTO]: 'bg-green-100 text-green-800',
  [AlertStatus.CANCELADO]: 'bg-red-100 text-red-800'
};