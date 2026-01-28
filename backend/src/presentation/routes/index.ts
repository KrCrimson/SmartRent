import { Router } from 'express';
import authRoutes from './auth.routes';
import tenantRoutes from './tenant.routes';

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

// Rutas de inquilinos
router.use('/tenants', tenantRoutes);

// Aquí se agregarán más rutas según se implementen
// router.use('/departments', departmentRoutes);
// router.use('/users', userRoutes);
// router.use('/alerts', alertRoutes);
// router.use('/config', configRoutes);

export default router;
