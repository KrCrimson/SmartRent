import { ContractAlert, AlertSeverity, AlertType } from '@domain/entities/ContractAlert';
import { ContractAlertRepository } from '@domain/repositories/ContractAlertRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { inject, injectable } from 'tsyringe';

@injectable()
export class GenerateContractAlertsUseCase {
  constructor(
    @inject('ContractAlertRepository') private contractAlertRepository: ContractAlertRepository,
    @inject('IUserRepository') private userRepository: IUserRepository
  ) {}

  async execute(): Promise<{ generated: number; errors: string[] }> {
    const errors: string[] = [];
    let generated = 0;

    try {
      // Obtener todos los usuarios con contratos activos
      const users = await this.userRepository.findUsersWithContracts();
      
      for (const user of users) {
        try {
          await this.generateAlertsForUser(user.id);
          generated++;
        } catch (error: any) {
          errors.push(`Error generando alertas para usuario ${user.id}: ${error.message}`);
        }
      }

      return { generated, errors };
    } catch (error: any) {
      throw new Error(`Error en generación de alertas: ${error.message}`);
    }
  }

  private async generateAlertsForUser(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.assignedDepartmentId || !user.contractEndDate) {
      return;
    }

    const contractEndDate = new Date(user.contractEndDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((contractEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Verificar si ya existe una alerta activa para este usuario
    const existingAlerts = await this.contractAlertRepository.findByUserId(userId, false);
    const hasActiveAlert = existingAlerts.some(alert => alert.isActive && !alert.isRead);

    if (hasActiveAlert && daysUntilExpiry > 7) {
      return; // No generar alertas duplicadas si ya hay una activa y faltan más de 7 días
    }

    // Generar alerta según los días restantes
    let alert: ContractAlert | null = null;

    if (daysUntilExpiry <= 0) {
      alert = this.createExpiredAlert(userId, user.assignedDepartmentId, daysUntilExpiry, contractEndDate);
    } else if (daysUntilExpiry <= 7) {
      alert = this.createCriticalAlert(userId, user.assignedDepartmentId, daysUntilExpiry, contractEndDate);
    } else if (daysUntilExpiry <= 30) {
      alert = this.createHighAlert(userId, user.assignedDepartmentId, daysUntilExpiry, contractEndDate);
    } else if (daysUntilExpiry <= 90) {
      alert = this.createMediumAlert(userId, user.assignedDepartmentId, daysUntilExpiry, contractEndDate);
    }

    if (alert) {
      await this.contractAlertRepository.create(alert);
    }
  }

  private createExpiredAlert(userId: string, departmentId: string, daysUntilExpiry: number, contractEndDate: Date): ContractAlert {
    return {
      userId,
      departmentId,
      type: 'contract_expired' as AlertType,
      title: '⚠️ Contrato Vencido',
      message: `Tu contrato de arrendamiento ha vencido hace ${Math.abs(daysUntilExpiry)} días. Contacta urgentemente con administración.`,
      severity: 'critical' as AlertSeverity,
      daysUntilExpiry,
      contractEndDate,
      isRead: false,
      isActive: true
    };
  }

  private createCriticalAlert(userId: string, departmentId: string, daysUntilExpiry: number, contractEndDate: Date): ContractAlert {
    return {
      userId,
      departmentId,
      type: 'contract_expiring' as AlertType,
      title: '🚨 Contrato por Vencer',
      message: `Tu contrato vence en ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'día' : 'días'}. ¡Acción urgente requerida!`,
      severity: 'critical' as AlertSeverity,
      daysUntilExpiry,
      contractEndDate,
      isRead: false,
      isActive: true
    };
  }

  private createHighAlert(userId: string, departmentId: string, daysUntilExpiry: number, contractEndDate: Date): ContractAlert {
    return {
      userId,
      departmentId,
      type: 'contract_expiring' as AlertType,
      title: '⚠️ Renovación Próxima',
      message: `Tu contrato vence en ${daysUntilExpiry} días. Es momento de considerar la renovación.`,
      severity: 'high' as AlertSeverity,
      daysUntilExpiry,
      contractEndDate,
      isRead: false,
      isActive: true
    };
  }

  private createMediumAlert(userId: string, departmentId: string, daysUntilExpiry: number, contractEndDate: Date): ContractAlert {
    return {
      userId,
      departmentId,
      type: 'renewal_reminder' as AlertType,
      title: '📋 Recordatorio de Renovación',
      message: `Tu contrato vence en ${daysUntilExpiry} días. Puedes comenzar a planificar tu renovación.`,
      severity: 'medium' as AlertSeverity,
      daysUntilExpiry,
      contractEndDate,
      isRead: false,
      isActive: true
    };
  }
}