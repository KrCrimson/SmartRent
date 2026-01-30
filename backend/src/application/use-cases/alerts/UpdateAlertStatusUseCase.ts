import { ObjectId } from 'mongodb';
import { Alert, AlertStatus } from '@domain/entities/Alert';
import { IAlertRepository } from '@domain/repositories/IAlertRepository';

export interface UpdateAlertStatusDTO {
  alertId: string;
  newStatus: AlertStatus;
  userId: string;
  userRole: string;
  notes?: string;
}

export interface UpdateAlertStatusResponse {
  success: boolean;
  alert?: Alert;
  error?: string;
}

/**
 * Use Case: Actualizar el estado de una alerta
 */
export class UpdateAlertStatusUseCase {
  constructor(private alertRepository: IAlertRepository) {}

  async execute(dto: UpdateAlertStatusDTO): Promise<UpdateAlertStatusResponse> {
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
      const hasPermission = this.checkPermissions(dto.userRole);
      if (!hasPermission) {
        return {
          success: false,
          error: 'No tienes permisos para actualizar el estado de alertas'
        };
      }

      // Verificar si la transición es válida
      const canTransition = alert.canTransitionTo(dto.newStatus);
      if (!canTransition) {
        return {
          success: false,
          error: `No es posible cambiar el estado de ${alert.status} a ${dto.newStatus}. Transiciones válidas: ${alert.getValidTransitions().join(', ')}`
        };
      }

      // Realizar la transición
      alert.transitionTo(dto.newStatus);

      // Agregar nota si se proporciona
      if (dto.notes) {
        alert.addNote(dto.notes, new ObjectId(dto.userId));
      }

      // Asignar automáticamente si es necesario
      if (dto.newStatus === AlertStatus.EN_PROGRESO && !alert.assignedTo) {
        alert.assignTo(new ObjectId(dto.userId));
      }

      // Guardar cambios
      const updatedAlert = await this.alertRepository.update(alert);

      return {
        success: true,
        alert: updatedAlert
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar el estado de la alerta'
      };
    }
  }

  private checkPermissions(userRole: string): boolean {
    // Solo admins pueden cambiar estados
    return userRole === 'admin';
  }
}