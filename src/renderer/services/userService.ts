import { apiService } from './api';
import type { User, UpdateUserDto } from './types';

class UsersService {
  async getAllUsers(): Promise<User[]> {
    return apiService.get<User[]>('/users');
  }

  async getUserById(id: string): Promise<User> {
    return apiService.get<User>(`/users/${id}`);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return apiService.patch<User>(`/users/${id}`, updateUserDto);
  }

  async searchUsers(query: string): Promise<User[]> {
    return apiService.get<User[]>(
      `/users/search?q=${encodeURIComponent(query)}`,
    );
  }

  async updateOnlineStatus(isOnline: boolean): Promise<void> {
    await apiService.patch<void>('/users/online-status', { isOnline });
  }
}

export const usersService = new UsersService();
