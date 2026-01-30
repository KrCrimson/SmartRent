import mongoose, { Schema } from 'mongoose';
import { ContractAlert } from '@domain/entities/ContractAlert';
import { ContractAlertRepository } from '@domain/repositories/ContractAlertRepository';

const ContractAlertSchema = new Schema<ContractAlert>({
  userId: { type: String, required: true, index: true },
  departmentId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['contract_expiring', 'contract_expired', 'renewal_reminder'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    required: true 
  },
  daysUntilExpiry: { type: Number, required: true },
  contractEndDate: { type: Date, required: true },
  isRead: { type: Boolean, default: false, index: true },
  isActive: { type: Boolean, default: true, index: true },
}, {
  timestamps: true,
});

// Índices compuestos para optimizar consultas
ContractAlertSchema.index({ userId: 1, isActive: 1, isRead: 1 });
ContractAlertSchema.index({ contractEndDate: 1, isActive: 1 });
ContractAlertSchema.index({ type: 1, isActive: 1 });

const ContractAlertModel = mongoose.model<ContractAlert>('ContractAlert', ContractAlertSchema);

export class MongoContractAlertRepository implements ContractAlertRepository {
  async create(alert: ContractAlert): Promise<ContractAlert> {
    const newAlert = new ContractAlertModel(alert);
    await newAlert.save();
    return newAlert.toObject();
  }

  async findById(id: string): Promise<ContractAlert | null> {
    const alert = await ContractAlertModel.findById(id);
    return alert ? alert.toObject() : null;
  }

  async findByUserId(userId: string, includeRead: boolean = false): Promise<ContractAlert[]> {
    const query: any = { userId, isActive: true };
    
    if (!includeRead) {
      query.isRead = false;
    }

    const alerts = await ContractAlertModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50); // Limitar resultados

    return alerts.map(alert => alert.toObject());
  }

  async findActiveAlerts(): Promise<ContractAlert[]> {
    const alerts = await ContractAlertModel
      .find({ isActive: true })
      .sort({ severity: -1, createdAt: -1 });

    return alerts.map(alert => alert.toObject());
  }

  async findExpiringContracts(daysThreshold: number): Promise<ContractAlert[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const alerts = await ContractAlertModel
      .find({
        contractEndDate: { $lte: thresholdDate },
        isActive: true
      })
      .sort({ contractEndDate: 1 });

    return alerts.map(alert => alert.toObject());
  }

  async update(id: string, alert: Partial<ContractAlert>): Promise<ContractAlert | null> {
    const updated = await ContractAlertModel.findByIdAndUpdate(
      id, 
      { ...alert, updatedAt: new Date() }, 
      { new: true }
    );
    return updated ? updated.toObject() : null;
  }

  async markAsRead(id: string): Promise<void> {
    await ContractAlertModel.findByIdAndUpdate(
      id, 
      { isRead: true, updatedAt: new Date() }
    );
  }

  async markAsInactive(id: string): Promise<void> {
    await ContractAlertModel.findByIdAndUpdate(
      id, 
      { isActive: false, updatedAt: new Date() }
    );
  }

  async deleteOldAlerts(daysOld: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await ContractAlertModel.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true
    });
  }
}