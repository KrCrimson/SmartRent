import { ITenantRepository } from '../../../domain/repositories/ITenantRepository';
import { Tenant } from '../../../domain/entities/Tenant';
import { ConflictError } from '../../../shared/errors/ConflictError';

export class CreateTenantUseCase {
  constructor(private tenantRepository: ITenantRepository) {}

  async execute(tenantData: Omit<Tenant, 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    // Verificar que el email no esté en uso
    const existingEmail = await this.tenantRepository.findByEmail(tenantData.contactInfo.email);
    if (existingEmail) {
      throw new ConflictError(`Ya existe un inquilino con el email: ${tenantData.contactInfo.email}`);
    }

    // Verificar que el número de identificación no esté en uso
    const existingId = await this.tenantRepository.findByIdNumber(tenantData.documents.idNumber);
    if (existingId) {
      throw new ConflictError(`Ya existe un inquilino con el número de identificación: ${tenantData.documents.idNumber}`);
    }

    // Crear el inquilino
    return await this.tenantRepository.create(tenantData);
  }
}