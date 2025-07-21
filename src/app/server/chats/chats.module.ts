import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { Chat } from './chat.entity';
import { User } from '../users/user.entity';
import { Message } from '../messages/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, User, Message])],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}