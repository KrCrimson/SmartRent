import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { DepartmentFilters, DepartmentStatus } from '@/types/department';

interface DepartmentFiltersProps {
  filters: DepartmentFilters;
  onFiltersChange: (filters: DepartmentFilters) => void;
  onClearFilters: () => void;
}

export const DepartmentFiltersComponent: React.FC<DepartmentFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [showFilters, setShowFilters] = React.useState(false);

  const handleInputChange = (field: keyof DepartmentFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ''
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Header con botón para mostrar/ocultar filtros */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          Filtros
        </h2>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
          >
            {showFilters ? 'Ocultar' : 'Mostrar'} filtros
          </button>
        </div>
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleInputChange('status', e.target.value as DepartmentStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos</option>
              <option value="available">Disponible</option>
              <option value="occupied">Ocupado</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
          </div>

          {/* Ciudad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por ciudad"
                value={filters.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Precio Mínimo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Mínimo
            </label>
            <input
              type="number"
              placeholder="$ 0"
              value={filters.minPrice || ''}
              onChange={(e) => handleInputChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Precio Máximo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Máximo
            </label>
            <input
              type="number"
              placeholder="$ 10000"
              value={filters.maxPrice || ''}
              onChange={(e) => handleInputChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Recámaras */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recámaras
            </label>
            <select
              value={filters.bedrooms || ''}
              onChange={(e) => handleInputChange('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Cualquiera</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4+</option>
            </select>
          </div>

          {/* Baños */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Baños
            </label>
            <select
              value={filters.bathrooms || ''}
              onChange={(e) => handleInputChange('bathrooms', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Cualquiera</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3+</option>
            </select>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.hasParking || false}
                onChange={(e) => handleInputChange('hasParking', e.target.checked || undefined)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Con estacionamiento</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.hasFurniture || false}
                onChange={(e) => handleInputChange('hasFurniture', e.target.checked || undefined)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Amoblado</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentFiltersComponent;
