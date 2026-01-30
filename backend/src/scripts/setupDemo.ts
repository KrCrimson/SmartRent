import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Schemas
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
}, { timestamps: true });

const DepartmentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
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
    condition: { type: String, enum: ['new', 'good', 'fair', 'poor'] }
  }],
  currentTenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const sampleInventory = [
  { category: 'Muebles', item: 'Sofá de 3 plazas', quantity: 1, condition: 'good' },
  { category: 'Muebles', item: 'Mesa de comedor', quantity: 1, condition: 'new' },
  { category: 'Muebles', item: 'Sillas de comedor', quantity: 4, condition: 'good' },
  { category: 'Dormitorio', item: 'Cama matrimonial', quantity: 1, condition: 'good' },
  { category: 'Dormitorio', item: 'Colchón', quantity: 1, condition: 'new' },
  { category: 'Dormitorio', item: 'Mesas de noche', quantity: 2, condition: 'good' },
  { category: 'Electrodomésticos', item: 'Refrigeradora', quantity: 1, condition: 'good' },
  { category: 'Electrodomésticos', item: 'Microondas', quantity: 1, condition: 'new' },
  { category: 'Electrodomésticos', item: 'Televisor 42"', quantity: 1, condition: 'good' },
  { category: 'Cocina', item: 'Cocina a gas 4 hornillas', quantity: 1, condition: 'good' },
  { category: 'Cocina', item: 'Juego de ollas', quantity: 1, condition: 'fair' },
  { category: 'Baño', item: 'Toallas', quantity: 4, condition: 'good' },
  { category: 'General', item: 'Aspiradora', quantity: 1, condition: 'good' },
];

const sampleDepartment = {
  code: 'DEPT-001',
  name: 'Departamento Ejecutivo Centro',
  description: 'Moderno departamento de 2 dormitorios en el centro de la ciudad',
  status: 'available',
  monthlyPrice: 1200,
  images: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
  ],
  address: {
    street: 'Av. Arequipa',
    number: '1234',
    floor: '5A',
    city: 'Lima',
    postalCode: '15001',
  },
  features: {
    bedrooms: 2,
    bathrooms: 2,
    squareMeters: 85,
    hasParking: true,
    hasFurniture: true,
  },
  inventory: sampleInventory,
  isActive: true,
};

const tenantUser = {
  firstName: 'Juan',
  lastName: 'Pérez García',
  email: 'juan.perez@example.com',
  password: 'User123',
  role: 'user' as const,
  phone: '987654321',
  dni: '12345678',
  address: 'Av. Arequipa 1234, Lima',
  isActive: true,
};

async function setupCompleteDemo() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Conectado a MongoDB');

    const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
    const DepartmentModel = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);

    // 1. Crear/actualizar departamento
    console.log('🏠 Creando departamento de muestra...');
    let department = await DepartmentModel.findOne({ code: sampleDepartment.code });
    if (!department) {
      department = await DepartmentModel.create(sampleDepartment);
      console.log('✅ Departamento creado:', department.code);
    } else {
      await DepartmentModel.findByIdAndUpdate(department._id, {
        ...sampleDepartment,
        status: 'available',
        currentTenant: null
      });
      console.log('✅ Departamento actualizado:', department.code);
    }

    // 2. Crear/actualizar usuario inquilino
    console.log('👤 Configurando usuario inquilino...');
    let user = await UserModel.findOne({ email: tenantUser.email });
    if (!user) {
      const hashedPassword = await bcrypt.hash(tenantUser.password, 10);
      user = await UserModel.create({
        ...tenantUser,
        password: hashedPassword
      });
      console.log('✅ Usuario inquilino creado:', user.email);
    } else {
      console.log('✅ Usuario inquilino ya existe:', user.email);
    }

    // 3. Asignar departamento al usuario
    console.log('🔗 Asignando departamento al usuario...');
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    await UserModel.findByIdAndUpdate(user._id, {
      assignedDepartment: department._id,
      contractStartDate: startDate,
      contractEndDate: endDate
    });

    await DepartmentModel.findByIdAndUpdate(department._id, {
      currentTenant: user._id,
      status: 'occupied'
    });

    console.log('✅ Asignación completada exitosamente!');
    console.log('');
    console.log('📋 RESUMEN:');
    console.log(`   👤 Usuario: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`   🏠 Departamento: ${department.code} - ${department.name}`);
    console.log(`   📅 Contrato: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
    console.log(`   📦 Items de inventario: ${department.inventory.length}`);
    console.log('');
    console.log('🎉 ¡Listo para probar el sistema!');

  } catch (error) {
    console.error('❌ Error en la configuración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
  }
}

if (require.main === module) {
  setupCompleteDemo();
}

export { setupCompleteDemo };