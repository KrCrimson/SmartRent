import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { 
  GetUserAlertsUseCase, 
  MarkAlertAsReadUseCase,
  MarkAllAlertsAsReadUseCase,
  GenerateContractAlertsUseCase 
} from '@application/use-cases/alerts';

/**
 * Controlador para el manejo de alertas de contrato
 */
export class AlertController {
  
  /**
   * Obtener alertas del usuario autenticado
   */
  async getUserAlerts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const includeRead = req.query.includeRead === 'true';

      const useCase = container.resolve(GetUserAlertsUseCase);
      const result = await useCase.execute({ userId, includeRead });

      res.json({
        success: true,
        message: 'Alertas obtenidas exitosamente',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Marcar una alerta específica como leída
   */
  async markAlertAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const alertId = req.params.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!alertId) {
        res.status(400).json({
          success: false,
          message: 'ID de alerta requerido'
        });
        return;
      }

      const useCase = container.resolve(MarkAlertAsReadUseCase);
      await useCase.execute({ alertId, userId });

      res.json({
        success: true,
        message: 'Alerta marcada como leída'
      });
    } catch (error: any) {
      const statusCode = error.message.includes('no encontrado') ? 404 : 
                        error.message.includes('permisos') ? 403 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Marcar todas las alertas del usuario como leídas
   */
  async markAllAlertsAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const useCase = container.resolve(MarkAllAlertsAsReadUseCase);
      const result = await useCase.execute(userId);

      res.json({
        success: true,
        message: `${result.modifiedCount} alertas marcadas como leídas`,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Generar alertas de contratos (endpoint para admin/cron)
   */
  async generateContractAlerts(req: Request, res: Response): Promise<void> {
    try {
      // Solo administradores pueden ejecutar esto
      const userRole = req.user?.role;
      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Solo administradores pueden generar alertas'
        });
        return;
      }

      const useCase = container.resolve(GenerateContractAlertsUseCase);
      const result = await useCase.execute();

      res.json({
        success: true,
        message: 'Alertas generadas exitosamente',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener estadísticas rápidas de alertas
   */
  async getAlertStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const useCase = container.resolve(GetUserAlertsUseCase);
      const result = await useCase.execute({ userId, includeRead: false });

      // Solo devolver las estadísticas, no las alertas completas
      const stats = {
        unreadCount: result.unreadCount,
        criticalCount: result.criticalCount,
        hasExpiredContract: result.hasExpiredContract,
        hasUnreadAlerts: result.unreadCount > 0
      };

      res.json({
        success: true,
        message: 'Estadísticas de alertas obtenidas',
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }
}