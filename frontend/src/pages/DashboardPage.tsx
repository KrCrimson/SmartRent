import React from 'react';
import { useAuth } from '@hooks/useAuth';
import { LogOut, User, Home, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-display font-bold text-slate-900">Portal Inquilinos</h1>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-red-600 font-semibold rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-1">
                Bienvenido, {user?.fullName}
              </h2>
              <p className="text-slate-500 mb-3">{user?.email}</p>
              <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full font-semibold border border-slate-200 capitalize">
                Rol: {user?.role}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <h3 className="text-xl font-display font-bold text-slate-900 mb-6">Tu Información</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Estado de Cuenta</dt>
                <dd className="text-lg font-bold text-slate-900">
                  <span className={`inline-flex items-center gap-1.5 ${
                    user?.isActive ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${user?.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {user?.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </dd>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">ID de Cliente</dt>
                <dd className="text-sm text-slate-700 font-mono mt-1 break-all">{user?._id}</dd>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Miembro Desde</dt>
                <dd className="text-base font-semibold text-slate-900 mt-1">
                  {user?.createdAt && new Date(user.createdAt).toLocaleDateString('es-ES')}
                </dd>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Departamento</dt>
                <dd className="text-base font-semibold text-slate-500 mt-1">
                  Aún no asignado
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5 shadow-sm text-emerald-600">
              <Home className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-emerald-900 mb-3">
              ¿Buscas un departamento?
            </h3>
            <p className="text-emerald-800 mb-6">
              Explora nuestro catálogo público de propiedades disponibles y encuentra tu nuevo hogar.
            </p>
            <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
              Ver Catálogo
            </Link>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-5 shadow-sm text-slate-300">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-3">
              Tus Contratos
            </h3>
            <p className="text-slate-400 mb-6">
              El módulo de contratos y pagos estará disponible muy pronto. Podrás ver tus recibos y fechas de pago aquí.
            </p>
            <button disabled className="inline-flex items-center justify-center px-6 py-3 bg-slate-800 text-slate-400 font-semibold rounded-xl cursor-not-allowed">
              Próximamente
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default DashboardPage;
