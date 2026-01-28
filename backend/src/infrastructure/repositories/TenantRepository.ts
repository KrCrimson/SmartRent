import { ITenantRepository, TenantFilters } from '../../domain/repositories/ITenantRepository';
import type { Tenant } from '../../domain/entities/Tenant';
import TenantSchema from '../database/schemas/TenantSchema';

export class TenantRepository implements ITenantRepository {
  
  /**
   * Helper para transformar el resultado de toObject() y que sea compatible con la interface Tenant
   */
  private transformTenant(tenantDoc: any): Tenant {
    const tenantObj = tenantDoc.toObject();
    if (tenantObj.contactInfo.emergencyContact === null) {
      tenantObj.contactInfo.emergencyContact = undefined;
    }
    return tenantObj as Tenant;
  }
  
  async create(tenantData: Omit<Tenant, 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    try {
      const tenant = new TenantSchema(tenantData);
      const savedTenant = await tenant.save();
      console.log(`Tenant created successfully: ${savedTenant._id}`);
      
      // Transform to match interface (null -> undefined for emergencyContact)
      return this.transformTenant(savedTenant);
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  async findAll(filters?: TenantFilters): Promise<Tenant[]> {
    try {
      let query = TenantSchema.find({ isActive: true });

      if (filters) {
        if (filters.status) {
          query = query.where('status').equals(filters.status);
        }
        
        if (filters.departmentId) {
          query = query.where('currentDepartment').equals(filters.departmentId);
        }
        
        if (filters.hasActiveLease !== undefined) {
          const now = new Date().getTime();
          if (filters.hasActiveLease) {
            query = query.where('leaseStartDate').lte(now).where('leaseEndDate').gte(now);
          } else {
            query = query.or([
              { leaseStartDate: { $exists: false } },
              { leaseEndDate: { $exists: false } },
              { leaseStartDate: { $gt: now } },
              { leaseEndDate: { $lt: now } }
            ]);
          }
        }
        
        if (filters.minIncome !== undefined) {
          query = query.where('personalInfo.monthlyIncome').gte(filters.minIncome);
        }
        
        if (filters.maxIncome !== undefined) {
          query = query.where('personalInfo.monthlyIncome').lte(filters.maxIncome);
        }
        
        if (filters.nationality) {
          query = query.where('personalInfo.nationality').regex(new RegExp(filters.nationality, 'i'));
        }
        
        if (filters.search) {
          const searchRegex = new RegExp(filters.search, 'i');
          query = query.or([
            { 'personalInfo.firstName': searchRegex },
            { 'personalInfo.lastName': searchRegex },
            { 'contactInfo.email': searchRegex },
            { 'contactInfo.phone': searchRegex },
            { 'documents.idNumber': searchRegex }
          ]);
        }
      }

      const tenants = await query
        .populate('currentDepartment', 'code name')
        .sort({ 'personalInfo.lastName': 1, 'personalInfo.firstName': 1 })
        .exec();

      return tenants.map(tenant => this.transformTenant(tenant));
    } catch (error) {
      console.error('Error finding tenants:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Tenant | null> {
    try {
      const tenant = await TenantSchema
        .findOne({ _id: id, isActive: true })
        .populate('currentDepartment', 'code name address')
        .exec();
      
      if (!tenant) return null;
      
      return this.transformTenant(tenant);
    } catch (error) {
      console.error('Error finding tenant by ID:', error);
      throw error;
    }
  }

  async findByIdNumber(idNumber: string): Promise<Tenant | null> {
    try {
      const tenant = await TenantSchema
        .findOne({ 
          'documents.idNumber': idNumber, 
          isActive: true 
        })
        .populate('currentDepartment', 'code name')
        .exec();
      
      return tenant ? this.transformTenant(tenant) : null;
    } catch (error) {
      console.error('Error finding tenant by ID number:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Tenant | null> {
    try {
      const tenant = await TenantSchema
        .findOne({ 
          'contactInfo.email': email.toLowerCase(), 
          isActive: true 
        })
        .populate('currentDepartment', 'code name')
        .exec();
      
      return tenant ? this.transformTenant(tenant) : null;
    } catch (error) {
      console.error('Error finding tenant by email:', error);
      throw error;
    }
  }

  async findByDepartment(departmentId: string): Promise<Tenant[]> {
    try {
      const tenants = await TenantSchema
        .find({ 
          currentDepartment: departmentId, 
          isActive: true 
        })
        .sort({ 'personalInfo.lastName': 1 })
        .exec();

      return tenants.map(tenant => this.transformTenant(tenant));
    } catch (error) {
      console.error('Error finding tenants by department:', error);
      throw error;
    }
  }

  async findWithActiveLease(): Promise<Tenant[]> {
    try {
      const now = new Date().getTime();
      const tenants = await TenantSchema
        .find({
          isActive: true,
          status: 'active',
          leaseStartDate: { $lte: now },
          leaseEndDate: { $gte: now }
        })
        .populate('currentDepartment', 'code name')
        .sort({ leaseEndDate: 1 })
        .exec();

      return tenants.map(tenant => this.transformTenant(tenant));
    } catch (error) {
      console.error('Error finding tenants with active lease:', error);
      throw error;
    }
  }

  async findWithExpiringLease(daysAhead: number): Promise<Tenant[]> {
    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
      
      const tenants = await TenantSchema
        .find({
          isActive: true,
          status: 'active',
          leaseEndDate: {
            $gte: now.getTime(),
            $lte: futureDate.getTime()
          }
        })
        .populate('currentDepartment', 'code name address')
        .sort({ leaseEndDate: 1 })
        .exec();

      return tenants.map(tenant => this.transformTenant(tenant));
    } catch (error) {
      console.error('Error finding tenants with expiring lease:', error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<Tenant>): Promise<Tenant | null> {
    try {
      const tenant = await TenantSchema
        .findOneAndUpdate(
          { _id: id, isActive: true },
          { ...updates, updatedAt: new Date() },
          { new: true, runValidators: true }
        )
        .populate('currentDepartment', 'code name')
        .exec();

      if (tenant) {
        console.log(`Tenant updated successfully: ${tenant._id}`);
        return this.transformTenant(tenant);
      }
      
      return null;
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  }

  async assignToDepartment(
    tenantId: string, 
    departmentId: string, 
    leaseInfo: {
      leaseStartDate: string;
      leaseEndDate: string;
      monthlyRent: number;
      securityDeposit: number;
    }
  ): Promise<Tenant | null> {
    try {
      const tenant = await TenantSchema
        .findOneAndUpdate(
          { _id: tenantId, isActive: true },
          {
            currentDepartment: departmentId,
            status: 'active',
            ...leaseInfo,
            updatedAt: new Date()
          },
          { new: true, runValidators: true }
        )
        .populate('currentDepartment', 'code name address')
        .exec();

      if (tenant) {
        console.log(`Tenant assigned to department: ${tenantId} -> ${departmentId}`);
        return this.transformTenant(tenant);
      }
      
      return null;
    } catch (error) {
      console.error('Error assigning tenant to department:', error);
      throw error;
    }
  }

  async removeFromDepartment(tenantId: string): Promise<Tenant | null> {
    try {
      const tenant = await TenantSchema
        .findOneAndUpdate(
          { _id: tenantId, isActive: true },
          {
            $unset: {
              currentDepartment: 1,
              leaseStartDate: 1,
              leaseEndDate: 1,
              monthlyRent: 1,
              securityDeposit: 1
            },
            status: 'inactive',
            updatedAt: new Date()
          },
          { new: true, runValidators: true }
        )
        .exec();

      if (tenant) {
        console.log(`Tenant removed from department: ${tenantId}`);
        return this.transformTenant(tenant);
      }
      
      return null;
    } catch (error) {
      console.error('Error removing tenant from department:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await TenantSchema
        .findOneAndUpdate(
          { _id: id, isActive: true },
          { 
            isActive: false, 
            status: 'terminated',
            updatedAt: new Date() 
          }
        )
        .exec();

      if (result) {
        console.log(`Tenant soft deleted: ${id}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting tenant:', error);
      throw error;
    }
  }

  async count(filters?: TenantFilters): Promise<number> {
    try {
      let query = TenantSchema.find({ isActive: true });

      if (filters) {
        // Apply same filters as in findAll
        if (filters.status) {
          query = query.where('status').equals(filters.status);
        }
        if (filters.departmentId) {
          query = query.where('currentDepartment').equals(filters.departmentId);
        }
        // Add other filters as needed
      }

      return await query.countDocuments();
    } catch (error) {
      console.error('Error counting tenants:', error);
      throw error;
    }
  }
}