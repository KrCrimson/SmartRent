import { ITenantRepository } from '../../../domain/repositories/ITenantRepository';
import { Tenant } from '../../../domain/entities/Tenant';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ConflictError } from '../../../shared/errors/ConflictError';

export class UpdateTenantUseCase {
  constructor(private tenantRepository: ITenantRepository) {}

  async execute(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    // Verificar que el inquilino existe
    const existingTenant = await this.tenantRepository.findById(id);
    if (!existingTenant) {
      throw new NotFoundError('Inquilino no encontrado');
    }

    // Si se actualiza el email, verificar que no esté en uso por otro inquilino
    if (updates.contactInfo?.email) {
      const emailInUse = await this.tenantRepository.findByEmail(updates.contactInfo.email);
      if (emailInUse && emailInUse.id !== id) {
        throw new ConflictError(`El email ${updates.contactInfo.email} ya está en uso`);
      }
    }

    // Si se actualiza el número de identificación, verificar que no esté en uso
    if (updates.documents?.idNumber) {
      const idInUse = await this.tenantRepository.findByIdNumber(updates.documents.idNumber);
      if (idInUse && idInUse.id !== id) {
        throw new ConflictError(`El número de identificación ${updates.documents.idNumber} ya está en uso`);
      }
    }

    const updatedTenant = await this.tenantRepository.update(id, updates);
    
    if (!updatedTenant) {
      throw new NotFoundError('Error al actualizar el inquilino');
    }

    return updatedTenant;
  }
}