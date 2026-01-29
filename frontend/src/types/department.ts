// Department and Address types for frontend

export interface Address {
  street: string;
  number: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  address: Address;
  rentAmount: number;
  deposit: number;
  area: number; // in square meters
  bedrooms: number;
  bathrooms: number;
  floor: number;
  isAvailable: boolean;
  amenities: string[];
  features: string[];
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
