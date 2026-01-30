import React, { useState } from 'react';
import { 
  Package, 
  Sofa, 
  Tv, 
  Utensils, 
  Bed, 
  Bath, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  FileText,
  Filter,
  Search
} from 'lucide-react';
import { InventoryItem } from '../services/myDepartmentService';

interface InventoryViewProps {
  inventory: InventoryItem[];
}

interface CategoryIcon {
  [key: string]: React.ReactNode;
}

const categoryIcons: CategoryIcon = {
  'Muebles': <Sofa className="w-5 h-5" />,
  'Electrodomésticos': <Tv className="w-5 h-5" />,
  'Cocina': <Utensils className="w-5 h-5" />,
  'Dormitorio': <Bed className="w-5 h-5" />,
  'Baño': <Bath className="w-5 h-5" />,
  'General': <Package className="w-5 h-5" />
};

const conditionConfig = {
  new: { 
    label: 'Nuevo', 
    color: 'text-green-600', 
    bg: 'bg-green-50', 
    border: 'border-green-200',
    icon: <CheckCircle className="w-4 h-4" />
  },
  good: { 
    label: 'Bueno', 
    color: 'text-blue-600', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200',
    icon: <CheckCircle className="w-4 h-4" />
  },
  fair: { 
    label: 'Regular', 
    color: 'text-yellow-600', 
    bg: 'bg-yellow-50', 
    border: 'border-yellow-200',
    icon: <Clock className="w-4 h-4" />
  },
  poor: { 
    label: 'Malo', 
    color: 'text-red-600', 
    bg: 'bg-red-50', 
    border: 'border-red-200',
    icon: <XCircle className="w-4 h-4" />
  }
};

export const InventoryView: React.FC<InventoryViewProps> = ({ inventory }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedCondition, setSelectedCondition] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Agrupar inventario por categorías
  const groupedInventory = inventory.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  const categories = ['Todos', ...Object.keys(groupedInventory)];
  const conditions = ['Todos', 'new', 'good', 'fair', 'poor'];

  // Filtrar inventario
  const filteredInventory = inventory.filter(item => {
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesCondition = selectedCondition === 'Todos' || item.condition === selectedCondition;
    const matchesSearch = item.item.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesCondition && matchesSearch;
  });

  const getConditionStats = () => {
    const stats = inventory.reduce((acc, item) => {
      acc[item.condition] = (acc[item.condition] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const handleReportIssue = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowReportModal(true);
  };

  const conditionStats = getConditionStats();
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  if (inventory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Sin Inventario Registrado
        </h3>
        <p className="text-gray-600 mb-4">
          Este departamento no tiene un inventario registrado aún.
        </p>
        <div className="text-sm text-blue-600">
          Contacta a administración para registrar el inventario.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Items */}
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
          <div className="text-sm text-gray-600">Items Total</div>
        </div>

        {/* Condition Stats */}
        {Object.entries(conditionStats).map(([condition, count]) => {
          const config = conditionConfig[condition as keyof typeof conditionConfig];
          return (
            <div key={condition} className="bg-white rounded-lg shadow p-4 text-center">
              <div className={`text-2xl font-bold ${config.color}`}>{count}</div>
              <div className="text-sm text-gray-600">{config.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div className="md:w-48">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {conditions.map(condition => (
                <option key={condition} value={condition}>
                  {condition === 'Todos' ? 'Todas las condiciones' : conditionConfig[condition as keyof typeof conditionConfig]?.label || condition}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map((item, index) => {
          const config = conditionConfig[item.condition];
          const categoryIcon = categoryIcons[item.category] || categoryIcons['General'];
          
          return (
            <div key={index} className={`bg-white rounded-lg shadow border-l-4 ${config.border}`}>
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
                      {categoryIcon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.item}</h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">×{item.quantity}</div>
                  </div>
                </div>

                {/* Condition Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} ${config.color} mb-4`}>
                  {config.icon}
                  <span className="text-sm font-medium">{config.label}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReportIssue(item)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">Reportar</span>
                  </button>
                  
                  <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredInventory.length === 0 && inventory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron items
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros o el término de búsqueda.
          </p>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Reportar Problema</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">Item: <strong>{selectedItem.item}</strong></p>
                <p className="text-sm text-gray-600">Categoría: {selectedItem.category}</p>
                <p className="text-sm text-gray-600">Cantidad: {selectedItem.quantity}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe el problema:
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe qué problema has encontrado con este item..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    // Aquí implementarías el envío del reporte
                    console.log('Reporte enviado para:', selectedItem.item);
                    setShowReportModal(false);
                    setSelectedItem(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Enviar Reporte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};