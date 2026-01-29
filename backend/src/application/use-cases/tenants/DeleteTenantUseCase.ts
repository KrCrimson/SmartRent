import { ITenantRepository } from '../../../domain/repositories/ITenantRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ConflictError } from '../../../shared/errors/ConflictError';

export class DeleteTenantUseCase {
  constructor(private tenantRepository: ITenantRepository) {}

  async execute(id: string): Promise<void> {
    // Verificar que el inquilino existe
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundError('Inquilino no encontrado');
    }

    // Verificar que el inquilino no tenga un contrato activo
    if (tenant.status === 'active' && tenant.currentDepartment) {
      throw new ConflictError('No se puede eliminar un inquilino con contrato activo. Primero debe finalizar el contrato.');
    }

    const deleted = await this.tenantRepository.delete(id);
    
    if (!deleted) {
      throw new Error('Error al eliminar el inquilino');
    }
  }
}