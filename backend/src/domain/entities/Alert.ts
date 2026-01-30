import { ObjectId } from 'mongodb';

/**
 * Enumeraciones para el sistema de alertas
 */
export enum AlertStatus {
  PENDIENTE = 'PENDIENTE',
  EN_PROGRESO = 'EN_PROGRESO',
  RESUELTO = 'RESUELTO',
  CANCELADO = 'CANCELADO'
}

export enum AlertCategory {
  MANTENIMIENTO = 'MANTENIMIENTO',
  LIMPIEZA = 'LIMPIEZA',
  SEGURIDAD = 'SEGURIDAD',
  SERVICIOS = 'SERVICIOS',
  RUIDO = 'RUIDO',
  OTRO = 'OTRO'
}

export enum AlertPriority {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE'
}

/**
 * State Pattern para manejo de transiciones válidas de estado
 */
export abstract class AlertState {
  protected alert: Alert;

  constructor(alert: Alert) {
    this.alert = alert;
  }

  abstract getValidTransitions(): AlertStatus[];
  abstract canTransitionTo(newStatus: AlertStatus): boolean;
  abstract transitionTo(newStatus: AlertStatus): void;
  abstract getDescription(): string;
}

export class PendienteState extends AlertState {
  getValidTransitions(): AlertStatus[] {
    return [AlertStatus.EN_PROGRESO, AlertStatus.CANCELADO];
  }

  canTransitionTo(newStatus: AlertStatus): boolean {
    return this.getValidTransitions().includes(newStatus);
  }

  transitionTo(newStatus: AlertStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(`Transición inválida de ${AlertStatus.PENDIENTE} a ${newStatus}`);
    }
    this.alert.updateStatus(newStatus);
  }

  getDescription(): string {
    return 'Alerta reportada, esperando ser atendida';
  }
}

export class EnProgresoState extends AlertState {
  getValidTransitions(): AlertStatus[] {
    return [AlertStatus.RESUELTO, AlertStatus.CANCELADO];
  }

  canTransitionTo(newStatus: AlertStatus): boolean {
    return this.getValidTransitions().includes(newStatus);
  }

  transitionTo(newStatus: AlertStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(`Transición inválida de ${AlertStatus.EN_PROGRESO} a ${newStatus}`);
    }
    this.alert.updateStatus(newStatus);
  }

  getDescription(): string {
    return 'Alerta siendo atendida por el personal de mantenimiento';
  }
}

export class ResueltaState extends AlertState {
  getValidTransitions(): AlertStatus[] {
    return []; // Estado final, no puede transicionar
  }

  canTransitionTo(newStatus: AlertStatus): boolean {
    return false;
  }

  transitionTo(newStatus: AlertStatus): void {
    throw new Error(`No se puede transicionar desde estado ${AlertStatus.RESUELTO}`);
  }

  getDescription(): string {
    return 'Alerta resuelta exitosamente';
  }
}

export class CanceladaState extends AlertState {
  getValidTransitions(): AlertStatus[] {
    return []; // Estado final, no puede transicionar
  }

  canTransitionTo(newStatus: AlertStatus): boolean {
    return false;
  }

  transitionTo(newStatus: AlertStatus): void {
    throw new Error(`No se puede transicionar desde estado ${AlertStatus.CANCELADO}`);
  }

  getDescription(): string {
    return 'Alerta cancelada';
  }
}

/**
 * Entidad Alert - Representa un reporte/alerta del sistema
 */
export class Alert {
  private _id?: ObjectId;
  private _title: string;
  private _description: string;
  private _category: AlertCategory;
  private _priority: AlertPriority;
  private _status: AlertStatus;
  private _reporterId: ObjectId; // Usuario que reporta
  private _departmentId: ObjectId; // Departamento relacionado
  private _assignedTo?: ObjectId; // Admin/staff asignado
  private _images: string[]; // URLs de imágenes
  private _notes: string[]; // Notas administrativas
  private _createdAt: Date;
  private _updatedAt: Date;
  private _resolvedAt?: Date;

  // State Pattern
  private _state: AlertState;

  constructor(data: {
    title: string;
    description: string;
    category: AlertCategory;
    priority: AlertPriority;
    reporterId: ObjectId;
    departmentId: ObjectId;
    images?: string[];
    id?: ObjectId;
  }) {
    this._id = data.id;
    this._title = this.validateTitle(data.title);
    this._description = this.validateDescription(data.description);
    this._category = data.category;
    this._priority = data.priority;
    this._status = AlertStatus.PENDIENTE;
    this._reporterId = data.reporterId;
    this._departmentId = data.departmentId;
    this._images = data.images || [];
    this._notes = [];
    this._createdAt = new Date();
    this._updatedAt = new Date();

    // Inicializar con estado pendiente
    this._state = new PendienteState(this);

    this.validateImages();
  }

  // Getters
  get id(): ObjectId | undefined { return this._id; }
  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get category(): AlertCategory { return this._category; }
  get priority(): AlertPriority { return this._priority; }
  get status(): AlertStatus { return this._status; }
  get reporterId(): ObjectId { return this._reporterId; }
  get departmentId(): ObjectId { return this._departmentId; }
  get assignedTo(): ObjectId | undefined { return this._assignedTo; }
  get images(): string[] { return [...this._images]; }
  get notes(): string[] { return [...this._notes]; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get resolvedAt(): Date | undefined { return this._resolvedAt; }
  get state(): AlertState { return this._state; }

  // Métodos de negocio
  updateStatus(newStatus: AlertStatus): void {
    this._status = newStatus;
    this._updatedAt = new Date();
    
    if (newStatus === AlertStatus.RESUELTO) {
      this._resolvedAt = new Date();
    }

    // Actualizar state pattern
    this.updateStatePattern(newStatus);
  }

  private updateStatePattern(status: AlertStatus): void {
    switch (status) {
      case AlertStatus.PENDIENTE:
        this._state = new PendienteState(this);
        break;
      case AlertStatus.EN_PROGRESO:
        this._state = new EnProgresoState(this);
        break;
      case AlertStatus.RESUELTO:
        this._state = new ResueltaState(this);
        break;
      case AlertStatus.CANCELADO:
        this._state = new CanceladaState(this);
        break;
    }
  }

  transitionTo(newStatus: AlertStatus): void {
    this._state.transitionTo(newStatus);
  }

  canTransitionTo(newStatus: AlertStatus): boolean {
    return this._state.canTransitionTo(newStatus);
  }

  getValidTransitions(): AlertStatus[] {
    return this._state.getValidTransitions();
  }

  assignTo(adminId: ObjectId): void {
    this._assignedTo = adminId;
    this._updatedAt = new Date();
  }

  addNote(note: string, authorId: ObjectId): void {
    if (!note.trim()) {
      throw new Error('La nota no puede estar vacía');
    }

    const noteWithMetadata = `[${new Date().toISOString()}] [${authorId.toString()}]: ${note.trim()}`;
    this._notes.push(noteWithMetadata);
    this._updatedAt = new Date();
  }

  updatePriority(newPriority: AlertPriority): void {
    this._priority = newPriority;
    this._updatedAt = new Date();
  }

  addImage(imageUrl: string): void {
    if (this._images.length >= 3) {
      throw new Error('No se pueden agregar más de 3 imágenes por alerta');
    }
    
    this._images.push(imageUrl);
    this._updatedAt = new Date();
  }

  removeImage(imageUrl: string): void {
    const index = this._images.indexOf(imageUrl);
    if (index > -1) {
      this._images.splice(index, 1);
      this._updatedAt = new Date();
    }
  }

  // Validaciones
  private validateTitle(title: string): string {
    if (!title || title.trim().length === 0) {
      throw new Error('El título es obligatorio');
    }
    if (title.length > 100) {
      throw new Error('El título no puede exceder 100 caracteres');
    }
    return title.trim();
  }

  private validateDescription(description: string): string {
    if (!description || description.trim().length === 0) {
      throw new Error('La descripción es obligatoria');
    }
    if (description.length > 500) {
      throw new Error('La descripción no puede exceder 500 caracteres');
    }
    return description.trim();
  }

  private validateImages(): void {
    if (this._images.length > 3) {
      throw new Error('No se pueden agregar más de 3 imágenes por alerta');
    }
  }

  // Métodos de utilidad
  isActive(): boolean {
    return this._status === AlertStatus.PENDIENTE || this._status === AlertStatus.EN_PROGRESO;
  }

  isResolved(): boolean {
    return this._status === AlertStatus.RESUELTO;
  }

  isCancelled(): boolean {
    return this._status === AlertStatus.CANCELADO;
  }

  isHighPriority(): boolean {
    return this._priority === AlertPriority.ALTA || this._priority === AlertPriority.URGENTE;
  }

  getDaysOpen(): number {
    const endDate = this._resolvedAt || new Date();
    const diffTime = Math.abs(endDate.getTime() - this._createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Serialización
  toPlainObject(): any {
    return {
      _id: this._id,
      title: this._title,
      description: this._description,
      category: this._category,
      priority: this._priority,
      status: this._status,
      reporterId: this._reporterId,
      departmentId: this._departmentId,
      assignedTo: this._assignedTo,
      images: this._images,
      notes: this._notes,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      resolvedAt: this._resolvedAt
    };
  }

  static fromPlainObject(data: any): Alert {
    const alert = new Alert({
      id: data._id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      reporterId: data.reporterId,
      departmentId: data.departmentId,
      images: data.images || []
    });

    // Restaurar estado
    if (data.status) {
      alert.updateStatus(data.status);
    }
    if (data.assignedTo) {
      alert._assignedTo = data.assignedTo;
    }
    if (data.notes) {
      alert._notes = data.notes;
    }
    if (data.createdAt) {
      alert._createdAt = new Date(data.createdAt);
    }
    if (data.updatedAt) {
      alert._updatedAt = new Date(data.updatedAt);
    }
    if (data.resolvedAt) {
      alert._resolvedAt = new Date(data.resolvedAt);
    }

    return alert;
  }
}