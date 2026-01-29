import { ITenantRepository } from '../../../domain/repositories/ITenantRepository';
import { Tenant } from '../../../domain/entities/Tenant';
import { NotFoundError } from '../../../shared/errors/NotFoundError';

export class GetTenantByIdUseCase {
  constructor(private tenantRepository: ITenantRepository) {}

  async execute(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id);
    
    if (!tenant) {
      throw new NotFoundError('Inquilino no encontrado');
    }

    return tenant;
  }
}