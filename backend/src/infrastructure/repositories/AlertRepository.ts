import { ObjectId } from 'mongodb';
import { Alert, AlertStatus, AlertCategory, AlertPriority } from '@domain/entities/Alert';
import { 
  IAlertRepository, 
  AlertFilters, 
  AlertQueryOptions, 
  PaginatedAlerts, 
  AlertStats 
} from '@domain/repositories/IAlertRepository';
import { AlertModel, IAlertDocument } from '@infrastructure/database/models/AlertModel';
import { logger } from '@shared/utils/logger';

/**
 * Implementación del repositorio de alertas usando MongoDB/Mongoose
 */
export class AlertRepository implements IAlertRepository {
  
  async create(alert: Alert): Promise<Alert> {
    try {
      const alertData = alert.toPlainObject();
      const alertDocument = new AlertModel(alertData);
      const savedAlert = await alertDocument.save();
      
      logger.info(`Alert creada: ${savedAlert._id}`);
      return this.mapToEntity(savedAlert);
    } catch (error) {
      logger.error('Error al crear alert:', error);
      throw new Error('Error al crear la alerta');
    }
  }

  async findById(id: string): Promise<Alert | null> {
    try {
      const alertDocument = await AlertModel.findById(id)
        .populate('reporterId', 'firstName lastName email')
        .populate('departmentId', 'number building')
        .populate('assignedTo', 'firstName lastName email');
      
      return alertDocument ? this.mapToEntity(alertDocument) : null;
    } catch (error) {
      logger.error(`Error al buscar alert por ID ${id}:`, error);
      return null;
    }
  }

  async findMany(filters: AlertFilters, options: AlertQueryOptions): Promise<PaginatedAlerts> {
    try {
      const query = this.buildQuery(filters);
      const sortOptions = this.buildSortOptions(options);
      
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;

      const [alerts, totalCount] = await Promise.all([
        AlertModel.find(query)
          .populate('reporterId', 'firstName lastName email')
          .populate('departmentId', 'number building')
          .populate('assignedTo', 'firstName lastName email')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        AlertModel.countDocuments(query)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        alerts: alerts.map(alert => this.mapToEntity(alert)),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrevious: page > 1
        }
      };
    } catch (error) {
      logger.error('Error al buscar alerts:', error);
      throw new Error('Error al buscar alertas');
    }
  }

  async findByReporterId(reporterId: ObjectId, options: AlertQueryOptions): Promise<PaginatedAlerts> {
    const filters: AlertFilters = { reporterId };
    return this.findMany(filters, options);
  }

  async findByDepartmentId(departmentId: ObjectId, options: AlertQueryOptions): Promise<PaginatedAlerts> {
    const filters: AlertFilters = { departmentId };
    return this.findMany(filters, options);
  }

  async findByAssignedTo(assignedTo: ObjectId, options: AlertQueryOptions): Promise<PaginatedAlerts> {
    const filters: AlertFilters = { assignedTo };
    return this.findMany(filters, options);
  }

  async update(alert: Alert): Promise<Alert> {
    try {
      const alertData = alert.toPlainObject();
      const updatedAlert = await AlertModel.findByIdAndUpdate(
        alert.id,
        alertData,
        { new: true, runValidators: true }
      );

      if (!updatedAlert) {
        throw new Error('Alerta no encontrada');
      }

      logger.info(`Alert actualizada: ${alert.id}`);
      return this.mapToEntity(updatedAlert);
    } catch (error) {
      logger.error(`Error al actualizar alert ${alert.id}:`, error);
      throw new Error('Error al actualizar la alerta');
    }
  }

  async updateStatus(id: ObjectId, status: AlertStatus, updatedBy: ObjectId): Promise<Alert> {
    try {
      const updateData: any = { 
        status, 
        updatedAt: new Date() 
      };

      if (status === AlertStatus.RESUELTO) {
        updateData.resolvedAt = new Date();
      }

      const updatedAlert = await AlertModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedAlert) {
        throw new Error('Alerta no encontrada');
      }

      logger.info(`Alert status actualizado: ${id} -> ${status}`);
      return this.mapToEntity(updatedAlert);
    } catch (error) {
      logger.error(`Error al actualizar status de alert ${id}:`, error);
      throw new Error('Error al actualizar el estado de la alerta');
    }
  }

  async assignTo(id: ObjectId, assignedTo: ObjectId, updatedBy: ObjectId): Promise<Alert> {
    try {
      const updatedAlert = await AlertModel.findByIdAndUpdate(
        id,
        { assignedTo, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!updatedAlert) {
        throw new Error('Alerta no encontrada');
      }

      logger.info(`Alert asignada: ${id} -> ${assignedTo}`);
      return this.mapToEntity(updatedAlert);
    } catch (error) {
      logger.error(`Error al asignar alert ${id}:`, error);
      throw new Error('Error al asignar la alerta');
    }
  }

  async addNote(id: ObjectId, note: string, authorId: ObjectId): Promise<Alert> {
    try {
      const noteWithMetadata = `[${new Date().toISOString()}] [${authorId.toString()}]: ${note.trim()}`;
      
      const updatedAlert = await AlertModel.findByIdAndUpdate(
        id,
        { 
          $push: { notes: noteWithMetadata },
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!updatedAlert) {
        throw new Error('Alerta no encontrada');
      }

      logger.info(`Nota agregada a alert ${id}`);
      return this.mapToEntity(updatedAlert);
    } catch (error) {
      logger.error(`Error al agregar nota a alert ${id}:`, error);
      throw new Error('Error al agregar nota a la alerta');
    }
  }

  async updatePriority(id: ObjectId, priority: AlertPriority, updatedBy: ObjectId): Promise<Alert> {
    try {
      const updatedAlert = await AlertModel.findByIdAndUpdate(
        id,
        { priority, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!updatedAlert) {
        throw new Error('Alerta no encontrada');
      }

      logger.info(`Alert prioridad actualizada: ${id} -> ${priority}`);
      return this.mapToEntity(updatedAlert);
    } catch (error) {
      logger.error(`Error al actualizar prioridad de alert ${id}:`, error);
      throw new Error('Error al actualizar la prioridad de la alerta');
    }
  }

  async delete(id: ObjectId): Promise<boolean> {
    try {
      const result = await AlertModel.findByIdAndDelete(id);
      
      if (result) {
        logger.info(`Alert eliminada: ${id}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error(`Error al eliminar alert ${id}:`, error);
      throw new Error('Error al eliminar la alerta');
    }
  }

  async getStats(filters?: Partial<AlertFilters>): Promise<AlertStats> {
    try {
      const query = filters ? this.buildQuery(filters as AlertFilters) : {};

      const [
        total,
        statusCounts,
        categoryCounts,
        priorityCounts,
        resolvedAlerts,
        overdueAlerts,
        activeAlerts
      ] = await Promise.all([
        AlertModel.countDocuments(query),
        this.getCountsByField('status', query),
        this.getCountsByField('category', query),
        this.getCountsByField('priority', query),
        AlertModel.find({ ...query, status: AlertStatus.RESUELTO }).select('createdAt resolvedAt'),
        this.getOverdueAlertsCount(7), // Alertas con más de 7 días sin resolver
        AlertModel.countDocuments({ 
          ...query, 
          status: { $in: [AlertStatus.PENDIENTE, AlertStatus.EN_PROGRESO] } 
        })
      ]);

      // Calcular promedio de días de resolución
      const resolutionTimes = resolvedAlerts
        .filter(alert => alert.resolvedAt)
        .map(alert => {
          const days = Math.ceil((alert.resolvedAt!.getTime() - alert.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return days;
        });

      const averageResolutionDays = resolutionTimes.length > 0
        ? resolutionTimes.reduce((sum, days) => sum + days, 0) / resolutionTimes.length
        : 0;

      // Tendencia mensual (últimos 12 meses)
      const monthlyTrend = await this.getMonthlyTrend(query);

      return {
        total,
        byStatus: this.normalizeCountsByEnum(statusCounts, AlertStatus),
        byCategory: this.normalizeCountsByEnum(categoryCounts, AlertCategory),
        byPriority: this.normalizeCountsByEnum(priorityCounts, AlertPriority),
        averageResolutionDays: Math.round(averageResolutionDays * 100) / 100,
        overdueCount: overdueAlerts,
        activeCount: activeAlerts,
        monthlyTrend
      };
    } catch (error) {
      logger.error('Error al obtener estadísticas de alerts:', error);
      throw new Error('Error al obtener estadísticas');
    }
  }

  async findActiveAlerts(options: AlertQueryOptions): Promise<PaginatedAlerts> {
    const filters: AlertFilters = {
      status: [AlertStatus.PENDIENTE, AlertStatus.EN_PROGRESO]
    };
    return this.findMany(filters, options);
  }

  async findOverdueAlerts(days: number, options: AlertQueryOptions): Promise<PaginatedAlerts> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filters: AlertFilters = {
      isOverdue: true
    };

    // Construir query personalizada para alertas vencidas
    const customQuery = {
      status: { $in: [AlertStatus.PENDIENTE, AlertStatus.EN_PROGRESO] },
      createdAt: { $lte: cutoffDate }
    };

    try {
      const sortOptions = this.buildSortOptions(options);
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;

      const [alerts, totalCount] = await Promise.all([
        AlertModel.find(customQuery)
          .populate('reporterId', 'firstName lastName email')
          .populate('departmentId', 'number building')
          .populate('assignedTo', 'firstName lastName email')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        AlertModel.countDocuments(customQuery)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        alerts: alerts.map(alert => this.mapToEntity(alert)),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrevious: page > 1
        }
      };
    } catch (error) {
      logger.error('Error al buscar alertas vencidas:', error);
      throw new Error('Error al buscar alertas vencidas');
    }
  }

  async findByDateRange(from: Date, to: Date, options: AlertQueryOptions): Promise<PaginatedAlerts> {
    const filters: AlertFilters = {
      dateRange: { from, to }
    };
    return this.findMany(filters, options);
  }

  async countByStatus(): Promise<Record<AlertStatus, number>> {
    const counts = await this.getCountsByField('status');
    return this.normalizeCountsByEnum(counts, AlertStatus);
  }

  async countByCategory(): Promise<Record<AlertCategory, number>> {
    const counts = await this.getCountsByField('category');
    return this.normalizeCountsByEnum(counts, AlertCategory);
  }

  async countByPriority(): Promise<Record<AlertPriority, number>> {
    const counts = await this.getCountsByField('priority');
    return this.normalizeCountsByEnum(counts, AlertPriority);
  }

  async findHighPriorityUnassigned(): Promise<Alert[]> {
    try {
      const alerts = await AlertModel.find({
        priority: { $in: [AlertPriority.ALTA, AlertPriority.URGENTE] },
        assignedTo: { $exists: false },
        status: { $in: [AlertStatus.PENDIENTE, AlertStatus.EN_PROGRESO] }
      })
      .populate('reporterId', 'firstName lastName email')
      .populate('departmentId', 'number building')
      .sort({ priority: -1, createdAt: 1 })
      .lean();

      return alerts.map(alert => this.mapToEntity(alert));
    } catch (error) {
      logger.error('Error al buscar alertas de alta prioridad sin asignar:', error);
      throw new Error('Error al buscar alertas de alta prioridad');
    }
  }

  async findRecent(days: number): Promise<Alert[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const alerts = await AlertModel.find({
        createdAt: { $gte: cutoffDate }
      })
      .populate('reporterId', 'firstName lastName email')
      .populate('departmentId', 'number building')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

      return alerts.map(alert => this.mapToEntity(alert));
    } catch (error) {
      logger.error('Error al buscar alertas recientes:', error);
      throw new Error('Error al buscar alertas recientes');
    }
  }

  async exists(id: ObjectId): Promise<boolean> {
    try {
      const count = await AlertModel.countDocuments({ _id: id });
      return count > 0;
    } catch (error) {
      logger.error(`Error al verificar existencia de alert ${id}:`, error);
      return false;
    }
  }

  async findSimilar(departmentId: ObjectId, category: AlertCategory, excludeId?: ObjectId): Promise<Alert[]> {
    try {
      const query: any = {
        departmentId,
        category,
        status: { $in: [AlertStatus.PENDIENTE, AlertStatus.EN_PROGRESO] }
      };

      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      const alerts = await AlertModel.find(query)
        .populate('reporterId', 'firstName lastName email')
        .populate('departmentId', 'number building')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      return alerts.map(alert => this.mapToEntity(alert));
    } catch (error) {
      logger.error('Error al buscar alertas similares:', error);
      throw new Error('Error al buscar alertas similares');
    }
  }

  async getAverageResolutionTime(): Promise<Record<AlertCategory, number>> {
    try {
      const pipeline = [
        {
          $match: {
            status: AlertStatus.RESUELTO,
            resolvedAt: { $exists: true }
          }
        },
        {
          $addFields: {
            resolutionDays: {
              $divide: [
                { $subtract: ['$resolvedAt', '$createdAt'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        {
          $group: {
            _id: '$category',
            averageDays: { $avg: '$resolutionDays' }
          }
        }
      ];

      const results = await AlertModel.aggregate(pipeline);
      
      const averageTimes: Record<string, number> = {};
      results.forEach(result => {
        averageTimes[result._id] = Math.round(result.averageDays * 100) / 100;
      });

      return this.normalizeCountsByEnum(averageTimes, AlertCategory);
    } catch (error) {
      logger.error('Error al obtener tiempo promedio de resolución:', error);
      throw new Error('Error al obtener tiempo promedio de resolución');
    }
  }

  async findWithImages(): Promise<Alert[]> {
    try {
      const alerts = await AlertModel.find({
        images: { $exists: true, $not: { $size: 0 } }
      })
      .populate('reporterId', 'firstName lastName email')
      .populate('departmentId', 'number building')
      .sort({ createdAt: -1 })
      .lean();

      return alerts.map(alert => this.mapToEntity(alert));
    } catch (error) {
      logger.error('Error al buscar alertas con imágenes:', error);
      throw new Error('Error al buscar alertas con imágenes');
    }
  }

  async searchByText(searchTerm: string, options: AlertQueryOptions): Promise<PaginatedAlerts> {
    try {
      const query = {
        $text: { $search: searchTerm }
      };

      const sortOptions = this.buildSortOptions(options);
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;

      const [alerts, totalCount] = await Promise.all([
        AlertModel.find(query, { score: { $meta: 'textScore' } })
          .populate('reporterId', 'firstName lastName email')
          .populate('departmentId', 'number building')
          .populate('assignedTo', 'firstName lastName email')
          .sort({ score: { $meta: 'textScore' }, ...sortOptions })
          .skip(skip)
          .limit(limit)
          .lean(),
        AlertModel.countDocuments(query)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        alerts: alerts.map(alert => this.mapToEntity(alert)),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrevious: page > 1
        }
      };
    } catch (error) {
      logger.error('Error en búsqueda de texto:', error);
      throw new Error('Error en búsqueda de alertas');
    }
  }

  // Métodos de utilidad privados
  private buildQuery(filters: AlertFilters): any {
    const query: any = {};

    if (filters.reporterId) {
      query.reporterId = filters.reporterId;
    }

    if (filters.departmentId) {
      query.departmentId = filters.departmentId;
    }

    if (filters.assignedTo) {
      query.assignedTo = filters.assignedTo;
    }

    if (filters.status) {
      query.status = Array.isArray(filters.status) ? { $in: filters.status } : filters.status;
    }

    if (filters.category) {
      query.category = Array.isArray(filters.category) ? { $in: filters.category } : filters.category;
    }

    if (filters.priority) {
      query.priority = Array.isArray(filters.priority) ? { $in: filters.priority } : filters.priority;
    }

    if (filters.dateRange) {
      query.createdAt = {
        $gte: filters.dateRange.from,
        $lte: filters.dateRange.to
      };
    }

    if (filters.isActive !== undefined) {
      if (filters.isActive) {
        query.status = { $in: [AlertStatus.PENDIENTE, AlertStatus.EN_PROGRESO] };
      } else {
        query.status = { $in: [AlertStatus.RESUELTO, AlertStatus.CANCELADO] };
      }
    }

    return query;
  }

  private buildSortOptions(options: AlertQueryOptions): any {
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    
    return { [sortBy]: sortOrder };
  }

  private mapToEntity(document: any): Alert {
    return Alert.fromPlainObject({
      _id: document._id,
      title: document.title,
      description: document.description,
      category: document.category,
      priority: document.priority,
      status: document.status,
      reporterId: document.reporterId,
      departmentId: document.departmentId,
      assignedTo: document.assignedTo,
      images: document.images,
      notes: document.notes,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      resolvedAt: document.resolvedAt
    });
  }

  private async getCountsByField(field: string, query: any = {}): Promise<Record<string, number>> {
    try {
      const pipeline = [
        { $match: query },
        { $group: { _id: `$${field}`, count: { $sum: 1 } } }
      ];

      const results = await AlertModel.aggregate(pipeline);
      
      const counts: Record<string, number> = {};
      results.forEach(result => {
        counts[result._id] = result.count;
      });

      return counts;
    } catch (error) {
      logger.error(`Error al contar por campo ${field}:`, error);
      throw new Error(`Error al contar por ${field}`);
    }
  }

  private normalizeCountsByEnum<T extends Record<string, string>>(
    counts: Record<string, number>, 
    enumObj: T
  ): Record<string, number> {
    const normalized: Record<string, number> = {};
    
    Object.values(enumObj).forEach(value => {
      normalized[value] = counts[value] || 0;
    });

    return normalized;
  }

  private async getOverdueAlertsCount(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return AlertModel.countDocuments({
      status: { $in: [AlertStatus.PENDIENTE, AlertStatus.EN_PROGRESO] },
      createdAt: { $lte: cutoffDate }
    });
  }

  private async getMonthlyTrend(query: any = {}): Promise<Array<{ month: string; count: number; resolved: number }>> {
    try {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const results = await AlertModel.aggregate([
        {
          $match: {
            ...query,
            createdAt: { $gte: twelveMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            resolved: {
              $sum: {
                $cond: [{ $eq: ['$status', AlertStatus.RESUELTO] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { 
            '_id.year': 1, 
            '_id.month': 1
          }
        }
      ]);
      
      return results.map(result => ({
        month: `${result._id.year}-${String(result._id.month).padStart(2, '0')}`,
        count: result.count,
        resolved: result.resolved
      }));
    } catch (error) {
      logger.error('Error al obtener tendencia mensual:', error);
      return [];
    }
  }
}