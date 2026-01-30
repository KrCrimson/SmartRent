import request from 'supertest';
import { Express } from 'express';
import { Department } from '../../../src/domain/entities/Department';

// Mock dependencies
jest.mock('../../../src/infrastructure/repositories/DepartmentRepository');
jest.mock('../../../src/infrastructure/services/CloudinaryService');
jest.mock('../../../src/presentation/middleware/auth.middleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 'admin-123', role: 'admin' };
    next();
  }
}));
jest.mock('../../../src/presentation/middleware/roles.middleware', () => ({
  roleMiddleware: (role: string) => (req: any, res: any, next: any) => next()
}));

// Helper para crear mock de departamento
const createMockDepartment = (overrides?: Partial<Department>): Department => ({
  _id: 'dept-123',
  code: 'DEPT001',
  name: 'Departamento Test',
  description: 'Departamento de prueba',
  status: 'available',
  monthlyPrice: 1500,
  images: ['image1.jpg'],
  address: {
    street: 'Calle Principal',
    number: '123',
    floor: '2A',
    city: 'Ciudad Test',
    postalCode: '12345'
  },
  features: {
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 80,
    hasParking: true,
    hasFurniture: false
  },
  inventory: [],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

describe('Department Routes Integration', () => {
  let app: Express;
  let mockDepartmentRepository: any;

  beforeAll(async () => {
    // Importar app después de configurar mocks
    const { default: appModule } = await import('../../../src/app');
    app = appModule;
  });

  beforeEach(async () => {
    // Importar mocks después de que estén configurados
    const { DepartmentRepository } = await import('../../../src/infrastructure/repositories/DepartmentRepository');
    mockDepartmentRepository = DepartmentRepository as jest.MockedClass<typeof DepartmentRepository>;
    
    jest.clearAllMocks();
  });

  describe('GET /api/departments', () => {
    it('debe obtener todos los departamentos', async () => {
      // Arrange
      const mockDepartments = [
        createMockDepartment(),
        createMockDepartment({ _id: 'dept-456', code: 'DEPT002' })
      ];

      mockDepartmentRepository.prototype.findAll = jest.fn().mockResolvedValue(mockDepartments);

      // Act
      const response = await request(app)
        .get('/api/departments')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ code: 'DEPT001' }),
          expect.objectContaining({ code: 'DEPT002' })
        ]),
        count: 2
      });
    });

    it('debe aplicar filtros de query params', async () => {
      // Arrange
      const mockDepartments = [createMockDepartment()];
      mockDepartmentRepository.prototype.findAll = jest.fn().mockResolvedValue(mockDepartments);

      // Act
      const response = await request(app)
        .get('/api/departments')
        .query({
          status: 'available',
          city: 'Ciudad Test',
          minPrice: '1000',
          maxPrice: '2000'
        })
        .expect(200);

      // Assert
      expect(mockDepartmentRepository.prototype.findAll).toHaveBeenCalledWith({
        status: 'available',
        city: 'Ciudad Test',
        minPrice: 1000,
        maxPrice: 2000,
        bedrooms: undefined,
        hasParking: undefined,
        hasFurniture: undefined
      });
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/departments/:id', () => {
    it('debe obtener un departamento por ID', async () => {
      // Arrange
      const departmentId = 'dept-123';
      const mockDepartment = createMockDepartment({ _id: departmentId });

      mockDepartmentRepository.prototype.findById = jest.fn().mockResolvedValue(mockDepartment);

      // Act
      const response = await request(app)
        .get(`/api/departments/${departmentId}`)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({ _id: departmentId })
      });
    });

    it('debe retornar 404 si el departamento no existe', async () => {
      // Arrange
      const departmentId = 'non-existent';
      mockDepartmentRepository.prototype.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await request(app)
        .get(`/api/departments/${departmentId}`)
        .expect(404);
    });
  });

  describe('POST /api/departments', () => {
    it('debe crear un departamento correctamente', async () => {
      // Arrange
      const departmentData = {
        code: 'DEPT001',
        name: 'Departamento Test',
        description: 'Descripción de prueba',
        monthlyPrice: 1500,
        address: {
          street: 'Calle Principal',
          number: '123',
          city: 'Ciudad Test',
          postalCode: '12345'
        },
        features: {
          bedrooms: 2,
          bathrooms: 1,
          squareMeters: 80,
          hasParking: true,
          hasFurniture: false
        },
        inventory: []
      };

      const createdDepartment = createMockDepartment(departmentData);

      mockDepartmentRepository.prototype.findByCode = jest.fn().mockResolvedValue(null);
      mockDepartmentRepository.prototype.create = jest.fn().mockResolvedValue(createdDepartment);

      // Act
      const response = await request(app)
        .post('/api/departments')
        .send(departmentData)
        .expect(201);

      // Assert
      expect(response.body).toEqual({
        success: true,
        message: 'Departamento creado exitosamente',
        data: expect.objectContaining({
          code: departmentData.code,
          name: departmentData.name
        })
      });
    });

    it('debe retornar 409 si el código ya existe', async () => {
      // Arrange
      const departmentData = { code: 'DEPT001', name: 'Test' };
      const existingDepartment = createMockDepartment({ code: 'DEPT001' });

      mockDepartmentRepository.prototype.findByCode = jest.fn().mockResolvedValue(existingDepartment);

      // Act & Assert
      await request(app)
        .post('/api/departments')
        .send(departmentData)
        .expect(409);
    });
  });

  describe('PUT /api/departments/:id', () => {
    it('debe actualizar un departamento correctamente', async () => {
      // Arrange
      const departmentId = 'dept-123';
      const updateData = { name: 'Nuevo Nombre', monthlyPrice: 2000 };
      const existingDepartment = createMockDepartment({ _id: departmentId });
      const updatedDepartment = createMockDepartment({ _id: departmentId, ...updateData });

      mockDepartmentRepository.prototype.findById = jest.fn().mockResolvedValue(existingDepartment);
      mockDepartmentRepository.prototype.update = jest.fn().mockResolvedValue(updatedDepartment);

      // Act
      const response = await request(app)
        .put(`/api/departments/${departmentId}`)
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        message: 'Departamento actualizado exitosamente',
        data: expect.objectContaining(updateData)
      });
    });
  });

  describe('DELETE /api/departments/:id', () => {
    it('debe eliminar un departamento disponible', async () => {
      // Arrange
      const departmentId = 'dept-123';
      const department = createMockDepartment({ 
        _id: departmentId, 
        status: 'available',
        currentTenant: undefined
      });

      mockDepartmentRepository.prototype.findById = jest.fn().mockResolvedValue(department);
      mockDepartmentRepository.prototype.delete = jest.fn().mockResolvedValue(true);

      // Act
      const response = await request(app)
        .delete(`/api/departments/${departmentId}`)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        message: 'Departamento eliminado exitosamente'
      });
    });

    it('debe retornar 409 si el departamento está ocupado', async () => {
      // Arrange
      const departmentId = 'dept-123';
      const department = createMockDepartment({ 
        _id: departmentId, 
        status: 'occupied',
        currentTenant: 'tenant-123'
      });

      mockDepartmentRepository.prototype.findById = jest.fn().mockResolvedValue(department);

      // Act & Assert
      await request(app)
        .delete(`/api/departments/${departmentId}`)
        .expect(409);
    });
  });

  describe('POST /api/departments/:id/images', () => {
    it('debe subir imágenes correctamente', async () => {
      // Arrange
      const departmentId = 'dept-123';
      const department = createMockDepartment({ _id: departmentId });
      const updatedDepartment = createMockDepartment({
        _id: departmentId,
        images: ['image1.jpg', 'new-image.jpg']
      });

      mockDepartmentRepository.prototype.findById = jest.fn().mockResolvedValue(department);
      mockDepartmentRepository.prototype.update = jest.fn().mockResolvedValue(updatedDepartment);

      // Mock CloudinaryService
      const { CloudinaryService } = await import('../../../src/infrastructure/services/CloudinaryService');
      (CloudinaryService as any).prototype.uploadImages = jest.fn().mockResolvedValue(['new-image.jpg']);

      // Act
      const response = await request(app)
        .post(`/api/departments/${departmentId}/images`)
        .attach('images', Buffer.from('fake-image-data'), 'test.jpg')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        message: 'Imágenes subidas exitosamente',
        data: expect.objectContaining({
          images: expect.arrayContaining(['new-image.jpg'])
        })
      });
    });
  });

  describe('DELETE /api/departments/:id/images', () => {
    it('debe eliminar una imagen correctamente', async () => {
      // Arrange
      const departmentId = 'dept-123';
      const imageUrl = 'https://example.com/image.jpg';
      const department = createMockDepartment({
        _id: departmentId,
        images: ['image1.jpg', imageUrl]
      });
      const updatedDepartment = createMockDepartment({
        _id: departmentId,
        images: ['image1.jpg']
      });

      mockDepartmentRepository.prototype.findById = jest.fn().mockResolvedValue(department);
      mockDepartmentRepository.prototype.update = jest.fn().mockResolvedValue(updatedDepartment);

      // Mock CloudinaryService
      const { CloudinaryService } = await import('../../../src/infrastructure/services/CloudinaryService');
      (CloudinaryService as any).prototype.deleteImage = jest.fn().mockResolvedValue(true);

      // Act
      const response = await request(app)
        .delete(`/api/departments/${departmentId}/images`)
        .send({ imageUrl })
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        message: 'Imagen eliminada exitosamente',
        data: expect.objectContaining({
          images: ['image1.jpg']
        })
      });
    });
  });
});