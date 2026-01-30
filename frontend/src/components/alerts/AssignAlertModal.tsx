import React, { useState, useEffect } from 'react';
import { X, User, Search, Check } from 'lucide-react';
import type { Alert } from '@/types/alert';

interface AssignAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: Alert | null;
  onAssign: (alertId: string, assigneeId: string, assigneeName: string) => void;
  loading?: boolean;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
  workload: number; // Número de alertas asignadas actualmente
  specialties?: string[];
}

// Mock data - en una app real esto vendría del backend
const mockStaff: Staff[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@smartrent.com',
    role: 'Técnico de Mantenimiento',
    department: 'Mantenimiento',
    workload: 3,
    specialties: ['Plomería', 'Electricidad']
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria.gonzalez@smartrent.com',
    role: 'Supervisora de Limpieza',
    department: 'Limpieza',
    workload: 5,
    specialties: ['Limpieza', 'Higiene']
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@smartrent.com',
    role: 'Administrador de Edificio',
    department: 'Administración',
    workload: 8,
    specialties: ['Gestión', 'Coordinación']
  },
  {
    id: '4',
    name: 'Ana Martínez',
    email: 'ana.martinez@smartrent.com',
    role: 'Técnico Especialista',
    department: 'Mantenimiento',
    workload: 2,
    specialties: ['HVAC', 'Sistemas']
  },
  {
    id: '5',
    name: 'Roberto Silva',
    email: 'roberto.silva@smartrent.com',
    role: 'Conserje',
    department: 'Servicios Generales',
    workload: 4,
    specialties: ['Seguridad', 'Accesos']
  }
];

const AssignAlertModal: React.FC<AssignAlertModalProps> = ({
  isOpen,
  onClose,
  alert,
  onAssign,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>(mockStaff);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = mockStaff.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.specialties?.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredStaff(filtered);
    } else {
      setFilteredStaff(mockStaff);
    }
  }, [searchTerm]);

  const handleAssign = () => {
    if (alert && selectedStaff) {
      onAssign(alert.id, selectedStaff.id, selectedStaff.name);
      setSelectedStaff(null);
      setSearchTerm('');
      onClose();
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload <= 3) return 'text-green-600 bg-green-100';
    if (workload <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getWorkloadText = (workload: number) => {
    if (workload <= 3) return 'Disponible';
    if (workload <= 6) return 'Ocupado';
    return 'Saturado';
  };

  if (!isOpen || !alert) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Asignar Alerta
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {alert.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Alert Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Prioridad:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  alert.priority === 'URGENTE' ? 'bg-red-100 text-red-800' :
                  alert.priority === 'ALTA' ? 'bg-orange-100 text-orange-800' :
                  alert.priority === 'MEDIA' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {alert.priority}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ubicación:</span>
                <span className="ml-2 text-gray-600">
                  {alert.departmentInfo?.building} - {alert.departmentInfo?.number}
                </span>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Descripción:</span>
                <p className="mt-1 text-gray-600">{alert.description}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar personal por nombre, rol o especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Staff List */}
          <div className="max-h-80 overflow-y-auto space-y-2">
            {filteredStaff.map((staff) => (
              <div
                key={staff.id}
                onClick={() => setSelectedStaff(staff)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedStaff?.id === staff.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 flex items-center">
                        {staff.name}
                        {selectedStaff?.id === staff.id && (
                          <Check className="w-4 h-4 text-primary-600 ml-2" />
                        )}
                      </h4>
                      <p className="text-xs text-gray-500">{staff.role}</p>
                      <p className="text-xs text-gray-500">{staff.email}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getWorkloadColor(staff.workload)}`}>
                      {getWorkloadText(staff.workload)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {staff.workload} alertas asignadas
                    </p>
                  </div>
                </div>
                
                {staff.specialties && staff.specialties.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {staff.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {filteredStaff.length === 0 && (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No se encontró personal que coincida con la búsqueda
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedStaff || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Asignando...' : 'Asignar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignAlertModal;