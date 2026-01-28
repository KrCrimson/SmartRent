import { User } from '../../../domain/entities/User.entity';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ConflictError } from '../../../shared/errors/ConflictError';
import { ValidationError } from '../../../shared/errors/ValidationError';

export interface UpdateUserRequest {
  fullName?: string;
  phone?: string;
  email?: string;
  role?: 'admin' | 'user';
  assignedDepartmentId?: string;
  contractStartDate?: Date;
  contractEndDate?: Date;
  isActive?: boolean;
}

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, updateData: UpdateUserRequest): Promise<User> {
    // Validar ID de usuario
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new ValidationError('ID de usuario requerido y debe ser una cadena válida');
    }

    // Buscar el usuario existente
    const existingUser = await this.userRepository.findById(userId.trim());
    if (!existingUser) {
      throw new NotFoundError(`No se encontró el usuario con ID: ${userId}`);
    }

    // Validar datos de actualización
    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('Se requiere al menos un campo para actualizar');
    }

    // Validaciones de campos específicos
    if (updateData.fullName !== undefined && updateData.fullName.trim().length < 3) {
      throw new ValidationError('El nombre debe tener al menos 3 caracteres');
    }

    if (updateData.phone !== undefined && updateData.phone.trim().length < 8) {
      throw new ValidationError('El teléfono debe tener al menos 8 caracteres');
    }

    if (updateData.role !== undefined && updateData.role !== 'admin' && updateData.role !== 'user') {
      throw new ValidationError('El rol debe ser admin o user');
    }

    // Verificar unicidad de email si se va a cambiar
    if (updateData.email && updateData.email !== existingUser.email.getValue()) {
      const emailExists = await this.userRepository.existsByEmail(updateData.email);
      if (emailExists) {
        throw new ConflictError(`Ya existe un usuario con el email: ${updateData.email}`);
      }
    }

    // Validar fechas de contrato
    if (updateData.contractStartDate && updateData.contractEndDate) {
      if (updateData.contractEndDate <= updateData.contractStartDate) {
        throw new ValidationError('La fecha de fin del contrato debe ser posterior a la fecha de inicio');
      }
    }

    // Actualizar información del usuario usando los métodos de la entidad
    if (updateData.fullName !== undefined || updateData.phone !== undefined) {
      existingUser.updateInfo({
        fullName: updateData.fullName,
        phone: updateData.phone
      });
    }

    // Manejar asignación de departamento
    if (updateData.assignedDepartmentId !== undefined) {
      if (updateData.assignedDepartmentId && updateData.contractStartDate && updateData.contractEndDate) {
        // Asignar departamento
        existingUser.assignDepartment(
          updateData.assignedDepartmentId,
          updateData.contractStartDate,
          updateData.contractEndDate
        );
      } else if (!updateData.assignedDepartmentId) {
        // Desasignar departamento
        existingUser.unassignDepartment();
      }
    }

    // Manejar cambios de estado activo
    if (updateData.isActive !== undefined) {
      if (updateData.isActive) {
        existingUser.activate();
      } else {
        existingUser.deactivate();
      }
    }

    // Guardar cambios
    const updatedUser = await this.userRepository.update(existingUser);

    return updatedUser;
  }
}