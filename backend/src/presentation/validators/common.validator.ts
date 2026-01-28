import { param } from 'express-validator';
import { isValidObjectId } from 'mongoose';

/**
 * Validador para MongoDB ObjectId en parámetros
 */
export const validateMongoId = (paramName: string) => {
  return param(paramName)
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error(`${paramName} debe ser un ID válido de MongoDB`);
      }
      return true;
    });
};