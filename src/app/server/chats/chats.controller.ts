import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/user.entity';

@Controller('api/chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  create(@Body() createChatDto: CreateChatDto, @GetUser() user: User) {
    return this.chatsService.create(createChatDto, user.id);
  }

  @Get()
  findUserChats(@GetUser() user: User) {
    return this.chatsService.findUserChats(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.chatsService.findOne(id, user.id);
  }

  @Patch(':id/participants')
  addParticipant(
    @Param('id') chatId: string,
    @Body('participantId') participantId: string,
    @GetUser() user: User,
  ) {
    return this.chatsService.addParticipant(chatId, user.id, participantId);
  }

  @Patch(':id/info')
  updateChatInfo(
    @Param('id') chatId: string,
    @Body() updateData: { name?: string; avatar?: string },
    @GetUser() user: User,
  ) {
    return this.chatsService.updateChatInfo(chatId, user.id, updateData);
  }
}