import { EditMessageDto, Message, SendMessageDto } from '../../services/types';
export declare function useMessages(chatId: string): {
    messages: Message[];
    loading: boolean;
    error: string;
    hasMore: boolean;
    loadMessages: (pageNum?: number, append?: boolean) => Promise<void>;
    loadMoreMessages: () => void;
    sendMessage: (sendMessageDto: Omit<SendMessageDto, 'chatId'>) => Promise<Message>;
    editMessage: (messageId: string, editMessageDto: EditMessageDto) => Promise<Message>;
    deleteMessage: (messageId: string) => Promise<void>;
    addMessage: (message: Message) => void;
};
