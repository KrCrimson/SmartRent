import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { CreateTenantUseCase } from '../../application/use-cases/tenants/CreateTenantUseCase';
import { GetAllTenantsUseCase } from '../../application/use-cases/tenants/GetAllTenantsUseCase';
import { GetTenantByIdUseCase } from '../../application/use-cases/tenants/GetTenantByIdUseCase';
import { UpdateTenantUseCase } from '../../application/use-cases/tenants/UpdateTenantUseCase';
import { DeleteTenantUseCase } from '../../application/use-cases/tenants/DeleteTenantUseCase';
import { TenantRepository } from '../../infrastructure/repositories/TenantRepository';
import { AppError } from '../../shared/errors/AppError';
import { NotFoundError } from '../../shared/errors/NotFoundError';
import { ConflictError } from '../../shared/errors/ConflictError';
import { ValidationError } from '../../shared/errors/ValidationError';
import { TenantFilters } from '../../domain/repositories/ITenantRepository';

interface SimpleLogger {
  info: (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
}

// Simple console-based logger
const logger: SimpleLogger = {
  info: (msg: string, meta?: any) => console.log(`[INFO] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[ERROR] ${msg}`, meta || '')
};

export class TenantController {
  private tenantRepository: TenantRepository;
  private createTenantUseCase: CreateTenantUseCase;
  private getAllTenantsUseCase: GetAllTenantsUseCase;
  private getTenantByIdUseCase: GetTenantByIdUseCase;
  private updateTenantUseCase: UpdateTenantUseCase;
  private deleteTenantUseCase: DeleteTenantUseCase;

  constructor() {
    this.tenantRepository = new TenantRepository();
    this.createTenantUseCase = new CreateTenantUseCase(this.tenantRepository);
    this.getAllTenantsUseCase = new GetAllTenantsUseCase(this.tenantRepository);
    this.getTenantByIdUseCase = new GetTenantByIdUseCase(this.tenantRepository);
    this.updateTenantUseCase = new UpdateTenantUseCase(this.tenantRepository);
    this.deleteTenantUseCase = new DeleteTenantUseCase(this.tenantRepository);
  }

  /**
   * Crear un nuevo inquilino
   */
  createTenant = async (req: Request, res: Response): Promise<void> => {
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

      const tenantData = req.body;

      logger.info('Creando nuevo inquilino', { 
        email: tenantData.contactInfo?.email,
        idNumber: tenantData.documents?.idNumber 
      });

      const result = await this.createTenantUseCase.execute(tenantData);

      res.status(201).json({
        success: true,
        message: 'Inquilino creado exitosamente',
        data: result
      });

      logger.info('Inquilino creado exitosamente', { 
        tenantId: result.id,
        email: result.contactInfo.email 
      });

    } catch (error) {
      logger.error('Error al crear inquilino', { error: error instanceof Error ? error.message : String(error) });

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
        message: 'Error interno del servidor al crear inquilino'
      });
    }
  };

  /**
   * Obtener todos los inquilinos con filtros
   */
  getAllTenants = async (req: Request, res: Response): Promise<void> => {
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

      const filters: TenantFilters = {};

      // Aplicar filtros de query params
      if (req.query.status) filters.status = req.query.status as 'active' | 'inactive' | 'pending' | 'terminated';
      if (req.query.departmentId) filters.departmentId = req.query.departmentId as string;
      if (req.query.hasActiveLease !== undefined) {
        filters.hasActiveLease = req.query.hasActiveLease === 'true';
      }
      if (req.query.minIncome) filters.minIncome = parseFloat(req.query.minIncome as string);
      if (req.query.maxIncome) filters.maxIncome = parseFloat(req.query.maxIncome as string);
      if (req.query.nationality) filters.nationality = req.query.nationality as string;
      if (req.query.search) filters.search = req.query.search as string;

      logger.info('Obteniendo inquilinos', { filters });

      const result = await this.getAllTenantsUseCase.execute(filters);

      res.status(200).json({
        success: true,
        message: 'Inquilinos obtenidos exitosamente',
        data: result.tenants,
        count: result.total
      });

      logger.info('Inquilinos obtenidos exitosamente', { 
        count: result.total,
        hasFilters: Object.keys(filters).length > 0 
      });

    } catch (error) {
      logger.error('Error al obtener inquilinos', { error: error instanceof Error ? error.message : String(error) });

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener inquilinos'
      });
    }
  };

  /**
   * Obtener un inquilino por ID
   */
  getTenantById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      logger.info('Obteniendo inquilino por ID', { tenantId: id });

      const tenant = await this.getTenantByIdUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: 'Inquilino obtenido exitosamente',
        data: tenant
      });

      logger.info('Inquilino obtenido exitosamente', { 
        tenantId: id,
        email: tenant.contactInfo.email 
      });

    } catch (error) {
      logger.error('Error al obtener inquilino', { tenantId: req.params.id, error: error instanceof Error ? error.message : String(error) });

      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener inquilino'
      });
    }
  };

  /**
   * Actualizar un inquilino
   */
  updateTenant = async (req: Request, res: Response): Promise<void> => {
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

      logger.info('Actualizando inquilino', { tenantId: id });

      const updatedTenant = await this.updateTenantUseCase.execute(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Inquilino actualizado exitosamente',
        data: updatedTenant
      });

      logger.info('Inquilino actualizado exitosamente', { 
        tenantId: id,
        email: updatedTenant.contactInfo.email 
      });

    } catch (error) {
      logger.error('Error al actualizar inquilino', { tenantId: req.params.id, error: error instanceof Error ? error.message : String(error) });

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
        message: 'Error interno del servidor al actualizar inquilino'
      });
    }
  };

  /**
   * Eliminar un inquilino (soft delete)
   */
  deleteTenant = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      logger.info('Eliminando inquilino', { tenantId: id });

      await this.deleteTenantUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: 'Inquilino eliminado exitosamente'
      });

      logger.info('Inquilino eliminado exitosamente', { tenantId: id });

    } catch (error) {
      logger.error('Error al eliminar inquilino', { tenantId: req.params.id, error: error instanceof Error ? error.message : String(error) });

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

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al eliminar inquilino'
      });
    }
  };
}