import { useEffect, useState } from 'react';
import { Message } from '../../../services/types';
import { WebSocketChatClient } from '../../../services/RTC/wsManager';

export function useMessages(client: WebSocketChatClient) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const unsubscribeNew = client.on('message:new', (message) => {
      setMessages((prev) => [message, ...prev]);
    });

    const unsubscribeEdited = client.on('message:edited', (editedMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === editedMessage.id ? editedMessage : msg)),
      );
    });

    const unsubscribeDeleted = client.on('message:deleted', ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    });

    return () => {
      unsubscribeNew();
      unsubscribeEdited();
      unsubscribeDeleted();
    };
  }, [client]);

  return messages;
}
