import api from './api';
import type { ApiResponse } from '@/types/api';
import type { Department, DepartmentFilters } from '@/types/department';

export const departmentService = {
  /**
   * Obtener todos los departamentos (con filtros opcionales)
   */
  async getAll(filters?: DepartmentFilters): Promise<Department[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.bedrooms) params.append('bedrooms', filters.bedrooms.toString());
      if (filters.city) params.append('city', filters.city);
      if (filters.hasParking !== undefined) params.append('hasParking', filters.hasParking.toString());
      if (filters.hasFurniture !== undefined) params.append('hasFurniture', filters.hasFurniture.toString());
    }

    const queryString = params.toString();
    const url = `/departments${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<ApiResponse<Department[]>>(url);
    return response.data.data || [];
  },

  /**
   * Obtener un departamento por ID
   */
  async getById(id: string): Promise<Department> {
    const response = await api.get<ApiResponse<Department>>(`/departments/${id}`);
    if (!response.data.data) {
      throw new Error('Department not found');
    }
    return response.data.data;
  },

  /**
   * Crear un departamento (admin)
   */
  async create(department: Omit<Department, '_id' | 'createdAt' | 'updatedAt'>): Promise<Department> {
    const response = await api.post<ApiResponse<Department>>('/departments', department);
    if (!response.data.data) {
      throw new Error('Failed to create department');
    }
    return response.data.data;
  },

  /**
   * Actualizar un departamento (admin)
   */
  async update(id: string, data: Partial<Department>): Promise<Department> {
    const response = await api.put<ApiResponse<Department>>(`/departments/${id}`, data);
    if (!response.data.data) {
      throw new Error('Failed to update department');
    }
    return response.data.data;
  },

  /**
   * Eliminar un departamento (admin)
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/departments/${id}`);
  },

  /**
   * Subir imágenes a un departamento (admin)
   */
  async uploadImages(id: string, files: File[]): Promise<Department> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await api.post<ApiResponse<Department>>(
      `/departments/${id}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    if (!response.data.data) {
      throw new Error('Failed to upload images');
    }
    return response.data.data;
  },

  /**
   * Eliminar una imagen de un departamento (admin)
   */
  async deleteImage(id: string, imageUrl: string): Promise<Department> {
    const encodedUrl = encodeURIComponent(imageUrl);
    const response = await api.delete<ApiResponse<Department>>(
      `/departments/${id}/images/${encodedUrl}`
    );
    if (!response.data.data) {
      throw new Error('Failed to delete image');
    }
    return response.data.data;
  },
};
