import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IDepartmentRepository } from '../../../domain/repositories/IDepartmentRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError';
import { Department } from '../../../domain/entities/Department';

export interface GetMyDepartmentRequest {
  userId: string;
}

export interface MyDepartmentResponse {
  department: Department;
  contractInfo: {
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    daysUntilExpiry: number;
    isExpiringSoon: boolean;
  };
  tenantInfo: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
}

/**
 * Use Case: Obtener el departamento asignado a un inquilino
 * 
 * Reglas de negocio:
 * - Solo inquilinos pueden acceder a esta información
 * - El usuario debe tener un departamento asignado
 * - El contrato debe estar activo o próximo a vencer
 * - Incluir información completa: inventario, contrato, datos del inquilino
 */
export class GetMyDepartmentUseCase {
  constructor(
    private userRepository: IUserRepository,
    private departmentRepository: IDepartmentRepository
  ) {}

  async execute(request: GetMyDepartmentRequest): Promise<MyDepartmentResponse> {
    // 1. Buscar el usuario
    const user = await this.userRepository.findById(request.userId);
    
    if (!user) {
      throw new NotFoundError(`No se encontró el usuario con ID: ${request.userId}`);
    }

    // 2. Verificar que sea inquilino
    if (user.role !== 'user') {
      throw new UnauthorizedError('Solo los inquilinos pueden acceder a esta información');
    }

    // 3. Verificar que tenga departamento asignado
    if (!user.assignedDepartmentId) {
      throw new NotFoundError('El usuario no tiene ningún departamento asignado');
    }

    // 4. Buscar el departamento
    const department = await this.departmentRepository.findById(user.assignedDepartmentId);
    
    if (!department) {
      throw new NotFoundError(`No se encontró el departamento asignado`);
    }

    // 5. Verificar que tenga contrato válido
    if (!user.contractStartDate || !user.contractEndDate) {
      throw new NotFoundError('El usuario no tiene información de contrato válida');
    }

    // 6. Calcular información del contrato
    const now = new Date();
    const isActive = user.hasActiveContract();
    const daysUntilExpiry = Math.ceil((user.contractEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = user.isContractExpiringSoon();

    // 7. Preparar respuesta
    return {
      department,
      contractInfo: {
        startDate: user.contractStartDate,
        endDate: user.contractEndDate,
        isActive,
        daysUntilExpiry,
        isExpiringSoon
      },
      tenantInfo: {
        id: user.id,
        fullName: user.fullName,
        email: user.email.getValue(),
        phone: user.phone
      }
    };
  }
}