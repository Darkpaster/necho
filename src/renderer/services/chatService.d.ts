import type { Chat, CreateChatDto } from './types';
declare class ChatsService {
    createChat(createChatDto: CreateChatDto): Promise<Chat>;
    getUserChats(): Promise<Chat[]>;
    getChatById(id: string): Promise<Chat>;
    addParticipant(chatId: string, participantId: string): Promise<Chat>;
    removeParticipant(chatId: string, participantId: string): Promise<Chat>;
    updateChatInfo(chatId: string, updateData: {
        name?: string;
        avatar?: string;
    }): Promise<Chat>;
}
export declare const chatsService: ChatsService;
export {};
