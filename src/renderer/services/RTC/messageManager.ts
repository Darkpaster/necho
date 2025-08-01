import { Socket } from 'socket.io-client';
import { EditMessagePayload, Message, SendMessagePayload } from '../types';
import { EventEmitter } from './wsManager';
import { EventMap } from './types';

export class MessageManager {
  constructor(
    private socket: Socket,
    private events: EventEmitter<EventMap>,
  ) {}

  async sendMessage(payload: SendMessagePayload): Promise<Message> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Send message timeout')),
        10000,
      );

      this.socket.emit('send-message', payload, (response: any) => {
        clearTimeout(timeout);
        if (response?.success) {
          resolve(response.message);
        } else {
          reject(new Error(response?.error || 'Failed to send message'));
        }
      });
    });
  }

  async editMessage(
    messageId: string,
    payload: EditMessagePayload,
  ): Promise<Message> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Edit message timeout')),
        10000,
      );

      this.socket.emit(
        'edit-message',
        { messageId, editMessageDto: payload },
        (response: any) => {
          clearTimeout(timeout);
          if (response?.success) {
            resolve(response.message);
          } else {
            reject(new Error(response?.error || 'Failed to edit message'));
          }
        },
      );
    });
  }

  async deleteMessage(messageId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Delete message timeout')),
        10000,
      );

      this.socket.emit('delete-message', { messageId }, (response: any) => {
        clearTimeout(timeout);
        if (response?.success) {
          resolve();
        } else {
          reject(new Error(response?.error || 'Failed to delete message'));
        }
      });
    });
  }

  // Internal methods called by WebSocketChatClient
  _handleNewMessage(message: Message): void {
    this.events.emit('message:new', message);
  }

  _handleEditedMessage(message: Message): void {
    this.events.emit('message:edited', message);
  }

  _handleDeletedMessage(data: { messageId: string; chatId: string }): void {
    this.events.emit('message:deleted', data);
  }
}
