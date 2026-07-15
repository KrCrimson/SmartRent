import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { LogOut, User, Shield, Users, Building2, Bell, Inbox, Activity, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllUsers } from '@/services/userService';
import { departmentService } from '@/services/departmentService';

export const AdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  
  const [stats, setStats] = useState({
    users: 0,
    departments: 0,
    tenants: 0,
    alerts: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersData, deptsData] = await Promise.all([
          getAllUsers(),
          departmentService.getAll()
        ]);
        
        const tenantsCount = usersData.filter(u => u.role === 'user' && u.assignedDepartmentId).length;
        
        setStats({
          users: usersData.length,
          departments: deptsData.length,
          tenants: tenantsCount,
          alerts: 0, // Por ahora 0 o lógica futura
          loading: false
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(s => ({ ...s, loading: false }));
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Navbar Glassmorphism */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors mr-2">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-900 hidden sm:block">Panel de Administración</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-red-600 font-semibold rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Información del Admin */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-10 flex items-center gap-6">
          <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-slate-400" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-1">
              {user?.fullName}
            </h2>
            <p className="text-slate-500 mb-3">{user?.email}</p>
            <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full font-semibold border border-emerald-200">
              👑 Super Administrador
            </span>
          </div>
        </div>

        <h3 className="text-xl font-display font-bold text-slate-900 mb-6">Módulos del Sistema</h3>
        
        {/* Módulos del Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          
          <Link to="/admin/usuarios" className="group block bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900 mb-2">Gestión de Usuarios</h3>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              Crear, editar y gestionar los accesos de inquilinos y administradores.
            </p>
          </Link>

          <Link to="/departments" className="group block bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900 mb-2">Departamentos</h3>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              Administrar el catálogo de propiedades, precios, estado e inquilinos asignados.
            </p>
          </Link>

          <Link to="/admin/reservas" className="group block bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Inbox className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900 mb-2">Peticiones de Reserva</h3>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              Bandeja de entrada con solicitudes de contacto e interés por propiedades.
            </p>
          </Link>

          <div className="group block bg-white/50 rounded-2xl border border-slate-200 border-dashed p-6 opacity-70">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-5">
              <Bell className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-500 mb-2">Alertas y Pagos</h3>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              Sistema de notificaciones automáticas para cobros y mantenimientos.
            </p>
          </div>

        </div>

        {/* Estadísticas Rápidas */}
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-6 h-6 text-slate-800" />
          <h3 className="text-xl font-display font-bold text-slate-900">Estadísticas Generales</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 border border-blue-400 p-6 flex flex-col justify-between text-white transform hover:scale-[1.02] transition-all duration-300">
            <div className="text-sm font-semibold uppercase tracking-wider mb-4 text-blue-100 flex items-center justify-between">
              Usuarios
              <Users className="w-6 h-6 opacity-80" />
            </div>
            <div className="text-5xl font-display font-bold">
              {stats.loading ? '...' : stats.users}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20 border border-emerald-400 p-6 flex flex-col justify-between text-white transform hover:scale-[1.02] transition-all duration-300">
            <div className="text-sm font-semibold uppercase tracking-wider mb-4 text-emerald-100 flex items-center justify-between">
              Departamentos
              <Building2 className="w-6 h-6 opacity-80" />
            </div>
            <div className="text-5xl font-display font-bold">
              {stats.loading ? '...' : stats.departments}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20 border border-indigo-400 p-6 flex flex-col justify-between text-white transform hover:scale-[1.02] transition-all duration-300">
            <div className="text-sm font-semibold uppercase tracking-wider mb-4 text-indigo-100 flex items-center justify-between">
              Inquilinos
              <User className="w-6 h-6 opacity-80" />
            </div>
            <div className="text-5xl font-display font-bold">
              {stats.loading ? '...' : stats.tenants}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl shadow-lg shadow-rose-500/20 border border-rose-400 p-6 flex flex-col justify-between text-white transform hover:scale-[1.02] transition-all duration-300">
            <div className="text-sm font-semibold uppercase tracking-wider mb-4 text-rose-100 flex items-center justify-between">
              Alertas
              <Bell className="w-6 h-6 opacity-80" />
            </div>
            <div className="text-5xl font-display font-bold">
              {stats.loading ? '...' : stats.alerts}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminPage;
