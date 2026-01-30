import api from './api';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth';
import type { ApiResponse } from '../types/api';

export const authService = {
  /**
   * Login de usuario
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    
    const { user, accessToken, refreshToken } = response.data.data!;
    
    // Guardar en localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data.data!;
  },

  /**
   * Registro de nuevo usuario (solo admin)
   */
  async register(data: RegisterData): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/auth/register', data);
    return response.data.data!;
  },

  /**
   * Obtener usuario actual
   */
  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      // Limpiar localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', {
      refreshToken,
    });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data.data!;
    
    // Actualizar tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    return response.data.data!;
  },

  /**
   * Verificar si hay sesión activa
   */
  hasSession(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Obtener usuario del localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authService;
