import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Car, Sofa } from 'lucide-react';
import type { Department } from '@/types/department';

interface DepartmentCardProps {
  department: Department;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({ department }) => {
  const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
  };

  const statusLabels: Record<string, string> = {
    available: 'Disponible',
    occupied: 'Ocupado',
    maintenance: 'Mantenimiento',
  };

  const mainImage = department.images[0] || 'https://via.placeholder.com/400x300?text=Sin+Imagen';

  return (
    <Link
      to={`/departments/${department._id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
    >
      {/* Imagen */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={mainImage}
          alt={department.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[department.status]}`}>
            {statusLabels[department.status]}
          </span>
        </div>
        <div className="absolute bottom-2 left-2 bg-primary-600 text-white px-3 py-1 rounded-md text-sm font-bold">
          ${department.monthlyPrice.toLocaleString()}/mes
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{department.name}</h3>
            <p className="text-sm text-gray-600 font-mono">{department.code}</p>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span>
            {department.address.street} {department.address.number}, {department.address.city}
          </span>
        </div>

        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {department.description}
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Bed className="w-4 h-4 mr-1" />
            <span>{department.features.bedrooms} hab.</span>
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1" />
            <span>{department.features.bathrooms} baños</span>
          </div>
          <div className="flex items-center">
            <Square className="w-4 h-4 mr-1" />
            <span>{department.features.squareMeters}m²</span>
          </div>
        </div>

        {/* Extras */}
        <div className="flex gap-2">
          {department.features.hasParking && (
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              <Car className="w-3 h-3 mr-1" />
              Parking
            </span>
          )}
          {department.features.hasFurniture && (
            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
              <Sofa className="w-3 h-3 mr-1" />
              Amoblado
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default DepartmentCard;
