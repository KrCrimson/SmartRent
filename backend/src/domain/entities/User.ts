import { ObjectId } from 'mongodb';

/**
 * Enumeración de roles de usuario
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  INQUILINO = 'user', // Alias para compatibilidad
  SUPER_ADMIN = 'admin' // Por ahora mismo que admin
}

/**
 * Interface básica del usuario para compatibilidad
 */
export interface User {
  id: string;
  email: string;
  role: UserRole | string;
  departmentId?: ObjectId;
  isActive: boolean;
}

/**
 * Interfaz extendida de Request con usuario autenticado
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    departmentId?: ObjectId;
  };
}
