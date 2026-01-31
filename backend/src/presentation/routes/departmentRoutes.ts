import { Router } from 'express';
import { DepartmentController } from '@presentation/controllers/DepartmentController';
import { DepartmentRepository } from '@infrastructure/repositories/DepartmentRepository';
import { CreateDepartmentUseCase } from '@application/use-cases/departments/CreateDepartmentUseCase';
import { GetAllDepartmentsUseCase } from '@application/use-cases/departments/GetAllDepartmentsUseCase';
import { GetDepartmentByIdUseCase } from '@application/use-cases/departments/GetDepartmentByIdUseCase';
import { UpdateDepartmentUseCase } from '@application/use-cases/departments/UpdateDepartmentUseCase';
import { DeleteDepartmentUseCase } from '@application/use-cases/departments/DeleteDepartmentUseCase';
import { UploadDepartmentImagesUseCase } from '@application/use-cases/departments/UploadDepartmentImagesUseCase';
import { DeleteDepartmentImageUseCase } from '@application/use-cases/departments/DeleteDepartmentImageUseCase';
import { GetMyDepartmentUseCase } from '@application/use-cases/departments/GetMyDepartmentUseCase';
import { CloudinaryService } from '@infrastructure/services/CloudinaryService';
import { UserRepository } from '@infrastructure/repositories/UserRepository';
import { authMiddleware } from '@presentation/middlewares/authMiddleware';
import { roleMiddleware } from '@presentation/middleware/roles.middleware';
import { upload, handleMulterError } from '@presentation/middleware/upload.middleware';

const router = Router();

// Instanciar dependencias
const departmentRepository = new DepartmentRepository();
const userRepository = new UserRepository();
const imageStorageService = new CloudinaryService();

const createDepartmentUseCase = new CreateDepartmentUseCase(departmentRepository);
const getAllDepartmentsUseCase = new GetAllDepartmentsUseCase(departmentRepository);
const getDepartmentByIdUseCase = new GetDepartmentByIdUseCase(departmentRepository);
const updateDepartmentUseCase = new UpdateDepartmentUseCase(departmentRepository);
const deleteDepartmentUseCase = new DeleteDepartmentUseCase(departmentRepository);
const getMyDepartmentUseCase = new GetMyDepartmentUseCase(userRepository, departmentRepository);
const uploadDepartmentImagesUseCase = new UploadDepartmentImagesUseCase(
  departmentRepository,
  imageStorageService
);
const deleteDepartmentImageUseCase = new DeleteDepartmentImageUseCase(
  departmentRepository,
  imageStorageService
);

const departmentController = new DepartmentController(
  createDepartmentUseCase,
  getAllDepartmentsUseCase,
  getDepartmentByIdUseCase,
  updateDepartmentUseCase,
  deleteDepartmentUseCase,
  uploadDepartmentImagesUseCase,
  deleteDepartmentImageUseCase,
  getMyDepartmentUseCase
);

/**
 * @route   GET /api/v1/departments
 * @desc    Obtener todos los departamentos (filtros opcionales)
 * @access  Público
 */
router.get('/', departmentController.getAll);

/**
 * @route   GET /api/v1/departments/my
 * @desc    Obtener MI departamento asignado (solo inquilinos)
 * @access  Privado (Solo inquilinos con departamento asignado)
 */
router.get('/my', authMiddleware, departmentController.getMyDepartment);

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

/**
 * @route   POST /api/v1/departments/:id/images
 * @desc    Subir imágenes a un departamento
 * @access  Privado (Solo Admin)
 */
router.post(
  '/:id/images',
  authMiddleware,
  roleMiddleware('admin'),
  upload.array('images', 10),
  handleMulterError,
  departmentController.uploadImages
);

/**
 * @route   DELETE /api/v1/departments/:id/images/:imageUrl
 * @desc    Eliminar una imagen del departamento
 * @access  Privado (Solo Admin)
 */
router.delete(
  '/:id/images/:imageUrl',
  authMiddleware,
  roleMiddleware('admin'),
  departmentController.deleteImage
);

export default router;
