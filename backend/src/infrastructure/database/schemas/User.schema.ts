import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface del documento de MongoDB para User
 */
export interface IUserDocument extends Document {
  email: string;
  password: string;
  role: 'admin' | 'user';
  fullName: string;
  phone: string;
  assignedDepartment?: mongoose.Types.ObjectId;
  contractStartDate?: Date;
  contractEndDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema de Mongoose para User
 */
const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido']
    },
    password: {
      type: String,
      required: [true, 'Password es requerido'],
      minlength: [8, 'Password debe tener al menos 8 caracteres']
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'user'],
        message: 'Rol debe ser admin o user'
      },
      required: [true, 'Rol es requerido']
    },
    fullName: {
      type: String,
      required: [true, 'Nombre completo es requerido'],
      trim: true,
      minlength: [3, 'Nombre debe tener al menos 3 caracteres']
    },
    phone: {
      type: String,
      required: [true, 'Teléfono es requerido'],
      trim: true,
      minlength: [8, 'Teléfono debe tener al menos 8 caracteres']
    },
    assignedDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    contractStartDate: {
      type: Date,
      default: null
    },
    contractEndDate: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Índices para optimizar búsquedas (email ya es único, no necesita índice adicional)
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ assignedDepartment: 1 });

// Método para transformar el documento en JSON
UserSchema.set('toJSON', {
  transform: (_: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password; // Nunca retornar el password
    return ret;
  }
});

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
