import { Router } from 'express';
import authRoutes from './auth.routes';
import departmentAssignmentRoutes from './departmentAssignment.routes';

/**
 * Enrutador principal de la API
 */
const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de asignación de departamentos
router.use('/users', departmentAssignmentRoutes);

// Aquí se agregarán más rutas según se implementen
// router.use('/departments', departmentRoutes);
// router.use('/alerts', alertRoutes);
// router.use('/config', configRoutes);

export default router;
