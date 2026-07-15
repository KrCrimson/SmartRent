import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Home, Plus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { DepartmentCard } from '@/components/DepartmentCard';
import { DepartmentFiltersComponent } from '@/components/DepartmentFilters';
import { departmentService } from '@/services/departmentService';
import type { Department, DepartmentFilters } from '@/types/department';
import { DepartmentFormModal } from '@/components/departments/DepartmentFormModal';
import { useAuth } from '@/hooks/useAuth';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DepartmentFilters>({
    isAvailable: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>(undefined);
  const navigate = useNavigate();
  
  // Utilizamos Auth para saber si es admin (opcional, si es la página pública/privada combinada)
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

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
    setFilters({ isAvailable: true });
  };

  const handleDeleteDepartment = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este departamento?')) {
      try {
        await departmentService.delete(id);
        toast.success('Departamento eliminado exitosamente');
        loadDepartments();
      } catch (error) {
        console.error(error);
        toast.error('Error al eliminar departamento');
      }
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    loadDepartments(); // Refrescar la lista al crear
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <DepartmentFormModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDepartment(undefined);
        }} 
        onSuccess={handleModalSuccess}
        initialData={selectedDepartment}
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
                Gestión de Departamentos
              </h1>
              <p className="text-slate-500">
                Administra tu catálogo de propiedades e inquilinos
              </p>
            </div>
          </div>
          {isAdmin && (
            <button 
              onClick={() => {
                setSelectedDepartment(undefined);
                setIsModalOpen(true);
              }}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nuevo Departamento
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Filtros */}
        <DepartmentFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {departments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 mt-8">
            <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-slate-900 mb-2">
              No hay departamentos
            </h3>
            <p className="text-slate-500">
              Por el momento no hay departamentos que coincidan con tus criterios.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 mt-8 text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {departments.length} {departments.length === 1 ? 'departamento listado' : 'departamentos listados'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((department) => {
                const dId = department.id || department._id;
                return (
                  <DepartmentCard 
                    key={dId} 
                    department={department} 
                    isAdmin={isAdmin}
                    onDelete={() => dId && handleDeleteDepartment(dId)}
                    onEdit={() => {
                      setSelectedDepartment(department);
                      setIsModalOpen(true);
                    }}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentsPage;
