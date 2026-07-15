import { Payment, PaymentStatus } from '../entities/Payment';

export interface PaymentFilters {
  tenantId?: string;
  departmentId?: string;
  status?: PaymentStatus;
  year?: number;
  month?: number;
}

export interface IPaymentRepository {
  create(payment: Omit<Payment, '_id' | 'createdAt' | 'updatedAt'>): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findAll(filters?: PaymentFilters): Promise<Payment[]>;
  update(id: string, data: Partial<Payment>): Promise<Payment | null>;
  delete(id: string): Promise<boolean>;
}
