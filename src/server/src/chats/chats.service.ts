import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../users/user.entity';
import { Message } from '../messages/message.entity';
import { CreateChatDto } from './dto/createChat.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async create(createChatDto: CreateChatDto, creatorId: string): Promise<Chat> {
    const participants = await this.usersRepository.findByIds([
      ...createChatDto.participantIds,
      creatorId,
    ]);

    if (participants.length !== createChatDto.participantIds.length + 1) {
      throw new NotFoundException('Некоторые пользователи не найдены');
    }

    if (!createChatDto.isGroup && createChatDto.participantIds.length === 1) {
      const existingChat = await this.findPrivateChat(
        creatorId,
        createChatDto.participantIds[0],
      );
      if (existingChat) {
        return existingChat;
      }
    }

    const chat = this.chatsRepository.create({
      ...createChatDto,
      participants,
    });

    return this.chatsRepository.save(chat);
  }

  async findUserChats(userId: string): Promise<Chat[]> {
    const chats = await this.chatsRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participants', 'participants')
      .leftJoinAndSelect('chat.messages', 'messages')
      .where('participants.id = :userId', { userId })
      .orderBy('chat.updatedAt', 'DESC')
      .getMany();

    for (const chat of chats) {
      const lastMessage = await this.messagesRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.sender', 'sender')
        .where('message.chatId = :chatId', { chatId: chat.id })
        .orderBy('message.createdAt', 'DESC')
        .limit(1)
        .getOne();

      chat.lastMessage = lastMessage;
    }

    return chats;
  }

  async findOne(id: string, userId: string): Promise<Chat> {
    const chat = await this.chatsRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participants', 'participants')
      .where('chat.id = :id', { id })
      .andWhere('participants.id = :userId', { userId })
      .getOne();

    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }

    return chat;
  }

  private async findPrivateChat(
    user1Id: string,
    user2Id: string,
  ): Promise<Chat | null> {
    const chat = await this.chatsRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participants', 'participants')
      .where('chat.isGroup = :isGroup', { isGroup: false })
      .andWhere('participants.id IN (:...userIds)', { userIds: [user1Id, user2Id] })
      .groupBy('chat.id')
      .addGroupBy('participants.id')
      .addGroupBy('participants.username')
      .addGroupBy('participants.firstName')
      .addGroupBy('participants.lastName')
      .addGroupBy('participants.avatar')
      .addGroupBy('participants.isOnline')
      .addGroupBy('participants.lastSeen')
      .having('COUNT(DISTINCT participants.id) = 2')
      .getOne();

    return chat;
  }

  async addParticipant(
    chatId: string,
    userId: string,
    newParticipantId: string,
  ): Promise<Chat> {
    const chat = await this.findOne(chatId, userId);

    if (!chat.isGroup) {
      throw new ForbiddenException(
        'Нельзя добавлять участников в приватный чат',
      );
    }

    const newParticipant = await this.usersRepository.findOne({
      where: { id: newParticipantId },
    });

    if (!newParticipant) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isAlreadyParticipant = chat.participants.some(p => p.id === newParticipantId);
    if (isAlreadyParticipant) {
      throw new ForbiddenException('Пользователь уже является участником чата');
    }

    chat.participants.push(newParticipant);
    return this.chatsRepository.save(chat);
  }

  async removeParticipant(
    chatId: string,
    userId: string,
    participantId: string,
  ): Promise<Chat> {
    const chat = await this.findOne(chatId, userId);

    if (!chat.isGroup) {
      throw new ForbiddenException(
        'Нельзя удалять участников из приватного чата',
      );
    }

    chat.participants = chat.participants.filter(p => p.id !== participantId);
    return this.chatsRepository.save(chat);
  }

  async updateChatInfo(
    chatId: string,
    userId: string,
    updateData: { name?: string; avatar?: string },
  ): Promise<Chat> {
    const chat = await this.findOne(chatId, userId);

    if (!chat.isGroup) {
      throw new ForbiddenException(
        'Нельзя изменять информацию приватного чата',
      );
    }

    Object.assign(chat, updateData);
    return this.chatsRepository.save(chat);
  }
}