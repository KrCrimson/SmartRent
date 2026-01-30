import { ObjectId } from 'mongodb';
import { Alert, AlertCategory, AlertPriority } from '@domain/entities/Alert';
import { IAlertRepository } from '@domain/repositories/IAlertRepository';
import { IDepartmentRepository } from '@domain/repositories/IDepartmentRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';

export interface CreateAlertDTO {
  title: string;
  description: string;
  category: AlertCategory;
  priority: AlertPriority;
  reporterId: string;
  departmentId: string;
  images?: string[];
}

export interface CreateAlertResponse {
  success: boolean;
  alert?: Alert;
  error?: string;
}

/**
 * Use Case: Crear una nueva alerta
 */
export class CreateAlertUseCase {
  constructor(
    private alertRepository: IAlertRepository,
    private departmentRepository: IDepartmentRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(dto: CreateAlertDTO): Promise<CreateAlertResponse> {
    try {
      // Validaciones
      const validation = await this.validateInput(dto);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Crear entidad Alert
      const alert = new Alert({
        title: dto.title,
        description: dto.description,
        category: dto.category,
        priority: dto.priority,
        reporterId: new ObjectId(dto.reporterId),
        departmentId: new ObjectId(dto.departmentId),
        images: dto.images || []
      });

      // Persistir en base de datos
      const savedAlert = await this.alertRepository.create(alert);

      return {
        success: true,
        alert: savedAlert
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      };
    }
  }

  private async validateInput(dto: CreateAlertDTO): Promise<{ isValid: boolean; error?: string }> {
    // Validar que el usuario existe
    const user = await this.userRepository.findById(dto.reporterId.toString());
    if (!user) {
      return { isValid: false, error: 'Usuario no encontrado' };
    }

    // Validar que el departamento existe
    const department = await this.departmentRepository.findById(dto.departmentId.toString());
    if (!department) {
      return { isValid: false, error: 'Departamento no encontrado' };
    }

    // Validar que el usuario tiene acceso al departamento (solo para usuarios normales)
    if (user.role === 'user') {
      // Esta validación se puede agregar más adelante cuando tengamos la relación user-department
      // if (user.departmentId?.toString() !== dto.departmentId) {
      //   return { isValid: false, error: 'No tienes acceso a este departamento' };
      // }
    }

    // Validar imágenes
    if (dto.images && dto.images.length > 3) {
      return { isValid: false, error: 'No se pueden subir más de 3 imágenes' };
    }

    // Validar imágenes
    if (dto.images && dto.images.length > 3) {
      return { isValid: false, error: 'No se pueden subir más de 3 imágenes' };
    }

    return { isValid: true };
  }
}