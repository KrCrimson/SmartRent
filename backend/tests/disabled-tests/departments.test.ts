import { CreateDepartmentUseCase } from '../../../src/application/use-cases/departments/CreateDepartmentUseCase';
import { GetDepartmentsUseCase } from '../../../src/application/use-cases/departments/GetDepartmentsUseCase';
import { GetDepartmentByIdUseCase } from '../../../src/application/use-cases/departments/GetDepartmentByIdUseCase';
import { UpdateDepartmentUseCase } from '../../../src/application/use-cases/departments/UpdateDepartmentUseCase';
import { DeleteDepartmentUseCase } from '../../../src/application/use-cases/departments/DeleteDepartmentUseCase';
import { DepartmentRepository } from '../../../src/infrastructure/repositories/DepartmentRepository';
import { CloudinaryImageService } from '../../../src/infrastructure/services/CloudinaryImageService';
import { Department } from '../../../src/domain/entities/Department';

describe('Department Use Cases', () => {
  let departmentRepository: DepartmentRepository;
  let imageService: CloudinaryImageService;
  let createDepartmentUseCase: CreateDepartmentUseCase;
  let getDepartmentsUseCase: GetDepartmentsUseCase;
  let getDepartmentByIdUseCase: GetDepartmentByIdUseCase;
  let updateDepartmentUseCase: UpdateDepartmentUseCase;
  let deleteDepartmentUseCase: DeleteDepartmentUseCase;

  beforeEach(() => {
    departmentRepository = new DepartmentRepository();
    imageService = new CloudinaryImageService();
    createDepartmentUseCase = new CreateDepartmentUseCase(departmentRepository, imageService);
    getDepartmentsUseCase = new GetDepartmentsUseCase(departmentRepository);
    getDepartmentByIdUseCase = new GetDepartmentByIdUseCase(departmentRepository);
    updateDepartmentUseCase = new UpdateDepartmentUseCase(departmentRepository, imageService);
    deleteDepartmentUseCase = new DeleteDepartmentUseCase(departmentRepository, imageService);
  });

  describe('CreateDepartmentUseCase', () => {
    it('debe crear un departamento con datos válidos', async () => {
      // Arrange
      const departmentData = {
        code: 'DEPT001',
        name: 'Departamento Test',
        description: 'Departamento de prueba',
        monthlyPrice: 1500,
        images: ['image1.jpg', 'image2.jpg'],
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
        inventory: [
          {
            category: 'Electrodomésticos',
            item: 'Refrigeradora',
            quantity: 1,
            condition: 'good' as const
          }
        ]
      };

      const mockDepartment: Department = {
        _id: 'dept123',
        ...departmentData,
        status: 'available',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(departmentRepository, 'create').mockResolvedValue(mockDepartment);
      jest.spyOn(departmentRepository, 'findByCode').mockResolvedValue(null);

      // Act
      const result = await createDepartmentUseCase.execute(departmentData);

      // Assert
      expect(result).toBeDefined();
      expect(result.code).toBe(departmentData.code);
      expect(result.name).toBe(departmentData.name);
      expect(result.status).toBe('available');
      expect(departmentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: departmentData.code,
          name: departmentData.name
        })
      );
    });

    it('debe fallar si el código de departamento ya existe', async () => {
      // Arrange
      const existingDepartment: Department = {
        _id: 'existing123',
        code: 'DEPT001',
        name: 'Existing Department',
        description: 'Existing description',
        status: 'available',
        monthlyPrice: 1000,
        images: [],
        address: {
          street: 'Existing Street',
          number: '456',
          city: 'Existing City',
          postalCode: '54321'
        },
        features: {
          bedrooms: 1,
          bathrooms: 1,
          squareMeters: 50,
          hasParking: false,
          hasFurniture: false
        },
        inventory: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(departmentRepository, 'findByCode').mockResolvedValue(existingDepartment);

      const departmentData = {
        code: 'DEPT001', // Código duplicado
        name: 'New Department',
        description: 'New description',
        monthlyPrice: 1500,
        images: [],
        address: {
          street: 'New Street',
          number: '789',
          city: 'New City',
          postalCode: '98765'
        },
        features: {
          bedrooms: 2,
          bathrooms: 1,
          squareMeters: 70,
          hasParking: true,
          hasFurniture: false
        },
        inventory: []
      };

      // Act & Assert
      await expect(createDepartmentUseCase.execute(departmentData))
        .rejects.toThrow('El código de departamento ya existe');
    });
  });

  describe('GetDepartmentsUseCase', () => {
    it('debe retornar lista de departamentos con filtros', async () => {
      // Arrange
      const mockDepartments: Department[] = [
        {
          _id: 'dept1',
          code: 'DEPT001',
          name: 'Departamento 1',
          description: 'Descripción 1',
          status: 'available',
          monthlyPrice: 1500,
          images: [],
          address: {
            street: 'Calle 1',
            number: '123',
            city: 'Ciudad 1',
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
          updatedAt: new Date()
        }
      ];

      jest.spyOn(departmentRepository, 'findAll').mockResolvedValue(mockDepartments);

      const filters = {
        status: 'available' as const,
        minPrice: 1000,
        maxPrice: 2000
      };

      // Act
      const result = await getDepartmentsUseCase.execute(filters);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].code).toBe('DEPT001');
      expect(departmentRepository.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('GetDepartmentByIdUseCase', () => {
    it('debe retornar departamento por ID', async () => {
      // Arrange
      const departmentId = 'dept123';
      const mockDepartment: Department = {
        _id: departmentId,
        code: 'DEPT001',
        name: 'Departamento Test',
        description: 'Descripción test',
        status: 'available',
        monthlyPrice: 1500,
        images: [],
        address: {
          street: 'Calle Test',
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
        inventory: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(departmentRepository, 'findById').mockResolvedValue(mockDepartment);

      // Act
      const result = await getDepartmentByIdUseCase.execute(departmentId);

      // Assert
      expect(result).toBeDefined();
      expect(result?._id).toBe(departmentId);
      expect(result?.code).toBe('DEPT001');
    });

    it('debe retornar null si no encuentra departamento', async () => {
      // Arrange
      const departmentId = 'nonexistent';
      jest.spyOn(departmentRepository, 'findById').mockResolvedValue(null);

      // Act
      const result = await getDepartmentByIdUseCase.execute(departmentId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('UpdateDepartmentUseCase', () => {
    it('debe actualizar departamento correctamente', async () => {
      // Arrange
      const departmentId = 'dept123';
      const updateData = {
        name: 'Departamento Actualizado',
        monthlyPrice: 1800
      };

      const updatedDepartment: Department = {
        _id: departmentId,
        code: 'DEPT001',
        name: updateData.name,
        description: 'Descripción original',
        status: 'available',
        monthlyPrice: updateData.monthlyPrice,
        images: [],
        address: {
          street: 'Calle Original',
          number: '123',
          city: 'Ciudad Original',
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
        updatedAt: new Date()
      };

      jest.spyOn(departmentRepository, 'update').mockResolvedValue(updatedDepartment);

      // Act
      const result = await updateDepartmentUseCase.execute(departmentId, updateData);

      // Assert
      expect(result).toBeDefined();
      expect(result?.name).toBe(updateData.name);
      expect(result?.monthlyPrice).toBe(updateData.monthlyPrice);
    });
  });

  describe('DeleteDepartmentUseCase', () => {
    it('debe eliminar departamento correctamente', async () => {
      // Arrange
      const departmentId = 'dept123';
      const mockDepartment: Department = {
        _id: departmentId,
        code: 'DEPT001',
        name: 'Departamento a eliminar',
        description: 'Descripción',
        status: 'available',
        monthlyPrice: 1500,
        images: ['image1.jpg'],
        address: {
          street: 'Calle',
          number: '123',
          city: 'Ciudad',
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
        updatedAt: new Date()
      };

      jest.spyOn(departmentRepository, 'findById').mockResolvedValue(mockDepartment);
      jest.spyOn(departmentRepository, 'delete').mockResolvedValue(true);
      jest.spyOn(imageService, 'deleteImages').mockResolvedValue();

      // Act
      const result = await deleteDepartmentUseCase.execute(departmentId);

      // Assert
      expect(result).toBe(true);
      expect(departmentRepository.delete).toHaveBeenCalledWith(departmentId);
      expect(imageService.deleteImages).toHaveBeenCalledWith(['image1.jpg']);
    });

    it('debe fallar si departamento está ocupado', async () => {
      // Arrange
      const departmentId = 'dept123';
      const mockDepartment: Department = {
        _id: departmentId,
        code: 'DEPT001',
        name: 'Departamento ocupado',
        description: 'Descripción',
        status: 'occupied', // Departamento ocupado
        monthlyPrice: 1500,
        images: [],
        address: {
          street: 'Calle',
          number: '123',
          city: 'Ciudad',
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
        currentTenant: 'tenant123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(departmentRepository, 'findById').mockResolvedValue(mockDepartment);

      // Act & Assert
      await expect(deleteDepartmentUseCase.execute(departmentId))
        .rejects.toThrow('No se puede eliminar un departamento que está ocupado');
    });
  });
});