// Department and Address types for frontend

export interface Address {
  street: string;
  number: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  zipCode?: string;
  floor?: string | number;
  apartment?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Department {
  _id?: string;
  id?: string;
  code: string;
  name: string;
  description?: string;
  address: Address;
  monthlyPrice: number;
  rentAmount?: number; // Para retrocompatibilidad
  deposit: number;
  area?: number; 
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  isAvailable?: boolean;
  status: DepartmentStatus;
  amenities: string[];
  features: {
    bedrooms: number;
    bathrooms: number;
    squareMeters: number;
    hasParking?: boolean;
    hasFurniture?: boolean;
  };
  inventory?: InventoryItem[];
  images: string[];
  currentTenant?: {
    id: string;
    name: string;
    email: string;
    contractStartDate: Date;
    contractEndDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDepartmentData {
  code: string;
  name: string;
  description?: string;
  address: Address;
  rentAmount: number;
  deposit: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  hasParking?: boolean;
  hasFurniture?: boolean;
  amenities: string[];
  features: string[];
  images?: string[];
}

export interface UpdateDepartmentData {
  code?: string;
  name?: string;
  description?: string;
  address?: Address;
  rentAmount?: number;
  deposit?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  isAvailable?: boolean;
  amenities?: string[];
  features?: string[];
  images?: string[];
}

export interface DepartmentFilters {
  isAvailable?: boolean;
  status?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  floor?: number;
  amenities?: string[];
  features?: string[];
  search?: string;
  hasParking?: boolean;
  hasFurniture?: boolean;
}

export type DepartmentStatus = 'available' | 'occupied' | 'maintenance';

export interface InventoryItem {
  id: string;
  name: string;
  condition: string;
  quantity: number;
}

// Enum for common amenities
export enum DepartmentAmenity {
  PARKING = 'parking',
  ELEVATOR = 'elevator',
  BALCONY = 'balcony',
  LAUNDRY = 'laundry',
  GYM = 'gym',
  POOL = 'pool',
  GARDEN = 'garden',
  SECURITY = 'security',
  INTERNET = 'internet',
  AC = 'air_conditioning',
  HEATING = 'heating'
}

// Enum for common features
export enum DepartmentFeature {
  FURNISHED = 'furnished',
  PETS_ALLOWED = 'pets_allowed',
  SMOKING_ALLOWED = 'smoking_allowed',
  KITCHEN_EQUIPPED = 'kitchen_equipped',
  WASHER_DRYER = 'washer_dryer',
  DISHWASHER = 'dishwasher',
  MICROWAVE = 'microwave',
  REFRIGERATOR = 'refrigerator'
}
