import { useEffect, useState } from 'react';
import {
  ConnectionState,
  WebSocketChatClientConfig,
} from '../../../services/RTC/types';
import { createChatClient } from '../../../services/RTC/wsManager';

export function useChatClient(config: WebSocketChatClientConfig) {
  const [client] = useState(() => createChatClient(config));
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    client.getConnectionState(),
  );

  useEffect(() => {
    const unsubscribe = client.on('connection:state', setConnectionState);
    return () => {
      unsubscribe();
      client.destroy();
    };
  }, [client]);

  return { client, connectionState };
}
