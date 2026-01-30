import { LoginUseCase } from '../../../src/application/use-cases/auth/LoginUseCase';
import { RegisterUseCase } from '../../../src/application/use-cases/auth/RegisterUseCase';
import { RefreshTokenUseCase } from '../../../src/application/use-cases/auth/RefreshTokenUseCase';
import { UserRepository } from '../../../src/infrastructure/repositories/UserRepository';
import { BcryptPasswordHasher } from '../../../src/infrastructure/security/BcryptPasswordHasher';
import { JwtTokenService } from '../../../src/infrastructure/security/JwtTokenService';
import { User } from '../../../src/domain/entities/User.entity';
import { Email } from '../../../src/domain/value-objects/Email';
import { Password } from '../../../src/domain/value-objects/Password';
import { UnauthorizedError } from '../../../src/shared/errors/UnauthorizedError';
import { NotFoundError } from '../../../src/shared/errors/NotFoundError';

describe('Authentication Use Cases', () => {
  let userRepository: UserRepository;
  let passwordHasher: BcryptPasswordHasher;
  let tokenService: JwtTokenService;
  let loginUseCase: LoginUseCase;
  let registerUseCase: RegisterUseCase;
  let refreshTokenUseCase: RefreshTokenUseCase;

  beforeEach(() => {
    userRepository = new UserRepository();
    passwordHasher = new BcryptPasswordHasher();
    tokenService = new JwtTokenService();
    loginUseCase = new LoginUseCase(userRepository, passwordHasher, tokenService);
    registerUseCase = new RegisterUseCase(userRepository, passwordHasher);
    refreshTokenUseCase = new RefreshTokenUseCase(userRepository, tokenService);
  });

  describe('LoginUseCase', () => {
    it('debe autenticar un usuario con credenciales válidas', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'Test123!';
      const hashedPassword = await passwordHasher.hash(password);
      
      const user = User.create({
        email,
        password: hashedPassword,
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });
      
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user);

      // Act
      const result = await loginUseCase.execute({ email, password });

      // Assert
      expect(result).toBeDefined();
      expect(result.user.email.getValue()).toBe(email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('debe fallar con credenciales inválidas', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'WrongPassword';
      
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

      // Act & Assert
      await expect(loginUseCase.execute({ email, password }))
        .rejects.toThrow(UnauthorizedError);
    });

    it('debe fallar con usuario inactivo', async () => {
      // Arrange
      const email = 'inactive@example.com';
      const password = 'Test123!';
      const hashedPassword = await passwordHasher.hash(password);
      
      const user = User.create({
        email,
        password: hashedPassword,
        role: 'user',
        fullName: 'Inactive User',
        phone: '+1234567890'
      });
      user.deactivate();
      
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user);

      // Act & Assert
      await expect(loginUseCase.execute({ email, password }))
        .rejects.toThrow(UnauthorizedError);
    });
  });

  describe('RegisterUseCase', () => {
    it('debe crear un nuevo usuario con datos válidos', async () => {
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        password: 'Test123!',
        role: 'user' as const,
        fullName: 'New User',
        phone: '+1234567890'
      };

      const createdUser = User.create(userData);
      
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockResolvedValue(createdUser);

      // Act
      const result = await registerUseCase.execute(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result.email.getValue()).toBe(userData.email);
      expect(result.role).toBe(userData.role);
    });

    it('debe fallar si el email ya existe', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        password: 'Test123!',
        role: 'user' as const,
        fullName: 'Existing User',
        phone: '+1234567890'
      };

      const existingUser = User.create(userData);
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(existingUser);

      // Act & Assert
      await expect(registerUseCase.execute(userData))
        .rejects.toThrow('Email ya está registrado');
    });
  });

  describe('RefreshTokenUseCase', () => {
    it('debe generar nuevos tokens con refresh token válido', async () => {
      // Arrange
      const userId = 'user123';
      const refreshToken = tokenService.generateRefreshToken(userId);
      
      const user = User.create({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });

      jest.spyOn(userRepository, 'findById').mockResolvedValue(user);

      // Act
      const result = await refreshTokenUseCase.execute({ refreshToken });

      // Assert
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('debe fallar con refresh token inválido', async () => {
      // Arrange
      const invalidToken = 'invalid-token';

      // Act & Assert
      await expect(refreshTokenUseCase.execute({ refreshToken: invalidToken }))
        .rejects.toThrow();
    });
  });
});