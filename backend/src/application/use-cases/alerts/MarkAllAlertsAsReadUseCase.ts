import { inject, injectable } from 'tsyringe';
import type { IContractAlertRepository } from '@domain/interfaces/repositories/IContractAlertRepository';

/**
 * Caso de uso para marcar todas las alertas de un usuario como leídas
 */
@injectable()
export class MarkAllAlertsAsReadUseCase {
  constructor(
    @inject('IContractAlertRepository')
    private contractAlertRepository: IContractAlertRepository
  ) {}

  /**
   * Marcar todas las alertas de un usuario como leídas
   * @param userId - ID del usuario
   * @returns Promise con el número de alertas actualizadas
   */
  async execute(userId: string): Promise<{ modifiedCount: number }> {
    const result = await this.contractAlertRepository.markAllAsReadByUserId(userId);
    return { modifiedCount: result };
  }
}