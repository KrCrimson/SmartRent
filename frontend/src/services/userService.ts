// User service for API calls
import api from './api';
import { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  AssignDepartmentData,
  UserFilters 
} from '@/types/user';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Get all users with optional filters
 */
export const getAllUsers = async (filters?: UserFilters): Promise<User[]> => {
  const params = new URLSearchParams();
  
  if (filters?.role) params.append('role', filters.role);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.hasDepartment !== undefined) {
    params.append('hasDepartment', String(filters.hasDepartment));
  }

  const response = await api.get<ApiResponse<User[]>>(
    `/users?${params.toString()}`
  );
  return response.data.data;
};

/**
 * Get a single user by ID
 */
export const getUserById = async (userId: string): Promise<User> => {
  const response = await api.get<ApiResponse<User>>(`/users/${userId}`);
  return response.data.data;
};

/**
 * Create a new user
 */
export const createUser = async (userData: CreateUserData): Promise<User> => {
  const response = await api.post<ApiResponse<User>>('/users', userData);
  return response.data.data;
};

/**
 * Update an existing user
 */
export const updateUser = async (
  userId: string,
  userData: UpdateUserData
): Promise<User> => {
  const response = await api.put<ApiResponse<User>>(
    `/users/${userId}`,
    userData
  );
  return response.data.data;
};

/**
 * Delete a user
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/users/${userId}`);
};

/**
 * Assign department to user
 */
export const assignDepartment = async (
  userId: string,
  data: AssignDepartmentData
): Promise<User> => {
  const response = await api.put<ApiResponse<User>>(
    `/users/${userId}/assign-department`,
    data
  );
  return response.data.data;
};

/**
 * Unassign department from user
 */
export const unassignDepartment = async (userId: string): Promise<User> => {
  const response = await api.delete<ApiResponse<User>>(
    `/users/${userId}/unassign-department`
  );
  return response.data.data;
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<ApiResponse<User>>('/users/me');
  return response.data.data;
};
