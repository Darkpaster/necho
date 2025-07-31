import ChatHeader from './ChatHeader';
import MessageContainer from '../../components/MessageContainer';
import OptimisticMessage from '../../components/OptimisticMessage';
import TypingIndicator from '../../components/preload/TypingIndicator';
import LoadingSpinner from '../../components/preload/LoadingSpinner';
import ChatInput from './ChatInput';
import { useMessages } from '../../hooks/api/useMessages';
import { Chat, Message, SendMessageDto } from '../../services/types';
import { useState, useEffect } from 'react';
import MessageSkeleton from '../../components/preload/skeleton/MessageSkeleton';
import { useOptimisticMessages } from '../../hooks/ui/useOptimisticMessages';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { selectCurrentUser } from '../../store/slices/authSlice';

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

  const currentUser = useAppSelector(selectCurrentUser);

  const {
    optimisticMessages,
    addOptimisticMessage,
    removeOptimisticMessage,
    updateOptimisticMessage,
    clearOptimisticMessages,
  } = useOptimisticMessages();

  const [isTyping, setIsTyping] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Очищаем оптимистичные сообщения при смене чата
  useEffect(() => {
    clearOptimisticMessages();

    // if (messages.length === 0) {
    //   handleSendMessage({
    //     chatId: currentChat.id,
    //     content: 'здарова брадок пон',
    //   });
    // }
  }, [currentChat.id, clearOptimisticMessages]);

  const handleSendMessage = async (messageDto: SendMessageDto) => {
    messageDto.chatId = currentChat.id;

    // Добавляем оптимистичное сообщение
    const tempId = addOptimisticMessage(messageDto);

    try {
      // Отправляем сообщение
      const sentMessage = await sendMessage(messageDto);

      // Обновляем оптимистичное сообщение реальными данными
      if (sentMessage) {
        updateOptimisticMessage(tempId, sentMessage);
      }
    } catch (error) {
      // В случае ошибки помечаем сообщение как failed
      // или удаляем его
      removeOptimisticMessage(tempId);
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      await loadMoreMessages();
    } finally {
      setLoadingMore(false);
    }
  };

  // Объединяем реальные и оптимистичные сообщения
  const allMessages = [...messages, ...optimisticMessages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader
        chatName={currentChat.name || 'Неизвестный'}
        status={currentChat.participants[0].isOnline ? 'В сети' : 'Не в сети'}
      />

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {hasMore && (
          <div className="text-center mb-4">
            {loadingMore ? (
              <LoadingSpinner />
            ) : (
              <button
                onClick={handleLoadMore}
                className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 text-sm font-medium"
              >
                Загрузить предыдущие сообщения
              </button>
            )}
          </div>
        )}

        <div className="space-y-4">
          {loading && messages.length === 0 ? (
            <>
              <MessageSkeleton isOwn={false} />
              <MessageSkeleton isOwn={true} />
              <MessageSkeleton isOwn={false} />
              <MessageSkeleton isOwn={true} />
              <MessageSkeleton isOwn={false} />
            </>
          ) : (
            <>
              {allMessages.map(
                (
                  message: Message & {
                    isOptimistic?: boolean;
                    isPending?: boolean;
                  },
                ) => {
                  if (message.isOptimistic) {
                    return (
                      <OptimisticMessage
                        key={message.id}
                        content={message.content}
                        isOwn={message.senderId === currentUser.id}
                        isPending={message.isPending}
                        timestamp={message.createdAt}
                      />
                    );
                  }

                  return (
                    <MessageContainer key={message.id} isOwn={message.senderId === currentUser.id} message={message} />
                  );
                },
              )}

              {isTyping && (
                <TypingIndicator
                  userName={currentChat.participants[0].name}
                />
              )}
            </>
          )}

          {loading && messages.length > 0 && !loadingMore && (
            <>
              <MessageSkeleton isOwn={false} />
              <MessageSkeleton isOwn={true} />
            </>
          )}
        </div>

        {error && (
          <div className="text-center py-4">
            <div className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <span className="text-red-700 dark:text-red-400 text-sm">
                Ошибка загрузки: {error}
              </span>
              <button
                onClick={() => loadMessages()}
                className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
              >
                Повторить
              </button>
            </div>
          </div>
        )}
      </div>

      <ChatInput
        sendMessage={handleSendMessage}
        error={error}
        // onTypingStart={() => setIsTyping(true)}
        // onTypingEnd={() => setIsTyping(false)}
      />
    </div>
  );
}
