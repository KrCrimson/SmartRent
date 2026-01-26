import { AppError } from './AppError';

/**
 * Error de autenticación (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 401, true);
  }
}
