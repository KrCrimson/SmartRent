import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import AlertForm from '@/components/alerts/AlertForm';

const CreateAlertPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const departmentId = searchParams.get('departmentId') || undefined;

  const handleSuccess = () => {
    navigate('/alerts', { 
      state: { 
        message: 'Alerta creada exitosamente. Un administrador la revisará pronto.' 
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reportar Problema
              </h1>
              <p className="text-gray-600 mt-1">
                Reporta cualquier problema en tu departamento o edificio
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-1">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-1">
                ¿Cómo funciona el reporte de alertas?
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Tu reporte será enviado inmediatamente al administrador</li>
                <li>• Recibirás una notificación cuando se inicie el trabajo</li>
                <li>• Puedes adjuntar hasta 3 fotos del problema</li>
                <li>• Selecciona la prioridad según la urgencia del problema</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Alert Form */}
        <AlertForm 
          onSuccess={handleSuccess}
          departmentId={departmentId}
        />

        {/* Emergency Notice */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 mb-1">
                ¿Es una emergencia?
              </h4>
              <p className="text-sm text-red-700">
                Si es una emergencia que requiere atención inmediata (fuga de gas, incendio, 
                robo, etc.), contacta directamente al administrador o servicios de emergencia.
              </p>
              <div className="mt-2 flex gap-4 text-sm font-medium text-red-800">
                <span>📞 Emergencias: 133</span>
                <span>📞 Administración: +56 9 XXXX XXXX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAlertPage;