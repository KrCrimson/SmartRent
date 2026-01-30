import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { logger } from '@shared/utils/logger';

/**
 * Configuración de rate limiting personalizada
 */
interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: any;
  keyGenerator?: (req: any) => string;
  skip?: (req: any) => boolean;
}

/**
 * Crear middleware de rate limiting
 */
export function rateLimitMiddleware(options: RateLimitOptions): RateLimitRequestHandler {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || {
      success: false,
      error: 'Demasiadas peticiones. Intenta de nuevo más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator || ((req: any) => {
      return req.ip || 'unknown';
    }),
    skip: options.skip || (() => false),
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
      res.status(429).json(options.message || {
        success: false,
        error: 'Demasiadas peticiones. Intenta de nuevo más tarde.'
      });
    }
  });
}

/**
 * Rate limiters predefinidos
 */
export const rateLimiters = {
  // Rate limit general para API
  general: rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // 100 requests por ventana
  }),

  // Rate limit estricto para autenticación
  auth: rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5 // 5 intentos de login por IP
  }),

  // Rate limit para creación de recursos
  create: rateLimitMiddleware({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 10 // 10 creaciones por ventana
  }),

  // Rate limit para búsquedas
  search: rateLimitMiddleware({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 30 // 30 búsquedas por minuto
  })
};

export default rateLimitMiddleware;