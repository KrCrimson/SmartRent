import { ObjectId } from 'mongodb';
import { Alert, AlertStatus, AlertCategory, AlertPriority } from '@domain/entities/Alert';
import { IAlertRepository, AlertFilters, AlertQueryOptions, PaginatedAlerts } from '@domain/repositories/IAlertRepository';
export interface GetAlertsDTO {
  userId: string;
  userRole: string;
  departmentId?: string;
  status?: AlertStatus | AlertStatus[];
  category?: AlertCategory | AlertCategory[];
  priority?: AlertPriority | AlertPriority[];
  assignedTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
  dateRange?: {
    from: Date;
    to: Date;
  };
  isActive?: boolean;
  searchTerm?: string;
}

export interface GetAlertsResponse {
  success: boolean;
  data?: PaginatedAlerts;
  error?: string;
}

/**
 * Use Case: Obtener alertas filtradas según el rol del usuario
 */
export class GetAlertsUseCase {
  constructor(private alertRepository: IAlertRepository) {}

  async execute(dto: GetAlertsDTO): Promise<GetAlertsResponse> {
    try {
      const filters = this.buildFilters(dto);
      const options = this.buildOptions(dto);

      let result: PaginatedAlerts;

      // Búsqueda por texto si se especifica
      if (dto.searchTerm) {
        result = await this.alertRepository.searchByText(dto.searchTerm, options);
      } else {
        result = await this.alertRepository.findMany(filters, options);
      }

      // Filtrar resultados según permisos del usuario
      result = this.filterByUserPermissions(result, dto);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener alertas'
      };
    }
  }

  private buildFilters(dto: GetAlertsDTO): AlertFilters {
    const filters: AlertFilters = {};

    // Filtro por rol
    if (dto.userRole === 'user') {
      // Los usuarios solo ven sus propias alertas
      filters.reporterId = new ObjectId(dto.userId);
    } else if (dto.userRole === 'admin' && dto.assignedTo) {
      // Los admins pueden ver alertas asignadas a ellos
      filters.assignedTo = new ObjectId(dto.assignedTo);
    }

    // Filtros opcionales
    if (dto.departmentId) {
      filters.departmentId = new ObjectId(dto.departmentId);
    }

    if (dto.status) {
      filters.status = dto.status;
    }

    if (dto.category) {
      filters.category = dto.category;
    }

    if (dto.priority) {
      filters.priority = dto.priority;
    }

    if (dto.dateRange) {
      filters.dateRange = dto.dateRange;
    }

    if (dto.isActive !== undefined) {
      filters.isActive = dto.isActive;
    }

    return filters;
  }

  private buildOptions(dto: GetAlertsDTO): AlertQueryOptions {
    return {
      page: dto.page || 1,
      limit: dto.limit || 10,
      sortBy: dto.sortBy || 'createdAt',
      sortOrder: dto.sortOrder || 'desc'
    };
  }

  private filterByUserPermissions(result: PaginatedAlerts, dto: GetAlertsDTO): PaginatedAlerts {
    // Los admins pueden ver todo
    if (dto.userRole === 'admin') {
      return result;
    }

    // Los usuarios ya están filtrados en buildFilters
    if (dto.userRole === 'user') {
      return result;
    }

    // Por defecto devolver el resultado
    return result;
  }
}