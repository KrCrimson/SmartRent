import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IPasswordHashService } from '@application/interfaces/IPasswordHashService';
import { IJWTService } from '@application/interfaces/IJWTService';
import { LoginDTO, AuthResponseDTO } from '@application/dto/UserDTO';
import { UserMapper } from '@application/mappers/UserMapper';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';

/**
 * Caso de Uso: Login de Usuario
 */
@injectable()
export class LoginUseCase {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('IPasswordHashService') private passwordHashService: IPasswordHashService,
    @inject('IJWTService') private jwtService: IJWTService
  ) {}

  async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
    // 1. Buscar usuario por email
    const user = await this.userRepository.findByEmail(dto.email);
    
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // 2. Verificar que el usuario esté activo
    if (!user.isActive) {
      throw new UnauthorizedError('Usuario inactivo');
    }

    // 3. Verificar password
    const isPasswordValid = await this.passwordHashService.compare(
      dto.password,
      user.getPassword().getValue()
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // 4. Generar tokens
    const accessToken = this.jwtService.generateAccessToken({
      userId: user.id,
      email: user.email.getValue(),
      role: user.role
    });

    const refreshToken = this.jwtService.generateRefreshToken({
      userId: user.id
    });

    // 5. Retornar respuesta
    return new AuthResponseDTO(
      UserMapper.toDTO(user),
      accessToken,
      refreshToken
    );
  }
}
