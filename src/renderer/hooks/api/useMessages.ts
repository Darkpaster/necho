import { useState, useEffect } from 'react';
import { EditMessageDto, Message, SendMessageDto } from '../../services/types';
import { messagesService } from '../../services/messageService';

export function useMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (chatId) {
      loadMessages();
    }
  }, [chatId]);

  const loadMessages = async (pageNum = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
        setError(null);
      }

      const newMessages = await messagesService.getChatMessages(
        chatId,
        pageNum,
      );

      if (append) {
        setMessages((prev) => [...prev, ...newMessages]);
      } else {
        setMessages(newMessages);
      }

      setHasMore(newMessages.length === 50);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !loading) {
      loadMessages(page + 1, true);
    }
  };

  const sendMessage = async (
    sendMessageDto: Omit<SendMessageDto, 'chatId'>,
  ) => {
    try {
      const newMessage = await messagesService.sendMessage({
        ...sendMessageDto,
        chatId,
      });
      setMessages((prev) => [newMessage, ...prev]);
      return newMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const editMessage = async (
    messageId: string,
    editMessageDto: EditMessageDto,
  ) => {
    try {
      const updatedMessage = await messagesService.editMessage(
        messageId,
        editMessageDto,
      );
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? updatedMessage : msg)),
      );
      return updatedMessage;
    } catch (error) {
      console.error('Failed to edit message:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await messagesService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  };

  const addMessage = (message: Message) => {
    setMessages((prev) => [message, ...prev]);
  };

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    addMessage,
  };
}
