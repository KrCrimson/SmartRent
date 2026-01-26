import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Definir el schema de User
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  phone: String,
  dni: String,
  address: String,
  assignedDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  contractStartDate: Date,
  contractEndDate: Date,
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

const ADMIN_USER = {
  firstName: 'Admin',
  lastName: 'SmartRent',
  email: 'admin@smartrent.com',
  password: 'Admin123',
  role: 'admin' as const,
  phone: '+51999999999',
  isActive: true,
};

async function seedAdmin() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Conectado a MongoDB');

    // Crear o obtener el modelo
    const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

    // Verificar si el admin ya existe
    const existingAdmin = await UserModel.findOne({ email: ADMIN_USER.email });

    if (existingAdmin) {
      console.log('⚠️  El usuario admin ya existe');
      console.log('Email:', ADMIN_USER.email);
      console.log('Password: Admin123');
      process.exit(0);
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 10);

    // Crear usuario admin
    const admin = new UserModel({
      ...ADMIN_USER,
      password: hashedPassword,
    });

    await admin.save();

    console.log('✅ Usuario admin creado exitosamente');
    console.log('───────────────────────────────────');
    console.log('📧 Email:', ADMIN_USER.email);
    console.log('🔑 Password:', ADMIN_USER.password);
    console.log('───────────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear usuario admin:', error);
    process.exit(1);
  }
}

seedAdmin();
