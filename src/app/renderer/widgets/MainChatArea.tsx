import ChatHeader from './ChatHeader';
import MessageContainer from '../components/MessageContainer';
import ChatInput from './ChatInput';
import { useMessages } from '../hooks/useMessages';
import { Chat, Message, SendMessageDto } from '../services/types';

interface Props {
  currentChat: Chat;
}

export default function MainChatArea({ currentChat }: Props) {
  const {
    sendMessage,
    loadMessages,
    loadMoreMessages,
    editMessage,
    hasMore,
    error,
    loading,
    messages,
  } = useMessages(currentChat.id);

  const handleSendMessage = (messageDto: SendMessageDto) => {
    messageDto.chatId = currentChat.id;
    sendMessage(messageDto);
  };

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader
        chatName={currentChat.name}
        status={currentChat.participants[0].isOnline ? 'В сети' : 'Не в сети'}
      />

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        <div className="space-y-4">
          {messages.map((value: Message) => (
            <MessageContainer message={value} />
          ))}
        </div>
      </div>

      <ChatInput sendMessage={handleSendMessage} error={error} />
    </div>
  );
}
