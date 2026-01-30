import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2 
} from 'lucide-react';
import alertService from '@/services/alertService';
import { useAuth } from '@/hooks/useAuth';
import type { 
  AlertFilters, 
  AlertQueryOptions,
  PaginatedAlerts,
  AlertCategory,
  AlertPriority
} from '@/types/alert';
import {
  Alert,
  AlertStatus,
  ALERT_STATUS_LABELS,
  ALERT_CATEGORY_LABELS,
  ALERT_PRIORITY_LABELS,
  ALERT_STATUS_COLORS,
  ALERT_PRIORITY_COLORS
} from '@/types/alert';

const AlertsPage: React.FC = () => {
  const location = useLocation();
  const [alerts, setAlerts] = useState<PaginatedAlerts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AlertFilters>({});
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Show success message if coming from create page
    if (location.state?.message) {
      toast.success(location.state.message);
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
    
    loadAlerts();
  }, [filters]);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const queryOptions: AlertQueryOptions = {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const searchFilters = search ? { ...filters, search } : filters;
      const data = await alertService.getAllAlerts(searchFilters, queryOptions);
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Error al cargar las alertas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAlerts();
  };

  const StatusIcon = ({ status }: { status: AlertStatus }) => {
    switch (status) {
      case AlertStatus.PENDIENTE:
        return <Clock className="w-4 h-4" />;
      case AlertStatus.EN_PROGRESO:
        return <AlertTriangle className="w-4 h-4" />;
      case AlertStatus.RESUELTO:
        return <CheckCircle className="w-4 h-4" />;
      case AlertStatus.CANCELADO:
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
          <p className="text-gray-600 mt-2">Cargando alertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Alertas</h1>
            <p className="text-gray-600 mt-1">
              Gestiona y supervisa tus reportes de problemas
            </p>
          </div>
          <Link
            to="/alerts/create"
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg 
                     font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Alerta
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por título o descripción..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Buscar
              </button>
            </form>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg 
                       hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
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
                    <option value="">Todos los estados</option>
                    {Object.entries(ALERT_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
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
                    <option value="">Todas las categorías</option>
                    {Object.entries(ALERT_CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Priority Filter */}
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
                    <option value="">Todas las prioridades</option>
                    {Object.entries(ALERT_PRIORITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alerts List */}
        {alerts?.alerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay alertas
            </h3>
            <p className="text-gray-600 mb-6">
              No tienes ninguna alerta reportada aún.
            </p>
            <Link
              to="/alerts/create"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg 
                       font-medium hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear Primera Alerta
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts?.alerts.map((alert) => (
              <div 
                key={alert.id} 
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              >
                <Link 
                  to={`/alerts/${alert.id}`}
                  className="block p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <StatusIcon status={alert.status} />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {alert.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {alert.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-3 text-sm">
                            <span className="text-gray-500">
                              📍 Depto {alert.departmentInfo?.number} - {alert.departmentInfo?.building}
                            </span>
                            <span className="text-gray-500">
                              🕒 {formatDate(alert.createdAt)}
                            </span>
                            {alert.assignedToInfo && (
                              <span className="text-gray-500">
                                👤 Asignado a {alert.assignedToInfo.firstName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      {/* Status Badge */}
                      <span className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        ${ALERT_STATUS_COLORS[alert.status]}
                      `}>
                        <StatusIcon status={alert.status} />
                        {ALERT_STATUS_LABELS[alert.status]}
                      </span>

                      {/* Priority Badge */}
                      <span className={`
                        inline-flex px-2 py-1 rounded-full text-xs font-medium
                        ${ALERT_PRIORITY_COLORS[alert.priority]}
                      `}>
                        {ALERT_PRIORITY_LABELS[alert.priority]}
                      </span>

                      {/* Category */}
                      <span className="text-xs text-gray-500">
                        {ALERT_CATEGORY_LABELS[alert.category]}
                      </span>
                    </div>
                  </div>

                  {/* Images Preview */}
                  {alert.images.length > 0 && (
                    <div className="mt-4 flex gap-2">
                      {alert.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Imagen ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ))}
                      {alert.images.length > 3 && (
                        <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                          +{alert.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {alerts && alerts.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="bg-white px-4 py-3 rounded-lg shadow border">
              <span className="text-sm text-gray-700">
                Mostrando {alerts.alerts.length} de {alerts.total} alertas
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;