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
 * Clase principal del servidor
 */
class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '5000');
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Inicializar middlewares
   */
  private initializeMiddlewares(): void {
    // Seguridad
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true
    }));

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compresión
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: 'Demasiadas peticiones desde esta IP, intenta nuevamente más tarde',
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api/', limiter);

    // Request logging
    this.app.use((req: any, res: any, next: any) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Inicializar rutas
   */
  private initializeRoutes(): void {
    // Ruta raíz
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'SmartRent API - Sistema de Gestión de Departamentos',
        version: '1.0.0',
        docs: '/api/docs'
      });
    });

    // API routes
    this.app.use('/api/v1', routes);

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
      });
    });
  }

  /**
   * Inicializar manejo de errores
   */
  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  /**
   * Iniciar servidor
   */
  async start(): Promise<void> {
    try {
      // Registrar dependencias
      DependencyContainer.register();
      logger.info('✅ Dependencias registradas');

      // Conectar a MongoDB
      const mongooseConfig = MongooseConfig.getInstance();
      await mongooseConfig.connect();

      // Iniciar servidor HTTP
      this.app.listen(this.port, () => {
        logger.info(`🚀 Servidor corriendo en puerto ${this.port}`);
        logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`📡 API disponible en: http://localhost:${this.port}/api/v1`);
      });
    } catch (error) {
      logger.error('❌ Error al iniciar servidor:', error);
      process.exit(1);
    }
  }
}

// Iniciar servidor
const server = new Server();
server.start();

// Manejo de errores no capturados
process.on('unhandledRejection', (reason: Error) => {
  logger.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
