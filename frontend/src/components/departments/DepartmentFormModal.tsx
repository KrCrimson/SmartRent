import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { departmentService } from '@/services/departmentService';
import { CreateDepartmentData, Department } from '@/types/department';
import MapPicker from './MapPicker';

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Department;
}

export const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<CreateDepartmentData>({
    defaultValues: {
      address: {
        country: 'Perú',
        state: 'Lima',
      },
      amenities: [],
      features: []
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          code: initialData.code,
          name: initialData.name,
          address: {
            street: initialData.address?.street || '',
            city: initialData.address?.city || '',
          } as any,
          rentAmount: (initialData as any).monthlyPrice || initialData.rentAmount || 0,
          deposit: (initialData as any).deposit || 0,
          area: (initialData as any).features?.squareMeters || initialData.area || 0,
          bedrooms: (initialData as any).features?.bedrooms || initialData.bedrooms || 0,
          bathrooms: (initialData as any).features?.bathrooms || initialData.bathrooms || 0,
          floor: (initialData as any).address?.floor || initialData.floor || 1,
          hasParking: (initialData as any).features?.hasParking || false,
          hasFurniture: (initialData as any).features?.hasFurniture || false,
        } as any);
        if (initialData.address?.coordinates) {
          setCoordinates(initialData.address.coordinates);
        }
      } else {
        reset({
          address: { country: 'Perú', state: 'Lima' },
          amenities: [],
          features: []
        });
        setCoordinates(null);
      }
      setSelectedFiles([]);
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: CreateDepartmentData) => {
    try {
        const payload: any = {
          code: data.code,
          name: data.name,
          description: data.name || 'Departamento en alquiler',
          monthlyPrice: Number(data.rentAmount || 0),
          rentAmount: Number(data.rentAmount || 0),
          deposit: Number(data.deposit || 0),
          features: {
            bedrooms: Number(data.bedrooms || 0),
            bathrooms: Number(data.bathrooms || 0),
            squareMeters: Number(data.area || 0),
            hasParking: Boolean(data.hasParking),
            hasFurniture: Boolean(data.hasFurniture),
          },
          address: {
            street: data.address?.street || 'Sin especificar',
            number: 'S/N',
            floor: String(data.floor || 1),
            city: data.address?.city || 'Lima',
            postalCode: '00000',
            ...(coordinates && { coordinates }),
          },
          area: Number(data.area || 0),
          bedrooms: Number(data.bedrooms || 0),
          bathrooms: Number(data.bathrooms || 0),
          floor: Number(data.floor || 1),
        };

      let dId = initialData?.id || initialData?._id;
      if (initialData && dId) {
        await departmentService.update(dId, payload);
        toast.success('Departamento actualizado exitosamente');
      } else {
        const newDept = await departmentService.create(payload);
        dId = newDept.id || newDept._id;
        toast.success('Departamento creado exitosamente');
      }
      
      if (selectedFiles.length > 0 && dId) {
        toast.loading('Subiendo imágenes...', { id: 'upload-toast' });
        try {
          await departmentService.uploadImages(dId, selectedFiles);
          toast.success('Imágenes subidas exitosamente', { id: 'upload-toast' });
        } catch (e: any) {
          const errMsg = e.response?.data?.message || 'Ocurrió un error al subir las imágenes';
          toast.error(errMsg, { id: 'upload-toast' });
        }
      }
      
      reset();
      setSelectedFiles([]);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar el departamento');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mt-auto md:mt-0">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">
            {initialData ? 'Editar Departamento' : 'Nuevo Departamento'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Código (Ej. 101)</label>
              <input 
                {...register('code', { required: true })} 
                className="w-full px-4 py-2 bg-white text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="101"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre (Ej. Dpto. Vista al Mar)</label>
              <input 
                {...register('name', { required: true })} 
                className="w-full px-4 py-2 bg-white text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Dpto Principal"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Dirección (Calle y número)</label>
              <input 
                {...register('address.street', { required: true })} 
                className="w-full px-4 py-2 bg-white text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Av. Los Pinos 123"
              />
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
              <input 
                {...register('address.city', { required: true })} 
                className="w-full px-4 py-2 bg-white text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Lima"
              />
            </div>

            <div className="col-span-1 md:col-span-2 mt-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Ubicación Exacta en Mapa</label>
              <MapPicker 
                initialPosition={coordinates || undefined} 
                onLocationSelect={(lat, lng) => setCoordinates({ lat, lng })}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Alquiler Mensual (S/)</label>
              <input 
                type="number"
                step="0.01"
                {...register('rentAmount', { required: true })} 
                className="w-full px-4 py-2 bg-white text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Garantía / Depósito (S/)</label>
              <input 
                type="number"
                step="0.01"
                {...register('deposit', { required: true })} 
                className="w-full px-4 py-2 bg-white text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Área (m²)</label>
              <input 
                type="number"
                {...register('area', { required: true })} 
                className="w-full px-4 py-2 bg-white text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Habitaciones</label>
              <input 
                type="number"
                {...register('bedrooms', { required: true })} 
                className="w-full px-4 py-2 bg-white text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Baños</label>
              <input 
                type="number"
                {...register('bathrooms', { required: true })} 
                className="w-full px-4 py-2 bg-white text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Piso</label>
              <input 
                type="number"
                {...register('floor', { required: true })} 
                className="w-full px-4 py-2 bg-white text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="col-span-1 flex items-center mt-6">
              <input 
                type="checkbox"
                id="hasParking"
                {...register('hasParking')} 
                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="hasParking" className="ml-2 block text-sm font-medium text-slate-700">Tiene Estacionamiento</label>
            </div>

            <div className="col-span-1 flex items-center mt-6">
              <input 
                type="checkbox"
                id="hasFurniture"
                {...register('hasFurniture')} 
                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="hasFurniture" className="ml-2 block text-sm font-medium text-slate-700">Amoblado</label>
            </div>

            <div className="col-span-1 md:col-span-2 mt-4 p-4 border border-slate-200 border-dashed rounded-xl bg-slate-50">
              <label className="block text-sm font-medium text-slate-700 mb-2">Imágenes del Departamento</label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-3 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-500 font-medium">Click para seleccionar o arrastra imágenes aquí</p>
                    <p className="text-xs text-slate-500">PNG, JPG o JPEG (Max. 10MB)</p>
                  </div>
                  <input 
                    id="dropzone-file" 
                    type="file" 
                    multiple
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files) {
                        setSelectedFiles(Array.from(e.target.files));
                      }
                    }}
                  />
                </label>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-slate-700 mb-2">Archivos seleccionados: {selectedFiles.length}</p>
                  <ul className="text-xs text-slate-500 grid grid-cols-2 gap-2">
                    {selectedFiles.map((file, i) => (
                      <li key={i} className="truncate bg-white p-2 rounded shadow-sm border border-slate-200">
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Guardando...' : 'Guardar Departamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
