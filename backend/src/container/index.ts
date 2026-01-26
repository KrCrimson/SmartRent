import 'reflect-metadata';
import { container } from 'tsyringe';

// Repositories
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { UserRepository } from '@infrastructure/repositories/UserRepository';

// Services
import { IPasswordHashService } from '@application/interfaces/IPasswordHashService';
import { BcryptService } from '@infrastructure/services/BcryptService';
import { IJWTService } from '@application/interfaces/IJWTService';
import { JWTService } from '@infrastructure/services/JWTService';

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

    // Registrar Servicios
    container.register<IPasswordHashService>('IPasswordHashService', {
      useClass: BcryptService
    });

    container.register<IJWTService>('IJWTService', {
      useClass: JWTService
    });

    // Aquí se agregarán más registros según se implementen
    // Ejemplo:
    // container.register<IDepartmentRepository>('IDepartmentRepository', {
    //   useClass: DepartmentRepository
    // });
  }
}
