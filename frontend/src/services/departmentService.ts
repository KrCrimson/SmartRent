// Department service for API calls
import api from './api';
import { Department, CreateDepartmentData, UpdateDepartmentData, DepartmentFilters } from '@/types/department';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Get all departments with optional filters
 */
export const getAllDepartments = async (filters?: DepartmentFilters): Promise<Department[]> => {
  const params = new URLSearchParams();
  
  if (filters?.isAvailable !== undefined) {
    params.append('isAvailable', String(filters.isAvailable));
  }
  if (filters?.minRent) params.append('minRent', String(filters.minRent));
  if (filters?.maxRent) params.append('maxRent', String(filters.maxRent));
  if (filters?.bedrooms) params.append('bedrooms', String(filters.bedrooms));
  if (filters?.bathrooms) params.append('bathrooms', String(filters.bathrooms));
  if (filters?.minArea) params.append('minArea', String(filters.minArea));
  if (filters?.maxArea) params.append('maxArea', String(filters.maxArea));
  if (filters?.floor) params.append('floor', String(filters.floor));
  if (filters?.search) params.append('search', filters.search);

  const response = await api.get<ApiResponse<Department[]>>(
    `/departments?${params.toString()}`
  );
  return response.data.data;
};

/**
 * Get a single department by ID
 */
export const getDepartmentById = async (departmentId: string): Promise<Department> => {
  const response = await api.get<ApiResponse<Department>>(`/departments/${departmentId}`);
  return response.data.data;
};

/**
 * Create a new department
 */
export const createDepartment = async (
  departmentData: CreateDepartmentData
): Promise<Department> => {
  const response = await api.post<ApiResponse<Department>>('/departments', departmentData);
  return response.data.data;
};

/**
 * Update an existing department
 */
export const updateDepartment = async (
  departmentId: string,
  departmentData: UpdateDepartmentData
): Promise<Department> => {
  const response = await api.put<ApiResponse<Department>>(
    `/departments/${departmentId}`,
    departmentData
  );
  return response.data.data;
};

/**
 * Delete a department
 */
export const deleteDepartment = async (departmentId: string): Promise<void> => {
  await api.delete(`/departments/${departmentId}`);
};
