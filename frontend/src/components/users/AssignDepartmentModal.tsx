import React, { useState, useEffect } from 'react';
import { X, Home, Calendar, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { assignDepartment } from '@/services/userService';
import { getAllDepartments } from '@/services/departmentService';
import { User, AssignDepartmentData } from '@/types/user';
import { Department } from '@/types/department';

interface AssignDepartmentModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignDepartmentModal: React.FC<AssignDepartmentModalProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<AssignDepartmentData>({
    departmentId: '',
    contractStartDate: '',
    contractEndDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      // Obtener solo departamentos disponibles
      const data = await getAllDepartments({ isAvailable: true });
      setDepartments(data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al cargar departamentos'
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Department
    if (!formData.departmentId) {
      newErrors.departmentId = 'Debes seleccionar un departamento';
    }

    // Start date
    if (!formData.contractStartDate) {
      newErrors.contractStartDate = 'La fecha de inicio es requerida';
    } else {
      const startDate = new Date(formData.contractStartDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        newErrors.contractStartDate = 'La fecha de inicio no puede ser anterior a hoy';
      }
    }

    // End date
    if (!formData.contractEndDate) {
      newErrors.contractEndDate = 'La fecha de fin es requerida';
    } else if (formData.contractStartDate) {
      const startDate = new Date(formData.contractStartDate);
      const endDate = new Date(formData.contractEndDate);

      if (endDate <= startDate) {
        newErrors.contractEndDate = 'La fecha de fin debe ser posterior a la de inicio';
      }

      // Validar que el contrato sea de al menos 1 mes (30 días)
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays < 30) {
        newErrors.contractEndDate = 'El contrato debe ser de al menos 1 mes (30 días)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      await assignDepartment(user.id, {
        departmentId: formData.departmentId,
        contractStartDate: new Date(formData.contractStartDate).toISOString(),
        contractEndDate: new Date(formData.contractEndDate).toISOString(),
      });
      toast.success('Departamento asignado exitosamente');
      onSuccess();
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al asignar departamento';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const getMinEndDate = (): string => {
    if (!formData.contractStartDate) return '';
    const startDate = new Date(formData.contractStartDate);
    startDate.setDate(startDate.getDate() + 30); // Mínimo 30 días después
    return startDate.toISOString().split('T')[0];
  };

  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  const selectedDepartment = departments.find(
    (d) => d.id === formData.departmentId
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Home className="h-6 w-6 text-blue-600" />
              Asignar Departamento
            </h2>
            <p className="text-gray-600 mt-1">
              Usuario: <span className="font-medium">{user.firstName} {user.lastName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : departments.length === 0 ? (
          <div className="p-12 text-center">
            <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              No hay departamentos disponibles
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Todos los departamentos están actualmente asignados
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Department Selection */}
            <div>
              <label
                htmlFor="departmentId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Departamento <span className="text-red-500">*</span>
              </label>
              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.departmentId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona un departamento</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name} (${dept.rentAmount}/mes)
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.departmentId}
                </p>
              )}
            </div>

            {/* Department Details */}
            {selectedDepartment && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Detalles del Departamento
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Código:</span>
                    <span className="ml-2 font-medium">{selectedDepartment.code}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Renta:</span>
                    <span className="ml-2 font-medium">
                      ${selectedDepartment.rentAmount}/mes
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Habitaciones:</span>
                    <span className="ml-2 font-medium">
                      {selectedDepartment.bedrooms}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Baños:</span>
                    <span className="ml-2 font-medium">
                      {selectedDepartment.bathrooms}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Área:</span>
                    <span className="ml-2 font-medium">
                      {selectedDepartment.area} m²
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Piso:</span>
                    <span className="ml-2 font-medium">
                      {selectedDepartment.floor}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <span className="text-gray-600 text-sm">Dirección:</span>
                  <p className="text-gray-900 font-medium">
                    {selectedDepartment.address.street} {selectedDepartment.address.number}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {selectedDepartment.address.city}, {selectedDepartment.address.state}
                  </p>
                </div>
              </div>
            )}

            {/* Contract Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contractStartDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Fecha de Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="contractStartDate"
                  name="contractStartDate"
                  value={formData.contractStartDate}
                  onChange={handleChange}
                  min={getTodayDate()}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.contractStartDate
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors.contractStartDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.contractStartDate}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contractEndDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Fecha de Fin <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="contractEndDate"
                  name="contractEndDate"
                  value={formData.contractEndDate}
                  onChange={handleChange}
                  min={getMinEndDate()}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.contractEndDate
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors.contractEndDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.contractEndDate}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  El contrato debe ser de al menos 1 mes (30 días)
                </p>
              </div>
            </div>

            {/* Contract Duration Info */}
            {formData.contractStartDate && formData.contractEndDate && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Duración del contrato:</span>{' '}
                  {(() => {
                    const start = new Date(formData.contractStartDate);
                    const end = new Date(formData.contractEndDate);
                    const diffTime = end.getTime() - start.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const months = Math.floor(diffDays / 30);
                    const days = diffDays % 30;
                    
                    if (months > 0 && days > 0) {
                      return `${months} ${months === 1 ? 'mes' : 'meses'} y ${days} ${days === 1 ? 'día' : 'días'}`;
                    } else if (months > 0) {
                      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
                    } else {
                      return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
                    }
                  })()}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Asignando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Asignar Departamento
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssignDepartmentModal;
