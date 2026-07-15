import mongoose, { Schema, Document } from 'mongoose';
import { AlertType } from '@domain/entities/Alert';

export interface IAlertDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: AlertType;
  isRead: boolean;
  relatedId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlertDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es requerido']
    },
    title: {
      type: String,
      required: [true, 'El título es requerido'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'El mensaje es requerido'],
      trim: true
    },
    type: {
      type: String,
      enum: {
        values: ['payment_reminder', 'maintenance_update', 'system'],
        message: '{VALUE} no es un tipo de alerta válido'
      },
      default: 'system'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    relatedId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

AlertSchema.index({ userId: 1, isRead: 1 });

AlertSchema.set('toJSON', {
  transform: (_: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export const AlertModel = mongoose.model<IAlertDocument>('Alert', AlertSchema);
