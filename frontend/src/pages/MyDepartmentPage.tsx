import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  Sofa,
  Package,
  Loader2,
  AlertCircle,
  Phone,
  Mail
} from 'lucide-react';
import myDepartmentService, { MyDepartmentData } from '../services/myDepartmentService';
import { ContractInfoView } from '../components/ContractInfoView';
import { InventoryView } from '../components/InventoryView';
import { NotificationSystem } from '../components/NotificationSystem';

const MyDepartmentPage: React.FC = () => {
  const { user } = useAuth();
  const [departmentData, setDepartmentData] = useState<MyDepartmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'contract' | 'inventory'>('overview');

  useEffect(() => {
    loadMyDepartment();
  }, []);

  const loadMyDepartment = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await myDepartmentService.getMyDepartment();
      setDepartmentData(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar tu departamento');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tu departamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No se pudo cargar tu departamento
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadMyDepartment}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!departmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No tienes un departamento asignado
          </h2>
          <p className="text-gray-600">
            Contacta al administrador para obtener más información.
          </p>
        </div>
      </div>
    );
  }

  const { department, contractInfo, tenantInfo } = departmentData;

  const tabs = [
    { id: 'overview' as const, label: 'Información', icon: Home },
    { id: 'contract' as const, label: 'Contrato', icon: Calendar },
    { id: 'inventory' as const, label: 'Inventario', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Departamento</h1>
              <p className="text-gray-600">
                Bienvenido/a, {tenantInfo.fullName}
              </p>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {contractInfo.isActive ? (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Contrato Activo</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Contrato Inactivo</span>
                </div>
              )}
              
              {contractInfo.isExpiringSoon && (
                <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Próximo a vencer</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-br from-blue-500 to-blue-700">
        {department.images && department.images.length > 0 ? (
          <img 
            src={department.images[0]} 
            alt={department.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-24 h-24 text-white opacity-50" />
          </div>
        )}
        
        {/* Overlay with department info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">{department.name}</h2>
            <p className="text-white/90">Código: {department.code}</p>
            <div className="flex items-center gap-2 text-white/90 mt-2">
              <MapPin className="w-4 h-4" />
              <span>
                {department.address.street} {department.address.number}, {department.address.city}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <Bed className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{department.features.bedrooms}</div>
                <div className="text-sm text-gray-600">Dormitorios</div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <Bath className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{department.features.bathrooms}</div>
                <div className="text-sm text-gray-600">Baños</div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <Square className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{department.features.squareMeters}</div>
                <div className="text-sm text-gray-600">m²</div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${department.monthlyPrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Renta mensual</div>
              </div>
            </div>

            {/* Features & Amenities */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Características</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Car className={`w-5 h-5 ${department.features.hasParking ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={department.features.hasParking ? 'text-gray-900' : 'text-gray-500'}>
                      {department.features.hasParking ? 'Estacionamiento incluido' : 'Sin estacionamiento'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Sofa className={`w-5 h-5 ${department.features.hasFurniture ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={department.features.hasFurniture ? 'text-gray-900' : 'text-gray-500'}>
                      {department.features.hasFurniture ? 'Amoblado' : 'Sin muebles'}
                    </span>
                  </div>
                </div>

                {department.description && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                    <p className="text-gray-700">{department.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Tu Información</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{tenantInfo.fullName}</div>
                      <div className="text-sm text-gray-600">Inquilino</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{tenantInfo.email}</div>
                      <div className="text-sm text-gray-600">Email</div>
                    </div>
                  </div>

                  {tenantInfo.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{tenantInfo.phone}</div>
                        <div className="text-sm text-gray-600">Teléfono</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contract Tab - Now implemented with ContractInfoView */}
        {activeTab === 'contract' && (
          <ContractInfoView
            contractInfo={contractInfo}
            monthlyPrice={department.monthlyPrice}
            tenantInfo={tenantInfo}
          />
        )}

        {/* Inventory Tab - Implemented with InventoryView */}
        {activeTab === 'inventory' && (
          <InventoryView inventory={department.inventory} />
        )}
      </div>
    </div>
  );
};

export default MyDepartmentPage;