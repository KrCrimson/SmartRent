import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  AlertTriangle, 
  X, 
  Send, 
  Loader2,
  Camera
} from 'lucide-react';
import alertService from '@/services/alertService';
import departmentService from '@/services/departmentService';
import { useAuth } from '@/hooks/useAuth';
import type { 
  CreateAlertData
} from '@/types/alert';
import { 
  AlertCategory, 
  AlertPriority
} from '@/types/alert';
import { 
  ALERT_CATEGORY_LABELS,
  ALERT_PRIORITY_LABELS 
} from '@/types/alert';
import type { Department } from '@/types/department';

interface AlertFormProps {
  onSuccess?: () => void;
  departmentId?: string; // Pre-selected department
}

interface FormData {
  title: string;
  description: string;
  category: AlertCategory;
  priority: AlertPriority;
  departmentId: string;
  images: FileList;
}

export const AlertForm: React.FC<AlertFormProps> = ({ 
  onSuccess, 
  departmentId: preselectedDepartmentId 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    defaultValues: {
      departmentId: preselectedDepartmentId || '',
      priority: AlertPriority.MEDIA,
      category: AlertCategory.MANTENIMIENTO
    }
  });

  // Load departments on component mount
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setIsLoadingDepartments(true);
      const data = await departmentService.getAllDepartments({ isAvailable: true });
      setDepartments(data);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error('Error al cargar los departamentos');
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length + imageFiles.length > 3) {
      toast.error('Máximo 3 imágenes permitidas');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen válida`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error(`${file.name} es muy grande (máximo 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create previews
    const newFiles = [...imageFiles, ...validFiles];
    const newPreviews = [...imagePreviews];

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === newFiles.length) {
          setImagePreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    setImageFiles(newFiles);
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const onSubmit = async (formData: FormData) => {
    if (!user) {
      toast.error('Debes iniciar sesión para reportar una alerta');
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);

      const alertData: CreateAlertData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        departmentId: formData.departmentId,
        images: imageFiles.length > 0 ? imageFiles : undefined
      };

      await alertService.createAlert(alertData);
      
      toast.success('¡Alerta creada exitosamente!');
      
      // Reset form
      reset();
      setImageFiles([]);
      setImagePreviews([]);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }

    } catch (error: any) {
      console.error('Error creating alert:', error);
      const message = error.response?.data?.message || 'Error al crear la alerta';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingDepartments) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <span className="ml-2 text-gray-600">Cargando formulario...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-6 h-6 text-orange-500" />
        <h2 className="text-2xl font-bold text-gray-900">
          Reportar Nueva Alerta
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Department Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departamento *
          </label>
          <select
            {...register('departmentId', { 
              required: 'Selecciona un departamento' 
            })}
            disabled={!!preselectedDepartmentId}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
          >
            <option value="">Selecciona un departamento</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name || `Departamento ${dept.id}`}
              </option>
            ))}
          </select>
          {errors.departmentId && (
            <p className="text-red-500 text-sm mt-1">{errors.departmentId.message}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título del Problema *
          </label>
          <input
            type="text"
            {...register('title', { 
              required: 'El título es requerido',
              minLength: {
                value: 5,
                message: 'El título debe tener al menos 5 caracteres'
              },
              maxLength: {
                value: 100,
                message: 'El título no puede exceder 100 caracteres'
              }
            })}
            placeholder="Ej: Problema con la calefacción, fuga de agua..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Category and Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              {...register('category', { 
                required: 'Selecciona una categoría' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Object.entries(ALERT_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad *
            </label>
            <select
              {...register('priority', { 
                required: 'Selecciona una prioridad' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Object.entries(ALERT_PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.priority && (
              <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción Detallada *
          </label>
          <textarea
            {...register('description', { 
              required: 'La descripción es requerida',
              minLength: {
                value: 10,
                message: 'La descripción debe tener al menos 10 caracteres'
              },
              maxLength: {
                value: 500,
                message: 'La descripción no puede exceder 500 caracteres'
              }
            })}
            rows={4}
            placeholder="Describe detalladamente el problema, cuándo ocurrió, ubicación específica, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imágenes (Opcional, máximo 3)
          </label>
          
          {/* Upload Button */}
          <div className="flex items-center gap-4 mb-4">
            <label
              className={`
                flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 
                rounded-lg cursor-pointer hover:border-primary-500 transition-colors
                ${imageFiles.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <Camera className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {imageFiles.length === 0 ? 'Agregar fotos' : `Agregar más (${imageFiles.length}/3)`}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                disabled={imageFiles.length >= 3}
                className="hidden"
              />
            </label>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 
                             opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg 
                     font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Crear Alerta
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlertForm;