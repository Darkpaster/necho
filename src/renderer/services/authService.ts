import { apiService } from './api';
import type { AuthResponse, LoginDto, RegisterDto, User } from './types';

class AuthService {
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      '/auth/login',
      loginDto,
    );
    return response;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      '/auth/register',
      registerDto,
    );
    return response;
  }

  async logout(): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>('/auth/logout');
    return response;
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/refresh');
      return response;
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<{ user: User }>('/auth/me');
    return response.user;
  }

  async checkAuthStatus(): Promise<boolean> {
    try {
      const response = await apiService.get<{ isAuthenticated: boolean }>(
        '/auth/check',
      );
      return response.isAuthenticated;
    } catch (error) {
      return false;
    }
  }

  // Helper method to handle token refresh automatically
  async withTokenRefresh<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall();
    } catch (error: any) {
      if (error.response?.status === 401) {
        try {
          await this.refreshToken();
          return await apiCall();
        } catch (refreshError) {
          throw new Error('Authentication expired. Please login again.');
        }
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
