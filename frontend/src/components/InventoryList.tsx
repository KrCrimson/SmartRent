import React from 'react';
import { Package, Check, AlertTriangle } from 'lucide-react';
import type { InventoryItem } from '@/types/department';

interface InventoryListProps {
  inventory: InventoryItem[];
}

export const InventoryList: React.FC<InventoryListProps> = ({ inventory }) => {
  if (!inventory || inventory.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Sin inventario registrado
        </h3>
        <p className="text-gray-500">
          No hay items de inventario disponibles para este departamento.
        </p>
      </div>
    );
  }

  const getConditionIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'excellent':
      case 'excelente':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'good':
      case 'bueno':
        return <Check className="w-5 h-5 text-blue-500" />;
      case 'fair':
      case 'regular':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'poor':
      case 'malo':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'excellent':
      case 'excelente':
        return 'bg-green-100 text-green-800';
      case 'good':
      case 'bueno':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
      case 'regular':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
      case 'malo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionLabel = (condition: string) => {
    const conditionMap: { [key: string]: string } = {
      'excellent': 'Excelente',
      'good': 'Bueno',
      'fair': 'Regular',
      'poor': 'Malo'
    };
    return conditionMap[condition.toLowerCase()] || condition;
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Package className="w-6 h-6 text-primary-600" />
        Inventario ({inventory.length} items)
      </h3>

      <div className="space-y-4">
        {inventory.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <div className="flex items-center gap-1">
                    {getConditionIcon(item.condition)}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(item.condition)}`}
                    >
                      {getConditionLabel(item.condition)}
                    </span>
                  </div>
                </div>
                
                {item.description && (
                  <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Cantidad: <span className="font-medium">{item.quantity}</span></span>
                  {item.brand && (
                    <span>Marca: <span className="font-medium">{item.brand}</span></span>
                  )}
                  {item.model && (
                    <span>Modelo: <span className="font-medium">{item.model}</span></span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen del inventario */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Resumen del inventario</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{inventory.length}</div>
            <div className="text-gray-600">Items totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {inventory.filter(item => item.condition.toLowerCase() === 'excellent').length}
            </div>
            <div className="text-gray-600">Excelente</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {inventory.filter(item => item.condition.toLowerCase() === 'good').length}
            </div>
            <div className="text-gray-600">Bueno</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {inventory.filter(item => ['fair', 'poor'].includes(item.condition.toLowerCase())).length}
            </div>
            <div className="text-gray-600">Necesita atención</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;