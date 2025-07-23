import { apiService } from './api';
import type { AuthResponse, LoginDto, RegisterDto } from './types';

class AuthService {
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      '/auth/login',
      loginDto,
    );
    apiService.setToken(response.access_token);
    return response;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      '/auth/register',
      registerDto,
    );
    apiService.setToken(response.access_token);
    return response;
  }

  async logout(): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>('/auth/logout');
    apiService.removeToken();
    return response;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}

export const authService = new AuthService();
