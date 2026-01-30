import { ContractAlertRepository } from '@domain/repositories/ContractAlertRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { inject, injectable } from 'tsyringe';

export interface MarkAlertAsReadRequest {
  alertId: string;
  userId: string;
}

@injectable()
export class MarkAlertAsReadUseCase {
  constructor(
    @inject('ContractAlertRepository') private contractAlertRepository: ContractAlertRepository,
    @inject('IUserRepository') private userRepository: IUserRepository
  ) {}

  async execute(request: MarkAlertAsReadRequest): Promise<void> {
    const { alertId, userId } = request;

    // Verificar que el usuario existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar que la alerta existe y pertenece al usuario
    const alert = await this.contractAlertRepository.findById(alertId);
    if (!alert) {
      throw new Error('Alerta no encontrada');
    }

    if (alert.userId !== userId) {
      throw new Error('No tienes permisos para marcar esta alerta');
    }

    // Marcar como leída
    await this.contractAlertRepository.markAsRead(alertId);
  }
}

export interface MarkAllAlertsAsReadRequest {
  userId: string;
}

@injectable()
export class MarkAllAlertsAsReadUseCase {
  constructor(
    @inject('ContractAlertRepository') private contractAlertRepository: ContractAlertRepository,
    @inject('IUserRepository') private userRepository: IUserRepository
  ) {}

  async execute(request: MarkAllAlertsAsReadRequest): Promise<{ markedCount: number }> {
    const { userId } = request;

    // Verificar que el usuario existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener todas las alertas no leídas del usuario
    const unreadAlerts = await this.contractAlertRepository.findByUserId(userId, false);
    
    // Marcar cada una como leída
    const promises = unreadAlerts.map(alert => 
      this.contractAlertRepository.markAsRead(alert._id!)
    );
    
    await Promise.all(promises);

    return { markedCount: unreadAlerts.length };
  }
}