import { User } from '../../../domain/entities/User.entity';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../shared/errors/ValidationError';

export class GetUserByIdUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User> {
    // Validar que se proporcione un ID válido
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new ValidationError('ID de usuario requerido y debe ser una cadena válida');
    }

    // Buscar el usuario por ID
    const user = await this.userRepository.findById(userId.trim());

    // Verificar si el usuario existe
    if (!user) {
      throw new NotFoundError(`No se encontró el usuario con ID: ${userId}`);
    }

    // Verificar si el usuario está activo (opcional - depende de reglas de negocio)
    if (!user.isActive) {
      throw new NotFoundError(`El usuario con ID: ${userId} está desactivado`);
    }

    return user;
  }
}