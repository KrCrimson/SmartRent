import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Definir schemas
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

const DepartmentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available',
  },
  monthlyPrice: { type: Number, required: true },
  images: [String],
  address: {
    street: String,
    number: String,
    floor: String,
    city: String,
    postalCode: String,
  },
  features: {
    bedrooms: Number,
    bathrooms: Number,
    squareMeters: Number,
    hasParking: Boolean,
    hasFurniture: Boolean,
  },
  inventory: [{
    category: String,
    item: String,
    quantity: Number,
    condition: {
      type: String,
      enum: ['new', 'good', 'fair', 'poor']
    }
  }],
  currentTenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

async function assignDepartment() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Conectado a MongoDB');

    const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
    const DepartmentModel = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);

    // Buscar el usuario inquilino
    const user = await UserModel.findOne({ email: 'juan.perez@example.com' });
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('👤 Usuario encontrado:', user.firstName, user.lastName);

    // Buscar un departamento disponible
    const department = await DepartmentModel.findOne({ 
      status: { $in: ['available', 'occupied'] },
      isActive: true 
    });

    if (!department) {
      console.log('❌ No hay departamentos disponibles');
      return;
    }

    console.log('🏠 Departamento encontrado:', department.code, '-', department.name);

    // Calcular fechas de contrato (1 año desde hoy)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    // Actualizar usuario
    await UserModel.findByIdAndUpdate(user._id, {
      assignedDepartment: department._id,
      contractStartDate: startDate,
      contractEndDate: endDate
    });

    // Actualizar departamento
    await DepartmentModel.findByIdAndUpdate(department._id, {
      currentTenant: user._id,
      status: 'occupied'
    });

    console.log('✅ Asignación completada:');
    console.log(`   👤 Usuario: ${user.firstName} ${user.lastName}`);
    console.log(`   🏠 Departamento: ${department.code} - ${department.name}`);
    console.log(`   📅 Contrato: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);

  } catch (error) {
    console.error('❌ Error en la asignación:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
if (require.main === module) {
  assignDepartment();
}

export { assignDepartment };