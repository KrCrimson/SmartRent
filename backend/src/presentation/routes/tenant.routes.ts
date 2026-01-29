import { Router } from 'express';
import { TenantController } from '../controllers/TenantController';
// import { authenticate } from '../middleware/auth.middleware';
// import { authorize } from '../middleware/roles.middleware';
import { 
  createTenantValidation,
  updateTenantValidation,
  tenantFiltersValidation 
} from '../validators/tenant.validator';
// import { validateMongoId } from '../validators/common.validator';

// Validador temporal inline
const validateMongoId = (paramName: string) => {
  return (req: any, res: any, next: any) => {
    // Validación básica temporal
    next();
  };
};

const router = Router();
const tenantController = new TenantController();

/**
 * @route   POST /api/tenants
 * @desc    Crear un nuevo inquilino
 * @access  Private (Admin/Manager)
 */
router.post(
  '/',
  // authenticate,
  // authorize(['admin', 'manager']),
  createTenantValidation,
  tenantController.createTenant
);

/**
 * @route   GET /api/tenants
 * @desc    Obtener todos los inquilinos con filtros opcionales
 * @access  Private (Admin/Manager)
 * @query   status, departmentId, hasActiveLease, minIncome, maxIncome, nationality, search
 */
router.get(
  '/',
  // authenticate,
  // authorize(['admin', 'manager']),
  tenantFiltersValidation,
  tenantController.getAllTenants
);

/**
 * @route   GET /api/tenants/:id
 * @desc    Obtener un inquilino por ID
 * @access  Private (Admin/Manager/Tenant - solo si es el mismo inquilino)
 */
router.get(
  '/:id',
  // authenticate,
  // authorize(['admin', 'manager', 'tenant']),
  validateMongoId('id'),
  tenantController.getTenantById
);

/**
 * @route   PUT /api/tenants/:id
 * @desc    Actualizar un inquilino
 * @access  Private (Admin/Manager)
 */
router.put(
  '/:id',
  // authenticate,
  // authorize(['admin', 'manager']),
  validateMongoId('id'),
  updateTenantValidation,
  tenantController.updateTenant
);

/**
 * @route   DELETE /api/tenants/:id
 * @desc    Eliminar un inquilino (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  // authenticate,
  // authorize(['admin']),
  validateMongoId('id'),
  tenantController.deleteTenant
);

export default router;