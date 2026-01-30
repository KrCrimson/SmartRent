import { User } from '../../../src/domain/entities/User.entity';
import { Email } from '../../../src/domain/value-objects/Email.vo';
import { Password } from '../../../src/domain/value-objects/Password.vo';

describe('User Entity', () => {
  describe('User Creation', () => {
    it('debe crear un usuario con datos válidos', () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user' as const,
        fullName: 'Test User',
        phone: '+1234567890'
      };

      const user = User.create(userData);

      expect(user).toBeDefined();
      expect(user.email.getValue()).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.fullName).toBe(userData.fullName);
      expect(user.phone).toBe(userData.phone);
      expect(user.isActive).toBe(true);
    });

    it('debe fallar con email inválido', () => {
      expect(() => {
        User.create({
          email: 'invalid-email',
          password: 'Test123!',
          role: 'user',
          fullName: 'Test User',
          phone: '+1234567890'
        });
      }).toThrow('Email inválido');
    });

    it('debe fallar con password débil', () => {
      expect(() => {
        User.create({
          email: 'test@example.com',
          password: '123',
          role: 'user',
          fullName: 'Test User',
          phone: '+1234567890'
        });
      }).toThrow();
    });
  });

  describe('Department Assignment', () => {
    let user: User;

    beforeEach(() => {
      user = User.create({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });
    });

    it('debe asignar un departamento con fechas válidas', () => {
      const departmentId = 'dept123';
      const startDate = new Date();
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 año

      user.assignDepartment(departmentId, startDate, endDate);

      expect(user.assignedDepartmentId).toBe(departmentId);
      expect(user.contractStartDate).toBe(startDate);
      expect(user.contractEndDate).toBe(endDate);
    });

    it('debe fallar al asignar departamento a admin', () => {
      const adminUser = User.create({
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin',
        fullName: 'Admin User',
        phone: '+1234567890'
      });

      expect(() => {
        adminUser.assignDepartment('dept123', new Date(), new Date());
      }).toThrow('Solo los inquilinos pueden tener departamentos asignados');
    });

    it('debe fallar con fechas inválidas', () => {
      const startDate = new Date();
      const endDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Ayer

      expect(() => {
        user.assignDepartment('dept123', startDate, endDate);
      }).toThrow('La fecha de fin debe ser posterior a la fecha de inicio');
    });

    it('debe desasignar departamento correctamente', () => {
      // Primero asignar
      user.assignDepartment('dept123', new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
      
      // Luego desasignar
      user.unassignDepartment();

      expect(user.assignedDepartmentId).toBeUndefined();
      expect(user.contractStartDate).toBeUndefined();
      expect(user.contractEndDate).toBeUndefined();
    });
  });

  describe('Contract Status', () => {
    let user: User;

    beforeEach(() => {
      user = User.create({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });
    });

    it('debe detectar contrato activo', () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 días atrás
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días adelante
      
      user.assignDepartment('dept123', startDate, endDate);

      expect(user.hasActiveContract()).toBe(true);
    });

    it('debe detectar contrato próximo a vencer', () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 días atrás
      const endDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 días adelante
      
      user.assignDepartment('dept123', startDate, endDate);

      expect(user.isContractExpiringSoon()).toBe(true);
    });

    it('debe detectar contrato no próximo a vencer', () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 días atrás
      const endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 días adelante
      
      user.assignDepartment('dept123', startDate, endDate);

      expect(user.isContractExpiringSoon()).toBe(false);
    });
  });

  describe('User Permissions', () => {
    it('admin debe tener todos los permisos', () => {
      const adminUser = User.create({
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin',
        fullName: 'Admin User',
        phone: '+1234567890'
      });

      expect(adminUser.hasPermission('any-permission')).toBe(true);
    });

    it('user regular debe tener permisos limitados', () => {
      const user = User.create({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });

      expect(user.hasPermission('read:own-department')).toBe(true);
      expect(user.hasPermission('create:alert')).toBe(true);
      expect(user.hasPermission('admin:permission')).toBe(false);
    });
  });

  describe('User Status Management', () => {
    let user: User;

    beforeEach(() => {
      user = User.create({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'user',
        fullName: 'Test User',
        phone: '+1234567890'
      });
    });

    it('debe activar y desactivar usuario', () => {
      expect(user.isActive).toBe(true);

      user.deactivate();
      expect(user.isActive).toBe(false);

      user.activate();
      expect(user.isActive).toBe(true);
    });
  });
});