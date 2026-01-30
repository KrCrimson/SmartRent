import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { MongooseConfig } from '@infrastructure/database/mongoose.config';
import { DependencyContainer } from './container';
import { errorMiddleware } from '@presentation/middleware/error.middleware';
import { logger } from '@shared/utils/logger';
import routes from '@presentation/routes';

// Cargar variables de entorno
dotenv.config();

/**
 * Configurar aplicación Express
 */
function createApp(): Application {
  const app = express();

  // Configurar middleware de seguridad
  app.use(helmet());
  
  // Configurar CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));

  // Configurar middleware de compresión
  app.use(compression());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: {
      success: false,
      message: 'Demasiadas solicitudes desde esta IP. Intenta de nuevo más tarde.',
    },
  });

  // Aplicar rate limiting a todas las rutas
  app.use('/api', limiter);

  // Parser de JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  });

  // Rutas principales
  app.use('/api/v1', routes);

  // Ruta para manejo de rutas no encontradas
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Ruta ${req.originalUrl} no encontrada`,
    });
  });

  // Middleware de manejo de errores (debe ir al final)
  app.use(errorMiddleware);

  return app;
}

// Crear aplicación
const app = createApp();

// Conectar a MongoDB solo si no estamos en testing
if (process.env.NODE_ENV !== 'test') {
  const mongooseConfig = MongooseConfig.getInstance();
  mongooseConfig.connect()
    .then(() => {
      logger.info('✅ Base de datos conectada exitosamente');
    })
    .catch((error: any) => {
      logger.error('❌ Error conectando a la base de datos:', error);
      process.exit(1);
    });
}

export default app;