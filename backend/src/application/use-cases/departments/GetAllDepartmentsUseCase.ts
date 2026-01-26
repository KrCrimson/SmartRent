import { Department } from '@domain/entities/Department';
import { IDepartmentRepository, DepartmentFilters } from '@domain/repositories/IDepartmentRepository';

export class GetAllDepartmentsUseCase {
  constructor(private departmentRepository: IDepartmentRepository) {}

  async execute(filters?: DepartmentFilters): Promise<Department[]> {
    return await this.departmentRepository.findAll(filters);
  }
}
