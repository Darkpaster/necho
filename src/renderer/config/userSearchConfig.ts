import { usersService } from '../services/userService';
import { User } from '../services/types';
import { ReactNode } from 'react';

export interface SearchConfig {
  title: string;
  placeholder: string;
  emptyMessage: string;
  searchFunction: (query: string) => Promise<User[]>;
  renderItem?: (item: User) => ReactNode;
  allowMultiSelect?: boolean;
  maxResults?: number;
  minQueryLength?: number;
}

export const userSearchConfig: SearchConfig = {
  title: 'Найти пользователя',
  placeholder: 'Введите имя пользователя...',
  emptyMessage: 'Пользователи не найдены',
  searchFunction: async (query: string): Promise<User[]> => {
    try {
      // Поиск пользователей по name
      return await usersService.searchUsers(query);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },
  allowMultiSelect: false,
  maxResults: 20,
  minQueryLength: 2,
};