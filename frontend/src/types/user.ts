// User types for frontend

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'inactive';

export interface User {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  departmentId?: string; // Por retrocompatibilidad si es necesario
  assignedDepartmentId?: string;
  department?: {
    id: string;
    code: string;
    name: string;
  };
  contractStartDate?: string;
  contractEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserData {
  fullName?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
  phone?: string;
}

export interface AssignDepartmentData {
  departmentId: string;
  contractStartDate: string; // ISO 8601 format
  contractEndDate: string; // ISO 8601 format
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string; // Search by name or email
  hasDepartment?: boolean;
}
