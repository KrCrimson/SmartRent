import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import type { Address } from '@/types/department';

interface LocationMapProps {
  address: Address;
  departmentName: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({ address, departmentName }) => {
  const fullAddress = `${address.street} ${address.number}, ${address.city}, ${address.state}, ${address.country}`;
  
  // Construir URL de Google Maps
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  
  // URL para abrir direcciones en Google Maps
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-primary-600" />
        Ubicación
      </h3>

      <div className="space-y-4">
        {/* Información de la dirección */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Dirección completa</h4>
          <div className="space-y-2 text-gray-600">
            <div><strong>Calle:</strong> {address.street} {address.number}</div>
            {address.apartment && (
              <div><strong>Apartamento:</strong> {address.apartment}</div>
            )}
            <div><strong>Ciudad:</strong> {address.city}</div>
            <div><strong>Estado:</strong> {address.state}</div>
            <div><strong>Código Postal:</strong> {address.zipCode}</div>
            <div><strong>País:</strong> {address.country}</div>
          </div>
        </div>

        {/* Mapa embebido (placeholder) */}
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <div className="aspect-video relative">
            {/* Placeholder para mapa - En producción se usaría Google Maps API */}
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  {departmentName}
                </h4>
                <p className="text-gray-600 mb-4">
                  {fullAddress}
                </p>
                <div className="space-y-2">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mr-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Ver en Google Maps
                  </a>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Cómo llegar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Información de ubicación</h4>
          <p className="text-blue-800 text-sm">
            Para una experiencia completa del mapa interactivo, haz clic en "Ver en Google Maps" 
            donde podrás explorar la zona, ver fotos del street view y encontrar servicios cercanos.
          </p>
        </div>

        {/* Servicios cercanos (información estática) */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Servicios cercanos comunes</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Transporte público</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Supermercados</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Hospitales</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>Escuelas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>Restaurantes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
              <span>Farmacias</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Consulta Google Maps para ubicaciones específicas y distancias exactas
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;