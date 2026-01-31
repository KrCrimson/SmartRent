import { Router } from 'express';
import { container } from 'tsyringe';
import { AlertController } from '@presentation/controllers/AlertController';
import { authMiddleware } from '@presentation/middlewares/authMiddleware';

const router = Router();
const alertController = container.resolve(AlertController);

/**
 * @route GET /alerts
 * @desc Obtener alertas del usuario autenticado
 * @access Private (User/Admin)
 */
router.get('/', authMiddleware, (req, res) => alertController.getUserAlerts(req, res));

/**
 * @route GET /alerts/stats
 * @desc Obtener estadísticas rápidas de alertas
 * @access Private (User/Admin)
 */
router.get('/stats', authMiddleware, (req, res) => alertController.getAlertStats(req, res));

/**
 * @route PUT /alerts/:id/read
 * @desc Marcar una alerta específica como leída
 * @access Private (User/Admin)
 */
router.put('/:id/read', authMiddleware, (req, res) => alertController.markAlertAsRead(req, res));

/**
 * @route PUT /alerts/read-all
 * @desc Marcar todas las alertas del usuario como leídas
 * @access Private (User/Admin)
 */
router.put('/read-all', authMiddleware, (req, res) => alertController.markAllAlertsAsRead(req, res));

/**
 * @route POST /alerts/generate
 * @desc Generar alertas de contratos (para admin/cron)
 * @access Private (Admin only)
 */
router.post('/generate', authMiddleware, (req, res) => alertController.generateContractAlerts(req, res));

export { router as alertRoutes };