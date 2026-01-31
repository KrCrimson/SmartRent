import { Router } from 'express';
import { AlertController } from '@infrastructure/controllers/AlertController';
import { authMiddleware } from '@presentation/middlewares/authMiddleware';
import { roleMiddleware } from '@presentation/middlewares/roleMiddleware';
import { uploadMiddleware } from '@presentation/middleware/upload.middleware';
import { rateLimitMiddleware } from '@infrastructure/middleware/rateLimit.middleware';

// Middleware de validación simple
const simpleValidation = (req: any, res: any, next: any) => next();

// Esquemas de validación simplificados
const createAlertSchema = {
  body: {
    required: ['title', 'description', 'category', 'priority', 'departmentId'],
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 100
      },
      description: {
        type: 'string',
        minLength: 1,
        maxLength: 500
      },
      category: {
        type: 'string',
        enum: ['MANTENIMIENTO', 'LIMPIEZA', 'SEGURIDAD', 'SERVICIOS', 'RUIDO', 'OTRO']
      },
      priority: {
        type: 'string',
        enum: ['BAJA', 'MEDIA', 'ALTA', 'URGENTE']
      },
      departmentId: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$'
      }
    }
  }
};

const updateStatusSchema = {
  body: {
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['PENDIENTE', 'EN_PROGRESO', 'RESUELTO', 'CANCELADO']
      },
      notes: {
        type: 'string',
        maxLength: 500
      }
    }
  }
};

const addNoteSchema = {
  body: {
    required: ['note'],
    properties: {
      note: {
        type: 'string',
        minLength: 1,
        maxLength: 500
      }
    }
  }
};

const assignAlertSchema = {
  body: {
    required: ['assignedTo'],
    properties: {
      assignedTo: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$'
      }
    }
  }
};

/**
 * Factory function para crear las rutas de alertas
 */
export function createAlertRoutes(alertController: AlertController): Router {
  const router = Router();

  // Aplicar autenticación a todas las rutas
  router.use(authMiddleware);

  // Rutas públicas (para obtener opciones)
  router.get('/categories', alertController.getCategories.bind(alertController));
  router.get('/priorities', alertController.getPriorities.bind(alertController));
  router.get('/statuses', alertController.getStatuses.bind(alertController));

  // Rutas de consulta
  router.get(
    '/',
    rateLimitMiddleware({ windowMs: 1 * 60 * 1000, max: 30 }), // 30 requests por minuto
    alertController.getAlerts.bind(alertController)
  );

  router.get(
    '/stats',
    roleMiddleware(['admin']),
    rateLimitMiddleware({ windowMs: 5 * 60 * 1000, max: 10 }), // 10 requests por 5 minutos
    alertController.getAlertStats.bind(alertController)
  );

  router.get(
    '/:id',
    rateLimitMiddleware({ windowMs: 1 * 60 * 1000, max: 20 }), // 20 requests por minuto
    alertController.getAlertById.bind(alertController)
  );

  // Rutas de creación
  router.post(
    '/',
    rateLimitMiddleware({ windowMs: 5 * 60 * 1000, max: 5 }), // 5 alertas por 5 minutos
    uploadMiddleware.array('images', 3), // Hasta 3 imágenes
    simpleValidation,
    alertController.createAlert.bind(alertController)
  );

  // Rutas de modificación (solo admins)
  router.put(
    '/:id/status',
    requireRoles(['admin']),
    rateLimitMiddleware({ windowMs: 1 * 60 * 1000, max: 20 }), // 20 updates por minuto
    simpleValidation,
    alertController.updateAlertStatus.bind(alertController)
  );

  router.put(
    '/:id/assign',
    requireRoles(['admin']),
    rateLimitMiddleware({ windowMs: 1 * 60 * 1000, max: 15 }), // 15 asignaciones por minuto
    simpleValidation,
    alertController.assignAlert.bind(alertController)
  );

  // Rutas para notas (inquilinos pueden agregar notas a sus alertas)
  router.post(
    '/:id/notes',
    rateLimitMiddleware({ windowMs: 2 * 60 * 1000, max: 10 }), // 10 notas por 2 minutos
    simpleValidation,
    alertController.addAlertNote.bind(alertController)
  );

  return router;
}

/**
 * Configuración específica de rutas por rol
 */
export const alertRouteConfig = {
  // Rutas accesibles por inquilinos
  tenant: [
    'GET /categories',
    'GET /priorities', 
    'GET /statuses',
    'GET /',
    'GET /:id',
    'POST /',
    'POST /:id/notes'
  ],

  // Rutas adicionales para admins
  admin: [
    'GET /stats',
    'PUT /:id/status',
    'PUT /:id/assign'
  ],

  // Todas las rutas para super admins
  superAdmin: 'all'
};

/**
 * Middleware específico para alertas con rate limiting personalizado
 */
export const alertSpecificMiddleware = {
  // Rate limit más estricto para creación de alertas críticas
  createUrgentAlert: rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 2, // Máximo 2 alertas urgentes por 10 minutos
    message: {
      success: false,
      error: 'Límite de alertas urgentes excedido. Intenta en unos minutos.'
    },
    keyGenerator: (req: any) => {
      // Rate limit por usuario para alertas urgentes
      return `urgent-alert-${req.user?.id}`;
    },
    skip: (req: any) => {
      // Solo aplicar a alertas de prioridad urgente
      return req.body?.priority !== 'URGENTE';
    }
  }),

  // Rate limit para búsquedas intensivas
  searchAlerts: rateLimitMiddleware({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 15, // 15 búsquedas por minuto
    message: {
      success: false,
      error: 'Demasiadas búsquedas. Intenta en un momento.'
    },
    keyGenerator: (req: any) => {
      return `search-alerts-${req.user?.id}`;
    },
    skip: (req: any) => {
      // Solo aplicar cuando hay parámetro de búsqueda
      return !req.query?.search;
    }
  })
};

export default createAlertRoutes;