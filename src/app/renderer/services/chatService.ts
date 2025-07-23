import { apiService } from './api';
import type { Chat, CreateChatDto } from './types';

class ChatsService {
  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    return apiService.post<Chat>('/chats', createChatDto);
  }

  async getUserChats(): Promise<Chat[]> {
    return apiService.get<Chat[]>('/chats');
  }

  async getChatById(id: string): Promise<Chat> {
    return apiService.get<Chat>(`/chats/${id}`);
  }

  async addParticipant(chatId: string, participantId: string): Promise<Chat> {
    return apiService.post<Chat>(`/chats/${chatId}/participants`, {
      participantId,
    });
  }

  async removeParticipant(
    chatId: string,
    participantId: string,
  ): Promise<Chat> {
    return apiService.delete<Chat>(
      `/chats/${chatId}/participants/${participantId}`,
    );
  }

  async updateChatInfo(
    chatId: string,
    updateData: { name?: string; avatar?: string },
  ): Promise<Chat> {
    return apiService.patch<Chat>(`/chats/${chatId}`, updateData);
  }
}

export const chatsService = new ChatsService();
