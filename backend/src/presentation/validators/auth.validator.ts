import { body } from 'express-validator';

/**
 * Validaciones para autenticación
 */

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password es requerido')
];

export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password debe contener al menos una mayúscula, una minúscula y un número'),
  
  body('role')
    .isIn(['admin', 'user'])
    .withMessage('Rol debe ser admin o user'),
  
  body('fullName')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nombre completo debe tener al menos 3 caracteres'),
  
  body('phone')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Teléfono debe tener al menos 8 caracteres')
];

export const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token es requerido')
];
