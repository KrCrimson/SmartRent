// Alert service for API calls
import api from './api';
import type { 
  Alert, 
  CreateAlertData, 
  UpdateAlertStatusData, 
  AddAlertNoteData,
  AlertFilters,
  AlertQueryOptions,
  PaginatedAlerts,
  AlertStats 
} from '@/types/alert';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Get all alerts with optional filters and pagination
 */
export const getAllAlerts = async (
  filters?: AlertFilters, 
  options?: AlertQueryOptions
): Promise<PaginatedAlerts> => {
  const params = new URLSearchParams();
  
  // Add filters to params
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
  }
  
  // Add query options to params
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }

  const response = await api.get<ApiResponse<PaginatedAlerts>>(
    `/alerts?${params.toString()}`
  );
  return response.data.data;
};

/**
 * Get alert by ID
 */
export const getAlertById = async (alertId: string): Promise<Alert> => {
  const response = await api.get<ApiResponse<Alert>>(`/alerts/${alertId}`);
  return response.data.data;
};

/**
 * Create a new alert
 */
export const createAlert = async (alertData: CreateAlertData): Promise<Alert> => {
  const formData = new FormData();
  
  // Add text fields
  formData.append('title', alertData.title);
  formData.append('description', alertData.description);
  formData.append('category', alertData.category);
  formData.append('priority', alertData.priority);
  formData.append('departmentId', alertData.departmentId);
  
  // Add images if present
  if (alertData.images && alertData.images.length > 0) {
    alertData.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  const response = await api.post<ApiResponse<Alert>>('/alerts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

/**
 * Update alert status
 */
export const updateAlertStatus = async (
  alertId: string, 
  statusData: UpdateAlertStatusData
): Promise<Alert> => {
  const response = await api.put<ApiResponse<Alert>>(
    `/alerts/${alertId}/status`, 
    statusData
  );
  return response.data.data;
};

/**
 * Add note to alert
 */
export const addAlertNote = async (
  alertId: string, 
  noteData: AddAlertNoteData
): Promise<Alert> => {
  const response = await api.post<ApiResponse<Alert>>(
    `/alerts/${alertId}/notes`, 
    noteData
  );
  return response.data.data;
};

/**
 * Assign alert to user (admin only)
 */
export const assignAlert = async (
  alertId: string, 
  assigneeId: string
): Promise<Alert> => {
  const response = await api.put<ApiResponse<Alert>>(
    `/alerts/${alertId}/assign`, 
    { assigneeId }
  );
  return response.data.data;
};

/**
 * Delete alert (admin only)
 */
export const deleteAlert = async (alertId: string): Promise<void> => {
  await api.delete(`/alerts/${alertId}`);
};

/**
 * Get alert statistics
 */
export const getAlertStats = async (filters?: AlertFilters): Promise<AlertStats> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
  }

  const response = await api.get<ApiResponse<AlertStats>>(
    `/alerts/stats?${params.toString()}`
  );
  return response.data.data;
};

// Default export for convenience
const alertService = {
  getAllAlerts,
  getAlertById,
  createAlert,
  updateAlertStatus,
  addAlertNote,
  assignAlert,
  deleteAlert,
  getAlertStats
};

export default alertService;