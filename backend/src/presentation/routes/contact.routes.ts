import { Router } from 'express';
import { ContactRequestController } from '../controllers/ContactRequestController';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/roles.middleware';

const router = Router();
const controller = new ContactRequestController();

// Ruta pública para enviar solicitudes
router.post('/', controller.createContactRequest);

// Rutas protegidas para administradores
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/', controller.getContactRequests);
router.patch('/:id/status', controller.updateStatus);

export default router;
