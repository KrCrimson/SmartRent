import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export interface ContractInfo {
  startDate: string;
  endDate: string;
  isActive: boolean;
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
}

export interface TenantInfo {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
}

export interface InventoryItem {
  category: string;
  item: string;
  quantity: number;
  condition: 'new' | 'good' | 'fair' | 'poor';
}

export interface MyDepartmentData {
  department: {
    _id: string;
    code: string;
    name: string;
    description: string;
    status: string;
    monthlyPrice: number;
    images: string[];
    address: {
      street: string;
      number: string;
      floor?: string;
      city: string;
      postalCode: string;
    };
    features: {
      bedrooms: number;
      bathrooms: number;
      squareMeters: number;
      hasParking: boolean;
      hasFurniture: boolean;
    };
    inventory: InventoryItem[];
  };
  contractInfo: ContractInfo;
  tenantInfo: TenantInfo;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class MyDepartmentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  async getMyDepartment(): Promise<MyDepartmentData> {
    try {
      const response = await axios.get<ApiResponse<MyDepartmentData>>(
        `${API_BASE_URL}/departments/my`,
        {
          headers: this.getAuthHeaders()
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener departamento');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching my department:', error);
      
      if (error.response?.status === 401) {
        throw new Error('No tienes permisos para acceder a esta información');
      } else if (error.response?.status === 404) {
        throw new Error('No tienes un departamento asignado');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error de conexión al servidor');
      }
    }
  }

  /**
   * Formatear fecha para mostrar en UI
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatear fecha corta
   */
  formatShortDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  /**
   * Obtener tiempo relativo (ej: "hace 3 días", "en 5 días")
   */
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';
    if (diffDays > 0) return `En ${diffDays} días`;
    return `Hace ${Math.abs(diffDays)} días`;
  }

  /**
   * Obtener color del badge según condición del inventario
   */
  getConditionColor(condition: string): string {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Obtener texto de condición en español
   */
  getConditionText(condition: string): string {
    switch (condition) {
      case 'new': return 'Nuevo';
      case 'good': return 'Bueno';
      case 'fair': return 'Regular';
      case 'poor': return 'Malo';
      default: return 'Desconocido';
    }
  }

  /**
   * Agrupar inventario por categoría
   */
  groupInventoryByCategory(inventory: MyDepartmentData['department']['inventory']) {
    return inventory.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof inventory>);
  }
}

export const myDepartmentService = new MyDepartmentService();
export default myDepartmentService;