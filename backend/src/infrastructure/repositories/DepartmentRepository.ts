import { Department, DepartmentStatus } from '@domain/entities/Department';
import { IDepartmentRepository, DepartmentFilters } from '@domain/repositories/IDepartmentRepository';
import { DepartmentModel } from '@infrastructure/database/schemas/DepartmentSchema';
import { logger } from '@shared/utils/logger';

export class DepartmentRepository implements IDepartmentRepository {
  async create(department: Omit<Department, '_id' | 'createdAt' | 'updatedAt'>): Promise<Department> {
    try {
      const newDepartment = new DepartmentModel(department);
      const saved = await newDepartment.save();
      return this.toEntity(saved);
    } catch (error: any) {
      logger.error('Error al crear departamento', { error: error.message });
      throw error;
    }
  }

  async findAll(filters?: DepartmentFilters): Promise<Department[]> {
    try {
      const query: any = { isActive: true };

      if (filters) {
        if (filters.status) query.status = filters.status;
        if (filters.city) query['address.city'] = new RegExp(filters.city, 'i');
        if (filters.bedrooms) query['features.bedrooms'] = filters.bedrooms;
        if (filters.hasParking !== undefined) query['features.hasParking'] = filters.hasParking;
        if (filters.hasFurniture !== undefined) query['features.hasFurniture'] = filters.hasFurniture;
        
        if (filters.minPrice || filters.maxPrice) {
          query.monthlyPrice = {};
          if (filters.minPrice) query.monthlyPrice.$gte = filters.minPrice;
          if (filters.maxPrice) query.monthlyPrice.$lte = filters.maxPrice;
        }
      }

      const departments = await DepartmentModel.find(query)
        .populate('currentTenant', 'firstName lastName email phone')
        .sort({ createdAt: -1 });

      return departments.map(dep => this.toEntity(dep));
    } catch (error: any) {
      logger.error('Error al obtener departamentos', { error: error.message });
      throw error;
    }
  }

  async findById(id: string): Promise<Department | null> {
    try {
      const department = await DepartmentModel.findById(id)
        .populate('currentTenant', 'firstName lastName email phone');
      
      return department ? this.toEntity(department) : null;
    } catch (error: any) {
      logger.error('Error al buscar departamento por ID', { id, error: error.message });
      throw error;
    }
  }

  async findByCode(code: string): Promise<Department | null> {
    try {
      const department = await DepartmentModel.findOne({ code: code.toUpperCase() })
        .populate('currentTenant', 'firstName lastName email phone');
      
      return department ? this.toEntity(department) : null;
    } catch (error: any) {
      logger.error('Error al buscar departamento por código', { code, error: error.message });
      throw error;
    }
  }

  async findByStatus(status: DepartmentStatus): Promise<Department[]> {
    try {
      const departments = await DepartmentModel.find({ status, isActive: true })
        .populate('currentTenant', 'firstName lastName email phone')
        .sort({ createdAt: -1 });

      return departments.map(dep => this.toEntity(dep));
    } catch (error: any) {
      logger.error('Error al buscar departamentos por estado', { status, error: error.message });
      throw error;
    }
  }

  async findAvailable(): Promise<Department[]> {
    return this.findByStatus('available');
  }

  async update(id: string, data: Partial<Department>): Promise<Department | null> {
    try {
      const updated = await DepartmentModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      ).populate('currentTenant', 'firstName lastName email phone');

      return updated ? this.toEntity(updated) : null;
    } catch (error: any) {
      logger.error('Error al actualizar departamento', { id, error: error.message });
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      // Soft delete - solo marcamos como inactivo
      const result = await DepartmentModel.findByIdAndUpdate(
        id,
        { $set: { isActive: false } },
        { new: true }
      );

      return result !== null;
    } catch (error: any) {
      logger.error('Error al eliminar departamento', { id, error: error.message });
      throw error;
    }
  }

  async assignTenant(departmentId: string, tenantId: string): Promise<Department | null> {
    try {
      const updated = await DepartmentModel.findByIdAndUpdate(
        departmentId,
        { 
          $set: { 
            currentTenant: tenantId,
            status: 'occupied'
          } 
        },
        { new: true, runValidators: true }
      ).populate('currentTenant', 'firstName lastName email phone');

      return updated ? this.toEntity(updated) : null;
    } catch (error: any) {
      logger.error('Error al asignar inquilino', { departmentId, tenantId, error: error.message });
      throw error;
    }
  }

  async removeTenant(departmentId: string): Promise<Department | null> {
    try {
      const updated = await DepartmentModel.findByIdAndUpdate(
        departmentId,
        { 
          $set: { 
            currentTenant: null,
            status: 'available'
          } 
        },
        { new: true, runValidators: true }
      );

      return updated ? this.toEntity(updated) : null;
    } catch (error: any) {
      logger.error('Error al remover inquilino', { departmentId, error: error.message });
      throw error;
    }
  }

  private toEntity(doc: any): Department {
    return {
      _id: doc._id.toString(),
      code: doc.code,
      name: doc.name,
      description: doc.description,
      status: doc.status,
      monthlyPrice: doc.monthlyPrice,
      images: doc.images,
      address: doc.address,
      features: doc.features,
      inventory: doc.inventory,
      currentTenant: doc.currentTenant?._id?.toString() || doc.currentTenant,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
