import { apiService } from './api';
import type { Message, SendMessageDto, EditMessageDto } from './types';

class MessagesService {
  async sendMessage(sendMessageDto: SendMessageDto): Promise<Message> {
    return apiService.post<Message>('/messages', sendMessageDto);
  }

  async getChatMessages(
    chatId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<Message[]> {
    return apiService.get<Message[]>(
      `/messages/chat/${chatId}?page=${page}&limit=${limit}`,
    );
  }

  async editMessage(
    messageId: string,
    editMessageDto: EditMessageDto,
  ): Promise<Message> {
    return apiService.patch<Message>(`/messages/${messageId}`, editMessageDto);
  }

  async deleteMessage(messageId: string): Promise<void> {
    await apiService.delete<void>(`/messages/${messageId}`);
  }

  async getMessageById(messageId: string): Promise<Message> {
    return apiService.get<Message>(`/messages/${messageId}`);
  }

  async searchMessages(chatId: string, query: string): Promise<Message[]> {
    return apiService.get<Message[]>(
      `/messages/chat/${chatId}/search?q=${encodeURIComponent(query)}`,
    );
  }
}

export const messagesService = new MessagesService();
