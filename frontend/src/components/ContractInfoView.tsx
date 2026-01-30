import React from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileText,
  Timer
} from 'lucide-react';

interface ContractInfoProps {
  contractInfo: {
    startDate: string;
    endDate: string;
    isActive: boolean;
    daysUntilExpiry: number;
    isExpiringSoon: boolean;
  };
  monthlyPrice: number;
  tenantInfo: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

export const ContractInfoView: React.FC<ContractInfoProps> = ({
  contractInfo,
  monthlyPrice,
  tenantInfo
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressPercentage = (): number => {
    const start = new Date(contractInfo.startDate).getTime();
    const end = new Date(contractInfo.endDate).getTime();
    const now = new Date().getTime();
    
    const total = end - start;
    const elapsed = now - start;
    
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  };

  const getTotalDays = (): number => {
    const start = new Date(contractInfo.startDate);
    const end = new Date(contractInfo.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getElapsedDays = (): number => {
    const start = new Date(contractInfo.startDate);
    const now = new Date();
    return Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const progress = getProgressPercentage();
  const totalDays = getTotalDays();
  const elapsedDays = getElapsedDays();

  return (
    <div className="space-y-6">
      {/* Contract Status Banner */}
      <div className={`rounded-lg p-6 ${
        contractInfo.isExpiringSoon 
          ? 'bg-yellow-50 border border-yellow-200' 
          : contractInfo.isActive 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-start gap-4">
          {contractInfo.isExpiringSoon ? (
            <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
          ) : contractInfo.isActive ? (
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
          ) : (
            <Clock className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
          )}
          
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${
              contractInfo.isExpiringSoon 
                ? 'text-yellow-900' 
                : contractInfo.isActive 
                ? 'text-green-900' 
                : 'text-red-900'
            }`}>
              {contractInfo.isExpiringSoon 
                ? '⚠️ Contrato próximo a vencer'
                : contractInfo.isActive 
                ? '✅ Contrato activo'
                : '❌ Contrato inactivo'
              }
            </h3>
            
            <p className={`mt-1 ${
              contractInfo.isExpiringSoon 
                ? 'text-yellow-800' 
                : contractInfo.isActive 
                ? 'text-green-800' 
                : 'text-red-800'
            }`}>
              {contractInfo.isExpiringSoon && contractInfo.daysUntilExpiry > 0
                ? `Tu contrato vence en ${contractInfo.daysUntilExpiry} días. Considera renovarlo pronto.`
                : contractInfo.isActive
                ? `Tu contrato está activo. Vence el ${formatDate(contractInfo.endDate)}.`
                : contractInfo.daysUntilExpiry < 0
                ? `Tu contrato venció hace ${Math.abs(contractInfo.daysUntilExpiry)} días.`
                : 'Tu contrato no está actualmente en vigor.'
              }
            </p>

            {contractInfo.isExpiringSoon && (
              <div className="mt-4">
                <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                  Contactar para renovar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contract Duration Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h4 className="text-lg font-semibold text-gray-900">Progreso del Contrato</h4>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Inicio: {formatDate(contractInfo.startDate)}</span>
            <span>Fin: {formatDate(contractInfo.endDate)}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                progress >= 90 
                  ? 'bg-red-500' 
                  : progress >= 75 
                  ? 'bg-yellow-500' 
                  : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-600">
              <span className="font-medium">{elapsedDays}</span> días transcurridos de <span className="font-medium">{totalDays}</span>
            </div>
            <div className={`font-medium ${
              progress >= 90 
                ? 'text-red-600' 
                : progress >= 75 
                ? 'text-yellow-600' 
                : 'text-blue-600'
            }`}>
              {progress.toFixed(1)}% completado
            </div>
          </div>
        </div>
      </div>

      {/* Contract Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h4 className="text-lg font-semibold text-gray-900">Información Financiera</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Renta mensual</span>
              <span className="text-2xl font-bold text-green-600">
                ${monthlyPrice.toLocaleString('es-ES')}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Total pagado (estimado)</span>
              <span className="text-lg font-semibold text-gray-900">
                ${(monthlyPrice * Math.floor(elapsedDays / 30)).toLocaleString('es-ES')}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Duración del contrato</span>
              <span className="text-lg font-semibold text-gray-900">
                {Math.round(totalDays / 30)} meses
              </span>
            </div>
          </div>
        </div>

        {/* Important Dates */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Fechas Importantes</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start py-3 border-b border-gray-100">
              <div>
                <div className="text-gray-600 text-sm">Fecha de inicio</div>
                <div className="font-semibold text-gray-900">{formatDate(contractInfo.startDate)}</div>
              </div>
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Inicio
              </div>
            </div>
            
            <div className="flex justify-between items-start py-3 border-b border-gray-100">
              <div>
                <div className="text-gray-600 text-sm">Fecha de vencimiento</div>
                <div className="font-semibold text-gray-900">{formatDate(contractInfo.endDate)}</div>
              </div>
              <div className={`px-2 py-1 rounded text-xs ${
                contractInfo.isExpiringSoon 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {contractInfo.isExpiringSoon ? 'Próximo' : 'Vencimiento'}
              </div>
            </div>
            
            <div className="flex justify-between items-start py-3">
              <div>
                <div className="text-gray-600 text-sm">Tiempo restante</div>
                <div className="font-semibold text-gray-900">
                  {contractInfo.daysUntilExpiry > 0 
                    ? `${contractInfo.daysUntilExpiry} días`
                    : 'Contrato vencido'
                  }
                </div>
              </div>
              <Timer className={`w-5 h-5 ${
                contractInfo.daysUntilExpiry <= 30 
                  ? 'text-red-500' 
                  : contractInfo.daysUntilExpiry <= 60
                  ? 'text-yellow-500'
                  : 'text-green-500'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-600" />
          <h4 className="text-lg font-semibold text-gray-900">Información del Inquilino</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-gray-600 text-sm mb-1">Nombre completo</div>
            <div className="font-semibold text-gray-900">{tenantInfo.fullName}</div>
          </div>
          
          <div>
            <div className="text-gray-600 text-sm mb-1">Email</div>
            <div className="font-semibold text-gray-900">{tenantInfo.email}</div>
          </div>
          
          {tenantInfo.phone && (
            <div>
              <div className="text-gray-600 text-sm mb-1">Teléfono</div>
              <div className="font-semibold text-gray-900">{tenantInfo.phone}</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-left">
            <div className="font-medium">Contactar al administrador</div>
            <div className="text-sm text-blue-100 mt-1">Para consultas sobre tu contrato</div>
          </button>
          
          <button className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-left">
            <div className="font-medium">Descargar contrato</div>
            <div className="text-sm text-green-100 mt-1">Obtener copia en PDF</div>
          </button>
        </div>
      </div>
    </div>
  );
};