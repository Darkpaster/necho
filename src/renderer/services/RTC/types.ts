import { Message, TypingUser } from '../types';

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

export type EventMap = {
  // Connection events
  'connection:state': ConnectionState;
  'connection:error': Error;

  // User events
  'user:online': { userId: string; username: string };
  'user:offline': { userId: string };

  // Message events
  'message:new': Message;
  'message:edited': Message;
  'message:deleted': { messageId: string; chatId: string };

  // Typing events
  'typing:start': TypingUser;
  'typing:stop': { userId: string; chatId: string };

  // Chat events
  'chat:joined': { chatId: string };
  'chat:left': { chatId: string };

  // Generic notification
  'notification': any;
};

export interface WebSocketChatClientConfig {
  url: string;
  token: string;
  autoConnect?: boolean;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  transports?: string[];
}