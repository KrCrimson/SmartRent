import { Alert } from '../entities/Alert';

export interface AlertFilters {
  userId?: string;
  isRead?: boolean;
}

export interface IAlertRepository {
  create(alert: Omit<Alert, '_id' | 'createdAt' | 'updatedAt'>): Promise<Alert>;
  findById(id: string): Promise<Alert | null>;
  findAll(filters?: AlertFilters): Promise<Alert[]>;
  update(id: string, data: Partial<Alert>): Promise<Alert | null>;
  delete(id: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<boolean>;
}
