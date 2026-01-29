import type { Tenant, TenantStatus } from '@domain/entities/Tenant';

export interface TenantFilters {
  status?: TenantStatus;
  departmentId?: string;
  hasActiveLease?: boolean;
  minIncome?: number;
  maxIncome?: number;
  nationality?: string;
  search?: string; // búsqueda por nombre, email, teléfono
}

export interface ITenantRepository {
  /**
   * Crear un nuevo inquilino
   */
  create(tenant: Omit<Tenant, 'createdAt' | 'updatedAt'>): Promise<Tenant>;

  /**
   * Obtener todos los inquilinos con filtros opcionales
   */
  findAll(filters?: TenantFilters): Promise<Tenant[]>;

  /**
   * Buscar inquilino por ID
   */
  findById(id: string): Promise<Tenant | null>;

  /**
   * Buscar inquilino por número de identificación
   */
  findByIdNumber(idNumber: string): Promise<Tenant | null>;

  /**
   * Buscar inquilino por email
   */
  findByEmail(email: string): Promise<Tenant | null>;

  /**
   * Buscar inquilinos por departamento
   */
  findByDepartment(departmentId: string): Promise<Tenant[]>;

  /**
   * Buscar inquilinos con contratos activos
   */
  findWithActiveLease(): Promise<Tenant[]>;

  /**
   * Buscar inquilinos con contratos próximos a vencer
   */
  findWithExpiringLease(daysAhead: number): Promise<Tenant[]>;

  /**
   * Actualizar inquilino
   */
  update(id: string, updates: Partial<Tenant>): Promise<Tenant | null>;

  /**
   * Asignar departamento a inquilino
   */
  assignToDepartment(
    tenantId: string, 
    departmentId: string, 
    leaseInfo: {
      leaseStartDate: string;
      leaseEndDate: string;
      monthlyRent: number;
      securityDeposit: number;
    }
  ): Promise<Tenant | null>;

  /**
   * Remover inquilino de departamento
   */
  removeFromDepartment(tenantId: string): Promise<Tenant | null>;

  /**
   * Eliminar inquilino (soft delete)
   */
  delete(id: string): Promise<boolean>;

  /**
   * Contar inquilinos con filtros
   */
  count(filters?: TenantFilters): Promise<number>;
}