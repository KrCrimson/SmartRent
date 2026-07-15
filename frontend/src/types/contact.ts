export type ContactRequestStatus = 'PENDING' | 'REVIEWED' | 'CONTACTED';

export interface ContactRequest {
  id: string;
  departmentId: string;
  departmentName: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  interestedInVisit: boolean;
  status: ContactRequestStatus;
  createdAt: string;
}

export type CreateContactRequest = Omit<ContactRequest, 'id' | 'status' | 'createdAt'>;
