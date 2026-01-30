import 'reflect-metadata';
import { container } from 'tsyringe';

// Repositories
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { UserRepository } from '@infrastructure/repositories/UserRepository';
import { ContractAlertRepository } from '@domain/repositories/ContractAlertRepository';
import { MongoContractAlertRepository } from '@infrastructure/repositories/MongoContractAlertRepository';

// Services
import { IPasswordHashService } from '@application/interfaces/IPasswordHashService';
import { BcryptService } from '@infrastructure/services/BcryptService';
import { IJWTService } from '@application/interfaces/IJWTService';
import { JWTService } from '@infrastructure/services/JWTService';

// Use Cases - Alerts
import { GenerateContractAlertsUseCase } from '@application/use-cases/alerts/GenerateContractAlertsUseCase';
import { GetUserAlertsUseCase } from '@application/use-cases/alerts/GetUserAlertsUseCase';
import { MarkAlertAsReadUseCase, MarkAllAlertsAsReadUseCase } from '@application/use-cases/alerts/MarkAlertAsReadUseCase';

/**
 * Contenedor de Inyección de Dependencias
 * Registra todas las implementaciones de interfaces
 */
export class DependencyContainer {
  static register(): void {
    // Registrar Repositorios
    container.register<IUserRepository>('IUserRepository', {
      useClass: UserRepository
    });

    container.register<ContractAlertRepository>('ContractAlertRepository', {
      useClass: MongoContractAlertRepository
    });

    // Registrar Servicios
    container.register<IPasswordHashService>('IPasswordHashService', {
      useClass: BcryptService
    });

    container.register<IJWTService>('IJWTService', {
      useClass: JWTService
    });

    // Registrar Use Cases - Alerts
    container.register(GenerateContractAlertsUseCase, { useClass: GenerateContractAlertsUseCase });
    container.register(GetUserAlertsUseCase, { useClass: GetUserAlertsUseCase });
    container.register(MarkAlertAsReadUseCase, { useClass: MarkAlertAsReadUseCase });
    container.register(MarkAllAlertsAsReadUseCase, { useClass: MarkAllAlertsAsReadUseCase });

    // Aquí se agregarán más registros según se implementen
    // Ejemplo:
    // container.register<IDepartmentRepository>('IDepartmentRepository', {
    //   useClass: DepartmentRepository
    // });
  }
}
