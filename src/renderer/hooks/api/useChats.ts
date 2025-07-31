import { useState, useEffect } from 'react';
import { Chat, CreateChatDto } from '../../services/types';
import { chatsService } from '../../services/chatService';

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      setError(null);
      const userChats = await chatsService.getUserChats();
      setChats(userChats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const createChat = async (createChatDto: CreateChatDto) => {
    try {
      const newChat = await chatsService.createChat(createChatDto);
      setChats((prev) => [newChat, ...prev]);
      return newChat;
    } catch (error) {
      console.error('Failed to create chat:', error);
      throw error;
    }
  };

  const updateChat = (updatedChat: Chat) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat)),
    );
  };

  return {
    chats,
    loading,
    error,
    loadChats,
    createChat,
    updateChat,
  };
}
