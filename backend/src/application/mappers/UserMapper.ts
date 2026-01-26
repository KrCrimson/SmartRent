import { User } from '@domain/entities/User.entity';
import { UserDTO } from '@application/dto/UserDTO';

/**
 * Mapper para convertir entre User Entity y DTOs
 */
export class UserMapper {
  /**
   * Convertir Entity a DTO (sin password)
   */
  static toDTO(entity: User): UserDTO {
    return new UserDTO(
      entity.id,
      entity.email.getValue(),
      entity.role,
      entity.fullName,
      entity.phone,
      entity.assignedDepartmentId,
      entity.contractStartDate,
      entity.contractEndDate,
      entity.isActive,
      entity.createdAt
    );
  }

  /**
   * Convertir array de Entities a array de DTOs
   */
  static toDTOList(entities: User[]): UserDTO[] {
    return entities.map(entity => this.toDTO(entity));
  }
}
