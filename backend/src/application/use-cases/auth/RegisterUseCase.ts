import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IPasswordHashService } from '@application/interfaces/IPasswordHashService';
import { User } from '@domain/entities/User.entity';
import { Password } from '@domain/value-objects/Password.vo';
import { CreateUserDTO } from '@application/dto/UserDTO';
import { UserMapper } from '@application/mappers/UserMapper';
import { UserDTO } from '@application/dto/UserDTO';
import { ValidationError } from '@shared/errors/ValidationError';

/**
 * Caso de Uso: Registrar/Crear Usuario
 * Solo puede ser ejecutado por administradores
 */
@injectable()
export class RegisterUseCase {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('IPasswordHashService') private passwordHashService: IPasswordHashService
  ) {}

  async execute(dto: CreateUserDTO): Promise<UserDTO> {
    // 1. Verificar que el email no exista
    const existingUser = await this.userRepository.findByEmail(dto.email);
    
    if (existingUser) {
      throw new ValidationError('El email ya está registrado');
    }

    // 2. Hashear password
    const hashedPassword = await this.passwordHashService.hash(dto.password);

    // 3. Crear entidad del dominio
    const user = User.create({
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      fullName: dto.fullName,
      phone: dto.phone
    });

    // 4. Actualizar el password con el hash
    user.updatePassword(new Password(hashedPassword, true));

    // 5. Persistir en base de datos
    const savedUser = await this.userRepository.save(user);

    // 6. Retornar DTO (sin password)
    return UserMapper.toDTO(savedUser);
  }
}
