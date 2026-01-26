import 'reflect-metadata';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { UserModel } from '../infrastructure/database/schemas/User.schema';
import { logger } from '../shared/utils/logger';

// Cargar variables de entorno
dotenv.config();

/**
 * Script de seeder para poblar la base de datos con datos iniciales
 */
async function seed() {
  try {
    logger.info('🌱 Iniciando seeder...');

    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartrent';
    await mongoose.connect(mongoUri);
    logger.info('✅ Conectado a MongoDB');

    // Limpiar colección de usuarios (CUIDADO: Solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await UserModel.deleteMany({});
      logger.info('🧹 Colección de usuarios limpiada');
    }

    // Hashear contraseñas
    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    const hashedPassword = await bcrypt.hash('Admin123', bcryptRounds);
    const hashedPasswordUser = await bcrypt.hash('User123', bcryptRounds);

    // Crear usuarios de prueba
    const users = [
      {
        email: 'admin@smartrent.com',
        password: hashedPassword,
        role: 'admin',
        fullName: 'Administrador Principal',
        phone: '999999999',
        dni: '12345678',
        address: 'Av. Principal 123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'juan.perez@example.com',
        password: hashedPasswordUser,
        role: 'user',
        fullName: 'Juan Pérez García',
        phone: '987654321',
        dni: '23456789',
        address: 'Jr. Los Olivos 456',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'maria.lopez@example.com',
        password: hashedPasswordUser,
        role: 'user',
        fullName: 'María López Díaz',
        phone: '976543210',
        dni: '34567890',
        address: 'Av. Los Rosales 789',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'carlos.ruiz@example.com',
        password: hashedPasswordUser,
        role: 'user',
        fullName: 'Carlos Ruiz Mendoza',
        phone: '965432109',
        dni: '45678901',
        address: 'Calle Las Flores 321',
        isActive: false, // Usuario inactivo para pruebas
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insertar usuarios
    const createdUsers = await UserModel.insertMany(users);
    logger.info(`✅ ${createdUsers.length} usuarios creados`);

    // Mostrar credenciales
    console.log('\n📋 CREDENCIALES DE PRUEBA:\n');
    console.log('👤 ADMIN:');
    console.log('   Email: admin@smartrent.com');
    console.log('   Password: Admin123');
    console.log('   Role: admin\n');
    
    console.log('👤 USUARIOS:');
    console.log('   Email: juan.perez@example.com');
    console.log('   Password: User123');
    console.log('   Role: user\n');
    
    console.log('   Email: maria.lopez@example.com');
    console.log('   Password: User123');
    console.log('   Role: user\n');
    
    console.log('   Email: carlos.ruiz@example.com (INACTIVO)');
    console.log('   Password: User123');
    console.log('   Role: user\n');

    logger.info('🎉 Seeder completado exitosamente');
  } catch (error) {
    logger.error('❌ Error en seeder:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('👋 Desconectado de MongoDB');
  }
}

// Ejecutar seeder
seed()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
