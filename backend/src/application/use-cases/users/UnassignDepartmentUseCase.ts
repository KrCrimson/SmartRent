import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ConflictError } from '../../../shared/errors/ConflictError';
import { ValidationError } from '../../../shared/errors/ValidationError';
import { User } from '../../../domain/entities/User.entity';

/**
 * Use Case: Desasignar un departamento de un usuario (inquilino)
 * 
 * Reglas de negocio:
 * - El usuario debe existir
 * - El usuario debe tener un departamento asignado actualmente
 * - No se puede desasignar si hay alertas activas (validación futura)
 * - El departamento debe liberarse (estado a 'available')
 */
export class UnassignDepartmentUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User> {
    // 1. Validar datos de entrada
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new ValidationError('ID de usuario requerido');
    }

    // 2. Buscar el usuario
    const user = await this.userRepository.findById(userId.trim());

    if (!user) {
      throw new NotFoundError(`No se encontró el usuario con ID: ${userId}`);
    }

    // 3. Validar que el usuario tenga un departamento asignado
    if (!user.assignedDepartmentId) {
      throw new ConflictError('El usuario no tiene ningún departamento asignado');
    }

    // 4. Guardar el departmentId antes de desasignar (para liberar el departamento después)
    const departmentId = user.assignedDepartmentId;

    // 5. TODO: Validar que no haya alertas activas
    // Cuando tengamos el AlertRepository implementado:
    // const activeAlerts = await alertRepository.findByUserAndStatus(userId, 'pending');
    // if (activeAlerts.length > 0) {
    //   throw new ConflictError('No se puede desasignar el departamento mientras haya alertas activas pendientes');
    // }

    // 6. Validar si el contrato está activo
    if (user.hasActiveContract()) {
      // Opcional: Podemos permitir desasignar pero con advertencia
      // o podemos requerir que el contrato esté vencido
      // Por ahora, permitiremos desasignar incluso con contrato activo
      console.warn(`Desasignando departamento con contrato activo para usuario ${userId}`);
    }

    // 7. Desasignar el departamento usando el método de la entidad
    try {
      user.unassignDepartment();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ConflictError(error.message);
      }
      throw new ConflictError('Error al desasignar departamento');
    }

    // 8. Guardar los cambios
    const updatedUser = await this.userRepository.update(user);

    // 9. TODO: Actualizar el estado del departamento a 'available'
    // await departmentRepository.updateStatus(departmentId, 'available');

    return updatedUser;
  }
}