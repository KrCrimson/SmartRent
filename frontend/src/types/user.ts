// User types for frontend

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  departmentId?: string;
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
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
}

export interface AssignDepartmentData {
  departmentId: string;
  contractStartDate: string; // ISO 8601 format
  contractEndDate: string; // ISO 8601 format
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string; // Search by name or email
  hasDepartment?: boolean;
}
