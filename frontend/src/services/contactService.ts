import api from './api';

export interface CreateContactRequestData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface ContactRequest extends CreateContactRequestData {
  _id: string;
  status: 'pending' | 'reviewed' | 'contacted';
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const createContactRequest = async (data: CreateContactRequestData): Promise<ContactRequest> => {
  const response = await api.post<ApiResponse<ContactRequest>>('/contact', data);
  return response.data.data;
};

export const contactService = {
  create: createContactRequest
};
