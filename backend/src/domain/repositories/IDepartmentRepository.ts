import { Department, DepartmentStatus } from '../entities/Department';

export interface DepartmentFilters {
  status?: DepartmentStatus;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  city?: string;
  hasParking?: boolean;
  hasFurniture?: boolean;
}

export interface IDepartmentRepository {
  create(department: Omit<Department, '_id' | 'createdAt' | 'updatedAt'>): Promise<Department>;
  findAll(filters?: DepartmentFilters): Promise<Department[]>;
  findById(id: string): Promise<Department | null>;
  findByCode(code: string): Promise<Department | null>;
  findByStatus(status: DepartmentStatus): Promise<Department[]>;
  findAvailable(): Promise<Department[]>;
  update(id: string, department: Partial<Department>): Promise<Department | null>;
  delete(id: string): Promise<boolean>;
  assignTenant(departmentId: string, tenantId: string): Promise<Department | null>;
  removeTenant(departmentId: string): Promise<Department | null>;
}
