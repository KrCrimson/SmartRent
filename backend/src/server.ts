import 'reflect-metadata';
import dotenv from 'dotenv';
import { logger } from '@shared/utils/logger';
import { MongooseConfig } from '@infrastructure/database/mongoose.config';
import { DependencyContainer } from './container';
import app from './app';

// Cargar variables de entorno
dotenv.config();

/**
 * Inicializar servidor
 */
async function startServer(): Promise<void> {
  try {
    // Inicializar dependencias
    DependencyContainer.register();
    
    // Conectar a MongoDB
    await MongooseConfig.getInstance().connect();
    logger.info('✅ MongoDB conectado exitosamente');

    // Obtener puerto
    const port = parseInt(process.env.PORT || '5000');

    // Iniciar servidor
    app.listen(port, () => {
      logger.info(`🚀 Servidor iniciado en puerto ${port}`);
      logger.info(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 URL: http://localhost:${port}`);
      logger.info(`📚 Health Check: http://localhost:${port}/health`);
    });
  } catch (error) {
    logger.error('❌ Error al inicializar el servidor:', error);
    process.exit(1);
  }
}

// Inicializar servidor solo si no estamos en testing
if (require.main === module) {
  startServer();
}

export { startServer };