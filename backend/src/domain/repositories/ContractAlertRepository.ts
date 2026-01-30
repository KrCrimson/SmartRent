import { ContractAlert } from '@domain/entities/ContractAlert';

export interface ContractAlertRepository {
  create(alert: ContractAlert): Promise<ContractAlert>;
  findById(id: string): Promise<ContractAlert | null>;
  findByUserId(userId: string, includeRead?: boolean): Promise<ContractAlert[]>;
  findActiveAlerts(): Promise<ContractAlert[]>;
  findExpiringContracts(daysThreshold: number): Promise<ContractAlert[]>;
  update(id: string, alert: Partial<ContractAlert>): Promise<ContractAlert | null>;
  markAsRead(id: string): Promise<void>;
  markAsInactive(id: string): Promise<void>;
  deleteOldAlerts(daysOld: number): Promise<void>;
}