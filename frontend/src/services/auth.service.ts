import { apiClient } from './api';
import {
  AuthResponse,
  LoginPayload,
  ReadinessPayload,
  RegisterPayload,
  RegisterResponse,
  User,
} from '../types/auth.types';

export const authService = {
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/api/auth/register', payload);
    return response.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', payload);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; user: User }>('/api/auth/me');
    return response.data.user;
  },

  async updateReadiness(payload: ReadinessPayload): Promise<User> {
    const response = await apiClient.patch<{ success: boolean; user: User }>(
      '/api/auth/me/readiness',
      payload
    );
    return response.data.user;
  },
};

