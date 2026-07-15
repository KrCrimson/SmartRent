export type ContactRequestStatus = 'PENDING' | 'REVIEWED' | 'CONTACTED';

export interface ContactRequest {
  _id?: string;
  id?: string;
  departmentId?: string;
  departmentName?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  interestedInVisit?: boolean;
  status: ContactRequestStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateContactRequestDto = Omit<ContactRequest, '_id' | 'id' | 'status' | 'createdAt' | 'updatedAt'>;
export type UpdateContactRequestDto = Partial<ContactRequest>;
