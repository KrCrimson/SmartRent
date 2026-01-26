import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, MapPin, Bed, Bath, Square, Car, Sofa, Calendar, Home } from 'lucide-react';
import { ImageCarousel } from '@/components/ImageCarousel';
import { InventoryList } from '@/components/InventoryList';
import { LocationMap } from '@/components/LocationMap';
import { ContactForm } from '@/components/ContactForm';
import { departmentService } from '@/services/departmentService';
import type { Department } from '@/types/department';

export const DepartmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'location' | 'contact'>('overview');

  useEffect(() => {
    if (id) {
      loadDepartment(id);
    }
  }, [id]);

  const loadDepartment = async (departmentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await departmentService.getById(departmentId);
      setDepartment(data);
    } catch (err) {
      setError('Error al cargar el departamento. Verifica que el ID sea correcto.');
      console.error('Error loading department:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando departamento...</p>
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Departamento no encontrado</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/departments"
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la galería
          </Link>
        </div>
      </div>
    );
  }

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
  };

  const statusLabels = {
    available: 'Disponible',
    occupied: 'Ocupado',
    maintenance: 'En mantenimiento',
  };

  const tabs = [
    { id: 'overview' as const, label: 'Información', icon: Home },
    { id: 'inventory' as const, label: 'Inventario', icon: Square },
    { id: 'location' as const, label: 'Ubicación', icon: MapPin },
    { id: 'contact' as const, label: 'Contacto', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/departments"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver a la galería
            </Link>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">Código: {department.code}</div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[department.status]}`}>
                {statusLabels[department.status]}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2">
            {/* Carrusel de imágenes */}
            <div className="mb-8">
              <ImageCarousel images={department.images} alt={department.name} />
            </div>

            {/* Información básica */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{department.name}</h1>
              
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span>
                  {department.address.street} {department.address.number}, {department.address.city}, {department.address.state}
                </span>
              </div>

              <div className="text-3xl font-bold text-primary-600 mb-6">
                ${department.monthlyPrice.toLocaleString()}/mes
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                {department.description}
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Bed className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-semibold">{department.features.bedrooms}</div>
                    <div className="text-sm text-gray-600">Recámaras</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Bath className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-semibold">{department.features.bathrooms}</div>
                    <div className="text-sm text-gray-600">Baños</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Square className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-semibold">{department.features.squareMeters}m²</div>
                    <div className="text-sm text-gray-600">Área</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Home className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-semibold">{department.features.floor}º</div>
                    <div className="text-sm text-gray-600">Piso</div>
                  </div>
                </div>
              </div>

              {/* Extras */}
              <div className="flex flex-wrap gap-2">
                {department.features.hasParking && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    <Car className="w-4 h-4 mr-1" />
                    Estacionamiento
                  </span>
                )}
                {department.features.hasFurniture && (
                  <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    <Sofa className="w-4 h-4 mr-1" />
                    Amoblado
                  </span>
                )}
              </div>
            </div>

            {/* Tabs de contenido adicional */}
            <div className="bg-white rounded-lg shadow-md">
              {/* Tab headers */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Características detalladas</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium text-gray-700">Piso:</span>
                          <span className="ml-2 text-gray-600">{department.features.floor}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Área total:</span>
                          <span className="ml-2 text-gray-600">{department.features.squareMeters}m²</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Estacionamiento:</span>
                          <span className="ml-2 text-gray-600">{department.features.hasParking ? 'Sí' : 'No'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Amoblado:</span>
                          <span className="ml-2 text-gray-600">{department.features.hasFurniture ? 'Sí' : 'No'}</span>
                        </div>
                      </div>
                    </div>

                    {department.currentTenant && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900 mb-2">Estado actual</h4>
                        <p className="text-yellow-800 text-sm">
                          Este departamento está actualmente ocupado.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <InventoryList inventory={department.inventory || []} />
                )}

                {activeTab === 'location' && (
                  <LocationMap address={department.address} departmentName={department.name} />
                )}

                {activeTab === 'contact' && department.status === 'available' && (
                  <ContactForm departmentName={department.name} departmentId={department._id} />
                )}

                {activeTab === 'contact' && department.status !== 'available' && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Departamento no disponible
                    </h3>
                    <p className="text-gray-600">
                      Este departamento está actualmente {department.status === 'occupied' ? 'ocupado' : 'en mantenimiento'} 
                      y no está disponible para renta.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resumen de contacto rápido */}
            {department.status === 'available' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">¿Te interesa este departamento?</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('contact')}
                    className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Contactar ahora
                  </button>
                  <button
                    onClick={() => setActiveTab('location')}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Ver ubicación
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Respuesta garantizada en menos de 24 horas
                </p>
              </div>
            )}

            {/* Información destacada */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Información destacada</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Código:</span>
                  <span className="font-medium">{department.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio mensual:</span>
                  <span className="font-medium">${department.monthlyPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[department.status]}`}>
                    {statusLabels[department.status]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Última actualización:</span>
                  <span className="font-medium">
                    {new Date(department.updatedAt || department.createdAt || '').toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetailPage;