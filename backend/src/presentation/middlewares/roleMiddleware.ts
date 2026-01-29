import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para verificar que el usuario tenga uno de los roles permitidos
 * @param allowedRoles - Array de roles permitidos
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Verificar que el usuario tenga uno de los roles permitidos
      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso',
          requiredRoles: allowedRoles,
          userRole
        });
        return;
      }

      next();
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};