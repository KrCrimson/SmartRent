import { Schema, model } from 'mongoose';

const ContactInfoSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  emergencyContact: {
    type: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      },
      relationship: {
        type: String,
        required: true,
        trim: true
      }
    },
    required: false
  }
}, { _id: false });

const PersonalInfoSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: String,
    required: true
  },
  nationality: {
    type: String,
    required: true,
    trim: true
  },
  occupation: {
    type: String,
    required: true,
    trim: true
  },
  monthlyIncome: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const TenantDocumentsSchema = new Schema({
  idNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  idType: {
    type: String,
    enum: ['passport', 'nationalId', 'driversLicense'],
    required: true
  },
  proofOfIncome: {
    type: String,
    trim: true
  },
  references: [{
    type: String,
    trim: true
  }]
}, { _id: false });

const TenantSchema = new Schema({
  personalInfo: {
    type: PersonalInfoSchema,
    required: true
  },
  contactInfo: {
    type: ContactInfoSchema,
    required: true
  },
  documents: {
    type: TenantDocumentsSchema,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'terminated'],
    default: 'pending',
    index: true
  },
  currentDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    index: true
  },
  leaseStartDate: {
    type: Date
  },
  leaseEndDate: {
    type: Date,
    index: true
  },
  monthlyRent: {
    type: Number,
    min: 0
  },
  securityDeposit: {
    type: Number,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices compuestos para consultas eficientes
TenantSchema.index({ 'contactInfo.email': 1 });
TenantSchema.index({ 'documents.idNumber': 1 });
TenantSchema.index({ status: 1, isActive: 1 });
TenantSchema.index({ currentDepartment: 1, status: 1 });
TenantSchema.index({ leaseEndDate: 1, status: 1 });

// Virtual para nombre completo
TenantSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual para verificar si el contrato está activo
TenantSchema.virtual('hasActiveLease').get(function() {
  if (!this.leaseStartDate || !this.leaseEndDate) return false;
  const now = new Date();
  const start = new Date(this.leaseStartDate);
  const end = new Date(this.leaseEndDate);
  return now >= start && now <= end;
});

// Virtual para días restantes del contrato
TenantSchema.virtual('daysUntilLeaseExpiry').get(function() {
  if (!this.leaseEndDate) return null;
  const now = new Date();
  const end = new Date(this.leaseEndDate);
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual para ID (mapear _id a id)
TenantSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
TenantSchema.set('toJSON', {
  virtuals: true
});

export default model('Tenant', TenantSchema);