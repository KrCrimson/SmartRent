import request from 'supertest';
import app from '../../../src/app';
import { UserRepository } from '../../../src/infrastructure/repositories/UserRepository';
import { User } from '../../../src/domain/entities/User.entity';

describe('Authentication Endpoints', () => {
  const userRepository = new UserRepository();
  let testUser: User;

  beforeEach(async () => {
    // Crear usuario de prueba
    testUser = await userRepository.create({
      email: 'test@example.com',
      password: 'Test123!',
      role: 'user',
      fullName: 'Test User',
      phone: '+1234567890'
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('debe autenticar usuario con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('debe fallar con email inválido', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Test123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debe fallar con credenciales incorrectas', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('debe fallar con campos faltantes', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com'
          // password faltante
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('debe crear nuevo usuario con datos válidos', async () => {
      // Crear admin para autorizar el registro
      const adminUser = await userRepository.create({
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin',
        fullName: 'Admin User',
        phone: '+1234567890'
      });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'Admin123!'
        });

      const token = loginResponse.body.data.accessToken;

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'newuser@example.com',
          password: 'NewUser123!',
          role: 'user',
          fullName: 'New User',
          phone: '+1987654321'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('newuser@example.com');
    });

    it('debe fallar sin autorización admin', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'unauthorized@example.com',
          password: 'Test123!',
          role: 'user',
          fullName: 'Unauthorized User',
          phone: '+1111111111'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('debe renovar tokens con refresh token válido', async () => {
      // Primero hacer login para obtener refresh token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!'
        });

      const refreshToken = loginResponse.body.data.refreshToken;

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('debe fallar con refresh token inválido', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-token'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('debe retornar datos del usuario autenticado', async () => {
      // Hacer login primero
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!'
        });

      const token = loginResponse.body.data.accessToken;

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('debe fallar sin token de autorización', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('debe cerrar sesión exitosamente', async () => {
      // Hacer login primero
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!'
        });

      const token = loginResponse.body.data.accessToken;

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Sesión cerrada');
    });
  });
});