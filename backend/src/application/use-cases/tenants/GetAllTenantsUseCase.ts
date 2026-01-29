import { ITenantRepository, TenantFilters } from '../../../domain/repositories/ITenantRepository';
import { Tenant } from '../../../domain/entities/Tenant';

export class GetAllTenantsUseCase {
  constructor(private tenantRepository: ITenantRepository) {}

  async execute(filters?: TenantFilters): Promise<{ tenants: Tenant[]; total: number }> {
    const [tenants, total] = await Promise.all([
      this.tenantRepository.findAll(filters),
      this.tenantRepository.count(filters)
    ]);

    return { tenants, total };
  }
}