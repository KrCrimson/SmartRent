import { ObjectId } from 'mongodb';
import { IAlertRepository, AlertStats, AlertFilters } from '@domain/repositories/IAlertRepository';

export interface GetAlertStatsDTO {
  userRole: string;
  userId: string;
  departmentId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface GetAlertStatsResponse {
  success: boolean;
  stats?: AlertStats;
  error?: string;
}

/**
 * Use Case: Obtener estadísticas de alertas
 */
export class GetAlertStatsUseCase {
  constructor(private alertRepository: IAlertRepository) {}

  async execute(dto: GetAlertStatsDTO): Promise<GetAlertStatsResponse> {
    try {
      // Verificar permisos
      const hasPermission = this.checkPermissions(dto.userRole);
      if (!hasPermission) {
        return {
          success: false,
          error: 'No tienes permisos para ver estadísticas de alertas'
        };
      }

      // Construir filtros según el rol
      const filters = this.buildFilters(dto);

      // Obtener estadísticas
      const stats = await this.alertRepository.getStats(filters);

      return {
        success: true,
        stats
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas de alertas'
      };
    }
  }

  private checkPermissions(userRole: string): boolean {
    // Solo admins pueden ver estadísticas generales
    return userRole === 'admin';
  }

  private buildFilters(dto: GetAlertStatsDTO): Partial<AlertFilters> {
    const filters: Partial<AlertFilters> = {};

    // Si es admin normal, solo puede ver stats de su departamento asignado
    if (dto.userRole === 'admin' && dto.departmentId) {
      filters.departmentId = new ObjectId(dto.departmentId);
    }

    // Filtro de rango de fechas si se especifica
    if (dto.dateRange) {
      filters.dateRange = dto.dateRange;
    }

    return filters;
  }
}