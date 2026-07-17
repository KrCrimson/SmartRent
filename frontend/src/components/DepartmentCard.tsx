import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Trash2 } from 'lucide-react';
import type { Department } from '@/types/department';

interface DepartmentCardProps {
  department: Department;
  isAdmin?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({ department, isAdmin, onDelete, onEdit }) => {
  const isAvailable = department.status === 'available' || department.isAvailable === true;
  const statusColor = isAvailable ? 'text-emerald-700' : 'text-red-700';
  const statusLabel = isAvailable ? 'Disponible' : 'Ocupado';

  const fallbackImage = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800';
  const mainImage = department.images?.[0] || `/depas/${department.code}/1.jpg`;
  const depId = department.id || department._id;

  return (
    <Link
      to={`/departments/${depId}`}
      className="block bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 group"
    >
      {/* Imagen */}
      <div className="relative h-56 overflow-hidden bg-slate-200">
        <img
          src={mainImage}
          alt={department.name}
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          {isAdmin && (
            <div className="flex gap-2">
              {onEdit && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit();
                  }}
                  className="p-2 bg-white/90 hover:bg-emerald-600 hover:text-white text-emerald-600 rounded-full shadow-lg backdrop-blur-sm transition-all"
                  title="Editar departamento"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete();
                  }}
                  className="p-2 bg-white/90 hover:bg-red-600 hover:text-white text-red-600 rounded-full shadow-lg backdrop-blur-sm transition-all"
                  title="Eliminar departamento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm bg-white/90 ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
          S/ {department.monthlyPrice?.toLocaleString() || department.rentAmount?.toLocaleString() || 0}/mes
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-display font-bold text-slate-900 mb-1">{department.name}</h3>
          <p className="text-sm font-bold text-emerald-600 font-mono">Dpto. {department.code}</p>
        </div>

        <div className="flex items-center text-sm text-slate-500 mb-4">
          <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
          <span className="truncate">
            {department.address?.street || 'Sin dirección'}, {department.address?.city || ''}
          </span>
        </div>

        <p className="text-sm text-slate-600 mb-6 line-clamp-2 leading-relaxed">
          {department.description}
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-slate-100">
          <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl">
            <Bed className="w-5 h-5 mb-1 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">{department.features?.bedrooms || department.bedrooms || 0} hab.</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl">
            <Bath className="w-5 h-5 mb-1 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">{department.features?.bathrooms || department.bathrooms || 0} baños</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl">
            <Square className="w-5 h-5 mb-1 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">{department.features?.squareMeters || department.area || 0} m²</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DepartmentCard;
