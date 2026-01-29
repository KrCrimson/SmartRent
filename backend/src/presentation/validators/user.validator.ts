import { body, query, param } from 'express-validator';

// Validadores para crear usuario
export const createUserValidators = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
  
  body('role')
    .isIn(['admin', 'user'])
    .withMessage('El rol debe ser admin o user'),
  
  body('fullName')
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres')
    .trim(),
  
  body('phone')
    .isLength({ min: 8, max: 20 })
    .withMessage('El teléfono debe tener entre 8 y 20 caracteres')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('El teléfono debe contener solo números, espacios, guiones y paréntesis')
    .trim()
];

// Validadores para actualizar usuario
export const updateUserValidators = [
  param('id')
    .isMongoId()
    .withMessage('ID de usuario inválido'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('El rol debe ser admin o user'),
  
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
  
  body('assignedDepartmentId')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true;
      if (typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/)) return true;
      throw new Error('ID de departamento inválido');
    }),
  
  body('contractStartDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio de contrato inválida')
    .toDate(),
  
  body('contractEndDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin de contrato inválida')
    .toDate(),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano'),

  // Validación personalizada para fechas de contrato
  body().custom((body) => {
    if (body.contractStartDate && body.contractEndDate) {
      const start = new Date(body.contractStartDate);
      const end = new Date(body.contractEndDate);
      if (end <= start) {
        throw new Error('La fecha de fin del contrato debe ser posterior a la fecha de inicio');
      }
    }
    return true;
  })
];

// Validadores para obtener usuario por ID
export const getUserByIdValidators = [
  param('id')
    .isMongoId()
    .withMessage('ID de usuario inválido')
];

// Validadores para eliminar usuario
export const deleteUserValidators = [
  param('id')
    .isMongoId()
    .withMessage('ID de usuario inválido')
];

// Validadores para filtros de búsqueda
export const getUsersQueryValidators = [
  query('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('El rol debe ser admin o user'),
  
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano'),
  
  query('hasAssignedDepartment')
    .optional()
    .isBoolean()
    .withMessage('hasAssignedDepartment debe ser un valor booleano'),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('La búsqueda debe tener entre 1 y 100 caracteres')
    .trim()
];

// Validador para cambio de contraseña (uso futuro)
export const changePasswordValidators = [
  param('id')
    .isMongoId()
    .withMessage('ID de usuario inválido'),
  
  body('currentPassword')
    .notEmpty()
    .withMessage('Contraseña actual requerida'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una letra minúscula, una mayúscula y un número')
];

// Validadores para asignar departamento
export const assignDepartmentValidators = [
  param('id')
    .isMongoId()
    .withMessage('ID de usuario inválido'),
  
  body('departmentId')
    .notEmpty()
    .withMessage('ID de departamento requerido')
    .isMongoId()
    .withMessage('ID de departamento inválido'),
  
  body('contractStartDate')
    .notEmpty()
    .withMessage('Fecha de inicio de contrato requerida')
    .isISO8601()
    .withMessage('Fecha de inicio de contrato inválida')
    .toDate(),
  
  body('contractEndDate')
    .notEmpty()
    .withMessage('Fecha de fin de contrato requerida')
    .isISO8601()
    .withMessage('Fecha de fin de contrato inválida')
    .toDate(),
  
  // Validación personalizada para fechas
  body().custom((body) => {
    if (body.contractStartDate && body.contractEndDate) {
      const start = new Date(body.contractStartDate);
      const end = new Date(body.contractEndDate);
      if (end <= start) {
        throw new Error('La fecha de fin del contrato debe ser posterior a la fecha de inicio');
      }
    }
    return true;
  })
];

// Validadores para desasignar departamento
export const unassignDepartmentValidators = [
  param('id')
    .isMongoId()
    .withMessage('ID de usuario inválido')
];