import { Department } from '@domain/entities/Department';
import { IDepartmentRepository } from '@domain/repositories/IDepartmentRepository';
import { ConflictError } from '@domain/errors/ConflictError';

export class CreateDepartmentUseCase {
  constructor(private departmentRepository: IDepartmentRepository) {}

  async execute(data: Omit<Department, '_id' | 'createdAt' | 'updatedAt'>): Promise<Department> {
    // Verificar si ya existe un departamento con el mismo código
    const existing = await this.departmentRepository.findByCode(data.code);
    if (existing) {
      throw new ConflictError(`Ya existe un departamento con el código ${data.code}`);
    }

    // Crear el departamento
    const department = await this.departmentRepository.create(data);
    return department;
  }
}
