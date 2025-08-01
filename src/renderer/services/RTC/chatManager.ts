import { Socket } from 'socket.io-client';
import { TypingUser } from '../types';
import { EventEmitter } from './wsManager';
import { EventMap } from './types';

export class ChatManager {
  private joinedChats = new Set<string>();
  private typingUsers = new Map<string, Set<string>>(); // chatId -> Set<userId>
  private typingTimeouts = new Map<string, NodeJS.Timeout>(); // userId-chatId -> timeout

  constructor(
    private socket: Socket,
    private events: EventEmitter<EventMap>,
  ) {}

  async joinChat(chatId: string): Promise<void> {
    if (this.joinedChats.has(chatId)) return;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Join chat timeout')),
        5000,
      );

      this.socket.emit('join-chat', { chatId }, (response: any) => {
        clearTimeout(timeout);
        if (response?.success === false) {
          reject(new Error(response.error || 'Failed to join chat'));
        } else {
          this.joinedChats.add(chatId);
          this.events.emit('chat:joined', { chatId });
          resolve();
        }
      });
    });
  }

  async leaveChat(chatId: string): Promise<void> {
    if (!this.joinedChats.has(chatId)) return;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Leave chat timeout')),
        5000,
      );

      this.socket.emit('leave-chat', { chatId }, (response: any) => {
        clearTimeout(timeout);
        if (response?.success === false) {
          reject(new Error(response.error || 'Failed to leave chat'));
        } else {
          this.joinedChats.delete(chatId);
          this.typingUsers.delete(chatId);
          this.events.emit('chat:left', { chatId });
          resolve();
        }
      });
    });
  }

  getJoinedChats(): string[] {
    return Array.from(this.joinedChats);
  }

  isJoined(chatId: string): boolean {
    return this.joinedChats.has(chatId);
  }

  getTypingUsers(chatId: string): string[] {
    return Array.from(this.typingUsers.get(chatId) || []);
  }

  private addTypingUser(chatId: string, userId: string): void {
    if (!this.typingUsers.has(chatId)) {
      this.typingUsers.set(chatId, new Set());
    }
    this.typingUsers.get(chatId).add(userId);
  }

  private removeTypingUser(chatId: string, userId: string): void {
    this.typingUsers.get(chatId)?.delete(userId);
  }

  startTyping(chatId: string): void {
    if (!this.joinedChats.has(chatId)) return;

    const key = `typing-${chatId}`;

    // Clear existing timeout
    if (this.typingTimeouts.has(key)) {
      clearTimeout(this.typingTimeouts.get(key));
    }

    this.socket.emit('typing-start', { chatId });

    // Auto-stop typing after 3 seconds
    const timeout = setTimeout(() => {
      this.stopTyping(chatId);
    }, 3000);

    this.typingTimeouts.set(key, timeout);
  }

  stopTyping(chatId: string): void {
    if (!this.joinedChats.has(chatId)) return;

    const key = `typing-${chatId}`;

    if (this.typingTimeouts.has(key)) {
      clearTimeout(this.typingTimeouts.get(key));
      this.typingTimeouts.delete(key);
    }

    this.socket.emit('typing-stop', { chatId });
  }

  // Internal methods called by WebSocketChatClient
  _handleTypingStart(data: TypingUser): void {
    this.addTypingUser(data.chatId, data.userId);
    this.events.emit('typing:start', data);
  }

  _handleTypingStop(data: { userId: string; chatId: string }): void {
    this.removeTypingUser(data.chatId, data.userId);
    this.events.emit('typing:stop', data);
  }

  _cleanup(): void {
    this.joinedChats.clear();
    this.typingUsers.clear();
    this.typingTimeouts.forEach(clearTimeout);
    this.typingTimeouts.clear();
  }
}
