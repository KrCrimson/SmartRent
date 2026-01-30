import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react';
import alertService from '@/services/alertService';
import AlertStatsCards from '../components/alerts/AlertStatsCards';
import AlertsManagementTable from '../components/alerts/AlertsManagementTable';
import AlertTrendChart from '../components/alerts/AlertTrendChart';
import AssignAlertModal from '../components/alerts/AssignAlertModal';
import AlertDetailsModal from '../components/alerts/AlertDetailsModal';
import type { 
  AlertStats, 
  AlertFilters, 
  PaginatedAlerts,
  AlertStatus,
  AlertCategory,
  AlertPriority,
  Alert
} from '@/types/alert';
import {
  ALERT_STATUS_LABELS,
  ALERT_CATEGORY_LABELS,
  ALERT_PRIORITY_LABELS
} from '@/types/alert';

const AdminAlertsPage: React.FC = () => {
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [alerts, setAlerts] = useState<PaginatedAlerts | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [filters, setFilters] = useState<AlertFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');
  
  // Modal states
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, [filters, dateRange]);

  const loadData = async () => {
    await Promise.all([
      loadStats(),
      loadAlerts()
    ]);
  };

  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const dateFilters = getDateRangeFilter();
      const statsFilters = { ...filters, ...dateFilters };
      const statsData = await alertService.getAlertStats(statsFilters);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadAlerts = async () => {
    try {
      setIsLoadingAlerts(true);
      const alertsData = await alertService.getAllAlerts(filters, {
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Error al cargar alertas');
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const getDateRangeFilter = () => {
    const now = new Date();
    let fromDate: Date;

    switch (dateRange) {
      case 'week':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        fromDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      default:
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
      fromDate: fromDate.toISOString(),
      toDate: now.toISOString()
    };
  };

  const handleRefresh = () => {
    loadData();
    toast.success('Datos actualizados');
  };

  // Modal handlers
  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowDetailsModal(true);
  };

  const handleEditAlert = (alert: Alert) => {
    // TODO: Implement edit functionality
    console.log('Edit alert:', alert);
    toast.success('Función de edición próximamente disponible');
  };

  const handleDeleteAlert = async (alert: Alert) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta alerta?')) {
      try {
        await alertService.deleteAlert(alert.id);
        toast.success('Alerta eliminada correctamente');
        loadData();
      } catch (error) {
        console.error('Error deleting alert:', error);
        toast.error('Error al eliminar la alerta');
      }
    }
  };

  const handleAssignAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowAssignModal(true);
  };

  const handleAssignToStaff = async (alertId: string, assigneeId: string, assigneeName: string) => {
    try {
      setIsAssigning(true);
      await alertService.assignAlert(alertId, assigneeId);
      toast.success(`Alerta asignada a ${assigneeName}`);
      setShowAssignModal(false);
      setSelectedAlert(null);
      loadData();
    } catch (error) {
      console.error('Error assigning alert:', error);
      toast.error('Error al asignar la alerta');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleChangeStatus = async (alertId: string, status: AlertStatus) => {
    try {
      await alertService.updateAlertStatus(alertId, { status });
      toast.success('Estado de alerta actualizado');
      loadData();
    } catch (error) {
      console.error('Error updating alert status:', error);
      toast.error('Error al actualizar el estado de la alerta');
    }
  };

  const handleAddComment = async (alertId: string, comment: string) => {
    try {
      // TODO: Implement comment functionality
      console.log('Add comment to alert:', alertId, comment);
      toast.success('Comentario agregado');
      // loadData(); // Uncomment when comment API is implemented
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error al agregar comentario');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary-600" />
              Dashboard de Alertas
            </h1>
            <p className="text-gray-600 mt-1">
              Gestión y supervisión de alertas del sistema
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'quarter')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mes</option>
              <option value="quarter">Último Trimestre</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg 
                       hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isLoadingStats || isLoadingAlerts}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg 
                       font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${(isLoadingStats || isLoadingAlerts) ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    status: e.target.value as AlertStatus || undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Todos</option>
                  {Object.entries(ALERT_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    category: e.target.value as AlertCategory || undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Todas</option>
                  {Object.entries(ALERT_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <select
                  value={filters.priority || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    priority: e.target.value as AlertPriority || undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Todas</option>
                  {Object.entries(ALERT_PRIORITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Solo Activas
                </label>
                <select
                  value={filters.isActive?.toString() || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    isActive: e.target.value ? e.target.value === 'true' : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Todas</option>
                  <option value="true">Solo Activas</option>
                  <option value="false">Solo Inactivas</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {isLoadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <AlertStatsCards stats={stats} />
        ) : null}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trend Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                Tendencia Mensual
              </h3>
            </div>
            <div className="p-6">
              {stats ? (
                <AlertTrendChart 
                  data={[
                    { period: '2024-01-01', total: 15, resolved: 8, pending: 4, inProgress: 3 },
                    { period: '2024-01-08', total: 12, resolved: 7, pending: 3, inProgress: 2 },
                    { period: '2024-01-15', total: 18, resolved: 10, pending: 5, inProgress: 3 },
                    { period: '2024-01-22', total: 20, resolved: 12, pending: 6, inProgress: 2 },
                    { period: '2024-01-29', total: 14, resolved: 9, pending: 3, inProgress: 2 },
                    { period: '2024-02-05', total: 16, resolved: 8, pending: 5, inProgress: 3 },
                    { period: '2024-02-12', total: 22, resolved: 15, pending: 4, inProgress: 3 }
                  ]}
                />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Distribución por Categoría
              </h3>
            </div>
            <div className="p-6">
              {stats ? (
                <div className="space-y-4">
                  {Object.entries(stats.byCategory).map(([category, count]) => {
                    const percentage = stats.total > 0 ? (count / stats.total * 100) : 0;
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">
                            {ALERT_CATEGORY_LABELS[category as AlertCategory]}
                          </span>
                          <span className="text-gray-900">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts Management Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Gestión de Alertas
              {alerts && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                  {alerts.total}
                </span>
              )}
            </h3>
          </div>
          <div className="overflow-hidden">
            {isLoadingAlerts ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : alerts ? (
              <AlertsManagementTable 
                alerts={alerts.alerts}
                onViewAlert={handleViewAlert}
                onEditAlert={handleEditAlert}
                onDeleteAlert={handleDeleteAlert}
                onAssignAlert={handleAssignAlert}
                onChangeStatus={handleChangeStatus}
                loading={isLoadingAlerts}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignAlertModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        alert={selectedAlert}
        onAssign={handleAssignToStaff}
        loading={isAssigning}
      />

      <AlertDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        alert={selectedAlert}
        onStatusChange={handleChangeStatus}
        onAddComment={handleAddComment}
      />
    </div>
  );
};

export default AdminAlertsPage;