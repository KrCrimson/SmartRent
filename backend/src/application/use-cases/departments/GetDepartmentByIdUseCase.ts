import { Department } from '@domain/entities/Department';
import { IDepartmentRepository } from '@domain/repositories/IDepartmentRepository';
import { NotFoundError } from '@domain/errors/NotFoundError';

export class GetDepartmentByIdUseCase {
  constructor(private departmentRepository: IDepartmentRepository) {}

  async execute(id: string): Promise<Department> {
    const department = await this.departmentRepository.findById(id);
    
    if (!department) {
      throw new NotFoundError('Departamento no encontrado');
    }

    return department;
  }
}
