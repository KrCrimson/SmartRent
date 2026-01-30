import mongoose, { Schema, Document } from 'mongoose';
import { AlertStatus, AlertCategory, AlertPriority } from '@domain/entities/Alert';

/**
 * Interfaz del documento MongoDB para alertas
 */
export interface IAlertDocument extends Document {
  title: string;
  description: string;
  category: AlertCategory;
  priority: AlertPriority;
  status: AlertStatus;
  reporterId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  images: string[];
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

/**
 * Schema de Mongoose para alertas
 */
const AlertSchema = new Schema<IAlertDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    category: {
      type: String,
      required: true,
      enum: Object.values(AlertCategory)
    },
    priority: {
      type: String,
      required: true,
      enum: Object.values(AlertPriority)
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(AlertStatus),
      default: AlertStatus.PENDIENTE
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Department'
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(arr: string[]) {
          return arr.length <= 3;
        },
        message: 'No se pueden agregar más de 3 imágenes'
      }
    },
    notes: {
      type: [String],
      default: []
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    collection: 'alerts'
  }
);

// Índices para optimizar consultas
AlertSchema.index({ reporterId: 1, createdAt: -1 });
AlertSchema.index({ departmentId: 1, status: 1 });
AlertSchema.index({ assignedTo: 1, status: 1 });
AlertSchema.index({ status: 1, priority: 1 });
AlertSchema.index({ category: 1, departmentId: 1 });
AlertSchema.index({ createdAt: -1 });
AlertSchema.index({ 
  title: 'text', 
  description: 'text' 
}, {
  weights: { title: 10, description: 5 }
});

// Middleware para actualizar resolvedAt cuando el status cambia a RESUELTO
AlertSchema.pre('save', function(this: IAlertDocument) {
  if (this.isModified('status')) {
    if (this.status === AlertStatus.RESUELTO && !this.resolvedAt) {
      this.resolvedAt = new Date();
    }
  }
});

// Métodos virtuales
AlertSchema.virtual('daysOpen').get(function(this: IAlertDocument) {
  const endDate = this.resolvedAt || new Date();
  const diffTime = Math.abs(endDate.getTime() - this.createdAt.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

AlertSchema.virtual('isActive').get(function(this: IAlertDocument) {
  return this.status === AlertStatus.PENDIENTE || this.status === AlertStatus.EN_PROGRESO;
});

AlertSchema.virtual('isHighPriority').get(function(this: IAlertDocument) {
  return this.priority === AlertPriority.ALTA || this.priority === AlertPriority.URGENTE;
});

// Configurar toJSON para incluir virtuals
AlertSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
[{
	"resource": "/c:/Users/windows11/Documents/GitHub/SmartRent/backend/src/application/use-cases/alerts/AddAlertNotesUseCase.ts",
	"owner": "typescript",
	"code": "2307",
	"severity": 8,
	"message": "Cannot find module '@domain/entities/User' or its corresponding type declarations.",
	"source": "ts",
	"startLineNumber": 4,
	"startColumn": 26,
	"endLineNumber": 4,
	"endColumn": 49,
	"modelVersionId": 98,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/windows11/Documents/GitHub/SmartRent/backend/src/application/use-cases/alerts/GetAlertByIdUseCase.ts",
	"owner": "typescript",
	"code": "2307",
	"severity": 8,
	"message": "Cannot find module '@domain/entities/User' or its corresponding type declarations.",
	"source": "ts",
	"startLineNumber": 4,
	"startColumn": 26,
	"endLineNumber": 4,
	"endColumn": 49,
	"modelVersionId": 77,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/windows11/Documents/GitHub/SmartRent/backend/src/application/use-cases/alerts/GetAlertStatsUseCase.ts",
	"owner": "typescript",
	"code": "2307",
	"severity": 8,
	"message": "Cannot find module '@domain/entities/User' or its corresponding type declarations.",
	"source": "ts",
	"startLineNumber": 3,
	"startColumn": 26,
	"endLineNumber": 3,
	"endColumn": 49,
	"modelVersionId": 77,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/windows11/Documents/GitHub/SmartRent/backend/src/application/use-cases/alerts/GetAlertsUseCase.ts",
	"owner": "typescript",
	"code": "2307",
	"severity": 8,
	"message": "Cannot find module '@domain/entities/User' or its corresponding type declarations.",
	"source": "ts",
	"startLineNumber": 4,
	"startColumn": 26,
	"endLineNumber": 4,
	"endColumn": 49,
	"modelVersionId": 132,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/windows11/Documents/GitHub/SmartRent/backend/src/application/use-cases/alerts/UpdateAlertStatusUseCase.ts",
	"owner": "typescript",
	"code": "2307",
	"severity": 8,
	"message": "Cannot find module '@domain/entities/User' or its corresponding type declarations.",
	"source": "ts",
	"startLineNumber": 4,
	"startColumn": 26,
	"endLineNumber": 4,
	"endColumn": 49,
	"modelVersionId": 89,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/windows11/Documents/GitHub/SmartRent/backend/src/infrastructure/controllers/AlertController.ts",
	"owner": "typescript",
	"code": "2307",
	"severity": 8,
	"message": "Cannot find module '@infrastructure/middleware/auth.middleware' or its corresponding type declarations.",
	"source": "ts",
	"startLineNumber": 10,
	"startColumn": 38,
	"endLineNumber": 10,
	"endColumn": 82,
	"modelVersionId": 551,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/windows11/Documents/GitHub/SmartRent/backend/src/infrastructure/controllers/AlertController.ts",
	"owner": "typescript",
	"code": "2307",
	"severity": 8,
	"message": "Cannot find module '@shared/utils/validation' or its corresponding type declarations.",
	"source": "ts",
	"startLineNumber": 11,
	"startColumn": 34,
	"endLineNumber": 11,
	"endColumn": 60,
	"modelVersionId": 551,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/windows11/Documents/GitHub/SmartRent/backend/src/infrastructure/repositories/AlertRepository.ts",
	"owner": "typescript",
	"code": "2769",
	"severity": 8,
	"message": "No overload matches this call.\n  Overload 1 of 2, '(pipeline?: PipelineStage[] | undefined, options?: AggregateOptions | undefined): Aggregate<any[]>', gave the following error.\n    Argument of type '({ $match: any; $group?: undefined; $sort?: undefined; } | { $group: { _id: { year: { $year: string; }; month: { $month: string; }; }; count: { $sum: number; }; resolved: { $sum: { $cond: (number | { $eq: string[]; })[]; }; }; }; $match?: undefined; $sort?: undefined; } | { ...; })[]' is not assignable to parameter of type 'PipelineStage[]'.\n      Type '{ $match: any; $group?: undefined; $sort?: undefined; } | { $group: { _id: { year: { $year: string; }; month: { $month: string; }; }; count: { $sum: number; }; resolved: { $sum: { $cond: (number | { $eq: string[]; })[]; }; }; }; $match?: undefined; $sort?: undefined; } | { ...; }' is not assignable to type 'PipelineStage'.\n        Type '{ $sort: { '_id.year': number; '_id.month': number; }; $match?: undefined; $group?: undefined; }' is not assignable to type 'PipelineStage'.\n          Type '{ $sort: { '_id.year': number; '_id.month': number; }; $match?: undefined; $group?: undefined; }' is not assignable to type 'Sort'.\n            Types of property '$sort' are incompatible.\n              Type '{ '_id.year': number; '_id.month': number; }' is not assignable to type 'Record<string, 1 | -1 | Meta>'.\n                Property ''_id.year'' is incompatible with index signature.\n                  Type 'number' is not assignable to type '1 | -1 | Meta'.\n  Overload 2 of 2, '(pipeline: PipelineStage[]): Aggregate<any[]>', gave the following error.\n    Argument of type '({ $match: any; $group?: undefined; $sort?: undefined; } | { $group: { _id: { year: { $year: string; }; month: { $month: string; }; }; count: { $sum: number; }; resolved: { $sum: { $cond: (number | { $eq: string[]; })[]; }; }; }; $match?: undefined; $sort?: undefined; } | { ...; })[]' is not assignable to parameter of type 'PipelineStage[]'.\n      Type '{ $match: any; $group?: undefined; $sort?: undefined; } | { $group: { _id: { year: { $year: string; }; month: { $month: string; }; }; count: { $sum: number; }; resolved: { $sum: { $cond: (number | { $eq: string[]; })[]; }; }; }; $match?: undefined; $sort?: undefined; } | { ...; }' is not assignable to type 'PipelineStage'.\n        Type '{ $sort: { '_id.year': number; '_id.month': number; }; $match?: undefined; $group?: undefined; }' is not assignable to type 'PipelineStage'.\n          Type '{ $sort: { '_id.year': number; '_id.month': number; }; $match?: undefined; $group?: undefined; }' is not assignable to type 'Sort'.\n            Types of property '$sort' are incompatible.\n              Type '{ '_id.year': number; '_id.month': number; }' is not assignable to type 'Record<string, 1 | -1 | Meta>'.\n                Property ''_id.year'' is incompatible with index signature.\n                  Type 'number' is not assignable to type '1 | -1 | Meta'.",
	"source": "ts",
	"startLineNumber": 688,
	"startColumn": 50,
	"endLineNumber": 688,
	"endColumn": 58,
	"modelVersionId": 701,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/windows11/Documents/GitHub/SmartRent/backend/src/infrastructure/routes/alertRoutes.ts",
	"owner": "typescript",
	"code": "2305",
	"severity": 8,
	"message": "Module '\"@presentation/middleware/auth.middleware\"' has no exported member 'requireRoles'.",
	"source": "ts",
	"startLineNumber": 3,
	"startColumn": 26,
	"endLineNumber": 3,
	"endColumn": 38,
	"modelVersionId": 236,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/windows11/Documents/GitHub/SmartRent/backend/src/infrastructure/routes/alertRoutes.ts",
	"owner": "typescript",
	"code": "2305",
	"severity": 8,
	"message": "Module '\"@presentation/middleware/upload.middleware\"' has no exported member 'uploadMiddleware'.",
	"source": "ts",
	"startLineNumber": 4,
	"startColumn": 10,
	"endLineNumber": 4,
	"endColumn": 26,
	"modelVersionId": 236,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/windows11/Documents/GitHub/SmartRent/backend/src/infrastructure/routes/alertRoutes.ts",
	"owner": "typescript",
	"code": "2307",
	"severity": 8,
	"message": "Cannot find module '@infrastructure/middleware/validation.middleware' or its corresponding type declarations.",
	"source": "ts",
	"startLineNumber": 6,
	"startColumn": 43,
	"endLineNumber": 6,
	"endColumn": 93,
	"modelVersionId": 236,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/windows11/Documents/GitHub/SmartRent/backend/src/infrastructure/routes/alertRoutes.ts",
	"owner": "typescript",
	"code": "2307",
	"severity": 8,
	"message": "Cannot find module '@domain/entities/User' or its corresponding type declarations.",
	"source": "ts",
	"startLineNumber": 7,
	"startColumn": 26,
	"endLineNumber": 7,
	"endColumn": 49,
	"modelVersionId": 236,
	"origin": "extHost1"
}];    ret._id = undefined;
    ret.__v = undefined;
    return ret;
  }
});

export const AlertModel = mongoose.model<IAlertDocument>('Alert', AlertSchema);