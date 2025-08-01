import { io, Socket } from 'socket.io-client';
import {
  EditMessagePayload,
  Message,
  SendMessagePayload,
  TypingUser,
} from '../types';
import { ConnectionState, EventMap, WebSocketChatClientConfig } from './types';
import { ChatManager } from './chatManager';
import { MessageManager } from './messageManager';
import { ConnectionManager } from './connectionManager';

export class EventEmitter<T extends Record<string, any> = {}> {
  private listeners: Map<keyof T, Set<Function>> = new Map();

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event).add(listener);

    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${String(event)}:`, error);
      }
    });
  }

  once<K extends keyof T>(
    event: K,
    listener: (data: T[K]) => void,
  ): () => void {
    const unsubscribe = this.on(event, (data) => {
      unsubscribe();
      listener(data);
    });
    return unsubscribe;
  }

  removeAllListeners<K extends keyof T>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export class WebSocketChatClient {
  private socket: Socket;
  private events = new EventEmitter<EventMap>();
  private connectionManager: ConnectionManager;
  private chatManager: ChatManager;
  private messageManager: MessageManager;
  private isDestroyed = false;

  constructor(private config: WebSocketChatClientConfig) {
    this.socket = io(config.url, {
      auth: { token: config.token },
      autoConnect: config.autoConnect ?? true,
      reconnection: config.reconnect ?? true,
      reconnectionAttempts: config.maxReconnectAttempts ?? 5,
      transports: config.transports ?? ['websocket', 'polling'],
    });

    this.connectionManager = new ConnectionManager(this.socket, this.events);
    this.chatManager = new ChatManager(this.socket, this.events);
    this.messageManager = new MessageManager(this.socket, this.events);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.socket.on(
      'user-online',
      (data: { userId: string; username: string }) => {
        this.events.emit('user:online', data);
      },
    );

    this.socket.on('user-offline', (data: { userId: string }) => {
      this.events.emit('user:offline', data);
    });

    this.socket.on('new-message', (message: Message) => {
      this.messageManager._handleNewMessage(message);
    });

    this.socket.on('message-edited', (message: Message) => {
      this.messageManager._handleEditedMessage(message);
    });

    this.socket.on(
      'message-deleted',
      (data: { messageId: string; chatId: string }) => {
        this.messageManager._handleDeletedMessage(data);
      },
    );

    this.socket.on('user-typing', (data: TypingUser) => {
      this.chatManager._handleTypingStart(data);
    });

    this.socket.on(
      'user-stopped-typing',
      (data: { userId: string; chatId: string }) => {
        this.chatManager._handleTypingStop(data);
      },
    );

    this.socket.on('notification', (data: any) => {
      this.events.emit('notification', data);
    });
  }

  // ================= PUBLIC API =================

  // Event system
  on<K extends keyof EventMap>(
    event: K,
    listener: (data: EventMap[K]) => void,
  ): () => void {
    this.assertNotDestroyed();
    return this.events.on(event, listener);
  }

  off<K extends keyof EventMap>(
    event: K,
    listener: (data: EventMap[K]) => void,
  ): void {
    this.events.off(event, listener);
  }

  once<K extends keyof EventMap>(
    event: K,
    listener: (data: EventMap[K]) => void,
  ): () => void {
    this.assertNotDestroyed();
    return this.events.once(event, listener);
  }

  // Connection management
  connect(): void {
    this.assertNotDestroyed();
    this.connectionManager.connect();
  }

  disconnect(): void {
    this.connectionManager.disconnect();
  }

  getConnectionState(): ConnectionState {
    return this.connectionManager.getState();
  }

  isConnected(): boolean {
    return this.connectionManager.isConnected();
  }

  // Chat management
  async joinChat(chatId: string): Promise<void> {
    this.assertNotDestroyed();
    this.assertConnected();
    return this.chatManager.joinChat(chatId);
  }

  async leaveChat(chatId: string): Promise<void> {
    this.assertNotDestroyed();
    return this.chatManager.leaveChat(chatId);
  }

  getJoinedChats(): string[] {
    return this.chatManager.getJoinedChats();
  }

  isJoinedToChat(chatId: string): boolean {
    return this.chatManager.isJoined(chatId);
  }

  // Typing indicators
  startTyping(chatId: string): void {
    this.assertNotDestroyed();
    this.assertConnected();
    this.chatManager.startTyping(chatId);
  }

  stopTyping(chatId: string): void {
    this.assertNotDestroyed();
    this.chatManager.stopTyping(chatId);
  }

  getTypingUsers(chatId: string): string[] {
    return this.chatManager.getTypingUsers(chatId);
  }

  // Message management
  async sendMessage(payload: SendMessagePayload): Promise<Message> {
    this.assertNotDestroyed();
    this.assertConnected();
    return this.messageManager.sendMessage(payload);
  }

  async editMessage(
    messageId: string,
    payload: EditMessagePayload,
  ): Promise<Message> {
    this.assertNotDestroyed();
    this.assertConnected();
    return this.messageManager.editMessage(messageId, payload);
  }

  async deleteMessage(messageId: string): Promise<void> {
    this.assertNotDestroyed();
    this.assertConnected();
    return this.messageManager.deleteMessage(messageId);
  }

  // Utility methods
  updateToken(token: string): void {
    this.assertNotDestroyed();
    this.config.token = token;
    this.socket.auth = { token };

    if (this.isConnected()) {
      this.disconnect();
      this.connect();
    }
  }

  // Cleanup
  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;
    this.connectionManager._cleanup();
    this.chatManager._cleanup();
    this.events.removeAllListeners();
    this.socket.disconnect();
    this.socket.removeAllListeners();
  }

  private assertNotDestroyed(): void {
    if (this.isDestroyed) {
      throw new Error('WebSocketChatClient has been destroyed');
    }
  }

  private assertConnected(): void {
    if (!this.isConnected()) {
      throw new Error('WebSocket is not connected');
    }
  }
}

export function createChatClient(
  config: WebSocketChatClientConfig,
): WebSocketChatClient {
  return new WebSocketChatClient(config);
}
