import mongoose from 'mongoose';
import { logger } from '@shared/utils/logger';

/**
 * Configuración y conexión a MongoDB
 */
export class MongooseConfig {
  private static instance: MongooseConfig;

  private constructor() {}

  static getInstance(): MongooseConfig {
    if (!MongooseConfig.instance) {
      MongooseConfig.instance = new MongooseConfig();
    }
    return MongooseConfig.instance;
  }

  async connect(): Promise<void> {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartrent';

      await mongoose.connect(mongoUri);

      logger.info('✅ Conectado a MongoDB exitosamente');

      // Manejar eventos de conexión
      mongoose.connection.on('error', (error: Error) => {
        logger.error('❌ Error de conexión a MongoDB:', error);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️ Desconectado de MongoDB');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        logger.info('🔌 Conexión a MongoDB cerrada');
        process.exit(0);
      });
    } catch (error) {
      logger.error('❌ Error al conectar a MongoDB:', error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    await mongoose.connection.close();
    logger.info('🔌 Conexión a MongoDB cerrada');
  }
}
