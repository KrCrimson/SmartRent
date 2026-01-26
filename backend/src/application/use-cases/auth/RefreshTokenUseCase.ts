import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IJWTService } from '@application/interfaces/IJWTService';
import { AuthResponseDTO } from '@application/dto/UserDTO';
import { UserMapper } from '@application/mappers/UserMapper';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';

/**
 * Caso de Uso: Refrescar Access Token
 */
@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('IJWTService') private jwtService: IJWTService
  ) {}

  async execute(refreshToken: string): Promise<AuthResponseDTO> {
    try {
      // 1. Verificar refresh token
      const decoded = this.jwtService.verifyRefreshToken(refreshToken);

      // 2. Buscar usuario
      const user = await this.userRepository.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new UnauthorizedError('Token inválido o usuario inactivo');
      }

      // 3. Generar nuevos tokens
      const newAccessToken = this.jwtService.generateAccessToken({
        userId: user.id,
        email: user.email.getValue(),
        role: user.role
      });

      const newRefreshToken = this.jwtService.generateRefreshToken({
        userId: user.id
      });

      // 4. Retornar respuesta
      return new AuthResponseDTO(
        UserMapper.toDTO(user),
        newAccessToken,
        newRefreshToken
      );
    } catch (error) {
      throw new UnauthorizedError('Token inválido o expirado');
    }
  }
}
