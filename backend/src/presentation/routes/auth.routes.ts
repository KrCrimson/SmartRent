import { Router } from 'express';
import { AuthController } from '@presentation/controllers/AuthController';
import { authMiddleware } from '@presentation/middlewares/authMiddleware';
import { roleMiddleware } from '@presentation/middleware/roles.middleware';
import { validateRequest } from '@presentation/middleware/validation.middleware';
import {
  loginValidation,
  registerValidation,
  refreshTokenValidation
} from '@presentation/validators/auth.validator';

/**
 * Rutas de autenticación
 */
const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login de usuario
 * @access  Público
 */
router.post(
  '/login',
  loginValidation,
  validateRequest,
  authController.login.bind(authController)
);

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Privado (Solo Admin)
 */
router.post(
  '/register',
  authMiddleware,
  roleMiddleware('admin'),
  registerValidation,
  validateRequest,
  authController.register.bind(authController)
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refrescar access token
 * @access  Público
 */
router.post(
  '/refresh',
  refreshTokenValidation,
  validateRequest,
  authController.refreshToken.bind(authController)
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Cerrar sesión
 * @access  Privado
 */
router.post(
  '/logout',
  authMiddleware,
  authController.logout.bind(authController)
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obtener información del usuario actual
 * @access  Privado
 */
router.get(
  '/me',
  authMiddleware,
  authController.getMe.bind(authController)
);

export default router;
