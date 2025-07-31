import { useState, useCallback } from 'react';
import { Message, SendMessageDto } from '../../services/types';

interface OptimisticMessage extends Message {
  isOptimistic?: boolean;
  isPending?: boolean;
}

export function useOptimisticMessages() {
  const [optimisticMessages, setOptimisticMessages] = useState<
    OptimisticMessage[]
  >([]);

  const addOptimisticMessage = useCallback((messageDto: SendMessageDto) => {
    const optimisticMessage: OptimisticMessage = {
      id: `temp-${Date.now()}`,
      content: messageDto.content,
      senderId: messageDto.replyToId,
      sender: null,
      chatId: messageDto.chatId,
      createdAt: new Date(),
      // updatedAt: new Date(),
      isOptimistic: true,
      isPending: true,
    };

    setOptimisticMessages((prev) => [...prev, optimisticMessage]);
    return optimisticMessage.id;
  }, []);

  const removeOptimisticMessage = useCallback((tempId: string) => {
    setOptimisticMessages((prev) => prev.filter((msg) => msg.id !== tempId));
  }, []);

  const updateOptimisticMessage = useCallback(
    (tempId: string, realMessage: Message) => {
      setOptimisticMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...realMessage, isOptimistic: false, isPending: false }
            : msg,
        ),
      );
    },
    [],
  );

  const clearOptimisticMessages = useCallback(() => {
    setOptimisticMessages([]);
  }, []);

  return {
    optimisticMessages,
    addOptimisticMessage,
    removeOptimisticMessage,
    updateOptimisticMessage,
    clearOptimisticMessages,
  };
}
