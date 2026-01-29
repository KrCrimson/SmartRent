import { IDepartmentRepository } from '@domain/repositories/IDepartmentRepository';
import { NotFoundError } from '@domain/errors/NotFoundError';
import { ConflictError } from '@domain/errors/ConflictError';

export class DeleteDepartmentUseCase {
  constructor(private departmentRepository: IDepartmentRepository) {}

  async execute(id: string): Promise<void> {
    // Verificar que el departamento existe
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new NotFoundError('Departamento no encontrado');
    }

    // No permitir eliminar si tiene inquilino activo
    if (department.currentTenant && department.status === 'occupied') {
      throw new ConflictError(
        'No se puede eliminar un departamento con inquilino activo. Primero remueva al inquilino.'
      );
    }

    // Soft delete
    const deleted = await this.departmentRepository.delete(id);
    
    if (!deleted) {
      throw new Error('Error al eliminar el departamento');
    }
  }
}
