import { AppError } from './AppError';

/**
 * Error de autorización/permisos (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso prohibido') {
    super(message, 403, true);
  }
}
