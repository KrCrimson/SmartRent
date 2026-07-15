import mongoose, { Schema, Document } from 'mongoose';
import { PaymentStatus } from '@domain/entities/Payment';

export interface IPaymentDocument extends Document {
  tenantId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  amount: number;
  dueDate: Date;
  paymentDate?: Date;
  status: PaymentStatus;
  month: number;
  year: number;
  reference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El inquilino es requerido']
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'El departamento es requerido']
    },
    amount: {
      type: Number,
      required: [true, 'El monto es requerido'],
      min: [0, 'El monto no puede ser negativo']
    },
    dueDate: {
      type: Date,
      required: [true, 'La fecha de vencimiento es requerida']
    },
    paymentDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'overdue'],
        message: '{VALUE} no es un estado de pago válido'
      },
      default: 'pending'
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    },
    reference: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

PaymentSchema.index({ tenantId: 1, year: 1, month: 1 });
PaymentSchema.index({ status: 1 });

PaymentSchema.set('toJSON', {
  transform: (_: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export const PaymentModel = mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
