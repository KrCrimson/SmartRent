import request from 'supertest';
import { app } from '../../../src/app';
import { connectDB, disconnectDB } from '../../../src/infrastructure/database/connection';
import { AlertModel } from '../../../src/infrastructure/models/Alert.model';
import { UserModel } from '../../../src/infrastructure/models/User.model';
import { DepartmentModel } from '../../../src/infrastructure/models/Department.model';
import { AlertType, AlertPriority, AlertStatus } from '../../../src/domain/entities/Alert.entity';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

describe('Alert Endpoints', () => {
  let adminToken: string;
  let userToken: string;
  let testUserId: string;
  let testDepartmentId: string;

  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    // Limpiar datos
    await AlertModel.deleteMany({});
    await UserModel.deleteMany({});
    await DepartmentModel.deleteMany({});

    // Crear departamento de prueba
    const department = new DepartmentModel({
      code: 'DEPT001',
      description: 'Test Department',
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
      phone: '+0987654321',
      assignedDepartmentId: testDepartmentId,
      contractStartDate: new Date(),
      contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
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

  describe('POST /api/alerts', () => {
    it('debe crear alerta con datos válidos (usuario)', async () => {
      const alertData = {
        title: 'Problema con calefacción',
        description: 'La calefacción del departamento no funciona correctamente',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.HIGH
      };

      const response = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${userToken}`)
        .send(alertData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          title: alertData.title,
          description: alertData.description,
          type: alertData.type,
          priority: alertData.priority,
          status: AlertStatus.PENDING,
          departmentId: testDepartmentId,
          userId: testUserId
        }
      });
    });

    it('debe crear alerta de emergencia con prioridad crítica automática', async () => {
      const alertData = {
        title: 'Fuga de gas detectada',
        description: 'Se detectó olor a gas en la cocina del departamento',
        type: AlertType.EMERGENCY,
        priority: AlertPriority.LOW // Será sobrescrito a CRITICAL
      };

      const response = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${userToken}`)
        .send(alertData);

      expect(response.status).toBe(201);
      expect(response.body.data.priority).toBe(AlertPriority.CRITICAL);
    });

    it('debe fallar sin token de autenticación', async () => {
      const alertData = {
        title: 'Problema con calefacción',
        description: 'La calefacción del departamento no funciona correctamente',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.HIGH
      };

      const response = await request(app)
        .post('/api/alerts')
        .send(alertData);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Token de acceso requerido'
      });
    });

    it('debe fallar con datos inválidos', async () => {
      const alertData = {
        title: '', // Título vacío
        description: 'Desc', // Descripción muy corta
        type: 'INVALID_TYPE',
        priority: 'INVALID_PRIORITY'
      };

      const response = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${userToken}`)
        .send(alertData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debe fallar si el usuario no tiene departamento asignado', async () => {
      // Crear usuario sin departamento asignado
      const hashedPassword = await bcrypt.hash('NoDepart123!', 10);
      const userWithoutDept = new UserModel({
        email: 'nodept@test.com',
        password: hashedPassword,
        role: 'user',
        fullName: 'User Without Department',
        phone: '+1111111111'
      });
      const savedUserNoDept = await userWithoutDept.save();
      
      const noDeptToken = jwt.sign(
        { userId: savedUserNoDept._id, role: 'user' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const alertData = {
        title: 'Problema general',
        description: 'Descripción del problema general',
        type: AlertType.GENERAL,
        priority: AlertPriority.MEDIUM
      };

      const response = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${noDeptToken}`)
        .send(alertData);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Usuario debe tener un departamento asignado para crear alertas'
      });
    });

    it('debe permitir a admin crear alertas para cualquier departamento', async () => {
      const alertData = {
        title: 'Inspección programada',
        description: 'Inspección de mantenimiento programada para el departamento',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        departmentId: testDepartmentId
      };

      const response = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(alertData);

      expect(response.status).toBe(201);
      expect(response.body.data.departmentId).toBe(testDepartmentId);
    });
  });

  describe('GET /api/alerts', () => {
    beforeEach(async () => {
      // Crear alertas de prueba
      const alerts = [
        new AlertModel({
          title: 'Alerta de mantenimiento',
          description: 'Descripción de alerta de mantenimiento',
          type: AlertType.MAINTENANCE,
          priority: AlertPriority.MEDIUM,
          status: AlertStatus.PENDING,
          departmentId: testDepartmentId,
          userId: testUserId,
          createdAt: new Date()
        }),
        new AlertModel({
          title: 'Alerta de seguridad',
          description: 'Descripción de alerta de seguridad',
          type: AlertType.SECURITY,
          priority: AlertPriority.HIGH,
          status: AlertStatus.IN_PROGRESS,
          departmentId: testDepartmentId,
          userId: testUserId,
          createdAt: new Date()
        }),
        new AlertModel({
          title: 'Emergencia resuelta',
          description: 'Descripción de emergencia ya resuelta',
          type: AlertType.EMERGENCY,
          priority: AlertPriority.CRITICAL,
          status: AlertStatus.RESOLVED,
          departmentId: testDepartmentId,
          userId: testUserId,
          createdAt: new Date(),
          resolvedAt: new Date(),
          resolutionNotes: 'Emergencia resuelta exitosamente'
        })
      ];

      await AlertModel.insertMany(alerts);
    });

    it('debe obtener todas las alertas (admin)', async () => {
      const response = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });

    it('debe obtener solo alertas del departamento del usuario (usuario)', async () => {
      const response = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      response.body.data.forEach((alert: any) => {
        expect(alert.departmentId).toBe(testDepartmentId);
      });
    });

    it('debe filtrar alertas por estado', async () => {
      const response = await request(app)
        .get('/api/alerts?status=PENDING')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe(AlertStatus.PENDING);
    });

    it('debe filtrar alertas por tipo', async () => {
      const response = await request(app)
        .get(`/api/alerts?type=${AlertType.EMERGENCY}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe(AlertType.EMERGENCY);
    });

    it('debe filtrar alertas por prioridad', async () => {
      const response = await request(app)
        .get(`/api/alerts?priority=${AlertPriority.CRITICAL}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].priority).toBe(AlertPriority.CRITICAL);
    });

    it('debe filtrar alertas por departamento (admin)', async () => {
      const response = await request(app)
        .get(`/api/alerts?departmentId=${testDepartmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
    });

    it('debe fallar sin token de autenticación', async () => {
      const response = await request(app)
        .get('/api/alerts');

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Token de acceso requerido'
      });
    });

    it('debe ordenar alertas por prioridad y fecha de creación', async () => {
      const response = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const alerts = response.body.data;
      
      // Verificar que las alertas críticas aparecen primero
      const criticalIndex = alerts.findIndex((a: any) => a.priority === AlertPriority.CRITICAL);
      const highIndex = alerts.findIndex((a: any) => a.priority === AlertPriority.HIGH);
      const mediumIndex = alerts.findIndex((a: any) => a.priority === AlertPriority.MEDIUM);

      expect(criticalIndex).toBeLessThan(highIndex);
      expect(highIndex).toBeLessThan(mediumIndex);
    });
  });

  describe('GET /api/alerts/:id', () => {
    let testAlertId: string;

    beforeEach(async () => {
      const alert = new AlertModel({
        title: 'Alerta específica',
        description: 'Descripción de alerta específica',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        status: AlertStatus.PENDING,
        departmentId: testDepartmentId,
        userId: testUserId,
        createdAt: new Date()
      });
      const savedAlert = await alert.save();
      testAlertId = savedAlert._id.toString();
    });

    it('debe obtener alerta específica (admin)', async () => {
      const response = await request(app)
        .get(`/api/alerts/${testAlertId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: testAlertId,
          title: 'Alerta específica'
        }
      });
    });

    it('debe obtener su propia alerta (usuario)', async () => {
      const response = await request(app)
        .get(`/api/alerts/${testAlertId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(testAlertId);
    });

    it('debe fallar con ID de alerta inválido', async () => {
      const response = await request(app)
        .get('/api/alerts/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debe fallar con alerta inexistente', async () => {
      const fakeAlertId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/alerts/${fakeAlertId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Alerta no encontrada'
      });
    });
  });

  describe('PUT /api/alerts/:id/status', () => {
    let testAlertId: string;

    beforeEach(async () => {
      const alert = new AlertModel({
        title: 'Alerta para actualizar',
        description: 'Descripción de alerta para actualizar estado',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        status: AlertStatus.PENDING,
        departmentId: testDepartmentId,
        userId: testUserId,
        createdAt: new Date()
      });
      const savedAlert = await alert.save();
      testAlertId = savedAlert._id.toString();
    });

    it('debe actualizar estado de alerta a IN_PROGRESS (admin)', async () => {
      const response = await request(app)
        .put(`/api/alerts/${testAlertId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: AlertStatus.IN_PROGRESS
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: testAlertId,
          status: AlertStatus.IN_PROGRESS
        }
      });
    });

    it('debe actualizar estado de alerta a RESOLVED con notas (admin)', async () => {
      // Primero cambiar a IN_PROGRESS
      await request(app)
        .put(`/api/alerts/${testAlertId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: AlertStatus.IN_PROGRESS
        });

      // Luego resolver
      const response = await request(app)
        .put(`/api/alerts/${testAlertId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: AlertStatus.RESOLVED,
          resolutionNotes: 'Problema resuelto exitosamente'
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: testAlertId,
          status: AlertStatus.RESOLVED,
          resolutionNotes: 'Problema resuelto exitosamente'
        }
      });
    });

    it('debe fallar si no es admin', async () => {
      const response = await request(app)
        .put(`/api/alerts/${testAlertId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: AlertStatus.IN_PROGRESS
        });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    });

    it('debe fallar sin token de autenticación', async () => {
      const response = await request(app)
        .put(`/api/alerts/${testAlertId}/status`)
        .send({
          status: AlertStatus.IN_PROGRESS
        });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Token de acceso requerido'
      });
    });

    it('debe fallar con transición de estado inválida', async () => {
      // Crear alerta ya resuelta
      await AlertModel.findByIdAndUpdate(testAlertId, {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date(),
        resolutionNotes: 'Ya resuelta'
      });

      const response = await request(app)
        .put(`/api/alerts/${testAlertId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: AlertStatus.PENDING
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('debe fallar al resolver sin notas de resolución', async () => {
      const response = await request(app)
        .put(`/api/alerts/${testAlertId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: AlertStatus.RESOLVED
          // Sin resolutionNotes
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debe fallar con estado inválido', async () => {
      const response = await request(app)
        .put(`/api/alerts/${testAlertId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'INVALID_STATUS'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Alert Statistics Endpoint', () => {
    beforeEach(async () => {
      // Crear alertas para estadísticas
      const alerts = [
        new AlertModel({
          title: 'Pendiente 1',
          description: 'Descripción pendiente 1',
          type: AlertType.MAINTENANCE,
          priority: AlertPriority.HIGH,
          status: AlertStatus.PENDING,
          departmentId: testDepartmentId,
          userId: testUserId,
          createdAt: new Date()
        }),
        new AlertModel({
          title: 'Pendiente 2',
          description: 'Descripción pendiente 2',
          type: AlertType.SECURITY,
          priority: AlertPriority.CRITICAL,
          status: AlertStatus.PENDING,
          departmentId: testDepartmentId,
          userId: testUserId,
          createdAt: new Date()
        }),
        new AlertModel({
          title: 'En progreso',
          description: 'Descripción en progreso',
          type: AlertType.EMERGENCY,
          priority: AlertPriority.CRITICAL,
          status: AlertStatus.IN_PROGRESS,
          departmentId: testDepartmentId,
          userId: testUserId,
          createdAt: new Date()
        }),
        new AlertModel({
          title: 'Resuelta',
          description: 'Descripción resuelta',
          type: AlertType.GENERAL,
          priority: AlertPriority.MEDIUM,
          status: AlertStatus.RESOLVED,
          departmentId: testDepartmentId,
          userId: testUserId,
          createdAt: new Date(),
          resolvedAt: new Date()
        })
      ];

      await AlertModel.insertMany(alerts);
    });

    it('debe obtener estadísticas de alertas (admin)', async () => {
      const response = await request(app)
        .get('/api/alerts/statistics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          total: 4,
          byStatus: {
            [AlertStatus.PENDING]: 2,
            [AlertStatus.IN_PROGRESS]: 1,
            [AlertStatus.RESOLVED]: 1
          },
          byPriority: {
            [AlertPriority.CRITICAL]: 2,
            [AlertPriority.HIGH]: 1,
            [AlertPriority.MEDIUM]: 1
          },
          byType: {
            [AlertType.MAINTENANCE]: 1,
            [AlertType.SECURITY]: 1,
            [AlertType.EMERGENCY]: 1,
            [AlertType.GENERAL]: 1
          }
        }
      });
    });

    it('debe fallar si no es admin (estadísticas)', async () => {
      const response = await request(app)
        .get('/api/alerts/statistics')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    });
  });
});