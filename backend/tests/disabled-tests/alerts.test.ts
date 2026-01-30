import { CreateAlertUseCase } from '../../../src/application/use-cases/alerts/CreateAlertUseCase';
import { GetAlertsUseCase } from '../../../src/application/use-cases/alerts/GetAlertsUseCase';
import { UpdateAlertStatusUseCase } from '../../../src/application/use-cases/alerts/UpdateAlertStatusUseCase';
import { AlertRepository } from '../../../src/infrastructure/repositories/AlertRepository';
import { Alert, AlertType, AlertPriority, AlertStatus } from '../../../src/domain/entities/Alert.entity';
import { ValidationError } from '../../../src/shared/errors/ValidationError';
import { NotFoundError } from '../../../src/shared/errors/NotFoundError';
import { ConflictError } from '../../../src/shared/errors/ConflictError';

describe('Alert Use Cases', () => {
  let alertRepository: AlertRepository;
  let createAlertUseCase: CreateAlertUseCase;
  let getAlertsUseCase: GetAlertsUseCase;
  let updateAlertStatusUseCase: UpdateAlertStatusUseCase;

  beforeEach(() => {
    alertRepository = new AlertRepository();
    createAlertUseCase = new CreateAlertUseCase(alertRepository);
    getAlertsUseCase = new GetAlertsUseCase(alertRepository);
    updateAlertStatusUseCase = new UpdateAlertStatusUseCase(alertRepository);
  });

  describe('CreateAlertUseCase', () => {
    it('debe crear alerta con datos válidos', async () => {
      // Arrange
      const alertData = {
        title: 'Problema con calefacción',
        description: 'La calefacción del departamento no funciona correctamente',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.HIGH,
        departmentId: 'dept123',
        userId: 'user123'
      };

      const createdAlert = Alert.create(alertData);
      jest.spyOn(alertRepository, 'save').mockResolvedValue(createdAlert);

      // Act
      const result = await createAlertUseCase.execute(alertData);

      // Assert
      expect(result).toBeDefined();
      expect(result.title).toBe(alertData.title);
      expect(result.type).toBe(AlertType.MAINTENANCE);
      expect(result.priority).toBe(AlertPriority.HIGH);
      expect(result.status).toBe(AlertStatus.PENDING);
    });

    it('debe crear alerta de emergencia con prioridad crítica automática', async () => {
      // Arrange
      const alertData = {
        title: 'Fuga de gas',
        description: 'Se detectó olor a gas en el departamento',
        type: AlertType.EMERGENCY,
        priority: AlertPriority.LOW, // Será sobrescrito a CRITICAL
        departmentId: 'dept123',
        userId: 'user123'
      };

      const createdAlert = Alert.create({
        ...alertData,
        priority: AlertPriority.CRITICAL
      });
      jest.spyOn(alertRepository, 'save').mockResolvedValue(createdAlert);

      // Act
      const result = await createAlertUseCase.execute(alertData);

      // Assert
      expect(result.priority).toBe(AlertPriority.CRITICAL);
    });

    it('debe fallar con título vacío', async () => {
      // Arrange
      const alertData = {
        title: '',
        description: 'Descripción válida',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        departmentId: 'dept123',
        userId: 'user123'
      };

      // Act & Assert
      await expect(createAlertUseCase.execute(alertData))
        .rejects.toThrow(ValidationError);
    });

    it('debe fallar con descripción muy corta', async () => {
      // Arrange
      const alertData = {
        title: 'Título válido',
        description: 'Corta',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        departmentId: 'dept123',
        userId: 'user123'
      };

      // Act & Assert
      await expect(createAlertUseCase.execute(alertData))
        .rejects.toThrow(ValidationError);
    });

    it('debe fallar con tipo de alerta inválido', async () => {
      // Arrange
      const alertData = {
        title: 'Título válido',
        description: 'Descripción válida con suficiente longitud',
        type: 'INVALID_TYPE' as AlertType,
        priority: AlertPriority.MEDIUM,
        departmentId: 'dept123',
        userId: 'user123'
      };

      // Act & Assert
      await expect(createAlertUseCase.execute(alertData))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('GetAlertsUseCase', () => {
    it('debe obtener todas las alertas sin filtros', async () => {
      // Arrange
      const mockAlerts = [
        Alert.create({
          title: 'Alerta 1',
          description: 'Descripción de la alerta 1',
          type: AlertType.MAINTENANCE,
          priority: AlertPriority.HIGH,
          departmentId: 'dept1',
          userId: 'user1'
        }),
        Alert.create({
          title: 'Alerta 2',
          description: 'Descripción de la alerta 2',
          type: AlertType.SECURITY,
          priority: AlertPriority.MEDIUM,
          departmentId: 'dept2',
          userId: 'user2'
        })
      ];

      jest.spyOn(alertRepository, 'findAll').mockResolvedValue(mockAlerts);

      // Act
      const result = await getAlertsUseCase.execute({});

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Alerta 1');
      expect(result[1].title).toBe('Alerta 2');
    });

    it('debe filtrar alertas por estado', async () => {
      // Arrange
      const pendingAlert = Alert.create({
        title: 'Alerta pendiente',
        description: 'Descripción de alerta pendiente',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.HIGH,
        departmentId: 'dept1',
        userId: 'user1'
      });

      jest.spyOn(alertRepository, 'findByFilters').mockResolvedValue([pendingAlert]);

      // Act
      const result = await getAlertsUseCase.execute({
        status: AlertStatus.PENDING
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(AlertStatus.PENDING);
    });

    it('debe filtrar alertas por tipo', async () => {
      // Arrange
      const maintenanceAlert = Alert.create({
        title: 'Mantenimiento',
        description: 'Descripción de mantenimiento',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        departmentId: 'dept1',
        userId: 'user1'
      });

      jest.spyOn(alertRepository, 'findByFilters').mockResolvedValue([maintenanceAlert]);

      // Act
      const result = await getAlertsUseCase.execute({
        type: AlertType.MAINTENANCE
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(AlertType.MAINTENANCE);
    });

    it('debe filtrar alertas por prioridad', async () => {
      // Arrange
      const highPriorityAlert = Alert.create({
        title: 'Alerta crítica',
        description: 'Descripción de alerta crítica',
        type: AlertType.EMERGENCY,
        priority: AlertPriority.CRITICAL,
        departmentId: 'dept1',
        userId: 'user1'
      });

      jest.spyOn(alertRepository, 'findByFilters').mockResolvedValue([highPriorityAlert]);

      // Act
      const result = await getAlertsUseCase.execute({
        priority: AlertPriority.CRITICAL
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe(AlertPriority.CRITICAL);
    });

    it('debe filtrar alertas por departamento', async () => {
      // Arrange
      const departmentAlert = Alert.create({
        title: 'Alerta departamento específico',
        description: 'Descripción para departamento específico',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        departmentId: 'dept123',
        userId: 'user1'
      });

      jest.spyOn(alertRepository, 'findByFilters').mockResolvedValue([departmentAlert]);

      // Act
      const result = await getAlertsUseCase.execute({
        departmentId: 'dept123'
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].departmentId).toBe('dept123');
    });

    it('debe filtrar alertas por usuario', async () => {
      // Arrange
      const userAlert = Alert.create({
        title: 'Alerta de usuario específico',
        description: 'Descripción para usuario específico',
        type: AlertType.GENERAL,
        priority: AlertPriority.LOW,
        departmentId: 'dept1',
        userId: 'user123'
      });

      jest.spyOn(alertRepository, 'findByFilters').mockResolvedValue([userAlert]);

      // Act
      const result = await getAlertsUseCase.execute({
        userId: 'user123'
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user123');
    });
  });

  describe('UpdateAlertStatusUseCase', () => {
    it('debe actualizar estado de alerta de PENDING a IN_PROGRESS', async () => {
      // Arrange
      const alertId = 'alert123';
      const existingAlert = Alert.create({
        title: 'Alerta de prueba',
        description: 'Descripción de alerta de prueba',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        departmentId: 'dept1',
        userId: 'user1'
      });

      const updatedAlert = Alert.create({
        title: 'Alerta de prueba',
        description: 'Descripción de alerta de prueba',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        departmentId: 'dept1',
        userId: 'user1'
      });
      updatedAlert.updateStatus(AlertStatus.IN_PROGRESS, 'admin123');

      jest.spyOn(alertRepository, 'findById').mockResolvedValue(existingAlert);
      jest.spyOn(alertRepository, 'update').mockResolvedValue(updatedAlert);

      // Act
      const result = await updateAlertStatusUseCase.execute({
        alertId,
        newStatus: AlertStatus.IN_PROGRESS,
        updatedBy: 'admin123'
      });

      // Assert
      expect(result.status).toBe(AlertStatus.IN_PROGRESS);
      expect(result.lastUpdatedBy).toBe('admin123');
    });

    it('debe actualizar estado de alerta de IN_PROGRESS a RESOLVED', async () => {
      // Arrange
      const alertId = 'alert123';
      const existingAlert = Alert.create({
        title: 'Alerta de prueba',
        description: 'Descripción de alerta de prueba',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        departmentId: 'dept1',
        userId: 'user1'
      });
      existingAlert.updateStatus(AlertStatus.IN_PROGRESS, 'admin123');

      const resolvedAlert = Alert.create({
        title: 'Alerta de prueba',
        description: 'Descripción de alerta de prueba',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        departmentId: 'dept1',
        userId: 'user1'
      });
      resolvedAlert.updateStatus(AlertStatus.RESOLVED, 'admin123');

      jest.spyOn(alertRepository, 'findById').mockResolvedValue(existingAlert);
      jest.spyOn(alertRepository, 'update').mockResolvedValue(resolvedAlert);

      // Act
      const result = await updateAlertStatusUseCase.execute({
        alertId,
        newStatus: AlertStatus.RESOLVED,
        updatedBy: 'admin123',
        resolutionNotes: 'Problema resuelto exitosamente'
      });

      // Assert
      expect(result.status).toBe(AlertStatus.RESOLVED);
      expect(result.resolutionNotes).toBe('Problema resuelto exitosamente');
    });

    it('debe fallar al intentar actualizar alerta inexistente', async () => {
      // Arrange
      const alertId = 'nonexistent';
      jest.spyOn(alertRepository, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(updateAlertStatusUseCase.execute({
        alertId,
        newStatus: AlertStatus.IN_PROGRESS,
        updatedBy: 'admin123'
      })).rejects.toThrow(NotFoundError);
    });

    it('debe fallar con transición de estado inválida', async () => {
      // Arrange
      const alertId = 'alert123';
      const resolvedAlert = Alert.create({
        title: 'Alerta resuelta',
        description: 'Descripción de alerta resuelta',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        departmentId: 'dept1',
        userId: 'user1'
      });
      resolvedAlert.updateStatus(AlertStatus.RESOLVED, 'admin123');

      jest.spyOn(alertRepository, 'findById').mockResolvedValue(resolvedAlert);

      // Act & Assert
      await expect(updateAlertStatusUseCase.execute({
        alertId,
        newStatus: AlertStatus.PENDING,
        updatedBy: 'admin123'
      })).rejects.toThrow(ConflictError);
    });

    it('debe fallar sin notas de resolución al resolver alerta', async () => {
      // Arrange
      const alertId = 'alert123';
      const inProgressAlert = Alert.create({
        title: 'Alerta en progreso',
        description: 'Descripción de alerta en progreso',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        departmentId: 'dept1',
        userId: 'user1'
      });
      inProgressAlert.updateStatus(AlertStatus.IN_PROGRESS, 'admin123');

      jest.spyOn(alertRepository, 'findById').mockResolvedValue(inProgressAlert);

      // Act & Assert
      await expect(updateAlertStatusUseCase.execute({
        alertId,
        newStatus: AlertStatus.RESOLVED,
        updatedBy: 'admin123'
        // Sin resolutionNotes
      })).rejects.toThrow(ValidationError);
    });

    it('debe fallar con usuario actualizador vacío', async () => {
      // Arrange
      const alertId = 'alert123';
      const pendingAlert = Alert.create({
        title: 'Alerta pendiente',
        description: 'Descripción de alerta pendiente',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        departmentId: 'dept1',
        userId: 'user1'
      });

      jest.spyOn(alertRepository, 'findById').mockResolvedValue(pendingAlert);

      // Act & Assert
      await expect(updateAlertStatusUseCase.execute({
        alertId,
        newStatus: AlertStatus.IN_PROGRESS,
        updatedBy: ''
      })).rejects.toThrow(ValidationError);
    });
  });

  describe('Alert State Machine Validations', () => {
    it('debe permitir transición válida: PENDING -> IN_PROGRESS', () => {
      // Arrange
      const alert = Alert.create({
        title: 'Test Alert',
        description: 'Test Description',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        departmentId: 'dept1',
        userId: 'user1'
      });

      // Act & Assert
      expect(() => {
        alert.updateStatus(AlertStatus.IN_PROGRESS, 'admin123');
      }).not.toThrow();
    });

    it('debe permitir transición válida: IN_PROGRESS -> RESOLVED', () => {
      // Arrange
      const alert = Alert.create({
        title: 'Test Alert',
        description: 'Test Description',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        departmentId: 'dept1',
        userId: 'user1'
      });
      alert.updateStatus(AlertStatus.IN_PROGRESS, 'admin123');

      // Act & Assert
      expect(() => {
        alert.updateStatus(AlertStatus.RESOLVED, 'admin123');
      }).not.toThrow();
    });

    it('debe rechazar transición inválida: RESOLVED -> PENDING', () => {
      // Arrange
      const alert = Alert.create({
        title: 'Test Alert',
        description: 'Test Description',
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.MEDIUM,
        departmentId: 'dept1',
        userId: 'user1'
      });
      alert.updateStatus(AlertStatus.IN_PROGRESS, 'admin123');
      alert.updateStatus(AlertStatus.RESOLVED, 'admin123');

      // Act & Assert
      expect(() => {
        alert.updateStatus(AlertStatus.PENDING, 'admin123');
      }).toThrow(ConflictError);
    });

    it('debe permitir transición: PENDING -> RESOLVED (resolución directa)', () => {
      // Arrange
      const alert = Alert.create({
        title: 'Test Alert',
        description: 'Test Description',
        type: AlertType.GENERAL,
        priority: AlertPriority.LOW,
        departmentId: 'dept1',
        userId: 'user1'
      });

      // Act & Assert
      expect(() => {
        alert.updateStatus(AlertStatus.RESOLVED, 'admin123');
      }).not.toThrow();
    });
  });
});