import api from './api';

export interface ContractAlert {
  _id: string;
  userId: string;
  departmentId: string;
  type: 'contract_expiring' | 'contract_expired' | 'renewal_reminder';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  daysUntilExpiry: number;
  contractEndDate: string;
  isRead: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContractAlertStats {
  unreadCount: number;
  criticalCount: number;
  hasExpiredContract: boolean;
  hasUnreadAlerts: boolean;
}

export interface GetContractAlertsResponse {
  alerts: ContractAlert[];
  unreadCount: number;
  criticalCount: number;
  hasExpiredContract: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class ContractAlertService {
  /**
   * Obtener alertas de contrato del usuario
   */
  async getUserAlerts(includeRead: boolean = false): Promise<GetContractAlertsResponse> {
    const response = await api.get<ApiResponse<GetContractAlertsResponse>>(
      `/alerts?includeRead=${includeRead}`
    );
    return response.data.data;
  }

  /**
   * Obtener estadísticas rápidas de alertas de contrato
   */
  async getAlertStats(): Promise<ContractAlertStats> {
    const response = await api.get<ApiResponse<ContractAlertStats>>('/alerts/stats');
    return response.data.data;
  }

  /**
   * Marcar una alerta como leída
   */
  async markAlertAsRead(alertId: string): Promise<void> {
    await api.put(`/alerts/${alertId}/read`);
  }

  /**
   * Marcar todas las alertas como leídas
   */
  async markAllAlertsAsRead(): Promise<{ markedCount: number }> {
    const response = await api.put<ApiResponse<{ markedCount: number }>>('/alerts/read-all');
    return response.data.data;
  }

  /**
   * Formatear fecha de alerta
   */
  formatAlertDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;
    
    return date.toLocaleDateString('es-ES');
  }

  /**
   * Obtener configuración de color por severidad
   */
  getSeverityConfig(severity: ContractAlert['severity']) {
    const configs = {
      low: {
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: '📋'
      },
      medium: {
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: '⚠️'
      },
      high: {
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: '🚨'
      },
      critical: {
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: '🆘'
      }
    };
    
    return configs[severity];
  }

  /**
   * Obtener mensaje de días restantes más amigable
   */
  getDaysMessage(daysUntilExpiry: number): string {
    if (daysUntilExpiry <= 0) {
      const daysExpired = Math.abs(daysUntilExpiry);
      return `Vencido hace ${daysExpired} ${daysExpired === 1 ? 'día' : 'días'}`;
    }
    
    if (daysUntilExpiry === 1) return 'Vence mañana';
    if (daysUntilExpiry <= 7) return `Vence en ${daysUntilExpiry} días`;
    if (daysUntilExpiry <= 30) return `Vence en ${daysUntilExpiry} días`;
    
    const weeks = Math.ceil(daysUntilExpiry / 7);
    if (weeks <= 12) return `Vence en ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    
    const months = Math.ceil(daysUntilExpiry / 30);
    return `Vence en ${months} ${months === 1 ? 'mes' : 'meses'}`;
  }
}

const contractAlertService = new ContractAlertService();
export default contractAlertService;