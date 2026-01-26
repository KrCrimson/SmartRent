export interface User {
  _id: string;
  id: string;
  email: string;
  role: 'admin' | 'user';
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  dni?: string;
  address?: string;
  assignedDepartment?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: 'admin' | 'user';
  fullName: string;
  phone: string;
  dni?: string;
  address?: string;
}
