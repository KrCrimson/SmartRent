import { ObjectId } from 'mongodb';
import { Alert, AlertStatus, AlertCategory, AlertPriority } from '@domain/entities/Alert';

/**
 * Filtros para consultas de alertas
 */
export interface AlertFilters {
  reporterId?: ObjectId;
  departmentId?: ObjectId;
  assignedTo?: ObjectId;
  status?: AlertStatus | AlertStatus[];
  category?: AlertCategory | AlertCategory[];
  priority?: AlertPriority | AlertPriority[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  isActive?: boolean; // PENDIENTE o EN_PROGRESO
  isOverdue?: boolean; // Más de X días sin resolver
}

/**
 * Opciones de paginación y ordenamiento
 */
export interface AlertQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Estadísticas de alertas
 */
export interface AlertStats {
  total: number;
  byStatus: Record<AlertStatus, number>;
  byCategory: Record<AlertCategory, number>;
  byPriority: Record<AlertPriority, number>;
  averageResolutionDays: number;
  overdueCount: number;
  activeCount: number;
  monthlyTrend: Array<{
    month: string;
    count: number;
    resolved: number;
  }>;
}

/**
 * Resultado paginado de alertas
 */
export interface PaginatedAlerts {
  alerts: Alert[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Interfaz del repositorio de alertas
 * Define el contrato para persistencia de datos
 */
export interface IAlertRepository {
  /**
   * Crear una nueva alerta
   */
  create(alert: Alert): Promise<Alert>;

  /**
   * Buscar alerta por ID
   */
  findById(id: string): Promise<Alert | null>;

  /**
   * Buscar alertas con filtros y paginación
   */
  findMany(
    filters: AlertFilters,
    options: AlertQueryOptions
  ): Promise<PaginatedAlerts>;

  /**
   * Buscar todas las alertas de un usuario específico
   */
  findByReporterId(
    reporterId: ObjectId,
    options: AlertQueryOptions
  ): Promise<PaginatedAlerts>;

  /**
   * Buscar todas las alertas de un departamento específico
   */
  findByDepartmentId(
    departmentId: ObjectId,
    options: AlertQueryOptions
  ): Promise<PaginatedAlerts>;

  /**
   * Buscar alertas asignadas a un administrador
   */
  findByAssignedTo(
    assignedTo: ObjectId,
    options: AlertQueryOptions
  ): Promise<PaginatedAlerts>;

  /**
   * Actualizar una alerta existente
   */
  update(alert: Alert): Promise<Alert>;

  /**
   * Actualizar solo el estado de una alerta
   */
  updateStatus(
    id: ObjectId,
    status: AlertStatus,
    updatedBy: ObjectId
  ): Promise<Alert>;

  /**
   * Asignar alerta a un administrador
   */
  assignTo(
    id: ObjectId,
    assignedTo: ObjectId,
    updatedBy: ObjectId
  ): Promise<Alert>;

  /**
   * Agregar nota a una alerta
   */
  addNote(
    id: ObjectId,
    note: string,
    authorId: ObjectId
  ): Promise<Alert>;

  /**
   * Actualizar prioridad de una alerta
   */
  updatePriority(
    id: ObjectId,
    priority: AlertPriority,
    updatedBy: ObjectId
  ): Promise<Alert>;

  /**
   * Eliminar una alerta (solo para casos excepcionales)
   */
  delete(id: ObjectId): Promise<boolean>;

  /**
   * Obtener estadísticas de alertas
   */
  getStats(filters?: Partial<AlertFilters>): Promise<AlertStats>;

  /**
   * Buscar alertas activas (PENDIENTE o EN_PROGRESO)
   */
  findActiveAlerts(
    options: AlertQueryOptions
  ): Promise<PaginatedAlerts>;

  /**
   * Buscar alertas vencidas (más de X días sin resolver)
   */
  findOverdueAlerts(
    days: number,
    options: AlertQueryOptions
  ): Promise<PaginatedAlerts>;

  /**
   * Buscar alertas por rango de fechas
   */
  findByDateRange(
    from: Date,
    to: Date,
    options: AlertQueryOptions
  ): Promise<PaginatedAlerts>;

  /**
   * Contar alertas por estado
   */
  countByStatus(): Promise<Record<AlertStatus, number>>;

  /**
   * Contar alertas por categoría
   */
  countByCategory(): Promise<Record<AlertCategory, number>>;

  /**
   * Contar alertas por prioridad
   */
  countByPriority(): Promise<Record<AlertPriority, number>>;

  /**
   * Buscar alertas de alta prioridad sin asignar
   */
  findHighPriorityUnassigned(): Promise<Alert[]>;

  /**
   * Obtener alertas recientes (últimos N días)
   */
  findRecent(days: number): Promise<Alert[]>;

  /**
   * Verificar si existe una alerta
   */
  exists(id: ObjectId): Promise<boolean>;

  /**
   * Buscar alertas similares (misma categoría y departamento)
   */
  findSimilar(
    departmentId: ObjectId,
    category: AlertCategory,
    excludeId?: ObjectId
  ): Promise<Alert[]>;

  /**
   * Obtener el tiempo promedio de resolución por categoría
   */
  getAverageResolutionTime(): Promise<Record<AlertCategory, number>>;

  /**
   * Buscar alertas con imágenes
   */
  findWithImages(): Promise<Alert[]>;

  /**
   * Buscar alertas por texto (título o descripción)
   */
  searchByText(
    searchTerm: string,
    options: AlertQueryOptions
  ): Promise<PaginatedAlerts>;
}