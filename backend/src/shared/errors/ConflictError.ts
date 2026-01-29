import { AppError } from './AppError';

/**
 * Error que representa un conflicto con el estado actual del recurso
 * HTTP Status Code: 409 Conflict
 */
export class ConflictError extends AppError {
  public field?: string;
  
  constructor(message: string, field?: string) {
    super(message, 409);
    this.name = 'ConflictError';
    this.field = field;
  }
}