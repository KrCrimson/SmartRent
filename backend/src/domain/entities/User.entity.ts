import { Email } from '../value-objects/Email.vo';
import { Password } from '../value-objects/Password.vo';
import crypto from 'crypto';

/**
 * Entity: User
 * Representa un usuario en el sistema (Admin o Inquilino)
 */
export class User {
  private constructor(
    public readonly id: string,
    public email: Email,
    private password: Password,
    public role: 'admin' | 'user',
    public fullName: string,
    public phone: string,
    public assignedDepartmentId?: string,
    public contractStartDate?: Date,
    public contractEndDate?: Date,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  /**
   * Factory method para crear un nuevo usuario
   */
  static create(props: {
    email: string;
    password: string;
    role: 'admin' | 'user';
    fullName: string;
    phone: string;
  }): User {
    // Validaciones de negocio
    if (props.fullName.trim().length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres');
    }

    if (props.phone.trim().length < 8) {
      throw new Error('El teléfono debe tener al menos 8 caracteres');
    }

    return new User(
      crypto.randomUUID(),
      new Email(props.email),
      new Password(props.password),
      props.role,
      props.fullName.trim(),
      props.phone.trim()
    );
  }

  /**
   * Factory method para reconstruir un usuario desde la DB
   */
  static reconstruct(props: {
    id: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    fullName: string;
    phone: string;
    assignedDepartmentId?: string;
    contractStartDate?: Date;
    contractEndDate?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      props.id,
      new Email(props.email),
      new Password(props.password, true), // Password ya está hasheado
      props.role,
      props.fullName,
      props.phone,
      props.assignedDepartmentId,
      props.contractStartDate,
      props.contractEndDate,
      props.isActive,
      props.createdAt,
      props.updatedAt
    );
  }

  /**
   * Asignar un departamento a un inquilino
   */
  assignDepartment(departmentId: string, startDate: Date, endDate: Date): void {
    if (this.role !== 'user') {
      throw new Error('Solo los inquilinos pueden tener departamentos asignados');
    }

    if (this.assignedDepartmentId) {
      throw new Error('El usuario ya tiene un departamento asignado');
    }

    if (endDate <= startDate) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    this.assignedDepartmentId = departmentId;
    this.contractStartDate = startDate;
    this.contractEndDate = endDate;
    this.updatedAt = new Date();
  }

  /**
   * Desasignar departamento
   */
  unassignDepartment(): void {
    this.assignedDepartmentId = undefined;
    this.contractStartDate = undefined;
    this.contractEndDate = undefined;
    this.updatedAt = new Date();
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  hasPermission(permission: string): boolean {
    if (this.role === 'admin') {
      return true; // Admin tiene todos los permisos
    }

    // Permisos de usuario regular
    const userPermissions = ['read:own-department', 'create:alert', 'read:own-alerts'];
    return userPermissions.includes(permission);
  }

  /**
   * Verificar si el contrato está activo
   */
  hasActiveContract(): boolean {
    if (!this.contractStartDate || !this.contractEndDate) {
      return false;
    }

    const now = new Date();
    return now >= this.contractStartDate && now <= this.contractEndDate;
  }

  /**
   * Verificar si el contrato está próximo a vencer (menos de 30 días)
   */
  isContractExpiringSoon(): boolean {
    if (!this.contractEndDate) {
      return false;
    }

    const now = new Date();
    const daysUntilExpiry = Math.ceil((this.contractEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  }

  /**
   * Actualizar información del usuario
   */
  updateInfo(props: { fullName?: string; phone?: string }): void {
    if (props.fullName) {
      if (props.fullName.trim().length < 3) {
        throw new Error('El nombre debe tener al menos 3 caracteres');
      }
      this.fullName = props.fullName.trim();
    }

    if (props.phone) {
      if (props.phone.trim().length < 8) {
        throw new Error('El teléfono debe tener al menos 8 caracteres');
      }
      this.phone = props.phone.trim();
    }

    this.updatedAt = new Date();
  }

  /**
   * Desactivar usuario
   */
  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Activar usuario
   */
  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Obtener el password (para operaciones de autenticación)
   */
  getPassword(): Password {
    return this.password;
  }

  /**
   * Actualizar password
   */
  updatePassword(newPassword: Password): void {
    this.password = newPassword;
    this.updatedAt = new Date();
  }
}
