import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartData {
  period: string;
  total: number;
  resolved: number;
  pending: number;
  inProgress: number;
}

interface AlertTrendChartProps {
  data: ChartData[];
  title?: string;
  period?: 'daily' | 'weekly' | 'monthly';
}

const AlertTrendChart: React.FC<AlertTrendChartProps> = ({ 
  data, 
  title = "Tendencia de Alertas",
  period = 'daily'
}) => {
  const maxValue = Math.max(...data.map(d => d.total));
  const scale = 100 / maxValue;

  const periodLabels = {
    daily: 'Últimos 7 días',
    weekly: 'Últimas 4 semanas',
    monthly: 'Últimos 6 meses'
  };

  const calculateTrend = () => {
    if (data.length < 2) return null;
    
    const recent = data.slice(-3).reduce((sum, d) => sum + d.total, 0) / 3;
    const previous = data.slice(-6, -3).reduce((sum, d) => sum + d.total, 0) / 3;
    
    if (previous === 0) return null;
    
    const change = ((recent - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      direction: change >= 0 ? 'up' : 'down',
      isPositive: change < 0 // Para alertas, menos es mejor
    };
  };

  const trend = calculateTrend();

  const formatPeriod = (period: string, type: 'daily' | 'weekly' | 'monthly') => {
    switch (type) {
      case 'daily':
        return new Date(period).toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit' 
        });
      case 'weekly':
        return `Sem ${period}`;
      case 'monthly':
        return new Date(period).toLocaleDateString('es-ES', { 
          month: 'short' 
        });
      default:
        return period;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {title}
          </h3>
          <p className="text-sm text-gray-500">
            {periodLabels[period]}
          </p>
        </div>
        
        {trend && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            trend.isPositive 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {trend.direction === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.value.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {/* Legend */}
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">Resueltas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-gray-600">Pendientes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-gray-600">En Progreso</span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between gap-2">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1 group">
                {/* Tooltip */}
                <div className="invisible group-hover:visible absolute bottom-full mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                  <div>{formatPeriod(item.period, period)}</div>
                  <div>Total: {item.total}</div>
                  <div>Resueltas: {item.resolved}</div>
                  <div>Pendientes: {item.pending}</div>
                  <div>En Progreso: {item.inProgress}</div>
                </div>

                {/* Stacked Bar */}
                <div className="relative w-full max-w-8 bg-gray-200 rounded-t">
                  {/* Resolved */}
                  <div
                    className="bg-green-500 rounded-t"
                    style={{ height: `${item.resolved * scale * 2.4}px` }}
                  ></div>
                  {/* In Progress */}
                  <div
                    className="bg-orange-500"
                    style={{ height: `${item.inProgress * scale * 2.4}px` }}
                  ></div>
                  {/* Pending */}
                  <div
                    className="bg-yellow-500"
                    style={{ height: `${item.pending * scale * 2.4}px` }}
                  ></div>
                </div>

                {/* Labels */}
                <div className="mt-2 text-xs text-gray-500 text-center">
                  {formatPeriod(item.period, period)}
                </div>
                <div className="text-xs font-medium text-gray-700">
                  {item.total}
                </div>
              </div>
            ))}
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-8">
            <span>{maxValue}</span>
            <span>{Math.round(maxValue * 0.75)}</span>
            <span>{Math.round(maxValue * 0.5)}</span>
            <span>{Math.round(maxValue * 0.25)}</span>
            <span>0</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {data.reduce((sum, d) => sum + d.total, 0)}
          </div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">
            {data.reduce((sum, d) => sum + d.resolved, 0)}
          </div>
          <div className="text-xs text-gray-500">Resueltas</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-yellow-600">
            {data.reduce((sum, d) => sum + d.pending, 0)}
          </div>
          <div className="text-xs text-gray-500">Pendientes</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-orange-600">
            {data.reduce((sum, d) => sum + d.inProgress, 0)}
          </div>
          <div className="text-xs text-gray-500">En Progreso</div>
        </div>
      </div>
    </div>
  );
};

export default AlertTrendChart;