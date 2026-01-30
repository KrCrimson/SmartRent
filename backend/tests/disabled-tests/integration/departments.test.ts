import request from 'supertest';
import app from '../../../src/app';
import { UserRepository } from '../../../src/infrastructure/repositories/UserRepository';
import { DepartmentRepository } from '../../../src/infrastructure/repositories/DepartmentRepository';
import { User } from '../../../src/domain/entities/User.entity';
import { Department } from '../../../src/domain/entities/Department';

describe('Department Endpoints', () => {
  const userRepository = new UserRepository();
  const departmentRepository = new DepartmentRepository();
  let adminToken: string;
  let userToken: string;
  let testDepartment: Department;

  beforeEach(async () => {
    // Crear usuario admin de prueba
    const adminUser = await userRepository.create({
      email: 'admin@test.com',
      password: 'Admin123!',
      role: 'admin',
      fullName: 'Admin Test',
      phone: '+1234567890'
    });

    // Crear usuario regular de prueba
    const regularUser = await userRepository.create({
      email: 'user@test.com',
      password: 'User123!',
      role: 'user',
      fullName: 'User Test',
      phone: '+1987654321'
    });

    // Obtener tokens
    const adminLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Admin123!'
      });

    const userLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'user@test.com',
        password: 'User123!'
      });

    adminToken = adminLoginResponse.body.data.accessToken;
    userToken = userLoginResponse.body.data.accessToken;

    // Crear departamento de prueba
    testDepartment = await departmentRepository.create({
      code: 'TEST001',
      name: 'Departamento Test',
      description: 'Departamento de prueba',
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
      isActive: true
    });
  });

  describe('POST /api/v1/departments', () => {
    it('debe crear departamento con admin autenticado', async () => {
      const newDepartment = {
        code: 'NEW001',
        name: 'Nuevo Departamento',
        description: 'Departamento nuevo',
        monthlyPrice: 2000,
        address: {
          street: 'Nueva Calle',
          number: '456',
          city: 'Nueva Ciudad',
          postalCode: '54321'
        },
        features: {
          bedrooms: 3,
          bathrooms: 2,
          squareMeters: 120,
          hasParking: true,
          hasFurniture: true
        },
        inventory: [
          {
            category: 'Muebles',
            item: 'Sofá',
            quantity: 1,
            condition: 'new'
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newDepartment);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe(newDepartment.code);
      expect(response.body.data.name).toBe(newDepartment.name);
      expect(response.body.data.status).toBe('available');
    });

    it('debe fallar sin autenticación', async () => {
      const newDepartment = {
        code: 'FAIL001',
        name: 'Departamento sin auth',
        description: 'Este debe fallar',
        monthlyPrice: 1000,
        address: {
          street: 'Calle Fail',
          number: '999',
          city: 'Ciudad Fail',
          postalCode: '99999'
        },
        features: {
          bedrooms: 1,
          bathrooms: 1,
          squareMeters: 50,
          hasParking: false,
          hasFurniture: false
        },
        inventory: []
      };

      const response = await request(app)
        .post('/api/v1/departments')
        .send(newDepartment);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('debe fallar con usuario no admin', async () => {
      const newDepartment = {
        code: 'FAIL002',
        name: 'Departamento user role',
        description: 'Este debe fallar',
        monthlyPrice: 1000,
        address: {
          street: 'Calle Fail',
          number: '999',
          city: 'Ciudad Fail',
          postalCode: '99999'
        },
        features: {
          bedrooms: 1,
          bathrooms: 1,
          squareMeters: 50,
          hasParking: false,
          hasFurniture: false
        },
        inventory: []
      };

      const response = await request(app)
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newDepartment);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('debe validar campos requeridos', async () => {
      const invalidDepartment = {
        // Falta code
        name: 'Departamento inválido',
        description: 'Falta información'
        // Falta address, features, etc.
      };

      const response = await request(app)
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidDepartment);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/v1/departments', () => {
    it('debe retornar lista de departamentos públicamente', async () => {
      const response = await request(app)
        .get('/api/v1/departments');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('debe aplicar filtros correctamente', async () => {
      const response = await request(app)
        .get('/api/v1/departments')
        .query({
          status: 'available',
          minPrice: 1000,
          maxPrice: 2000,
          bedrooms: 2
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verificar que los departamentos retornados cumplan los filtros
      const departments = response.body.data;
      departments.forEach((dept: any) => {
        expect(dept.status).toBe('available');
        expect(dept.monthlyPrice).toBeGreaterThanOrEqual(1000);
        expect(dept.monthlyPrice).toBeLessThanOrEqual(2000);
        expect(dept.features.bedrooms).toBe(2);
      });
    });
  });

  describe('GET /api/v1/departments/:id', () => {
    it('debe retornar departamento por ID', async () => {
      const response = await request(app)
        .get(`/api/v1/departments/${testDepartment._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testDepartment._id);
      expect(response.body.data.code).toBe(testDepartment.code);
    });

    it('debe retornar 404 para departamento no existente', async () => {
      const nonexistentId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/v1/departments/${nonexistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('debe validar formato de ID', async () => {
      const invalidId = 'invalid-id';
      
      const response = await request(app)
        .get(`/api/v1/departments/${invalidId}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/departments/:id', () => {
    it('debe actualizar departamento con admin autenticado', async () => {
      const updateData = {
        name: 'Departamento Actualizado',
        monthlyPrice: 1800,
        description: 'Descripción actualizada'
      };

      const response = await request(app)
        .put(`/api/v1/departments/${testDepartment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.monthlyPrice).toBe(updateData.monthlyPrice);
    });

    it('debe fallar sin autorización admin', async () => {
      const updateData = {
        name: 'Intento de actualización',
        monthlyPrice: 1800
      };

      const response = await request(app)
        .put(`/api/v1/departments/${testDepartment._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/departments/:id', () => {
    it('debe eliminar departamento con admin autenticado', async () => {
      // Crear departamento específico para eliminar
      const departmentToDelete = await departmentRepository.create({
        code: 'DELETE001',
        name: 'Departamento a Eliminar',
        description: 'Para eliminar',
        status: 'available',
        monthlyPrice: 1000,
        images: [],
        address: {
          street: 'Calle Eliminar',
          number: '999',
          city: 'Ciudad Eliminar',
          postalCode: '99999'
        },
        features: {
          bedrooms: 1,
          bathrooms: 1,
          squareMeters: 50,
          hasParking: false,
          hasFurniture: false
        },
        inventory: [],
        isActive: true
      });

      const response = await request(app)
        .delete(`/api/v1/departments/${departmentToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('eliminado');
    });

    it('debe fallar al eliminar departamento ocupado', async () => {
      // Crear departamento ocupado
      const occupiedDepartment = await departmentRepository.create({
        code: 'OCCUPIED001',
        name: 'Departamento Ocupado',
        description: 'Departamento con inquilino',
        status: 'occupied',
        monthlyPrice: 1500,
        images: [],
        address: {
          street: 'Calle Ocupada',
          number: '123',
          city: 'Ciudad Ocupada',
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
        isActive: true
      });

      const response = await request(app)
        .delete(`/api/v1/departments/${occupiedDepartment._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('ocupado');
    });
  });

  describe('GET /api/v1/departments/available', () => {
    it('debe retornar solo departamentos disponibles', async () => {
      const response = await request(app)
        .get('/api/v1/departments/available');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Todos los departamentos retornados deben estar disponibles
      const departments = response.body.data;
      departments.forEach((dept: any) => {
        expect(dept.status).toBe('available');
      });
    });
  });
});