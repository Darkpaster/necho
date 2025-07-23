import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { Chat } from '../chats/chat.entity';
import { SendMessageDto } from './dto/sendMessage.dto';
import { EditMessageDto } from './dto/editMessage.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
  ) {}

  async sendMessage(sendMessageDto: SendMessageDto, senderId: string): Promise<Message> {
    // Проверяем доступ к чату
    const chat = await this.chatsRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participants', 'participants')
      .where('chat.id = :chatId', { chatId: sendMessageDto.chatId })
      .andWhere('participants.id = :senderId', { senderId })
      .getOne();

    if (!chat) {
      throw new ForbiddenException('У вас нет доступа к этому чату');
    }

    // Проверяем реплай
    let replyTo = null;
    if (sendMessageDto.replyToId) {
      replyTo = await this.messagesRepository.findOne({
        where: {
          id: sendMessageDto.replyToId,
          chatId: sendMessageDto.chatId
        },
        relations: ['sender']
      });

      if (!replyTo) {
        throw new NotFoundException('Сообщение для ответа не найдено');
      }
    }

    const message = this.messagesRepository.create({
      ...sendMessageDto,
      senderId,
      replyTo,
    });

    const savedMessage = await this.messagesRepository.save(message);

    // Обновляем время последнего обновления чата
    await this.chatsRepository.update(sendMessageDto.chatId, {
      updatedAt: new Date()
    });

    // Возвращаем сообщение с полной информацией
    return this.messagesRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender', 'replyTo', 'replyTo.sender'],
    });
  }

  async getChatMessages(chatId: string, userId: string, page: number = 1, limit: number = 50): Promise<Message[]> {
    // Проверяем доступ к чату
    const chat = await this.chatsRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participants', 'participants')
      .where('chat.id = :chatId', { chatId })
      .andWhere('participants.id = :userId', { userId })
      .getOne();

    if (!chat) {
      throw new ForbiddenException('У вас нет доступа к этому чату');
    }

    const skip = (page - 1) * limit;

    return this.messagesRepository.find({
      where: { chatId },
      relations: ['sender', 'replyTo', 'replyTo.sender'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
  }

  async editMessage(messageId: string, editMessageDto: EditMessageDto, userId: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('Вы можете редактировать только свои сообщения');
    }

    await this.messagesRepository.update(messageId, {
      ...editMessageDto,
      edited: true,
      editedAt: new Date(),
    });

    return this.messagesRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'replyTo', 'replyTo.sender'],
    });
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('Вы можете удалять только свои сообщения');
    }

    await this.messagesRepository.delete(messageId);
  }

  async getMessageById(messageId: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'replyTo', 'replyTo.sender'],
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    return message;
  }

  async searchMessages(chatId: string, userId: string, query: string): Promise<Message[]> {
    // Проверяем доступ к чату
    const chat = await this.chatsRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participants', 'participants')
      .where('chat.id = :chatId', { chatId })
      .andWhere('participants.id = :userId', { userId })
      .getOne();

    if (!chat) {
      throw new ForbiddenException('У вас нет доступа к этому чату');
    }

    return this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.chatId = :chatId', { chatId })
      .andWhere('message.content ILIKE :query', { query: `%${query}%` })
      .orderBy('message.createdAt', 'DESC')
      .limit(20)
      .getMany();
  }
}