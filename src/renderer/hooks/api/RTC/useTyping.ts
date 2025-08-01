import { useEffect, useState } from 'react';
import { WebSocketChatClient } from '../../../services/RTC/wsManager';

export function useTyping(client: WebSocketChatClient, chatId: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribeStart = client.on('typing:start', (data) => {
      if (data.chatId === chatId) {
        setTypingUsers((prev) => [...new Set([...prev, data.userId])]);
      }
    });

    const unsubscribeStop = client.on('typing:stop', (data) => {
      if (data.chatId === chatId) {
        setTypingUsers((prev) =>
          prev.filter((userId) => userId !== data.userId),
        );
      }
    });

    return () => {
      unsubscribeStart();
      unsubscribeStop();
    };
  }, [client, chatId]);

  return typingUsers;
}
