import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsService } from './chats.service.js';
import { ChatsController } from './chats.controller.js';
import { Chat } from './chat.entity.js';
import { User } from '../users/user.entity.js';
import { Message } from '../messages/message.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Chat, Message])],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}