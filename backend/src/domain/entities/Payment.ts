export type PaymentStatus = 'pending' | 'paid' | 'overdue';

export interface Payment {
  _id?: string;
  tenantId: string;
  departmentId: string;
  amount: number;
  dueDate: Date;
  paymentDate?: Date;
  status: PaymentStatus;
  month: number;
  year: number;
  reference?: string; // e.g. transaction number or notes
  createdAt?: Date;
  updatedAt?: Date;
}
