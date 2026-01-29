import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ConflictError } from '../../../shared/errors/ConflictError';
import { ValidationError } from '../../../shared/errors/ValidationError';
import { User } from '../../../domain/entities/User.entity';

export interface AssignDepartmentRequest {
  userId: string;
  departmentId: string;
  contractStartDate: Date;
  contractEndDate: Date;
}

/**
 * Use Case: Asignar un departamento a un usuario (inquilino)
 * 
 * Reglas de negocio:
 * - El usuario debe existir y estar activo
 * - El usuario debe tener rol 'user' (no admin)
 * - El usuario NO debe tener un departamento asignado actualmente
 * - El departamento debe estar disponible (validación futura cuando tengamos Department entity)
 * - Las fechas del contrato deben ser válidas
 * - La fecha de fin debe ser posterior a la fecha de inicio
 */
export class AssignDepartmentUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: AssignDepartmentRequest): Promise<User> {
    // 1. Validar datos de entrada
    if (!request.userId || typeof request.userId !== 'string') {
      throw new ValidationError('ID de usuario requerido');
    }

    if (!request.departmentId || typeof request.departmentId !== 'string') {
      throw new ValidationError('ID de departamento requerido');
    }

    if (!request.contractStartDate || !(request.contractStartDate instanceof Date)) {
      throw new ValidationError('Fecha de inicio de contrato requerida');
    }

    if (!request.contractEndDate || !(request.contractEndDate instanceof Date)) {
      throw new ValidationError('Fecha de fin de contrato requerida');
    }

    // 2. Validar fechas del contrato
    if (request.contractEndDate <= request.contractStartDate) {
      throw new ValidationError('La fecha de fin del contrato debe ser posterior a la fecha de inicio');
    }

    // Validar que la fecha de inicio no sea en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(request.contractStartDate);
    startDate.setHours(0, 0, 0, 0);

    if (startDate < today) {
      throw new ValidationError('La fecha de inicio del contrato no puede ser en el pasado');
    }

    // Validar duración mínima del contrato (ej: 1 mes)
    const oneMonthLater = new Date(request.contractStartDate);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    
    if (request.contractEndDate < oneMonthLater) {
      throw new ValidationError('El contrato debe tener una duración mínima de 1 mes');
    }

    // 3. Buscar el usuario
    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      throw new NotFoundError(`No se encontró el usuario con ID: ${request.userId}`);
    }

    // 4. Validar estado del usuario
    if (!user.isActive) {
      throw new ConflictError('No se puede asignar un departamento a un usuario inactivo');
    }

    // 5. Validar rol del usuario
    if (user.role !== 'user') {
      throw new ConflictError('Solo los usuarios con rol "user" pueden tener departamentos asignados');
    }

    // 6. Validar que el usuario no tenga un departamento asignado
    if (user.assignedDepartmentId) {
      throw new ConflictError(
        `El usuario ya tiene un departamento asignado (${user.assignedDepartmentId}). ` +
        'Primero debe desasignar el departamento actual.'
      );
    }

    // 7. TODO: Validar que el departamento exista y esté disponible
    // Cuando tengamos el DepartmentRepository implementado:
    // const department = await departmentRepository.findById(request.departmentId);
    // if (!department) throw new NotFoundError('Departamento no encontrado');
    // if (!department.isAvailable) throw new ConflictError('Departamento no disponible');

    // 8. Asignar el departamento usando el método de la entidad
    try {
      user.assignDepartment(
        request.departmentId,
        request.contractStartDate,
        request.contractEndDate
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ConflictError(error.message);
      }
      throw new ConflictError('Error al asignar departamento');
    }

    // 9. Guardar los cambios
    const updatedUser = await this.userRepository.update(user);

    // 10. TODO: Actualizar el estado del departamento a 'occupied'
    // await departmentRepository.updateStatus(request.departmentId, 'occupied');

    return updatedUser;
  }
}