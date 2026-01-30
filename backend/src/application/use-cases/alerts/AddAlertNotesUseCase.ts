import { ObjectId } from 'mongodb';
import { Alert } from '@domain/entities/Alert';
import { IAlertRepository } from '@domain/repositories/IAlertRepository';

export interface AddAlertNotesDTO {
  alertId: string;
  note: string;
  authorId: string;
  userRole: string;
}

export interface AddAlertNotesResponse {
  success: boolean;
  alert?: Alert;
  error?: string;
}

/**
 * Use Case: Agregar notas a una alerta
 */
export class AddAlertNotesUseCase {
  constructor(private alertRepository: IAlertRepository) {}

  async execute(dto: AddAlertNotesDTO): Promise<AddAlertNotesResponse> {
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
      const hasPermission = this.checkPermissions(dto.userRole, alert, dto.authorId);
      if (!hasPermission) {
        return {
          success: false,
          error: 'No tienes permisos para agregar notas a esta alerta'
        };
      }

      // Validar la nota
      if (!dto.note || dto.note.trim().length === 0) {
        return {
          success: false,
          error: 'La nota no puede estar vacía'
        };
      }

      if (dto.note.length > 500) {
        return {
          success: false,
          error: 'La nota no puede exceder 500 caracteres'
        };
      }

      // Agregar la nota
      alert.addNote(dto.note, new ObjectId(dto.authorId));

      // Guardar cambios
      const updatedAlert = await this.alertRepository.update(alert);

      return {
        success: true,
        alert: updatedAlert
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al agregar nota a la alerta'
      };
    }
  }

  private checkPermissions(userRole: string, alert: Alert, authorId: string): boolean {
    // Admins pueden agregar notas a cualquier alerta
    if (userRole === 'admin') {
      return true;
    }

    // Usuarios solo pueden agregar notas a sus propias alertas
    if (userRole === 'user') {
      return alert.reporterId.toString() === authorId;
    }

    return false;
  }
}