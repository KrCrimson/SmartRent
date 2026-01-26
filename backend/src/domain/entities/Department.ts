export interface Address {
  street: string;
  number: string;
  floor?: string;
  city: string;
  postalCode: string;
}

export interface Features {
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  hasParking: boolean;
  hasFurniture: boolean;
}

export interface InventoryItem {
  category: string;
  item: string;
  quantity: number;
  condition: 'new' | 'good' | 'fair' | 'poor';
}

export type DepartmentStatus = 'available' | 'occupied' | 'maintenance';

export interface Department {
  _id?: string;
  code: string;
  name: string;
  description: string;
  status: DepartmentStatus;
  monthlyPrice: number;
  images: string[];
  address: Address;
  features: Features;
  inventory: InventoryItem[];
  currentTenant?: string; // User ID
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
