/**
 * DTO para crear un nuevo usuario
 */
export class CreateUserDTO {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly role: 'admin' | 'user',
    public readonly fullName: string,
    public readonly phone: string
  ) {}
}

/**
 * DTO para login
 */
export class LoginDTO {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}
}

/**
 * DTO de respuesta de usuario (sin password)
 */
export class UserDTO {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly role: 'admin' | 'user',
    public readonly fullName: string,
    public readonly phone: string,
    public readonly assignedDepartmentId?: string,
    public readonly contractStartDate?: Date,
    public readonly contractEndDate?: Date,
    public readonly isActive?: boolean,
    public readonly createdAt?: Date
  ) {}
}

/**
 * DTO de respuesta de autenticación
 */
export class AuthResponseDTO {
  constructor(
    public readonly user: UserDTO,
    public readonly accessToken: string,
    public readonly refreshToken: string
  ) {}
}

/**
 * DTO para actualizar usuario
 */
export class UpdateUserDTO {
  constructor(
    public readonly fullName?: string,
    public readonly phone?: string
  ) {}
}

/**
 * DTO para asignar departamento
 */
export class AssignDepartmentDTO {
  constructor(
    public readonly userId: string,
    public readonly departmentId: string,
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}
