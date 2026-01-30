import { Router } from 'express';
import authRoutes from './auth.routes';
import tenantRoutes from './tenant.routes';
import { userRoutes } from './user.routes';
import departmentAssignmentRoutes from './departmentAssignment.routes';
import departmentRoutes from './departmentRoutes';
import { alertRoutes } from './alertRoutes';

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

// Rutas de departamentos
router.use('/departments', departmentRoutes);

// Rutas de inquilinos
router.use('/tenants', tenantRoutes);

// Rutas de usuarios (incluye asignación de departamentos)
router.use('/users', userRoutes);
router.use('/users', departmentAssignmentRoutes);

// Rutas de alertas
router.use('/alerts', alertRoutes);

// Aquí se agregarán más rutas según se implementen
// router.use('/config', configRoutes);

export default router;
