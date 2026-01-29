import mongoose, { Schema, Document } from 'mongoose';
import { Department, Address, Features, InventoryItem } from '@domain/entities/Department';

export interface DepartmentDocument extends Omit<Department, '_id'>, Document {}

const AddressSchema = new Schema<Address>({
  street: { type: String, required: true },
  number: { type: String, required: true },
  floor: { type: String },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
}, { _id: false });

const FeaturesSchema = new Schema<Features>({
  bedrooms: { type: Number, required: true, min: 0 },
  bathrooms: { type: Number, required: true, min: 0 },
  squareMeters: { type: Number, required: true, min: 0 },
  hasParking: { type: Boolean, default: false },
  hasFurniture: { type: Boolean, default: false },
}, { _id: false });

const InventoryItemSchema = new Schema<InventoryItem>({
  category: { type: String, required: true },
  item: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  condition: {
    type: String,
    enum: ['new', 'good', 'fair', 'poor'],
    required: true,
  },
}, { _id: false });

const DepartmentSchema = new Schema<DepartmentDocument>(
  {
    code: {
      type: String,
      required: [true, 'El código del departamento es requerido'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'El nombre del departamento es requerido'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'occupied', 'maintenance'],
        message: 'El estado debe ser: available, occupied o maintenance',
      },
      default: 'available',
    },
    monthlyPrice: {
      type: Number,
      required: [true, 'El precio mensual es requerido'],
      min: [0, 'El precio no puede ser negativo'],
    },
    images: {
      type: [String],
      default: [],
    },
    address: {
      type: AddressSchema,
      required: [true, 'La dirección es requerida'],
    },
    features: {
      type: FeaturesSchema,
      required: [true, 'Las características son requeridas'],
    },
    inventory: {
      type: [InventoryItemSchema],
      default: [],
    },
    currentTenant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices para mejorar las búsquedas
DepartmentSchema.index({ status: 1 });
DepartmentSchema.index({ 'address.city': 1 });
DepartmentSchema.index({ monthlyPrice: 1 });

export const DepartmentModel = mongoose.model<DepartmentDocument>('Department', DepartmentSchema);
