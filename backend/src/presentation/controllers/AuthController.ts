import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { RegisterUseCase } from '@application/use-cases/auth/RegisterUseCase';
import { RefreshTokenUseCase } from '@application/use-cases/auth/RefreshTokenUseCase';
import { LoginDTO, CreateUserDTO } from '@application/dto/UserDTO';

/**
 * Controller de Autenticación
 */
export class AuthController {
  /**
   * Login de usuario
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const loginUseCase = container.resolve(LoginUseCase);
      const result = await loginUseCase.execute(new LoginDTO(email, password));

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registro de usuario (solo admin)
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, role, fullName, phone } = req.body;

      const registerUseCase = container.resolve(RegisterUseCase);
      const result = await registerUseCase.execute(
        new CreateUserDTO(email, password, role, fullName, phone)
      );

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refrescar access token
   * POST /api/v1/auth/refresh
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token es requerido'
        });
        return;
      }

      const refreshTokenUseCase = container.resolve(RefreshTokenUseCase);
      const result = await refreshTokenUseCase.execute(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refrescado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout (invalidar token en el cliente)
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    // En una implementación más avanzada, aquí se invalidaría el token en una blacklist
    res.status(200).json({
      success: true,
      message: 'Logout exitoso'
    });
  }

  /**
   * Obtener información del usuario actual
   * GET /api/v1/auth/me
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // El usuario ya está en req.user gracias al middleware de auth
      res.status(200).json({
        success: true,
        data: (req as any).user
      });
    } catch (error) {
      next(error);
    }
  }
}
