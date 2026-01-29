import { body, param, ValidationChain } from 'express-validator';

/**
 * Validadores para asignar un departamento a un usuario
 */
export const assignDepartmentValidators: ValidationChain[] = [
  param('id')
    .notEmpty().withMessage('El ID del usuario es obligatorio')
    .isMongoId().withMessage('El ID del usuario debe ser un ID de MongoDB válido'),
  
  body('departmentId')
    .notEmpty().withMessage('El ID del departamento es obligatorio')
    .isString().withMessage('El ID del departamento debe ser una cadena de texto'),
  
  body('contractStartDate')
    .notEmpty().withMessage('La fecha de inicio del contrato es obligatoria')
    .isISO8601().withMessage('La fecha de inicio del contrato debe ser una fecha válida (ISO 8601)')
    .custom((value: string) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        throw new Error('La fecha de inicio del contrato no puede ser en el pasado');
      }
      return true;
    }),
  
  body('contractEndDate')
    .notEmpty().withMessage('La fecha de fin del contrato es obligatoria')
    .isISO8601().withMessage('La fecha de fin del contrato debe ser una fecha válida (ISO 8601)')
    .custom((value: string, { req }) => {
      if (!req.body.contractStartDate) {
        throw new Error('Debe proporcionar contractStartDate para validar contractEndDate');
      }

      const startDate = new Date(req.body.contractStartDate);
      const endDate = new Date(value);
      
      if (endDate <= startDate) {
        throw new Error('La fecha de fin del contrato debe ser posterior a la fecha de inicio');
      }

      // Validar que el contrato sea de al menos 1 mes
      const oneMonthLater = new Date(startDate);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      
      if (endDate < oneMonthLater) {
        throw new Error('El contrato debe tener una duración mínima de 1 mes');
      }

      return true;
    })
];

/**
 * Validadores para desasignar un departamento de un usuario
 */
export const unassignDepartmentValidators: ValidationChain[] = [
  param('id')
    .notEmpty().withMessage('El ID del usuario es obligatorio')
    .isMongoId().withMessage('El ID del usuario debe ser un ID de MongoDB válido')
];