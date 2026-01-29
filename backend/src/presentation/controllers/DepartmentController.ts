import { Request, Response, NextFunction } from 'express';
import { CreateDepartmentUseCase } from '@application/use-cases/departments/CreateDepartmentUseCase';
import { GetAllDepartmentsUseCase } from '@application/use-cases/departments/GetAllDepartmentsUseCase';
import { GetDepartmentByIdUseCase } from '@application/use-cases/departments/GetDepartmentByIdUseCase';
import { UpdateDepartmentUseCase } from '@application/use-cases/departments/UpdateDepartmentUseCase';
import { DeleteDepartmentUseCase } from '@application/use-cases/departments/DeleteDepartmentUseCase';
import { DepartmentFilters } from '@domain/repositories/IDepartmentRepository';

export class DepartmentController {
  constructor(
    private createDepartmentUseCase: CreateDepartmentUseCase,
    private getAllDepartmentsUseCase: GetAllDepartmentsUseCase,
    private getDepartmentByIdUseCase: GetDepartmentByIdUseCase,
    private updateDepartmentUseCase: UpdateDepartmentUseCase,
    private deleteDepartmentUseCase: DeleteDepartmentUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const department = await this.createDepartmentUseCase.execute(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Departamento creado exitosamente',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: DepartmentFilters = {
        status: req.query.status as any,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : undefined,
        city: req.query.city as string,
        hasParking: req.query.hasParking === 'true' ? true : req.query.hasParking === 'false' ? false : undefined,
        hasFurniture: req.query.hasFurniture === 'true' ? true : req.query.hasFurniture === 'false' ? false : undefined,
      };

      const departments = await this.getAllDepartmentsUseCase.execute(filters);
      
      res.json({
        success: true,
        data: departments,
        count: departments.length,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const department = await this.getDepartmentByIdUseCase.execute(req.params.id);
      
      res.json({
        success: true,
        data: department,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const department = await this.updateDepartmentUseCase.execute(
        req.params.id,
        req.body
      );
      
      res.json({
        success: true,
        message: 'Departamento actualizado exitosamente',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteDepartmentUseCase.execute(req.params.id);
      
      res.json({
        success: true,
        message: 'Departamento eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };
}
