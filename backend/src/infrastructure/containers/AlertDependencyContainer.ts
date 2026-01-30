import { AlertRepository } from '@infrastructure/repositories/AlertRepository';
import { DepartmentRepository } from '@infrastructure/repositories/DepartmentRepository';
import { UserRepository } from '@infrastructure/repositories/UserRepository';
import { CreateAlertUseCase } from '@application/use-cases/alerts/CreateAlertUseCase';
import { GetAlertsUseCase } from '@application/use-cases/alerts/GetAlertsUseCase';
import { GetAlertByIdUseCase } from '@application/use-cases/alerts/GetAlertByIdUseCase';
import { UpdateAlertStatusUseCase } from '@application/use-cases/alerts/UpdateAlertStatusUseCase';
import { AddAlertNotesUseCase } from '@application/use-cases/alerts/AddAlertNotesUseCase';
import { GetAlertStatsUseCase } from '@application/use-cases/alerts/GetAlertStatsUseCase';
import { AlertController } from '@infrastructure/controllers/AlertController';

/**
 * Contenedor de dependencias para alertas
 * Implementa el patrón Dependency Injection
 */
export class AlertDependencyContainer {
  private static _alertRepository: AlertRepository;
  private static _departmentRepository: DepartmentRepository;
  private static _userRepository: UserRepository;
  
  // Use Cases
  private static _createAlertUseCase: CreateAlertUseCase;
  private static _getAlertsUseCase: GetAlertsUseCase;
  private static _getAlertByIdUseCase: GetAlertByIdUseCase;
  private static _updateAlertStatusUseCase: UpdateAlertStatusUseCase;
  private static _addAlertNotesUseCase: AddAlertNotesUseCase;
  private static _getAlertStatsUseCase: GetAlertStatsUseCase;
  
  // Controllers
  private static _alertController: AlertController;

  /**
   * Registrar todas las dependencias de alertas
   */
  static register(): void {
    // Registrar repositorios
    this._alertRepository = new AlertRepository();
    this._departmentRepository = new DepartmentRepository(); 
    this._userRepository = new UserRepository();

    // Registrar Use Cases
    this._createAlertUseCase = new CreateAlertUseCase(
      this._alertRepository,
      this._departmentRepository,
      this._userRepository
    );

    this._getAlertsUseCase = new GetAlertsUseCase(this._alertRepository);

    this._getAlertByIdUseCase = new GetAlertByIdUseCase(this._alertRepository);

    this._updateAlertStatusUseCase = new UpdateAlertStatusUseCase(this._alertRepository);

    this._addAlertNotesUseCase = new AddAlertNotesUseCase(this._alertRepository);

    this._getAlertStatsUseCase = new GetAlertStatsUseCase(this._alertRepository);

    // Registrar Controllers
    this._alertController = new AlertController(
      this._createAlertUseCase,
      this._getAlertsUseCase,
      this._getAlertByIdUseCase,
      this._updateAlertStatusUseCase,
      this._addAlertNotesUseCase,
      this._getAlertStatsUseCase
    );
  }

  // Getters para acceder a las dependencias
  static get alertRepository(): AlertRepository {
    if (!this._alertRepository) {
      throw new Error('AlertRepository not registered. Call AlertDependencyContainer.register() first.');
    }
    return this._alertRepository;
  }

  static get departmentRepository(): DepartmentRepository {
    if (!this._departmentRepository) {
      throw new Error('DepartmentRepository not registered. Call AlertDependencyContainer.register() first.');
    }
    return this._departmentRepository;
  }

  static get userRepository(): UserRepository {
    if (!this._userRepository) {
      throw new Error('UserRepository not registered. Call AlertDependencyContainer.register() first.');
    }
    return this._userRepository;
  }

  static get createAlertUseCase(): CreateAlertUseCase {
    if (!this._createAlertUseCase) {
      throw new Error('CreateAlertUseCase not registered. Call AlertDependencyContainer.register() first.');
    }
    return this._createAlertUseCase;
  }

  static get getAlertsUseCase(): GetAlertsUseCase {
    if (!this._getAlertsUseCase) {
      throw new Error('GetAlertsUseCase not registered. Call AlertDependencyContainer.register() first.');
    }
    return this._getAlertsUseCase;
  }

  static get getAlertByIdUseCase(): GetAlertByIdUseCase {
    if (!this._getAlertByIdUseCase) {
      throw new Error('GetAlertByIdUseCase not registered. Call AlertDependencyContainer.register() first.');
    }
    return this._getAlertByIdUseCase;
  }

  static get updateAlertStatusUseCase(): UpdateAlertStatusUseCase {
    if (!this._updateAlertStatusUseCase) {
      throw new Error('UpdateAlertStatusUseCase not registered. Call AlertDependencyContainer.register() first.');
    }
    return this._updateAlertStatusUseCase;
  }

  static get addAlertNotesUseCase(): AddAlertNotesUseCase {
    if (!this._addAlertNotesUseCase) {
      throw new Error('AddAlertNotesUseCase not registered. Call AlertDependencyContainer.register() first.');
    }
    return this._addAlertNotesUseCase;
  }

  static get getAlertStatsUseCase(): GetAlertStatsUseCase {
    if (!this._getAlertStatsUseCase) {
      throw new Error('GetAlertStatsUseCase not registered. Call AlertDependencyContainer.register() first.');
    }
    return this._getAlertStatsUseCase;
  }

  static get alertController(): AlertController {
    if (!this._alertController) {
      throw new Error('AlertController not registered. Call AlertDependencyContainer.register() first.');
    }
    return this._alertController;
  }
}