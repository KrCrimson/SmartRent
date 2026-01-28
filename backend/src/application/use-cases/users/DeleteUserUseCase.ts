import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ConflictError } from '../../../shared/errors/ConflictError';
import { ValidationError } from '../../../shared/errors/ValidationError';

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    // Validar ID de usuario
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new ValidationError('ID de usuario requerido y debe ser una cadena válida');
    }

    // Buscar el usuario existente
    const existingUser = await this.userRepository.findById(userId.trim());
    if (!existingUser) {
      throw new NotFoundError(`No se encontró el usuario con ID: ${userId}`);
    }

    // Validaciones de negocio antes del borrado
    
    // 1. No permitir eliminar usuarios con departamentos asignados
    if (existingUser.assignedDepartmentId) {
      throw new ConflictError('No se puede eliminar un usuario que tiene un departamento asignado. Primero desasigne el departamento.');
    }

    // 2. No permitir eliminar usuarios con contratos activos
    if (existingUser.hasActiveContract()) {
      throw new ConflictError('No se puede eliminar un usuario con un contrato activo.');
    }

    // 3. Validar que no sea el único administrador del sistema
    if (existingUser.role === 'admin') {
      const allUsers = await this.userRepository.findAll({ role: 'admin', isActive: true });
      const activeAdmins = allUsers.filter(user => user.isActive && user.id !== userId);
      
      if (activeAdmins.length === 0) {
        throw new ConflictError('No se puede eliminar el único administrador activo del sistema.');
      }
    }

    // Realizar soft delete (desactivar usuario en lugar de eliminar completamente)
    existingUser.deactivate();
    await this.userRepository.update(existingUser);

    // Alternativa: hard delete si se requiere
    // await this.userRepository.delete(userId);
  }
}