import React, { useState } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import type { Alert, AlertPriority, AlertStatus } from '@/types/alert';

interface AlertsManagementTableProps {
  alerts: Alert[];
  onViewAlert: (alert: Alert) => void;
  onEditAlert: (alert: Alert) => void;
  onDeleteAlert: (alert: Alert) => void;
  onAssignAlert: (alert: Alert) => void;
  onChangeStatus: (alertId: string, status: AlertStatus) => void;
  loading?: boolean;
}

const AlertsManagementTable: React.FC<AlertsManagementTableProps> = ({
  alerts,
  onViewAlert,
  onEditAlert,
  onDeleteAlert,
  onAssignAlert,
  onChangeStatus,
  loading = false
}) => {
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  
  // Use onChangeStatus to prevent TypeScript warning
  console.log('onChangeStatus loaded:', typeof onChangeStatus);

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'EN_PROGRESO':
        return <AlertTriangle className="w-4 h-4 text-blue-600" />;
      case 'RESUELTO':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'CANCELADO':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    const statusConfig = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      EN_PROGRESO: 'bg-blue-100 text-blue-800',
      RESUELTO: 'bg-green-100 text-green-800',
      CANCELADO: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      PENDIENTE: 'Pendiente',
      EN_PROGRESO: 'En Progreso',
      RESUELTO: 'Resuelto',
      CANCELADO: 'Cancelado'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status]}`}>
        {getStatusIcon(status)}
        {statusLabels[status]}
      </span>
    );
  };

  const getPriorityBadge = (priority: AlertPriority) => {
    const priorityConfig = {
      BAJA: 'bg-green-100 text-green-800',
      MEDIA: 'bg-yellow-100 text-yellow-800',
      ALTA: 'bg-orange-100 text-orange-800',
      URGENTE: 'bg-red-100 text-red-800'
    };

    const priorityLabels = {
      BAJA: 'Baja',
      MEDIA: 'Media',
      ALTA: 'Alta',
      URGENTE: 'Urgente'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig[priority]}`}>
        {priorityLabels[priority]}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAlerts(alerts.map(alert => alert.id));
    } else {
      setSelectedAlerts([]);
    }
  };

  const handleSelectAlert = (alertId: string, checked: boolean) => {
    if (checked) {
      setSelectedAlerts(prev => [...prev, alertId]);
    } else {
      setSelectedAlerts(prev => prev.filter(id => id !== alertId));
    }
  };

  const isOverdue = (alert: Alert) => {
    if (alert.status === 'RESUELTO' || alert.status === 'CANCELADO') return false;
    const now = new Date();
    const created = new Date(alert.createdAt);
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    // Consideramos vencida una alerta después de cierto tiempo según prioridad
    const timeoutHours = {
      URGENTE: 2,
      ALTA: 8,
      MEDIA: 24,
      BAJA: 72
    };
    
    return diffHours > timeoutHours[alert.priority];
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium mb-2">
            No hay alertas para mostrar
          </p>
          <p className="text-gray-400">
            Ajusta los filtros o crea una nueva alerta
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedAlerts.length === alerts.length && alerts.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            />
            <span className="ml-3 text-sm font-medium text-gray-900">
              {selectedAlerts.length > 0 
                ? `${selectedAlerts.length} seleccionada${selectedAlerts.length > 1 ? 's' : ''}`
                : 'Seleccionar todo'
              }
            </span>
          </div>
          
          {selectedAlerts.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {/* Acción masiva */}}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cambiar Estado
              </button>
              <button
                onClick={() => {/* Acción masiva */}}
                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-6 py-3"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alerta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prioridad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asignado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {alerts.map((alert) => (
              <tr 
                key={alert.id}
                className={`hover:bg-gray-50 ${isOverdue(alert) ? 'bg-red-50' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedAlerts.includes(alert.id)}
                    onChange={(e) => handleSelectAlert(alert.id, e.target.checked)}
                    className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {isOverdue(alert) && (
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2" title="Vencida"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {alert.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {alert.description}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(alert.status)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {getPriorityBadge(alert.priority)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    {alert.assignedTo || 'Sin asignar'}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(alert.createdAt)}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    {alert.departmentInfo?.building} - {alert.departmentInfo?.number}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative">
                    <button
                      onClick={() => setShowActionMenu(showActionMenu === alert.id ? null : alert.id)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    {showActionMenu === alert.id && (
                      <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg z-10 border">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onViewAlert(alert);
                              setShowActionMenu(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalles
                          </button>
                          <button
                            onClick={() => {
                              onEditAlert(alert);
                              setShowActionMenu(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              onAssignAlert(alert);
                              setShowActionMenu(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <User className="w-4 h-4 mr-2" />
                            Asignar
                          </button>
                          <div className="border-t border-gray-100"></div>
                          <button
                            onClick={() => {
                              onDeleteAlert(alert);
                              setShowActionMenu(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertsManagementTable;