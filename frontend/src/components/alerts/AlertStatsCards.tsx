import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import type { AlertStats, AlertStatus } from '@/types/alert';

interface Trend {
  type: 'up' | 'down' | 'neutral';
  value: number;
  isPositive: boolean;
}

interface AlertStatsCardsProps {
  stats: AlertStats;
}

const AlertStatsCards: React.FC<AlertStatsCardsProps> = ({ stats }) => {
  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return <Clock className="w-6 h-6" />;
      case 'EN_PROGRESO':
        return <AlertTriangle className="w-6 h-6" />;
      case 'RESUELTO':
        return <CheckCircle className="w-6 h-6" />;
      case 'CANCELADO':
        return <XCircle className="w-6 h-6" />;
      default:
        return <AlertTriangle className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return 'text-yellow-600 bg-yellow-100';
      case 'EN_PROGRESO':
        return 'text-blue-600 bg-blue-100';
      case 'RESUELTO':
        return 'text-green-600 bg-green-100';
      case 'CANCELADO':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    } else if (hours < 24) {
      return `${Math.round(hours)} h`;
    } else {
      return `${Math.round(hours / 24)} días`;
    }
  };

  const cardData = [
    {
      title: 'Total Alertas',
      value: stats.total,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'text-primary-600 bg-primary-100',
      trend: null as Trend | null
    },
    {
      title: 'Pendientes',
      value: stats.byStatus.PENDIENTE,
      icon: getStatusIcon('PENDIENTE' as AlertStatus),
      color: getStatusColor('PENDIENTE' as AlertStatus),
      trend: null as Trend | null
    },
    {
      title: 'En Progreso',
      value: stats.byStatus.EN_PROGRESO,
      icon: getStatusIcon('EN_PROGRESO' as AlertStatus),
      color: getStatusColor('EN_PROGRESO' as AlertStatus),
      trend: null as Trend | null
    },
    {
      title: 'Resueltas',
      value: stats.byStatus.RESUELTO,
      icon: getStatusIcon('RESUELTO' as AlertStatus),
      color: getStatusColor('RESUELTO' as AlertStatus),
      trend: null as Trend | null
    }
  ];

  const metricCards = [
    {
      title: 'Tiempo Promedio de Resolución',
      value: formatTime(stats.averageResolutionTime),
      icon: <Clock className="w-6 h-6" />,
      color: 'text-purple-600 bg-purple-100',
      description: 'Tiempo promedio para resolver alertas'
    },
    {
      title: 'Alertas Vencidas',
      value: stats.overdueCount,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'text-red-600 bg-red-100',
      description: 'Alertas que exceden el tiempo esperado'
    }
  ];

  return (
    <>
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {cardData.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {card.title}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value.toLocaleString()}
                  </p>
                  {card.trend && (
                    <div className={`flex items-center gap-1 text-xs ${
                      card.trend.type === 'up' 
                        ? 'text-green-600' 
                        : card.trend.type === 'down'
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {card.trend.type === 'up' && <TrendingUp className="w-3 h-3" />}
                      {card.trend.type === 'down' && <TrendingDown className="w-3 h-3" />}
                      {card.trend.type === 'neutral' && <Minus className="w-3 h-3" />}
                      {card.trend.value}%
                    </div>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-full ${card.color}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {metricCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {card.value}
                </p>
                <p className="text-xs text-gray-500">
                  {card.description}
                </p>
              </div>
              <div className={`p-3 rounded-full ${card.color} ml-4`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Priority Distribution */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Distribución por Prioridad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(stats.byPriority).map(([priority, count]) => {
            const percentage = stats.total > 0 ? (count / stats.total * 100) : 0;
            const priorityColors = {
              'BAJA': 'bg-green-500',
              'MEDIA': 'bg-yellow-500',
              'ALTA': 'bg-orange-500',
              'URGENTE': 'bg-red-500'
            };
            
            const priorityLabels = {
              'BAJA': 'Baja',
              'MEDIA': 'Media',
              'ALTA': 'Alta',
              'URGENTE': 'Urgente'
            };

            return (
              <div key={priority} className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {count}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {priorityLabels[priority as keyof typeof priorityLabels]}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${priorityColors[priority as keyof typeof priorityColors]}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default AlertStatsCards;