import { Chat, CreateChatDto } from '../services/types';
export declare function useChats(): {
    chats: Chat[];
    loading: boolean;
    error: string;
    loadChats: () => Promise<void>;
    createChat: (createChatDto: CreateChatDto) => Promise<Chat>;
    updateChat: (updatedChat: Chat) => void;
};
