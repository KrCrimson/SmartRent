export interface ContactInfo {
  email: string;
  phone: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  occupation: string;
  monthlyIncome: number;
}

export interface TenantDocuments {
  idNumber: string;
  idType: 'passport' | 'nationalId' | 'driversLicense';
  proofOfIncome?: string; // URL del documento
  references?: string[];   // URLs de referencias
}

export type TenantStatus = 'active' | 'inactive' | 'pending' | 'terminated';

export interface Tenant {
  id: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  documents: TenantDocuments;
  status: TenantStatus;
  currentDepartment?: string; // Department ID
  leaseStartDate?: string;
  leaseEndDate?: string;
  monthlyRent?: number;
  securityDeposit?: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}