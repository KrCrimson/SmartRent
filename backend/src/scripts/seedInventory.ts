import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Definir el schema de Department
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

const sampleInventory = [
  // Muebles
  { category: 'Muebles', item: 'Sofá de 3 plazas', quantity: 1, condition: 'good' },
  { category: 'Muebles', item: 'Mesa de comedor', quantity: 1, condition: 'new' },
  { category: 'Muebles', item: 'Sillas de comedor', quantity: 4, condition: 'good' },
  { category: 'Muebles', item: 'Mesa de centro', quantity: 1, condition: 'fair' },
  { category: 'Muebles', item: 'Estante para libros', quantity: 1, condition: 'good' },
  
  // Dormitorio
  { category: 'Dormitorio', item: 'Cama matrimonial', quantity: 1, condition: 'good' },
  { category: 'Dormitorio', item: 'Colchón', quantity: 1, condition: 'new' },
  { category: 'Dormitorio', item: 'Mesas de noche', quantity: 2, condition: 'good' },
  { category: 'Dormitorio', item: 'Ropero empotrado', quantity: 1, condition: 'good' },
  { category: 'Dormitorio', item: 'Lámpara de mesa', quantity: 2, condition: 'fair' },
  
  // Electrodomésticos
  { category: 'Electrodomésticos', item: 'Refrigeradora', quantity: 1, condition: 'good' },
  { category: 'Electrodomésticos', item: 'Microondas', quantity: 1, condition: 'new' },
  { category: 'Electrodomésticos', item: 'Lavadora', quantity: 1, condition: 'fair' },
  { category: 'Electrodomésticos', item: 'Televisor 42"', quantity: 1, condition: 'good' },
  { category: 'Electrodomésticos', item: 'Plancha', quantity: 1, condition: 'good' },
  
  // Cocina
  { category: 'Cocina', item: 'Cocina a gas 4 hornillas', quantity: 1, condition: 'good' },
  { category: 'Cocina', item: 'Juego de ollas', quantity: 1, condition: 'fair' },
  { category: 'Cocina', item: 'Juego de cubiertos', quantity: 1, condition: 'good' },
  { category: 'Cocina', item: 'Juego de platos', quantity: 1, condition: 'good' },
  { category: 'Cocina', item: 'Vasos y tazas', quantity: 8, condition: 'fair' },
  { category: 'Cocina', item: 'Tabla de picar', quantity: 2, condition: 'good' },
  
  // Baño
  { category: 'Baño', item: 'Toallas', quantity: 4, condition: 'good' },
  { category: 'Baño', item: 'Cortina de ducha', quantity: 1, condition: 'new' },
  { category: 'Baño', item: 'Alfombra de baño', quantity: 1, condition: 'fair' },
  { category: 'Baño', item: 'Espejo del baño', quantity: 1, condition: 'good' },
  
  // General
  { category: 'General', item: 'Aspiradora', quantity: 1, condition: 'good' },
  { category: 'General', item: 'Escoba y recogedor', quantity: 1, condition: 'fair' },
  { category: 'General', item: 'Baldes y trapeador', quantity: 1, condition: 'good' },
  { category: 'General', item: 'Extintor', quantity: 1, condition: 'new' },
  { category: 'General', item: 'Botiquín de primeros auxilios', quantity: 1, condition: 'good' },
];

async function seedInventory() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Conectado a MongoDB');

    // Crear o obtener el modelo
    const DepartmentModel = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);

    // Buscar departamentos sin inventario o con inventario vacío
    const departments = await DepartmentModel.find({
      $or: [
        { inventory: { $exists: false } },
        { inventory: { $size: 0 } }
      ]
    });

    console.log(`📦 Encontrados ${departments.length} departamentos sin inventario`);

    if (departments.length === 0) {
      console.log('✅ Todos los departamentos ya tienen inventario');
      return;
    }

    // Agregar inventario a cada departamento
    for (const department of departments) {
      await DepartmentModel.findByIdAndUpdate(
        department._id,
        { $set: { inventory: sampleInventory } },
        { new: true }
      );

      console.log(`✅ Inventario agregado al departamento: ${department.code} - ${department.name}`);
    }

    console.log('🎉 ¡Inventario agregado exitosamente a todos los departamentos!');
    
  } catch (error) {
    console.error('❌ Error al agregar inventario:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
if (require.main === module) {
  seedInventory();
}

export { seedInventory };