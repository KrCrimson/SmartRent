import { User } from '../entities/User.entity';

/**
 * Interface del Repositorio de Usuarios
 * Define el contrato que debe cumplir cualquier implementación
 */
export interface IUserRepository {
  /**
   * Buscar usuario por ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Buscar usuario por email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Guardar un nuevo usuario
   */
  save(user: User): Promise<User>;

  /**
   * Actualizar un usuario existente
   */
  update(user: User): Promise<User>;

  /**
   * Eliminar un usuario (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Buscar todos los usuarios con filtros opcionales
   */
  findAll(filters?: {
    role?: 'admin' | 'user';
    isActive?: boolean;
    hasAssignedDepartment?: boolean;
  }): Promise<User[]>;

  /**
   * Verificar si existe un usuario con el email dado
   */
  existsByEmail(email: string): Promise<boolean>;
}
