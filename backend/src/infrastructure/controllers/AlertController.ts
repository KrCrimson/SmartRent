import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { AlertStatus, AlertCategory, AlertPriority } from '@domain/entities/Alert';
import { CreateAlertUseCase } from '@application/use-cases/alerts/CreateAlertUseCase';
import { GetAlertsUseCase } from '@application/use-cases/alerts/GetAlertsUseCase';
import { GetAlertByIdUseCase } from '@application/use-cases/alerts/GetAlertByIdUseCase';
import { UpdateAlertStatusUseCase } from '@application/use-cases/alerts/UpdateAlertStatusUseCase';
import { AddAlertNotesUseCase } from '@application/use-cases/alerts/AddAlertNotesUseCase';
import { GetAlertStatsUseCase } from '@application/use-cases/alerts/GetAlertStatsUseCase';
import { logger } from '@shared/utils/logger';

// Interfaz para request autenticado
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    departmentId?: ObjectId;
  };
}

// Función helper para validar ObjectId
function validateObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Controlador para operaciones relacionadas con alertas
 */
export class AlertController {
  constructor(
    private createAlertUseCase: CreateAlertUseCase,
    private getAlertsUseCase: GetAlertsUseCase,
    private getAlertByIdUseCase: GetAlertByIdUseCase,
    private updateAlertStatusUseCase: UpdateAlertStatusUseCase,
    private addAlertNotesUseCase: AddAlertNotesUseCase,
    private getAlertStatsUseCase: GetAlertStatsUseCase
  ) {}

  /**
   * POST /api/v1/alerts
   * Crear nueva alerta
   */
  async createAlert(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title, description, category, priority, departmentId, images } = req.body;
      const reporterId = req.user!.id;

      // Validaciones básicas
      if (!title || !description || !category || !priority || !departmentId) {
        res.status(400).json({
          success: false,
          error: 'Todos los campos son obligatorios: title, description, category, priority, departmentId'
        });
        return;
      }

      // Validar que category y priority son válidos
      if (!Object.values(AlertCategory).includes(category)) {
        res.status(400).json({
          success: false,
          error: 'Categoría inválida'
        });
        return;
      }

      if (!Object.values(AlertPriority).includes(priority)) {
        res.status(400).json({
          success: false,
          error: 'Prioridad inválida'
        });
        return;
      }

      // Validar ObjectId del departamento
      if (!validateObjectId(departmentId)) {
        res.status(400).json({
          success: false,
          error: 'ID de departamento inválido'
        });
        return;
      }

      const result = await this.createAlertUseCase.execute({
        title,
        description,
        category,
        priority,
        reporterId,
        departmentId,
        images: images || []
      });

      if (result.success) {
        logger.info(`Alerta creada por usuario ${reporterId}: ${result.alert?.id}`);
        res.status(201).json({
          success: true,
          data: {
            alert: result.alert?.toPlainObject()
          },
          message: 'Alerta creada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Error en createAlert:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/alerts
   * Obtener alertas con filtros
   */
  async getAlerts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        status,
        category,
        priority,
        departmentId,
        assignedTo,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        isActive,
        search,
        fromDate,
        toDate
      } = req.query;

      const userId = req.user!.id;
      const userRole = req.user!.role;

      // Construir filtros
      const filters: any = {
        userId,
        userRole,
        page: parseInt(page as string),
        limit: Math.min(parseInt(limit as string), 50), // Máximo 50 por página
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      };

      if (departmentId && validateObjectId(departmentId as string)) {
        filters.departmentId = departmentId as string;
      }

      if (assignedTo && validateObjectId(assignedTo as string)) {
        filters.assignedTo = assignedTo as string;
      }

      if (status) {
        const statusArray = Array.isArray(status) ? status : [status];
        const validStatuses = statusArray.filter(s => Object.values(AlertStatus).includes(s as AlertStatus));
        if (validStatuses.length > 0) {
          filters.status = validStatuses.length === 1 ? validStatuses[0] : validStatuses;
        }
      }

      if (category) {
        const categoryArray = Array.isArray(category) ? category : [category];
        const validCategories = categoryArray.filter(c => Object.values(AlertCategory).includes(c as AlertCategory));
        if (validCategories.length > 0) {
          filters.category = validCategories.length === 1 ? validCategories[0] : validCategories;
        }
      }

      if (priority) {
        const priorityArray = Array.isArray(priority) ? priority : [priority];
        const validPriorities = priorityArray.filter(p => Object.values(AlertPriority).includes(p as AlertPriority));
        if (validPriorities.length > 0) {
          filters.priority = validPriorities.length === 1 ? validPriorities[0] : validPriorities;
        }
      }

      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }

      if (search) {
        filters.searchTerm = search as string;
      }

      if (fromDate && toDate) {
        filters.dateRange = {
          from: new Date(fromDate as string),
          to: new Date(toDate as string)
        };
      }

      const result = await this.getAlertsUseCase.execute(filters);

      if (result.success) {
        res.json({
          success: true,
          data: {
            alerts: result.data?.alerts.map(alert => alert.toPlainObject()),
            pagination: result.data?.pagination
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Error en getAlerts:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/alerts/:id
   * Obtener alerta por ID
   */
  async getAlertById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      if (!validateObjectId(id)) {
        res.status(400).json({
          success: false,
          error: 'ID de alerta inválido'
        });
        return;
      }

      const result = await this.getAlertByIdUseCase.execute({
        alertId: id,
        userId,
        userRole,
        departmentId: req.user!.departmentId?.toString()
      });

      if (result.success) {
        res.json({
          success: true,
          data: {
            alert: result.alert?.toPlainObject()
          }
        });
      } else {
        const statusCode = result.error === 'Alerta no encontrada' ? 404 : 403;
        res.status(statusCode).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Error en getAlertById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/v1/alerts/:id/status
   * Actualizar estado de alerta
   */
  async updateAlertStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      if (!validateObjectId(id)) {
        res.status(400).json({
          success: false,
          error: 'ID de alerta inválido'
        });
        return;
      }

      if (!status || !Object.values(AlertStatus).includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Estado inválido'
        });
        return;
      }

      const result = await this.updateAlertStatusUseCase.execute({
        alertId: id,
        newStatus: status,
        userId,
        userRole,
        notes
      });

      if (result.success) {
        logger.info(`Estado de alerta ${id} actualizado a ${status} por usuario ${userId}`);
        res.json({
          success: true,
          data: {
            alert: result.alert?.toPlainObject()
          },
          message: 'Estado de alerta actualizado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Error en updateAlertStatus:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/v1/alerts/:id/notes
   * Agregar nota a alerta
   */
  async addAlertNote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      if (!validateObjectId(id)) {
        res.status(400).json({
          success: false,
          error: 'ID de alerta inválido'
        });
        return;
      }

      if (!note || typeof note !== 'string' || note.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'La nota es obligatoria y no puede estar vacía'
        });
        return;
      }

      const result = await this.addAlertNotesUseCase.execute({
        alertId: id,
        note: note.trim(),
        authorId: userId,
        userRole
      });

      if (result.success) {
        logger.info(`Nota agregada a alerta ${id} por usuario ${userId}`);
        res.json({
          success: true,
          data: {
            alert: result.alert?.toPlainObject()
          },
          message: 'Nota agregada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Error en addAlertNote:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/alerts/stats
   * Obtener estadísticas de alertas
   */
  async getAlertStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { fromDate, toDate, departmentId } = req.query;

      const filters: any = {
        userId,
        userRole
      };

      if (departmentId && validateObjectId(departmentId as string)) {
        filters.departmentId = departmentId as string;
      }

      if (fromDate && toDate) {
        filters.dateRange = {
          from: new Date(fromDate as string),
          to: new Date(toDate as string)
        };
      }

      const result = await this.getAlertStatsUseCase.execute(filters);

      if (result.success) {
        res.json({
          success: true,
          data: {
            stats: result.stats
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Error en getAlertStats:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/v1/alerts/:id/assign
   * Asignar alerta a admin
   */
  async assignAlert(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      // Solo admins y super admins pueden asignar alertas
      if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
        res.status(403).json({
          success: false,
          error: 'No tienes permisos para asignar alertas'
        });
        return;
      }

      if (!validateObjectId(id)) {
        res.status(400).json({
          success: false,
          error: 'ID de alerta inválido'
        });
        return;
      }

      if (assignedTo && !validateObjectId(assignedTo)) {
        res.status(400).json({
          success: false,
          error: 'ID de usuario asignado inválido'
        });
        return;
      }

      // Aquí necesitarías un use case específico para asignar, pero por ahora uso updateStatus
      // En una implementación completa, crearías AssignAlertUseCase
      
      res.status(501).json({
        success: false,
        error: 'Funcionalidad de asignación pendiente de implementación'
      });
    } catch (error) {
      logger.error('Error en assignAlert:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/alerts/categories
   * Obtener lista de categorías disponibles
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: {
          categories: Object.values(AlertCategory).map(category => ({
            value: category,
            label: category.charAt(0) + category.slice(1).toLowerCase()
          }))
        }
      });
    } catch (error) {
      logger.error('Error en getCategories:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/alerts/priorities
   * Obtener lista de prioridades disponibles
   */
  async getPriorities(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: {
          priorities: Object.values(AlertPriority).map(priority => ({
            value: priority,
            label: priority.charAt(0) + priority.slice(1).toLowerCase()
          }))
        }
      });
    } catch (error) {
      logger.error('Error en getPriorities:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/alerts/statuses
   * Obtener lista de estados disponibles
   */
  async getStatuses(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: {
          statuses: Object.values(AlertStatus).map(status => ({
            value: status,
            label: status.replace('_', ' ').toLowerCase()
          }))
        }
      });
    } catch (error) {
      logger.error('Error en getStatuses:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}