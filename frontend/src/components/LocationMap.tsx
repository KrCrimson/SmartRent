import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import type { Address } from '@/types/department';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMapProps {
  address: Address;
  departmentName: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({ address, departmentName }) => {
  const parts = [
    `${address.street} ${address.number || ''}`.trim(),
    address.city,
    address.state,
    address.country
  ].filter(Boolean);
  const fullAddress = parts.join(', ');
  
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
            {address.state && <div><strong>Estado:</strong> {address.state}</div>}
            {address.zipCode && <div><strong>Código Postal:</strong> {address.zipCode}</div>}
            {address.postalCode && <div><strong>Código Postal:</strong> {address.postalCode}</div>}
            {address.country && <div><strong>País:</strong> {address.country}</div>}
          </div>
        </div>

        {/* Mapa embebido */}
        <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          <div className="aspect-video relative z-0">
            {address.coordinates ? (
              <MapContainer 
                center={[address.coordinates.lat, address.coordinates.lng]} 
                zoom={15} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%', zIndex: 0 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[address.coordinates.lat, address.coordinates.lng]} />
                <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 p-2 rounded shadow-md pointer-events-auto">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <Navigation className="w-4 h-4" />
                    Cómo llegar (Google Maps)
                  </a>
                </div>
              </MapContainer>
            ) : (
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
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Ver en Google Maps
                    </a>
                  </div>
                </div>
              </div>
            )}
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