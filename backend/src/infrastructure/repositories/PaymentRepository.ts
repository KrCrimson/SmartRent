import { Payment } from '@domain/entities/Payment';
import { IPaymentRepository, PaymentFilters } from '@domain/repositories/IPaymentRepository';
import { PaymentModel } from '@infrastructure/database/schemas/PaymentSchema';
import { logger } from '@shared/utils/logger';

export class PaymentRepository implements IPaymentRepository {
  async create(payment: Omit<Payment, '_id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    try {
      const newPayment = new PaymentModel(payment);
      const saved = await newPayment.save();
      return this.toEntity(saved);
    } catch (error: any) {
      logger.error('Error al crear pago', { error: error.message });
      throw error;
    }
  }

  async findById(id: string): Promise<Payment | null> {
    try {
      const payment = await PaymentModel.findById(id)
        .populate('tenantId', 'firstName lastName email')
        .populate('departmentId', 'code name monthlyPrice');
      return payment ? this.toEntity(payment) : null;
    } catch (error: any) {
      logger.error('Error al buscar pago por ID', { id, error: error.message });
      throw error;
    }
  }

  async findAll(filters?: PaymentFilters): Promise<Payment[]> {
    try {
      const query: any = {};
      if (filters) {
        if (filters.tenantId) query.tenantId = filters.tenantId;
        if (filters.departmentId) query.departmentId = filters.departmentId;
        if (filters.status) query.status = filters.status;
        if (filters.year) query.year = filters.year;
        if (filters.month) query.month = filters.month;
      }

      const payments = await PaymentModel.find(query)
        .populate('tenantId', 'firstName lastName email')
        .populate('departmentId', 'code name monthlyPrice')
        .sort({ year: -1, month: -1, createdAt: -1 });

      return payments.map(p => this.toEntity(p));
    } catch (error: any) {
      logger.error('Error al buscar pagos', { error: error.message });
      throw error;
    }
  }

  async update(id: string, data: Partial<Payment>): Promise<Payment | null> {
    try {
      const updated = await PaymentModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      )
        .populate('tenantId', 'firstName lastName email')
        .populate('departmentId', 'code name monthlyPrice');

      return updated ? this.toEntity(updated) : null;
    } catch (error: any) {
      logger.error('Error al actualizar pago', { id, error: error.message });
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await PaymentModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error: any) {
      logger.error('Error al eliminar pago', { id, error: error.message });
      throw error;
    }
  }

  private toEntity(doc: any): Payment {
    return {
      _id: doc._id.toString(),
      tenantId: doc.tenantId?._id ? doc.tenantId._id.toString() : doc.tenantId.toString(),
      departmentId: doc.departmentId?._id ? doc.departmentId._id.toString() : doc.departmentId.toString(),
      amount: doc.amount,
      dueDate: doc.dueDate,
      paymentDate: doc.paymentDate,
      status: doc.status,
      month: doc.month,
      year: doc.year,
      reference: doc.reference,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      // Optional: attach populated data if needed, but usually DTO handles it
      // we can map it to any or cast
    } as any;
  }
}
