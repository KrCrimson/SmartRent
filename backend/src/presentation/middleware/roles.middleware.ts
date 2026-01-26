import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ForbiddenError } from '@shared/errors/ForbiddenError';

/**
 * Middleware de autorización por roles
 * Verifica que el usuario tenga el rol requerido
 */
export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Usuario no autenticado');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError('No tienes permisos para realizar esta acción');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
