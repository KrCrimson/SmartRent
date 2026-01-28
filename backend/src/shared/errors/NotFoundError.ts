import { AppError } from './AppError';

/**
 * Error que representa un recurso no encontrado
 * HTTP Status Code: 404 Not Found
 */
export class NotFoundError extends AppError {
  public resource?: string;
  
  constructor(message: string, resource?: string) {
    super(message, 404);
    this.name = 'NotFoundError';
    this.resource = resource;
  }
}