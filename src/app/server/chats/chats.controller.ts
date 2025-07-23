import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { User } from '../users/user.entity';
import { JwtAuthGuard } from '../auth/jwtAuth.guard';
import { CreateChatDto } from './dto/createChat.dto';
import { GetUser } from '../auth/getUser.decorator';

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