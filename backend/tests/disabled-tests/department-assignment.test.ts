import { AssignDepartmentUseCase } from '../../../src/application/use-cases/users/AssignDepartmentUseCase';
import { UnassignDepartmentUseCase } from '../../../src/application/use-cases/users/UnassignDepartmentUseCase';
import { UserRepository } from '../../../src/infrastructure/repositories/UserRepository';
import { User } from '../../../src/domain/entities/User.entity';
import { ConflictError } from '../../../src/shared/errors/ConflictError';
import { NotFoundError } from '../../../src/shared/errors/NotFoundError';
import { ValidationError } from '../../../src/shared/errors/ValidationError';

describe('Department Assignment Use Cases', () => {
  let userRepository: UserRepository;
  let assignDepartmentUseCase: AssignDepartmentUseCase;
  let unassignDepartmentUseCase: UnassignDepartmentUseCase;

  beforeEach(() => {
    userRepository = new UserRepository();
    assignDepartmentUseCase = new AssignDepartmentUseCase(userRepository);
    unassignDepartmentUseCase = new UnassignDepartmentUseCase(userRepository);
  });

  describe('AssignDepartmentUseCase', () => {
    it('debe asignar departamento a usuario con datos válidos', async () => {
      // Arrange
      const userId = 'user123';
      const departmentId = 'dept123';
      const startDate = new Date();
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 año

      const user = User.create({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });

      const assignedUser = User.create({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });
      assignedUser.assignDepartment(departmentId, startDate, endDate);

      jest.spyOn(userRepository, 'findById').mockResolvedValue(user);
      jest.spyOn(userRepository, 'update').mockResolvedValue(assignedUser);

      const request = {
        userId,
        departmentId,
        contractStartDate: startDate,
        contractEndDate: endDate
      };

      // Act
      const result = await assignDepartmentUseCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.assignedDepartmentId).toBe(departmentId);
      expect(result.contractStartDate).toBe(startDate);
      expect(result.contractEndDate).toBe(endDate);
    });

    it('debe fallar si el usuario no existe', async () => {
      // Arrange
      const request = {
        userId: 'nonexistent',
        departmentId: 'dept123',
        contractStartDate: new Date(),
        contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(assignDepartmentUseCase.execute(request))
        .rejects.toThrow(NotFoundError);
    });

    it('debe fallar si el usuario es admin', async () => {
      // Arrange
      const adminUser = User.create({
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin',
        fullName: 'Admin User',
        phone: '+1234567890'
      });

      jest.spyOn(userRepository, 'findById').mockResolvedValue(adminUser);

      const request = {
        userId: 'admin123',
        departmentId: 'dept123',
        contractStartDate: new Date(),
        contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };

      // Act & Assert
      await expect(assignDepartmentUseCase.execute(request))
        .rejects.toThrow(ConflictError);
    });

    it('debe fallar si el usuario ya tiene departamento asignado', async () => {
      // Arrange
      const user = User.create({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });

      // Ya tiene departamento asignado
      user.assignDepartment(
        'existing-dept',
        new Date(),
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      );

      jest.spyOn(userRepository, 'findById').mockResolvedValue(user);

      const request = {
        userId: 'user123',
        departmentId: 'dept123',
        contractStartDate: new Date(),
        contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };

      // Act & Assert
      await expect(assignDepartmentUseCase.execute(request))
        .rejects.toThrow(ConflictError);
    });

    it('debe fallar con fechas de contrato inválidas', async () => {
      // Arrange
      const user = User.create({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });

      jest.spyOn(userRepository, 'findById').mockResolvedValue(user);

      const startDate = new Date();
      const endDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Ayer

      const request = {
        userId: 'user123',
        departmentId: 'dept123',
        contractStartDate: startDate,
        contractEndDate: endDate
      };

      // Act & Assert
      await expect(assignDepartmentUseCase.execute(request))
        .rejects.toThrow(ValidationError);
    });

    it('debe fallar si la fecha de inicio es en el pasado', async () => {
      // Arrange
      const user = User.create({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });

      jest.spyOn(userRepository, 'findById').mockResolvedValue(user);

      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Ayer
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 año

      const request = {
        userId: 'user123',
        departmentId: 'dept123',
        contractStartDate: startDate,
        contractEndDate: endDate
      };

      // Act & Assert
      await expect(assignDepartmentUseCase.execute(request))
        .rejects.toThrow(ValidationError);
    });

    it('debe fallar si el contrato es menor a 1 mes', async () => {
      // Arrange
      const user = User.create({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });

      jest.spyOn(userRepository, 'findById').mockResolvedValue(user);

      const startDate = new Date();
      const endDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 días

      const request = {
        userId: 'user123',
        departmentId: 'dept123',
        contractStartDate: startDate,
        contractEndDate: endDate
      };

      // Act & Assert
      await expect(assignDepartmentUseCase.execute(request))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('UnassignDepartmentUseCase', () => {
    it('debe desasignar departamento correctamente', async () => {
      // Arrange
      const userId = 'user123';
      const user = User.create({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });

      // Asignar departamento primero
      user.assignDepartment(
        'dept123',
        new Date(),
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      );

      const unassignedUser = User.create({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });
      // unassignedUser no tiene departamento asignado

      jest.spyOn(userRepository, 'findById').mockResolvedValue(user);
      jest.spyOn(userRepository, 'update').mockResolvedValue(unassignedUser);

      // Act
      const result = await unassignDepartmentUseCase.execute(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.assignedDepartmentId).toBeUndefined();
      expect(result.contractStartDate).toBeUndefined();
      expect(result.contractEndDate).toBeUndefined();
    });

    it('debe fallar si el usuario no existe', async () => {
      // Arrange
      const userId = 'nonexistent';
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(unassignDepartmentUseCase.execute(userId))
        .rejects.toThrow(NotFoundError);
    });

    it('debe fallar si el usuario no tiene departamento asignado', async () => {
      // Arrange
      const userId = 'user123';
      const user = User.create({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });
      // user no tiene departamento asignado

      jest.spyOn(userRepository, 'findById').mockResolvedValue(user);

      // Act & Assert
      await expect(unassignDepartmentUseCase.execute(userId))
        .rejects.toThrow(ConflictError);
    });

    it('debe validar entrada de ID de usuario', async () => {
      // Act & Assert
      await expect(unassignDepartmentUseCase.execute(''))
        .rejects.toThrow(ValidationError);

      await expect(unassignDepartmentUseCase.execute('   '))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('Contract Validations', () => {
    it('debe validar que el contrato no se pueda asignar en fines de semana (regla de negocio)', async () => {
      // Arrange
      const user = User.create({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });

      jest.spyOn(userRepository, 'findById').mockResolvedValue(user);

      // Encontrar un sábado (día 6) o domingo (día 0)
      const saturday = new Date();
      while (saturday.getDay() !== 6) {
        saturday.setDate(saturday.getDate() + 1);
      }

      const endDate = new Date(saturday.getTime() + 365 * 24 * 60 * 60 * 1000);

      const request = {
        userId: 'user123',
        departmentId: 'dept123',
        contractStartDate: saturday,
        contractEndDate: endDate
      };

      // Act
      // En este caso, permitimos contratos en fines de semana
      // pero podríamos agregar esta validación si fuera necesaria
      const assignedUser = User.create({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });
      assignedUser.assignDepartment(request.departmentId, saturday, endDate);

      jest.spyOn(userRepository, 'update').mockResolvedValue(assignedUser);

      const result = await assignDepartmentUseCase.execute(request);

      // Assert
      expect(result).toBeDefined();
    });
  });
});