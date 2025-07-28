import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { User } from '../users/user.entity';
import { JwtAuthGuard } from '../auth/jwtAuth.guard';
import { SendMessageDto } from './dto/sendMessage.dto';
import { EditMessageDto } from './dto/editMessage.dto';
import { GetUser } from '../auth/getUser.decorator';

@Controller('api/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  sendMessage(@Body() sendMessageDto: SendMessageDto, @GetUser() user: User) {
    return this.messagesService.sendMessage(sendMessageDto, user.id);
  }

  @Get('chat/:chatId')
  getChatMessages(
    @Param('chatId') chatId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @GetUser() user: User,
  ) {
    return this.messagesService.getChatMessages(chatId, user.id, page, limit);
  }

  @Get('search/:chatId')
  searchMessages(
    @Param('chatId') chatId: string,
    @Query('q') query: string,
    @GetUser() user: User,
  ) {
    return this.messagesService.searchMessages(chatId, user.id, query);
  }

  @Get(':id')
  getMessage(@Param('id') id: string) {
    return this.messagesService.getMessageById(id);
  }

  @Patch(':id')
  editMessage(
    @Param('id') id: string,
    @Body() editMessageDto: EditMessageDto,
    @GetUser() user: User,
  ) {
    return this.messagesService.editMessage(id, editMessageDto, user.id);
  }

  @Delete(':id')
  deleteMessage(@Param('id') id: string, @GetUser() user: User) {
    return this.messagesService.deleteMessage(id, user.id);
  }
}