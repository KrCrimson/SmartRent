import { User } from '../../../domain/entities/User.entity';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ConflictError } from '../../../shared/errors/ConflictError';
import { ValidationError } from '../../../shared/errors/ValidationError';

export interface CreateUserRequest {
  email: string;
  password: string;
  role: 'admin' | 'user';
  fullName: string;
  phone: string;
}

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: CreateUserRequest): Promise<User> {
    // Validaciones de negocio
    if (!request.email || !request.password || !request.fullName || !request.phone) {
      throw new ValidationError('Todos los campos requeridos deben ser proporcionados');
    }

    if (request.role !== 'admin' && request.role !== 'user') {
      throw new ValidationError('El rol debe ser admin o user');
    }

    // Verificar que el email no esté en uso
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new ConflictError(`Ya existe un usuario con el email: ${request.email}`);
    }

    // Verificar unicidad por email
    const emailExists = await this.userRepository.existsByEmail(request.email);
    if (emailExists) {
      throw new ConflictError(`Ya existe un usuario con el email: ${request.email}`);
    }

    // Crear nuevo usuario usando el factory method
    const newUser = User.create({
      email: request.email,
      password: request.password,
      role: request.role,
      fullName: request.fullName.trim(),
      phone: request.phone.trim()
    });

    // Guardar el usuario
    const savedUser = await this.userRepository.save(newUser);

    return savedUser;
  }
}