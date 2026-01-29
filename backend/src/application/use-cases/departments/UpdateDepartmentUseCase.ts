import { Department } from '@domain/entities/Department';
import { IDepartmentRepository } from '@domain/repositories/IDepartmentRepository';
import { NotFoundError } from '@domain/errors/NotFoundError';

export class UpdateDepartmentUseCase {
  constructor(private departmentRepository: IDepartmentRepository) {}

  async execute(id: string, data: Partial<Department>): Promise<Department> {
    // Verificar que el departamento existe
    const existing = await this.departmentRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Departamento no encontrado');
    }

    // No permitir cambiar el código a uno que ya existe
    if (data.code && data.code !== existing.code) {
      const codeExists = await this.departmentRepository.findByCode(data.code);
      if (codeExists) {
        throw new NotFoundError(`El código ${data.code} ya está en uso`);
      }
    }

    // Actualizar el departamento
    const updated = await this.departmentRepository.update(id, data);
    
    if (!updated) {
      throw new NotFoundError('Error al actualizar el departamento');
    }

    return updated;
  }
}
