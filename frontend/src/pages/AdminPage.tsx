import React from 'react';
import { useAuth } from '@hooks/useAuth';
import { LogOut, User, Shield, Settings } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              <span className="inline-block mt-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-semibold">
                👑 Administrador
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Usuarios</h3>
            <p className="text-gray-600 text-sm mb-4">
              Crear, editar y gestionar usuarios del sistema
            </p>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Sprint 2
            </span>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Departamentos</h3>
            <p className="text-gray-600 text-sm mb-4">
              Administrar departamentos y sus inquilinos
            </p>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Sprint 3
            </span>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Alertas</h3>
            <p className="text-gray-600 text-sm mb-4">
              Sistema de notificaciones y alertas
            </p>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Sprint 4
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Usuarios</div>
            <div className="text-3xl font-bold text-gray-900">1</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Departamentos</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Inquilinos</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Alertas</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </div>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-green-900 mb-2">
            ✅ Sprint 1 Completado Exitosamente
          </h3>
          <p className="text-green-800">
            El sistema de autenticación con roles está funcionando correctamente. 
            Los módulos adicionales se implementarán en los siguientes sprints según el roadmap del proyecto.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
