import { injectable } from 'tsyringe';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User.entity';
import { Email } from '@domain/value-objects/Email.vo';
import { Password } from '@domain/value-objects/Password.vo';
import { UserModel, IUserDocument } from '../database/schemas/User.schema';

/**
 * Implementación del Repositorio de Usuarios con Mongoose
 */
@injectable()
export class UserRepository implements IUserRepository {
  /**
   * Convertir documento de MongoDB a Entity del dominio
   */
  private toEntity(doc: IUserDocument): User {
    return User.reconstruct({
      id: (doc as any)._id.toString(),
      email: doc.email,
      password: doc.password,
      role: doc.role,
      fullName: doc.fullName,
      phone: doc.phone,
      assignedDepartmentId: doc.assignedDepartment?.toString(),
      contractStartDate: doc.contractStartDate,
      contractEndDate: doc.contractEndDate,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  /**
   * Convertir Entity del dominio a documento de MongoDB
   */
  private toDocument(user: User): Partial<IUserDocument> {
    return {
      email: user.email.getValue(),
      password: user.getPassword().getValue(),
      role: user.role,
      fullName: user.fullName,
      phone: user.phone,
      assignedDepartment: user.assignedDepartmentId as any,
      contractStartDate: user.contractStartDate,
      contractEndDate: user.contractEndDate,
      isActive: user.isActive
    };
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() });
    return doc ? this.toEntity(doc) : null;
  }

  async save(user: User): Promise<User> {
    const docData = this.toDocument(user);
    const doc = new UserModel(docData);
    await doc.save();
    return this.toEntity(doc);
  }

  async update(user: User): Promise<User> {
    const docData = this.toDocument(user);
    const doc = await UserModel.findByIdAndUpdate(
      user.id,
      docData,
      { new: true, runValidators: true }
    );

    if (!doc) {
      throw new Error('Usuario no encontrado');
    }

    return this.toEntity(doc);
  }

  async delete(id: string): Promise<void> {
    // Soft delete: marcar como inactivo
    await UserModel.findByIdAndUpdate(id, { isActive: false });
  }

  async findAll(filters?: {
    role?: 'admin' | 'user';
    isActive?: boolean;
    hasAssignedDepartment?: boolean;
  }): Promise<User[]> {
    const query: any = {};

    if (filters?.role) {
      query.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters?.hasAssignedDepartment !== undefined) {
      if (filters.hasAssignedDepartment) {
        query.assignedDepartment = { $ne: null };
      } else {
        query.assignedDepartment = null;
      }
    }

    const docs = await UserModel.find(query).sort({ createdAt: -1 });
    return docs.map(doc => this.toEntity(doc));
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await UserModel.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }

  /**
   * Encontrar usuarios que tienen contratos activos
   */
  async findUsersWithContracts(): Promise<User[]> {
    const docs = await UserModel.find({
      assignedDepartment: { $ne: null },
      contractStartDate: { $ne: null },
      contractEndDate: { $ne: null },
      isActive: true
    });

    return docs.map(doc => this.toEntity(doc));
  }
}
