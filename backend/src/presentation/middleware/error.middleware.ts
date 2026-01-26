import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/errors/AppError';
import { logger } from '@shared/utils/logger';

/**
 * Middleware global de manejo de errores
 */
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log del error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Si es un AppError operacional
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
    return;
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.message
    });
    return;
  }

  // Error de cast de Mongoose (ID inválido)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'ID inválido'
    });
    return;
  }

  // Error de duplicado de Mongoose
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    res.status(400).json({
      success: false,
      message: 'Ya existe un registro con esos datos'
    });
    return;
  }

  // Error genérico (no operacional)
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
