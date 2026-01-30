import { ContractAlert } from '@domain/entities/ContractAlert';
import { ContractAlertRepository } from '@domain/repositories/ContractAlertRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { inject, injectable } from 'tsyringe';

export interface GetUserAlertsRequest {
  userId: string;
  includeRead?: boolean;
  limit?: number;
}

export interface GetUserAlertsResponse {
  alerts: ContractAlert[];
  unreadCount: number;
  criticalCount: number;
  hasExpiredContract: boolean;
}

@injectable()
export class GetUserAlertsUseCase {
  constructor(
    @inject('ContractAlertRepository') private contractAlertRepository: ContractAlertRepository,
    @inject('IUserRepository') private userRepository: IUserRepository
  ) {}

  async execute(request: GetUserAlertsRequest): Promise<GetUserAlertsResponse> {
    const { userId, includeRead = false } = request;

    // Verificar que el usuario existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener alertas del usuario
    const alerts = await this.contractAlertRepository.findByUserId(userId, includeRead);

    // Calcular estadísticas
    const unreadCount = alerts.filter(alert => !alert.isRead && alert.isActive).length;
    const criticalCount = alerts.filter(alert => 
      alert.severity === 'critical' && !alert.isRead && alert.isActive
    ).length;
    const hasExpiredContract = alerts.some(alert => 
      alert.type === 'contract_expired' && alert.isActive
    );

    // Ordenar alertas por severidad y fecha
    const sortedAlerts = this.sortAlertsByPriority(alerts);

    return {
      alerts: sortedAlerts,
      unreadCount,
      criticalCount,
      hasExpiredContract
    };
  }

  private sortAlertsByPriority(alerts: ContractAlert[]): ContractAlert[] {
    const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    
    return alerts.sort((a, b) => {
      // Primero por severidad
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      
      // Luego por fecha de creación (más recientes primero)
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }
}