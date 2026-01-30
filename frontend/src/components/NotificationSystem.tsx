import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  Calendar,
  CheckCircle,
  X,
  MarkAsRead
} from 'lucide-react';
import contractAlertService, { 
  ContractAlert, 
  ContractAlertStats,
  GetContractAlertsResponse 
} from '../services/contractAlertService';

interface NotificationSystemProps {
  className?: string;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<ContractAlertStats | null>(null);
  const [alerts, setAlerts] = useState<ContractAlert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (isOpen && alerts.length === 0) {
      loadAlerts();
    }
  }, [isOpen]);

  const loadStats = async () => {
    try {
      const data = await contractAlertService.getAlertStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      console.error('Error cargando estadísticas de alertas:', err);
      setError(err.message);
    }
  };

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data: GetContractAlertsResponse = await contractAlertService.getUserAlerts(false);
      setAlerts(data.alerts);
      setError(null);
    } catch (err: any) {
      console.error('Error cargando alertas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      await contractAlertService.markAlertAsRead(alertId);
      
      // Actualizar estado local
      setAlerts(prev => prev.filter(alert => alert._id !== alertId));
      setStats(prev => prev ? {
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
        hasUnreadAlerts: prev.unreadCount > 1
      } : null);
    } catch (err: any) {
      console.error('Error marcando alerta como leída:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await contractAlertService.markAllAlertsAsRead();
      
      // Actualizar estado local
      setAlerts([]);
      setStats(prev => prev ? {
        ...prev,
        unreadCount: 0,
        hasUnreadAlerts: false
      } : null);
    } catch (err: any) {
      console.error('Error marcando todas las alertas como leídas:', err);
    }
  };

  const getBadgeCount = () => {
    if (!stats) return 0;
    return stats.criticalCount > 0 ? stats.criticalCount : stats.unreadCount;
  };

  const getBadgeColor = () => {
    if (!stats) return 'bg-gray-500';
    if (stats.criticalCount > 0) return 'bg-red-500';
    if (stats.hasExpiredContract) return 'bg-red-500';
    if (stats.unreadCount > 0) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notificaciones de contrato"
      >
        {stats?.hasUnreadAlerts ? (
          <BellRing className="w-6 h-6" />
        ) : (
          <Bell className="w-6 h-6" />
        )}
        
        {/* Badge */}
        {getBadgeCount() > 0 && (
          <span className={`absolute -top-1 -right-1 ${getBadgeColor()} text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center`}>
            {getBadgeCount() > 9 ? '9+' : getBadgeCount()}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Alertas de Contrato
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {stats && stats.unreadCount > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {stats.unreadCount} sin leer
                </span>
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Marcar todas como leídas
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-600">
                <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2">Cargando alertas...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-600">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>¡No tienes alertas pendientes!</p>
                <p className="text-sm">Tu contrato está al día.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {alerts.map((alert) => {
                  const severityConfig = contractAlertService.getSeverityConfig(alert.severity);
                  const daysMessage = contractAlertService.getDaysMessage(alert.daysUntilExpiry);
                  const timeAgo = contractAlertService.formatAlertDate(alert.createdAt);
                  
                  return (
                    <div key={alert._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`p-2 rounded-lg ${severityConfig.bg} ${severityConfig.color} flex-shrink-0`}>
                          <span className="text-lg">{severityConfig.icon}</span>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {alert.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {alert.message}
                          </p>
                          
                          {/* Meta info */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {daysMessage}
                            </span>
                            <span>{timeAgo}</span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => markAsRead(alert._id)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Marcar como leída"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {alerts.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600 text-center">
                Las alertas críticas requieren atención inmediata
              </p>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};