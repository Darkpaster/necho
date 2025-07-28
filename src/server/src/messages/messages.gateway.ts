import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { UsersService } from '../users/users.service';
import { SendMessageDto } from './dto/sendMessage.dto';
import { EditMessageDto } from './dto/editMessage.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('MessagesGateway');
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        client.disconnect();
        return;
      }

      client.userId = user.id;
      this.connectedUsers.set(user.id, client.id);

      await this.usersService.updateOnlineStatus(user.id, true);

      client.broadcast.emit('user-online', {
        userId: user.id,
        username: user.username,
      });

      this.logger.log(`User ${user.username} connected`);
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);

      await this.usersService.updateOnlineStatus(client.userId, false);

      client.broadcast.emit('user-offline', {
        userId: client.userId,
      });

      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('join-chat')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    await client.join(`chat-${data.chatId}`);
    this.logger.log(`User ${client.userId} joined chat ${data.chatId}`);
  }

  @SubscribeMessage('leave-chat')
  async handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    await client.leave(`chat-${data.chatId}`);
    this.logger.log(`User ${client.userId} left chat ${data.chatId}`);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() sendMessageDto: SendMessageDto,
  ) {
    try {
      const message = await this.messagesService.sendMessage(sendMessageDto, client.userId);

      this.server.to(`chat-${sendMessageDto.chatId}`).emit('new-message', message);

      return { success: true, message };
    } catch (error) {
      this.logger.error('Send message error:', error);
      return { success: false, error: error.toString() };
    }
  }

  @SubscribeMessage('edit-message')
  async handleEditMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; editMessageDto: EditMessageDto },
  ) {
    try {
      const message = await this.messagesService.editMessage(
        data.messageId,
        data.editMessageDto,
        client.userId,
      );

      this.server.to(`chat-${message.chatId}`).emit('message-edited', message);

      return { success: true, message };
    } catch (error) {
      this.logger.error('Edit message error:', error);
      return { success: false, error: error.toString() };
    }
  }

  @SubscribeMessage('delete-message')
  async handleDeleteMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string },
  ) {
    try {
      const message = await this.messagesService.getMessageById(data.messageId);
      await this.messagesService.deleteMessage(data.messageId, client.userId);

      this.server.to(`chat-${message.chatId}`).emit('message-deleted', {
        messageId: data.messageId,
        chatId: message.chatId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Delete message error:', error);
      return { success: false, error: error.toString() };
    }
  }

  @SubscribeMessage('typing-start')
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    const user = await this.usersService.findOne(client.userId);

    client.to(`chat-${data.chatId}`).emit('user-typing', {
      userId: client.userId,
      username: user.username,
      chatId: data.chatId,
    });
  }

  @SubscribeMessage('typing-stop')
  async handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    client.to(`chat-${data.chatId}`).emit('user-stopped-typing', {
      userId: client.userId,
      chatId: data.chatId,
    });
  }

  sendNotificationToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  sendMessageToChat(chatId: string, event: string, data: any) {
    this.server.to(`chat-${chatId}`).emit(event, data);
  }
}