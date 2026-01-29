import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { CreateUserUseCase } from '../../application/use-cases/users/CreateUserUseCase';
import { GetAllUsersUseCase } from '../../application/use-cases/users/GetAllUsersUseCase';
import { GetUserByIdUseCase } from '../../application/use-cases/users/GetUserByIdUseCase';
import { UpdateUserUseCase } from '../../application/use-cases/users/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../application/use-cases/users/DeleteUserUseCase';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { NotFoundError } from '../../shared/errors/NotFoundError';
import { ConflictError } from '../../shared/errors/ConflictError';
import { ValidationError } from '../../shared/errors/ValidationError';

interface SimpleLogger {
  info: (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
}

// Simple console-based logger
const logger: SimpleLogger = {
  info: (msg: string, meta?: any) => console.log(`[INFO] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[ERROR] ${msg}`, meta || '')
};

export class UserController {
  private userRepository: UserRepository;
  private createUserUseCase: CreateUserUseCase;
  private getAllUsersUseCase: GetAllUsersUseCase;
  private getUserByIdUseCase: GetUserByIdUseCase;
  private updateUserUseCase: UpdateUserUseCase;
  private deleteUserUseCase: DeleteUserUseCase;

  constructor() {
    this.userRepository = new UserRepository();
    this.createUserUseCase = new CreateUserUseCase(this.userRepository);
    this.getAllUsersUseCase = new GetAllUsersUseCase(this.userRepository);
    this.getUserByIdUseCase = new GetUserByIdUseCase(this.userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(this.userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(this.userRepository);
  }

  /**
   * Crear un nuevo usuario
   */
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
        return;
      }

      const userData = req.body;

      logger.info('Creando nuevo usuario', { 
        email: userData.email,
        role: userData.role,
        fullName: userData.fullName 
      });

      const result = await this.createUserUseCase.execute({
        email: userData.email,
        password: userData.password,
        role: userData.role,
        fullName: userData.fullName,
        phone: userData.phone
      });

      // Preparar respuesta sin password
      const responseData = {
        id: result.id,
        email: result.email.getValue(),
        role: result.role,
        fullName: result.fullName,
        phone: result.phone,
        assignedDepartmentId: result.assignedDepartmentId,
        contractStartDate: result.contractStartDate,
        contractEndDate: result.contractEndDate,
        isActive: result.isActive,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      };

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: responseData
      });

      logger.info('Usuario creado exitosamente', { 
        userId: result.id,
        email: result.email.getValue(),
        role: result.role 
      });

    } catch (error: unknown) {
      logger.error('Error al crear usuario', { error: error instanceof Error ? error.message : String(error) });

      if (error instanceof ConflictError) {
        res.status(409).json({
          success: false,
          message: error.message
        });
        return;
      }

      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al crear usuario'
      });
    }
  };

  /**
   * Obtener todos los usuarios con filtros
   */
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: errors.array()
        });
        return;
      }

      const filters: any = {};

      // Aplicar filtros de query params
      if (req.query.role) filters.role = req.query.role as 'admin' | 'user';
      if (req.query.isActive !== undefined) {
        filters.isActive = req.query.isActive === 'true';
      }
      if (req.query.hasAssignedDepartment !== undefined) {
        filters.hasAssignedDepartment = req.query.hasAssignedDepartment === 'true';
      }
      if (req.query.search) filters.search = req.query.search as string;

      logger.info('Obteniendo usuarios', { filters });

      const result = await this.getAllUsersUseCase.execute(filters);

      // Preparar respuesta sin passwords
      const responseData = result.users.map(user => ({
        id: user.id,
        email: user.email.getValue(),
        role: user.role,
        fullName: user.fullName,
        phone: user.phone,
        assignedDepartmentId: user.assignedDepartmentId,
        contractStartDate: user.contractStartDate,
        contractEndDate: user.contractEndDate,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));

      res.status(200).json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: responseData,
        count: result.total
      });

      logger.info('Usuarios obtenidos exitosamente', { 
        count: result.total,
        hasFilters: Object.keys(filters).length > 0 
      });

    } catch (error: unknown) {
      logger.error('Error al obtener usuarios', { error: error instanceof Error ? error.message : String(error) });

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener usuarios'
      });
    }
  };

  /**
   * Obtener un usuario por ID
   */
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      logger.info('Obteniendo usuario por ID', { userId: id });

      const user = await this.getUserByIdUseCase.execute(id);

      // Preparar respuesta sin password
      const responseData = {
        id: user.id,
        email: user.email.getValue(),
        role: user.role,
        fullName: user.fullName,
        phone: user.phone,
        assignedDepartmentId: user.assignedDepartmentId,
        contractStartDate: user.contractStartDate,
        contractEndDate: user.contractEndDate,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.status(200).json({
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: responseData
      });

      logger.info('Usuario obtenido exitosamente', { 
        userId: id,
        email: user.email.getValue() 
      });

    } catch (error: unknown) {
      logger.error('Error al obtener usuario', { userId: req.params.id, error: error instanceof Error ? error.message : String(error) });

      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener usuario'
      });
    }
  };

  /**
   * Actualizar un usuario
   */
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const updateData = req.body;

      logger.info('Actualizando usuario', { userId: id });

      const updatedUser = await this.updateUserUseCase.execute(id, updateData);

      // Preparar respuesta sin password
      const responseData = {
        id: updatedUser.id,
        email: updatedUser.email.getValue(),
        role: updatedUser.role,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        assignedDepartmentId: updatedUser.assignedDepartmentId,
        contractStartDate: updatedUser.contractStartDate,
        contractEndDate: updatedUser.contractEndDate,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };

      res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: responseData
      });

      logger.info('Usuario actualizado exitosamente', { 
        userId: id,
        email: updatedUser.email.getValue() 
      });

    } catch (error: unknown) {
      logger.error('Error al actualizar usuario', { userId: req.params.id, error: error instanceof Error ? error.message : String(error) });

      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      if (error instanceof ConflictError) {
        res.status(409).json({
          success: false,
          message: error.message
        });
        return;
      }

      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al actualizar usuario'
      });
    }
  };

  /**
   * Eliminar un usuario (soft delete)
   */
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      logger.info('Eliminando usuario', { userId: id });

      await this.deleteUserUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });

      logger.info('Usuario eliminado exitosamente', { userId: id });

    } catch (error: unknown) {
      logger.error('Error al eliminar usuario', { userId: req.params.id, error: error instanceof Error ? error.message : String(error) });

      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      if (error instanceof ConflictError) {
        res.status(409).json({
          success: false,
          message: error.message
        });
        return;
      }

      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al eliminar usuario'
      });
    }
  };
}