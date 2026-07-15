import mongoose, { Schema, Document } from 'mongoose';
import { ContactRequest, ContactRequestStatus } from '../../../domain/entities/ContactRequest';

export interface ContactRequestDocument extends Omit<ContactRequest, 'id' | '_id'>, Document {}

const ContactRequestSchema = new Schema(
  {
    departmentId: {
      type: String,
      required: false,
      index: true,
    },
    departmentName: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    message: {
      type: String,
      required: true,
    },
    interestedInVisit: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['PENDING', 'REVIEWED', 'CONTACTED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ContactRequestModel = mongoose.model<ContactRequestDocument>('ContactRequest', ContactRequestSchema);
