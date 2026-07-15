import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los íconos por defecto de Leaflet en React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  initialPosition?: { lat: number; lng: number };
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMarker: React.FC<{
  position: { lat: number; lng: number } | null;
  setPosition: (pos: { lat: number; lng: number }) => void;
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ position, setPosition, onLocationSelect }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

export const MapPicker: React.FC<MapPickerProps> = ({ initialPosition, onLocationSelect }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(initialPosition || null);
  
  // Coordenadas por defecto Tacna, Perú si no hay inicial
  const defaultCenter = initialPosition || { lat: -18.018173244320337, lng: -70.25623216992915 };

  return (
    <div className="w-full h-64 bg-slate-100 rounded-lg overflow-hidden border border-slate-300 relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
      </MapContainer>
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 z-[1000] shadow-sm pointer-events-none">
        Haz clic en el mapa para fijar la ubicación
      </div>
    </div>
  );
};

export default MapPicker;
