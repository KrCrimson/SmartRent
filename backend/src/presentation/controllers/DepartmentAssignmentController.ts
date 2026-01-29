import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AssignDepartmentUseCase } from '../../application/use-cases/users/AssignDepartmentUseCase';
import { UnassignDepartmentUseCase } from '../../application/use-cases/users/UnassignDepartmentUseCase';
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

export class DepartmentAssignmentController {
  private userRepository: UserRepository;
  private assignDepartmentUseCase: AssignDepartmentUseCase;
  private unassignDepartmentUseCase: UnassignDepartmentUseCase;

  constructor() {
    this.userRepository = new UserRepository();
    this.assignDepartmentUseCase = new AssignDepartmentUseCase(this.userRepository);
    this.unassignDepartmentUseCase = new UnassignDepartmentUseCase(this.userRepository);
  }

  /**
   * Asignar un departamento a un usuario
   */
  assignDepartment = async (req: Request, res: Response): Promise<void> => {
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

      const { id: userId } = req.params;
      const { departmentId, contractStartDate, contractEndDate } = req.body;

      logger.info('Asignando departamento a usuario', { 
        userId, 
        departmentId,
        contractStartDate,
        contractEndDate 
      });

      const updatedUser = await this.assignDepartmentUseCase.execute({
        userId,
        departmentId,
        contractStartDate: new Date(contractStartDate),
        contractEndDate: new Date(contractEndDate)
      });

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
        message: 'Departamento asignado exitosamente',
        data: responseData
      });

      logger.info('Departamento asignado exitosamente', { 
        userId,
        departmentId: updatedUser.assignedDepartmentId
      });

    } catch (error: unknown) {
      logger.error('Error al asignar departamento', { 
        userId: req.params.id, 
        error: error instanceof Error ? error.message : String(error) 
      });

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
        message: 'Error interno del servidor al asignar departamento'
      });
    }
  };

  /**
   * Desasignar el departamento de un usuario
   */
  unassignDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id: userId } = req.params;

      logger.info('Desasignando departamento de usuario', { userId });

      const updatedUser = await this.unassignDepartmentUseCase.execute(userId);

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
        message: 'Departamento desasignado exitosamente',
        data: responseData
      });

      logger.info('Departamento desasignado exitosamente', { userId });

    } catch (error: unknown) {
      logger.error('Error al desasignar departamento', { 
        userId: req.params.id, 
        error: error instanceof Error ? error.message : String(error) 
      });

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
        message: 'Error interno del servidor al desasignar departamento'
      });
    }
  };
}