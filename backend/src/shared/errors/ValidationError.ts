import { AppError } from './AppError';

/**
 * Error de validación (400)
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true);
  }
}
