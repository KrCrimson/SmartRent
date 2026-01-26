import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { IJWTService } from '@application/interfaces/IJWTService';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { UserMapper } from '@application/mappers/UserMapper';

/**
 * Interface extendida de Request con usuario autenticado
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware de autenticación
 * Verifica el JWT token y agrega el usuario a req.user
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];

    // 2. Verificar token
    const jwtService = container.resolve<IJWTService>('IJWTService');
    const decoded = jwtService.verifyAccessToken(token);

    // 3. Verificar que el usuario existe y está activo
    const userRepository = container.resolve<IUserRepository>('IUserRepository');
    const user = await userRepository.findById(decoded.userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Usuario no encontrado o inactivo');
    }

    // 4. Agregar usuario a request
    req.user = {
      id: user.id,
      email: user.email.getValue(),
      role: user.role
    };

    next();
  } catch (error) {
    next(error);
  }
};
