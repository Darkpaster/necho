import type { Message, SendMessageDto, EditMessageDto } from './types';
declare class MessagesService {
    sendMessage(sendMessageDto: SendMessageDto): Promise<Message>;
    getChatMessages(chatId: string, page?: number, limit?: number): Promise<Message[]>;
    editMessage(messageId: string, editMessageDto: EditMessageDto): Promise<Message>;
    deleteMessage(messageId: string): Promise<void>;
    getMessageById(messageId: string): Promise<Message>;
    searchMessages(chatId: string, query: string): Promise<Message[]>;
}
export declare const messagesService: MessagesService;
export {};
