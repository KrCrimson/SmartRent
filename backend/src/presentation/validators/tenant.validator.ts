import { body, query } from 'express-validator';

export const createTenantValidation = [
  // Personal Info
  body('personalInfo.firstName')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),

  body('personalInfo.lastName')
    .trim()
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),

  body('personalInfo.dateOfBirth')
    .isISO8601()
    .withMessage('Fecha de nacimiento debe ser válida (YYYY-MM-DD)'),

  body('personalInfo.nationality')
    .trim()
    .notEmpty()
    .withMessage('La nacionalidad es requerida'),

  body('personalInfo.occupation')
    .trim()
    .notEmpty()
    .withMessage('La ocupación es requerida'),

  body('personalInfo.monthlyIncome')
    .isFloat({ min: 0 })
    .withMessage('El ingreso mensual debe ser un número positivo'),

  // Contact Info
  body('contactInfo.email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('contactInfo.phone')
    .trim()
    .notEmpty()
    .withMessage('El teléfono es requerido')
    .isMobilePhone('any')
    .withMessage('Debe ser un número de teléfono válido'),

  body('contactInfo.emergencyContact.name')
    .optional() // Cambio a opcional
    .trim()
    .notEmpty()
    .withMessage('El nombre del contacto de emergencia es requerido'),

  body('contactInfo.emergencyContact.phone')
    .optional() // Cambio a opcional
    .trim()
    .notEmpty()
    .withMessage('El teléfono del contacto de emergencia es requerido')
    .isMobilePhone('any')
    .withMessage('Debe ser un número de teléfono válido'),

  body('contactInfo.emergencyContact.relationship')
    .optional() // Cambio a opcional
    .trim()
    .notEmpty()
    .withMessage('La relación con el contacto de emergencia es requerida'),

  // Documents
  body('documents.idNumber')
    .trim()
    .notEmpty()
    .withMessage('El número de identificación es requerido')
    .isLength({ min: 5, max: 20 })
    .withMessage('El número de identificación debe tener entre 5 y 20 caracteres'),

  body('documents.idType')
    .isIn(['passport', 'nationalId', 'driversLicense'])
    .withMessage('Tipo de identificación debe ser: passport, nationalId o driversLicense'),

  // Optional fields
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending', 'terminated'])
    .withMessage('Estado debe ser: active, inactive, pending o terminated'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
];

export const updateTenantValidation = [
  // Mismo que create pero todos opcionales
  body('personalInfo.firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),

  body('personalInfo.lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El apellido no puede estar vacío')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),

  body('personalInfo.dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Fecha de nacimiento debe ser válida (YYYY-MM-DD)'),

  body('personalInfo.monthlyIncome')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El ingreso mensual debe ser un número positivo'),

  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('contactInfo.phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El teléfono no puede estar vacío')
    .isMobilePhone('any')
    .withMessage('Debe ser un número de teléfono válido'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending', 'terminated'])
    .withMessage('Estado debe ser: active, inactive, pending o terminated'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
];

export const tenantFiltersValidation = [
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'pending', 'terminated'])
    .withMessage('Estado debe ser: active, inactive, pending o terminated'),

  query('departmentId')
    .optional()
    .isMongoId()
    .withMessage('ID de departamento debe ser válido'),

  query('hasActiveLease')
    .optional()
    .isBoolean()
    .withMessage('hasActiveLease debe ser true o false'),

  query('minIncome')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Ingreso mínimo debe ser un número positivo'),

  query('maxIncome')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Ingreso máximo debe ser un número positivo'),

  query('nationality')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nacionalidad debe tener al menos 2 caracteres'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Búsqueda debe tener al menos 2 caracteres')
];