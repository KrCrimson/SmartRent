import { Router } from 'express';
import { DepartmentController } from '@presentation/controllers/DepartmentController';
import { DepartmentRepository } from '@infrastructure/repositories/DepartmentRepository';
import { CreateDepartmentUseCase } from '@application/use-cases/departments/CreateDepartmentUseCase';
import { GetAllDepartmentsUseCase } from '@application/use-cases/departments/GetAllDepartmentsUseCase';
import { GetDepartmentByIdUseCase } from '@application/use-cases/departments/GetDepartmentByIdUseCase';
import { UpdateDepartmentUseCase } from '@application/use-cases/departments/UpdateDepartmentUseCase';
import { DeleteDepartmentUseCase } from '@application/use-cases/departments/DeleteDepartmentUseCase';
import { authMiddleware } from '@presentation/middleware/auth.middleware';
import { roleMiddleware } from '@presentation/middleware/roles.middleware';

const router = Router();

// Instanciar dependencias
const departmentRepository = new DepartmentRepository();
const createDepartmentUseCase = new CreateDepartmentUseCase(departmentRepository);
const getAllDepartmentsUseCase = new GetAllDepartmentsUseCase(departmentRepository);
const getDepartmentByIdUseCase = new GetDepartmentByIdUseCase(departmentRepository);
const updateDepartmentUseCase = new UpdateDepartmentUseCase(departmentRepository);
const deleteDepartmentUseCase = new DeleteDepartmentUseCase(departmentRepository);

const departmentController = new DepartmentController(
  createDepartmentUseCase,
  getAllDepartmentsUseCase,
  getDepartmentByIdUseCase,
  updateDepartmentUseCase,
  deleteDepartmentUseCase
);

/**
 * @route   GET /api/v1/departments
 * @desc    Obtener todos los departamentos (filtros opcionales)
 * @access  Público
 */
router.get('/', departmentController.getAll);

/**
 * @route   GET /api/v1/departments/:id
 * @desc    Obtener departamento por ID
 * @access  Público
 */
router.get('/:id', departmentController.getById);

/**
 * @route   POST /api/v1/departments
 * @desc    Crear nuevo departamento
 * @access  Privado (Solo Admin)
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  departmentController.create
);

/**
 * @route   PUT /api/v1/departments/:id
 * @desc    Actualizar departamento
 * @access  Privado (Solo Admin)
 */
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  departmentController.update
);

/**
 * @route   DELETE /api/v1/departments/:id
 * @desc    Eliminar departamento (soft delete)
 * @access  Privado (Solo Admin)
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  departmentController.delete
);

export default router;
