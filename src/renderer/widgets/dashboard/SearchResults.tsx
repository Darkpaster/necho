import ButtonContainer from '../../components/ButtonContainer';
import { Chat, Message } from '../../services/types';
import { Clock, MessageCircle } from 'lucide-react';

interface Props {
  results: { chats: Chat[]; messages: Array<{ chat: Chat; message: Message }> };
  onChatSelect: (id: string) => void;
  onClose: () => void;
}

export default function SearchResults({
  results,
  onChatSelect,
  onClose,
}: Props) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  return (
    <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-50">
      {results.chats.length === 0 && results.messages.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          Ничего не найдено
        </div>
      ) : (
        <div>
          {results.chats.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-100 dark:border-gray-700">
                Чаты ({results.chats.length})
              </div>
              {results.chats.map((chat) => (
                <ButtonContainer
                  key={`chat-${chat.id}`}
                  styles="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  onClick={() => {
                    onChatSelect(chat.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center w-full">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      {chat.avatar ? (
                        <img
                          src={chat.avatar}
                          alt={chat.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <MessageCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {highlightText(chat.name, '')}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {formatDate(chat.createdAt)}
                        </span>
                      </div>
                      {chat.lastMessage && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </ButtonContainer>
              ))}
            </div>
          )}

          {results.messages.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-100 dark:border-gray-700">
                Сообщения ({results.messages.length})
              </div>
              {results.messages.map((result, index) => (
                <ButtonContainer
                  key={`message-${result.message.id}-${index}`}
                  styles="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  onClick={() => {
                    onChatSelect(result.chat.id);
                    onClose();
                  }}
                >
                  <div className="flex items-start w-full">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      {result.chat.avatar ? (
                        <img
                          src={result.chat.avatar}
                          alt={result.chat.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <MessageCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {result.chat.name}
                        </span>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(result.message.createdAt)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                          {result.message.sender.name}:
                        </span>
                        {highlightText(result.message.content, '')}
                      </p>
                    </div>
                  </div>
                </ButtonContainer>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
