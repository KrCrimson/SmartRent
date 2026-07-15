import { Alert } from '@domain/entities/Alert';
import { IAlertRepository, AlertFilters } from '@domain/repositories/IAlertRepository';
import { AlertModel } from '@infrastructure/database/schemas/AlertSchema';
import { logger } from '@shared/utils/logger';

export class AlertRepository implements IAlertRepository {
  async create(alert: Omit<Alert, '_id' | 'createdAt' | 'updatedAt'>): Promise<Alert> {
    try {
      const newAlert = new AlertModel(alert);
      const saved = await newAlert.save();
      return this.toEntity(saved);
    } catch (error: any) {
      logger.error('Error al crear alerta', { error: error.message });
      throw error;
    }
  }

  async findById(id: string): Promise<Alert | null> {
    try {
      const alert = await AlertModel.findById(id);
      return alert ? this.toEntity(alert) : null;
    } catch (error: any) {
      logger.error('Error al buscar alerta por ID', { id, error: error.message });
      throw error;
    }
  }

  async findAll(filters?: AlertFilters): Promise<Alert[]> {
    try {
      const query: any = {};
      if (filters) {
        if (filters.userId) query.userId = filters.userId;
        if (filters.isRead !== undefined) query.isRead = filters.isRead;
      }

      const alerts = await AlertModel.find(query).sort({ createdAt: -1 });
      return alerts.map(a => this.toEntity(a));
    } catch (error: any) {
      logger.error('Error al buscar alertas', { error: error.message });
      throw error;
    }
  }

  async update(id: string, data: Partial<Alert>): Promise<Alert | null> {
    try {
      const updated = await AlertModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );
      return updated ? this.toEntity(updated) : null;
    } catch (error: any) {
      logger.error('Error al actualizar alerta', { id, error: error.message });
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await AlertModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error: any) {
      logger.error('Error al eliminar alerta', { id, error: error.message });
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      await AlertModel.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
      return true;
    } catch (error: any) {
      logger.error('Error al marcar alertas como leídas', { userId, error: error.message });
      throw error;
    }
  }

  private toEntity(doc: any): Alert {
    return {
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      title: doc.title,
      message: doc.message,
      type: doc.type,
      isRead: doc.isRead,
      relatedId: doc.relatedId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
