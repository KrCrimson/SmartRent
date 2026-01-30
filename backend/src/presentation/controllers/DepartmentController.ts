import { Request, Response, NextFunction } from 'express';
import { CreateDepartmentUseCase } from '@application/use-cases/departments/CreateDepartmentUseCase';
import { GetAllDepartmentsUseCase } from '@application/use-cases/departments/GetAllDepartmentsUseCase';
import { GetDepartmentByIdUseCase } from '@application/use-cases/departments/GetDepartmentByIdUseCase';
import { UpdateDepartmentUseCase } from '@application/use-cases/departments/UpdateDepartmentUseCase';
import { DeleteDepartmentUseCase } from '@application/use-cases/departments/DeleteDepartmentUseCase';
import { UploadDepartmentImagesUseCase } from '@application/use-cases/departments/UploadDepartmentImagesUseCase';
import { DeleteDepartmentImageUseCase } from '@application/use-cases/departments/DeleteDepartmentImageUseCase';
import { GetMyDepartmentUseCase } from '@application/use-cases/departments/GetMyDepartmentUseCase';
import { DepartmentFilters } from '@domain/repositories/IDepartmentRepository';

export class DepartmentController {
  constructor(
    private createDepartmentUseCase: CreateDepartmentUseCase,
    private getAllDepartmentsUseCase: GetAllDepartmentsUseCase,
    private getDepartmentByIdUseCase: GetDepartmentByIdUseCase,
    private updateDepartmentUseCase: UpdateDepartmentUseCase,
    private deleteDepartmentUseCase: DeleteDepartmentUseCase,
    private uploadDepartmentImagesUseCase: UploadDepartmentImagesUseCase,
    private deleteDepartmentImageUseCase: DeleteDepartmentImageUseCase,
    private getMyDepartmentUseCase: GetMyDepartmentUseCase
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

  uploadImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No se recibieron archivos para subir',
        });
        return;
      }

      const imageBuffers = req.files.map((file: Express.Multer.File) => file.buffer);
      const department = await this.uploadDepartmentImagesUseCase.execute(
        req.params.id,
        imageBuffers
      );

      res.json({
        success: true,
        message: `${req.files.length} imagen(es) subida(s) exitosamente`,
        data: department,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const imageUrl = decodeURIComponent(req.params.imageUrl);
      const department = await this.deleteDepartmentImageUseCase.execute(
        req.params.id,
        imageUrl
      );

      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  };

  getMyDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
        return;
      }

      const myDepartmentData = await this.getMyDepartmentUseCase.execute({ userId });

      res.json({
        success: true,
        message: 'Información del departamento obtenida exitosamente',
        data: myDepartmentData,
      });
    } catch (error) {
      next(error);
    }
  };
}
