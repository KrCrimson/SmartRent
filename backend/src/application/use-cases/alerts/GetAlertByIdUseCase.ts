import { ObjectId } from 'mongodb';
import { Alert } from '@domain/entities/Alert';
import { IAlertRepository } from '@domain/repositories/IAlertRepository';

export interface GetAlertByIdDTO {
  alertId: string;
  userId: string;
  userRole: string;
  departmentId?: string;
}

export interface GetAlertByIdResponse {
  success: boolean;
  alert?: Alert;
  error?: string;
}

/**
 * Use Case: Obtener una alerta específica por ID
 */
export class GetAlertByIdUseCase {
  constructor(private alertRepository: IAlertRepository) {}

  async execute(dto: GetAlertByIdDTO): Promise<GetAlertByIdResponse> {
    try {
      // Buscar la alerta
      const alert = await this.alertRepository.findById(dto.alertId);

      if (!alert) {
        return {
          success: false,
          error: 'Alerta no encontrada'
        };
      }

      // Verificar permisos
      const hasAccess = this.checkUserPermissions(alert, dto);
      if (!hasAccess) {
        return {
          success: false,
          error: 'No tienes permisos para ver esta alerta'
        };
      }

      return {
        success: true,
        alert
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener la alerta'
      };
    }
  }

  private checkUserPermissions(alert: Alert, dto: GetAlertByIdDTO): boolean {
    // Admins pueden ver todas las alertas
    if (dto.userRole === 'admin') {
      return true;
    }

    // Usuarios solo pueden ver sus propias alertas
    if (dto.userRole === 'user') {
      return alert.reporterId.toString() === dto.userId;
    }

    return false;
  }
}