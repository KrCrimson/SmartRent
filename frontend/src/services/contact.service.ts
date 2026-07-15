import { api } from './api';
import type { ContactRequest, CreateContactRequest, ContactRequestStatus } from '../types/contact';

export const contactService = {
  // Crear una nueva solicitud (Público)
  async createRequest(data: CreateContactRequest): Promise<ContactRequest> {
    const response = await api.post('/contact', data);
    return response.data.data;
  },

  // Obtener todas las solicitudes (Admin)
  async getRequests(): Promise<ContactRequest[]> {
    const response = await api.get('/contact');
    return response.data.data;
  },

  // Actualizar el estado de una solicitud (Admin)
  async updateStatus(id: string, status: ContactRequestStatus): Promise<ContactRequest> {
    const response = await api.patch(`/contact/${id}/status`, { status });
    return response.data.data;
  }
};
