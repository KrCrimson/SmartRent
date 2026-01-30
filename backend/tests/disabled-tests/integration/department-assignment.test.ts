import request from 'supertest';
import { app } from '../../../src/app';
import { connectDB, disconnectDB } from '../../../src/infrastructure/database/connection';
import { UserModel } from '../../../src/infrastructure/models/User.model';
import { DepartmentModel } from '../../../src/infrastructure/models/Department.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

describe('Department Assignment Endpoints', () => {
  let adminToken: string;
  let userToken: string;
  let testUserId: string;
  let testDepartmentId: string;

  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    // Limpiar datos
    await UserModel.deleteMany({});
    await DepartmentModel.deleteMany({});

    // Crear departamento de prueba
    const department = new DepartmentModel({
      code: 'DEPT001',
      description: 'Department Test',
      surface: 50,
      rooms: 2,
      bathrooms: 1,
      floor: 1,
      monthlyRent: 1000,
      status: 'available'
    });
    const savedDepartment = await department.save();
    testDepartmentId = savedDepartment._id.toString();

    // Crear admin
    const hashedAdminPassword = await bcrypt.hash('Admin123!', 10);
    const adminUser = new UserModel({
      email: 'admin@test.com',
      password: hashedAdminPassword,
      role: 'admin',
      fullName: 'Admin User',
      phone: '+1234567890'
    });
    const savedAdmin = await adminUser.save();
    adminToken = jwt.sign(
      { userId: savedAdmin._id, role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Crear usuario normal
    const hashedUserPassword = await bcrypt.hash('User123!', 10);
    const normalUser = new UserModel({
      email: 'user@test.com',
      password: hashedUserPassword,
      role: 'user',
      fullName: 'Normal User',
      phone: '+0987654321'
    });
    const savedUser = await normalUser.save();
    testUserId = savedUser._id.toString();
    userToken = jwt.sign(
      { userId: savedUser._id, role: 'user' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('POST /api/users/:userId/department/assign', () => {
    it('debe asignar departamento a usuario (admin)', async () => {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0); // Normalizar tiempo
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      endDate.setHours(0, 0, 0, 0);

      const response = await request(app)
        .post(`/api/users/${testUserId}/department/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          departmentId: testDepartmentId,
          contractStartDate: startDate.toISOString(),
          contractEndDate: endDate.toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: testUserId,
          assignedDepartmentId: testDepartmentId,
          contractStartDate: startDate.toISOString(),
          contractEndDate: endDate.toISOString()
        }
      });

      // Verificar que el departamento cambió de estado
      const updatedDepartment = await DepartmentModel.findById(testDepartmentId);
      expect(updatedDepartment?.status).toBe('occupied');
    });

    it('debe fallar si no es admin', async () => {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      const response = await request(app)
        .post(`/api/users/${testUserId}/department/assign`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          departmentId: testDepartmentId,
          contractStartDate: startDate.toISOString(),
          contractEndDate: endDate.toISOString()
        });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    });

    it('debe fallar sin token de autenticación', async () => {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      const response = await request(app)
        .post(`/api/users/${testUserId}/department/assign`)
        .send({
          departmentId: testDepartmentId,
          contractStartDate: startDate.toISOString(),
          contractEndDate: endDate.toISOString()
        });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Token de acceso requerido'
      });
    });

    it('debe fallar con usuario inexistente', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      const startDate = new Date();
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      const response = await request(app)
        .post(`/api/users/${fakeUserId}/department/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          departmentId: testDepartmentId,
          contractStartDate: startDate.toISOString(),
          contractEndDate: endDate.toISOString()
        });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Usuario no encontrado'
      });
    });

    it('debe fallar con departamento inexistente', async () => {
      const fakeDepartmentId = '507f1f77bcf86cd799439011';
      const startDate = new Date();
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      const response = await request(app)
        .post(`/api/users/${testUserId}/department/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          departmentId: fakeDepartmentId,
          contractStartDate: startDate.toISOString(),
          contractEndDate: endDate.toISOString()
        });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Departamento no encontrado'
      });
    });

    it('debe fallar con datos de entrada inválidos', async () => {
      const response = await request(app)
        .post(`/api/users/${testUserId}/department/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          departmentId: 'invalid-id',
          contractStartDate: 'invalid-date',
          contractEndDate: 'invalid-date'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debe fallar si el usuario ya tiene departamento asignado', async () => {
      // Primero asignar departamento
      const startDate = new Date();
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      await request(app)
        .post(`/api/users/${testUserId}/department/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          departmentId: testDepartmentId,
          contractStartDate: startDate.toISOString(),
          contractEndDate: endDate.toISOString()
        });

      // Intentar asignar otro departamento
      const secondDepartment = new DepartmentModel({
        code: 'DEPT002',
        description: 'Second Department',
        surface: 60,
        rooms: 3,
        bathrooms: 2,
        floor: 2,
        monthlyRent: 1200,
        status: 'available'
      });
      const savedSecondDept = await secondDepartment.save();

      const response = await request(app)
        .post(`/api/users/${testUserId}/department/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          departmentId: savedSecondDept._id.toString(),
          contractStartDate: startDate.toISOString(),
          contractEndDate: endDate.toISOString()
        });

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        success: false,
        message: 'El usuario ya tiene un departamento asignado'
      });
    });

    it('debe fallar con fechas de contrato inválidas', async () => {
      const startDate = new Date();
      const endDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Ayer

      const response = await request(app)
        .post(`/api/users/${testUserId}/department/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          departmentId: testDepartmentId,
          contractStartDate: startDate.toISOString(),
          contractEndDate: endDate.toISOString()
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debe fallar si el contrato es menor a 1 mes', async () => {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 días

      const response = await request(app)
        .post(`/api/users/${testUserId}/department/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          departmentId: testDepartmentId,
          contractStartDate: startDate.toISOString(),
          contractEndDate: endDate.toISOString()
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:userId/department/unassign', () => {
    beforeEach(async () => {
      // Asignar departamento al usuario para poder desasignar
      const startDate = new Date();
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      await request(app)
        .post(`/api/users/${testUserId}/department/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          departmentId: testDepartmentId,
          contractStartDate: startDate.toISOString(),
          contractEndDate: endDate.toISOString()
        });
    });

    it('debe desasignar departamento correctamente (admin)', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId}/department/unassign`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: testUserId,
          assignedDepartmentId: null,
          contractStartDate: null,
          contractEndDate: null
        }
      });

      // Verificar que el departamento cambió de estado
      const updatedDepartment = await DepartmentModel.findById(testDepartmentId);
      expect(updatedDepartment?.status).toBe('available');
    });

    it('debe fallar si no es admin', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId}/department/unassign`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    });

    it('debe fallar sin token de autenticación', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId}/department/unassign`);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Token de acceso requerido'
      });
    });

    it('debe fallar con usuario inexistente', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/users/${fakeUserId}/department/unassign`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Usuario no encontrado'
      });
    });

    it('debe fallar si el usuario no tiene departamento asignado', async () => {
      // Primero desasignar
      await request(app)
        .delete(`/api/users/${testUserId}/department/unassign`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Intentar desasignar nuevamente
      const response = await request(app)
        .delete(`/api/users/${testUserId}/department/unassign`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        success: false,
        message: 'El usuario no tiene departamento asignado'
      });
    });
  });

  describe('GET /api/users/:userId/department', () => {
    beforeEach(async () => {
      // Asignar departamento al usuario
      const startDate = new Date();
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      await request(app)
        .post(`/api/users/${testUserId}/department/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          departmentId: testDepartmentId,
          contractStartDate: startDate.toISOString(),
          contractEndDate: endDate.toISOString()
        });
    });

    it('debe obtener departamento asignado (admin)', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}/department`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            id: testUserId,
            assignedDepartmentId: testDepartmentId
          },
          department: {
            id: testDepartmentId,
            code: 'DEPT001',
            status: 'occupied'
          }
        }
      });
    });

    it('debe obtener su propio departamento (usuario)', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}/department`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(testUserId);
    });

    it('debe fallar al intentar ver departamento de otro usuario', async () => {
      // Crear otro usuario
      const hashedPassword = await bcrypt.hash('User2123!', 10);
      const otherUser = new UserModel({
        email: 'user2@test.com',
        password: hashedPassword,
        role: 'user',
        fullName: 'Other User',
        phone: '+1111111111'
      });
      const savedOtherUser = await otherUser.save();

      const response = await request(app)
        .get(`/api/users/${savedOtherUser._id.toString()}/department`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        success: false,
        message: 'No tienes permisos para ver esta información'
      });
    });

    it('debe fallar sin token de autenticación', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}/department`);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Token de acceso requerido'
      });
    });

    it('debe retornar información vacía si el usuario no tiene departamento', async () => {
      // Desasignar departamento
      await request(app)
        .delete(`/api/users/${testUserId}/department/unassign`)
        .set('Authorization', `Bearer ${adminToken}`);

      const response = await request(app)
        .get(`/api/users/${testUserId}/department`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            id: testUserId,
            assignedDepartmentId: null
          },
          department: null
        }
      });
    });
  });

  describe('GET /api/departments/:departmentId/user', () => {
    beforeEach(async () => {
      // Asignar departamento al usuario
      const startDate = new Date();
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      await request(app)
        .post(`/api/users/${testUserId}/department/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          departmentId: testDepartmentId,
          contractStartDate: startDate.toISOString(),
          contractEndDate: endDate.toISOString()
        });
    });

    it('debe obtener usuario asignado al departamento (admin)', async () => {
      const response = await request(app)
        .get(`/api/departments/${testDepartmentId}/user`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          department: {
            id: testDepartmentId,
            code: 'DEPT001'
          },
          user: {
            id: testUserId,
            email: 'user@test.com'
          }
        }
      });
    });

    it('debe fallar si no es admin', async () => {
      const response = await request(app)
        .get(`/api/departments/${testDepartmentId}/user`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    });

    it('debe retornar información vacía si el departamento está disponible', async () => {
      // Desasignar departamento
      await request(app)
        .delete(`/api/users/${testUserId}/department/unassign`)
        .set('Authorization', `Bearer ${adminToken}`);

      const response = await request(app)
        .get(`/api/departments/${testDepartmentId}/user`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          department: {
            id: testDepartmentId,
            status: 'available'
          },
          user: null
        }
      });
    });
  });
});