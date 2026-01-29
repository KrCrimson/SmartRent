import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers/UserController';
import { 
  createUserValidators,
  updateUserValidators,
  getUserByIdValidators,
  deleteUserValidators,
  getUsersQueryValidators
} from '../validators/user.validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/roles.middleware';

const router = Router();
const userController = new UserController();

/**
 * Middleware para verificar si el usuario puede acceder/modificar el recurso
 * - Admin puede acceder a cualquier usuario
 * - User solo puede acceder a su propio perfil
 */
const canAccessUser = async (req: any, res: any, next: any) => {
  try {
    const requestedUserId = req.params.id;
    const currentUser = req.user;

    // Admin puede acceder a cualquier usuario
    if (currentUser.role === 'admin') {
      return next();
    }

    // Usuario normal solo puede acceder a su propio perfil
    if (currentUser.userId === requestedUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'No tienes permiso para acceder a este recurso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor en verificación de permisos'
    });
  }
};

/**
 * Middleware para verificar si el usuario puede modificar ciertos campos
 * Solo admin puede cambiar roles y estados de usuarios
 */
const canModifyUserFields = async (req: any, res: any, next: any) => {
  try {
    const currentUser = req.user;
    const updateData = req.body;

    // Si no es admin y está tratando de modificar campos restringidos
    if (currentUser.role !== 'admin') {
      const restrictedFields = ['role', 'isActive', 'assignedDepartmentId', 'contractStartDate', 'contractEndDate'];
      const attemptedRestrictedFields = restrictedFields.filter(field => updateData.hasOwnProperty(field));
      
      if (attemptedRestrictedFields.length > 0) {
        return res.status(403).json({
          success: false,
          message: `No tienes permiso para modificar los campos: ${attemptedRestrictedFields.join(', ')}`
        });
      }
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor en verificación de permisos de campos'
    });
  }
};

// === RUTAS PÚBLICAS (requieren autenticación) ===

/**
 * @route GET /api/v1/users
 * @desc Obtener todos los usuarios (solo admin)
 * @access Admin
 */
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  getUsersQueryValidators,
  userController.getAllUsers
);

/**
 * @route GET /api/v1/users/:id
 * @desc Obtener usuario por ID (admin o propio usuario)
 * @access Admin/Own
 */
router.get(
  '/:id',
  authMiddleware,
  getUserByIdValidators,
  canAccessUser,
  userController.getUserById
);

/**
 * @route POST /api/v1/users
 * @desc Crear nuevo usuario (solo admin)
 * @access Admin
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  createUserValidators,
  userController.createUser
);

/**
 * @route PUT /api/v1/users/:id
 * @desc Actualizar usuario (admin o propio usuario con restricciones)
 * @access Admin/Own
 */
router.put(
  '/:id',
  authMiddleware,
  updateUserValidators,
  canAccessUser,
  canModifyUserFields,
  userController.updateUser
);

/**
 * @route DELETE /api/v1/users/:id
 * @desc Eliminar usuario (solo admin)
 * @access Admin
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  deleteUserValidators,
  userController.deleteUser
);

// === RUTAS ESPECIALES ===

/**
 * @route GET /api/v1/users/me/profile
 * @desc Obtener perfil del usuario autenticado
 * @access Private
 */
router.get(
  '/me/profile',
  authMiddleware,
  async (req: any, res: any) => {
    try {
      const userId = req.user.userId;
      req.params.id = userId;
      await userController.getUserById(req, res);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener perfil de usuario'
      });
    }
  }
);

/**
 * @route PUT /api/v1/users/me/profile
 * @desc Actualizar perfil del usuario autenticado
 * @access Private
 */
router.put(
  '/me/profile',
  authMiddleware,
  [
    // Validadores básicos para el perfil propio
    body('fullName')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('El nombre debe tener entre 3 y 100 caracteres')
      .trim(),
    
    body('phone')
      .optional()
      .isLength({ min: 8, max: 20 })
      .withMessage('El teléfono debe tener entre 8 y 20 caracteres')
      .matches(/^\+?[\d\s\-\(\)]+$/)
      .withMessage('El teléfono debe contener solo números, espacios, guiones y paréntesis')
      .trim(),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Debe ser un email válido')
      .normalizeEmail()
  ],
  async (req: any, res: any) => {
    try {
      const userId = req.user.userId;
      req.params.id = userId;
      
      // Filtrar solo campos permitidos para auto-edición
      const allowedFields = ['fullName', 'phone', 'email'];
      const filteredBody = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});
      
      req.body = filteredBody;
      await userController.updateUser(req, res);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar perfil de usuario'
      });
    }
  }
);

export { router as userRoutes };