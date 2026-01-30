import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Home } from 'lucide-react';
import { DepartmentCard } from '@/components/DepartmentCard';
import { DepartmentFiltersComponent } from '@/components/DepartmentFilters';
import departmentService from '@/services/departmentService';
import type { Department, DepartmentFilters } from '@/types/department';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DepartmentFilters>({
    status: 'available',
  });

  useEffect(() => {
    loadDepartments();
  }, [filters]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await departmentService.getAll(filters);
      setDepartments(data);
    } catch (err) {
      setError('Error al cargar los departamentos. Por favor, intenta de nuevo.');
      console.error('Error loading departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: DepartmentFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({ status: 'available' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando departamentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDepartments}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Departamentos Disponibles
          </h1>
          <p className="text-gray-600">
            Encuentra el departamento ideal para ti
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <DepartmentFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {departments.length === 0 ? (
          <div className="text-center py-16">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay departamentos disponibles
            </h3>
            <p className="text-gray-600">
              Por el momento no hay departamentos que coincidan con tus criterios.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {departments.length} {departments.length === 1 ? 'departamento encontrado' : 'departamentos encontrados'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((department) => (
                <DepartmentCard key={department._id} department={department} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentsPage;
