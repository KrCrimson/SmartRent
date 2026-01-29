import { User } from '../../../domain/entities/User.entity';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export interface UserFilters {
  role?: 'admin' | 'user';
  isActive?: boolean;
  hasAssignedDepartment?: boolean;
  search?: string; // Buscar en nombre o email
}

export interface GetAllUsersResponse {
  users: User[];
  total: number;
}

export class GetAllUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(filters: UserFilters = {}): Promise<GetAllUsersResponse> {
    // Obtener usuarios con filtros
    const users = await this.userRepository.findAll({
      role: filters.role,
      isActive: filters.isActive,
      hasAssignedDepartment: filters.hasAssignedDepartment
    });

    let filteredUsers = users;

    // Aplicar filtro de búsqueda si se proporciona
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim().toLowerCase();
      filteredUsers = users.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.email.getValue().toLowerCase().includes(searchTerm)
      );
    }

    return {
      users: filteredUsers,
      total: filteredUsers.length
    };
  }
}