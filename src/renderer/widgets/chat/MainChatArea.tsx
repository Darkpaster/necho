import React, { useState, useEffect, useCallback, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageContainer from '../../components/MessageContainer';
import OptimisticMessage from '../../components/OptimisticMessage';
import { OptimisticMessage as OptimisticMessageType } from '../../hooks/ui/useOptimisticMessages';
import TypingIndicator from '../../components/preload/TypingIndicator';
import LoadingSpinner from '../../components/preload/LoadingSpinner';
import ChatInput from './ChatInput';
import MessageSkeleton from '../../components/preload/skeleton/MessageSkeleton';

import { useMessages } from '../../hooks/api/useMessages';
import { useOptimisticMessages } from '../../hooks/ui/useOptimisticMessages';
import { useAppSelector } from '../../store/store';
import { selectCurrentUser } from '../../store/slices/authSlice';

import {
  Chat,
  Message,
  MessageType,
  SendMessageDto,
} from '../../services/types';
import { ConnectionState } from '../../services/RTC/types';
import { WebSocketChatClient } from '../../services/RTC/wsManager';

interface Props {
  currentChat: Chat;
  wsClient: WebSocketChatClient;
}

export default function MainChatArea({ currentChat, wsClient }: Props) {
  const {
    loadMessages,
    loadMoreMessages,
    editMessage,
    hasMore,
    error,
    loading,
    messages: httpMessages,
  } = useMessages(currentChat.id);

  const currentUser = useAppSelector(selectCurrentUser);

  const {
    optimisticMessages,
    addOptimisticMessage,
    removeOptimisticMessage,
    updateOptimisticMessage,
    clearOptimisticMessages,
  } = useOptimisticMessages();

  const [wsMessages, setWsMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    wsClient.getConnectionState(),
  );
  const [loadingMore, setLoadingMore] = useState(false);

  const isJoinedRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNewMessage = useCallback(
    (message: Message) => {
      if (message.chatId === currentChat.id) {
        setWsMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });

        const optimisticMsg = optimisticMessages.find(
          (opt) =>
            opt.content === message.content &&
            opt.senderId === message.senderId,
        );
        if (optimisticMsg) {
          removeOptimisticMessage(optimisticMsg.id);
        }
      }
    },
    [currentChat.id, optimisticMessages, removeOptimisticMessage],
  );

  const handleMessageEdited = useCallback(
    (message: Message) => {
      if (message.chatId === currentChat.id) {
        setWsMessages((prev) =>
          prev.map((m) => (m.id === message.id ? message : m)),
        );
      }
    },
    [currentChat.id],
  );

  const handleMessageDeleted = useCallback(
    ({ messageId, chatId }: { messageId: string; chatId: string }) => {
      if (chatId === currentChat.id) {
        setWsMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    },
    [currentChat.id],
  );

  const setTypingStart = useCallback(
    ({ userId, chatId }: { userId: string; chatId: string }) => {
      if (chatId === currentChat.id && userId !== currentUser.id) {
        setTypingUsers((prev) => {
          if (!prev.includes(userId)) {
            return [...prev, userId];
          }
          return prev;
        });
      }
    },
    [currentChat.id, currentUser.id],
  );

  const setTypingStop = useCallback(
    ({ userId, chatId }: { userId: string; chatId: string }) => {
      if (chatId === currentChat.id) {
        setTypingUsers((prev) => prev.filter((id) => id !== userId));
      }
    },
    [currentChat.id],
  );

  const handleConnectionState = useCallback((state: ConnectionState) => {
    setConnectionState(state);
  }, []);

  useEffect(() => {
    const unsubscribes = [
      wsClient.on('message:new', handleNewMessage),
      wsClient.on('message:edited', handleMessageEdited),
      wsClient.on('message:deleted', handleMessageDeleted),
      wsClient.on('typing:start', setTypingStart),
      wsClient.on('typing:stop', setTypingStop),
      wsClient.on('connection:state', handleConnectionState),
    ];

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [
    wsClient,
    handleNewMessage,
    handleMessageEdited,
    handleMessageDeleted,
    setTypingStart,
    setTypingStop,
    handleConnectionState,
  ]);

  useEffect(() => {
    const joinChat = async () => {
      try {
        if (
          wsClient.isConnected() &&
          !wsClient.isJoinedToChat(currentChat.id)
        ) {
          await wsClient.joinChat(currentChat.id);
          isJoinedRef.current = true;
        }
      } catch (error) {
        console.error('Ошибка подключения к чату:', error);
      }
    };

    const leaveCurrentChat = async () => {
      const joinedChats = wsClient.getJoinedChats();
      for (const chatId of joinedChats) {
        if (chatId !== currentChat.id) {
          try {
            await wsClient.leaveChat(chatId);
          } catch (error) {
            console.error('Ошибка выхода из чата:', error);
          }
        }
      }
    };

    if (connectionState === ConnectionState.CONNECTED) {
      joinChat();
      leaveCurrentChat();
    }

    return () => {
      if (isJoinedRef.current) {
        setWsMessages([]);
        setTypingUsers([]);
        clearOptimisticMessages();

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          wsClient.stopTyping(currentChat.id);
        }
      }
    };
  }, [currentChat.id, connectionState, wsClient, clearOptimisticMessages]);

  const handleSendMessage = useCallback(
    async (messageDto: SendMessageDto) => {
      const fullMessageDto = {
        ...messageDto,
        chatId: currentChat.id,
        type: messageDto.type || MessageType.TEXT,
      };

      const tempId = addOptimisticMessage(fullMessageDto);

      try {
        if (wsClient.isConnected() && wsClient.isJoinedToChat(currentChat.id)) {
          const sentMessage = await wsClient.sendMessage(fullMessageDto);

          setTimeout(() => {
            updateOptimisticMessage(tempId, sentMessage);
          }, 100);
        } else {
          console.warn('WebSocket недоступен, HTTP fallback');
          removeOptimisticMessage(tempId);
        }
      } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
        removeOptimisticMessage(tempId);

        throw error;
      }
    },
    [
      currentChat.id,
      wsClient,
      addOptimisticMessage,
      updateOptimisticMessage,
      removeOptimisticMessage,
    ],
  );

  const handleEditMessage = useCallback(
    async (messageId: string, content: string) => {
      try {
        if (wsClient.isConnected()) {
          await wsClient.editMessage(messageId, { content });
        } else {
          // HTTP fallback
          await editMessage(messageId, { content });
        }
      } catch (error) {
        console.error('Ошибка редактирования сообщения:', error);
        throw error;
      }
    },
    [wsClient, editMessage],
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      try {
        if (wsClient.isConnected()) {
          await wsClient.deleteMessage(messageId);
        } else {
          // HTTP fallback
          // await deleteMessage(messageId);
        }
      } catch (error) {
        console.error('Ошибка удаления сообщения:', error);
        throw error;
      }
    },
    [wsClient],
  );

  const handleTypingStart = useCallback(() => {
    if (wsClient.isConnected() && wsClient.isJoinedToChat(currentChat.id)) {
      wsClient.startTyping(currentChat.id);
    }
  }, [wsClient, currentChat.id]);

  const handleTypingStop = useCallback(() => {
    if (wsClient.isConnected() && wsClient.isJoinedToChat(currentChat.id)) {
      wsClient.stopTyping(currentChat.id);
    }
  }, [wsClient, currentChat.id]);

  const handleLoadMore = useCallback(() => {
    setLoadingMore(true);
    try {
      loadMoreMessages();
    } finally {
      setLoadingMore(false);
    }
  }, [loadMoreMessages]);

  const allMessages = React.useMemo(() => {
    const combined = [
      ...httpMessages,
      ...wsMessages,
      ...optimisticMessages.map((opt) => ({ ...opt, isOptimistic: true })),
    ];

    const unique = combined.reduce(
      (
        acc: Message[] | OptimisticMessageType[],
        message: OptimisticMessageType | Message,
      ) => {
        const existing = acc.find((m) => m.id === message.id);
        if (!existing) {
          acc.push(message);
        } else if (
          !Object.prototype.hasOwnProperty.call(existing, 'isOptimistic') &&
          Object.prototype.hasOwnProperty.call(message, 'isOptimistic')
        ) {
          return acc;
        }
        return acc;
      },
      [] as any[],
    );

    return unique.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [httpMessages, wsMessages, optimisticMessages]);

  const typingUserNames = typingUsers
    .map((userId) => {
      const participant = currentChat.participants.find((p) => p.id === userId);
      return participant?.name || participant?.username || 'Пользователь';
    })
    .filter(Boolean);

  const getConnectionStatus = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return wsClient.isJoinedToChat(currentChat.id)
          ? 'В сети'
          : 'Подключение...';
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return 'Подключение...';
      case ConnectionState.ERROR:
      case ConnectionState.DISCONNECTED:
        return 'Не в сети';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader
        chatName={currentChat.name || 'Неизвестный'}
        status={getConnectionStatus()}
        avatar={currentChat.avatar}
      />

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {connectionState !== ConnectionState.CONNECTED && (
          <div className="mb-4 text-center">
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                connectionState === ConnectionState.RECONNECTING
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}
            >
              {connectionState === ConnectionState.RECONNECTING && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
              )}
              {connectionState === ConnectionState.CONNECTING &&
                'Подключение...'}
              {connectionState === ConnectionState.RECONNECTING &&
                'Переподключение...'}
              {connectionState === ConnectionState.ERROR &&
                'Ошибка подключения'}
              {connectionState === ConnectionState.DISCONNECTED &&
                'Нет соединения'}
            </div>
          </div>
        )}

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
          {loading && allMessages.length === 0 ? (
            <>
              <MessageSkeleton isOwn={false} />
              <MessageSkeleton isOwn={true} />
              <MessageSkeleton isOwn={false} />
              <MessageSkeleton isOwn={true} />
              <MessageSkeleton isOwn={false} />
            </>
          ) : (
            <>
              {allMessages.map((message: OptimisticMessageType) => {
                const isOwn = message.senderId === currentUser.id;

                if (message.isOptimistic) {
                  return (
                    <OptimisticMessage
                      key={message.id}
                      content={message.content}
                      isOwn={isOwn}
                      isPending={message.isPending}
                      // hasError={message.hasError}
                      timestamp={new Date(message.createdAt)}
                    />
                  );
                }

                return (
                  <MessageContainer
                    key={message.id}
                    isOwn={isOwn}
                    message={message}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                    onReply={(msg) => {
                      console.log('Reply to:', msg);
                    }}
                    onCopy={(content) => {
                      console.log('Copied:', content);
                    }}
                    onForward={(msg) => {
                      console.log('Forward:', msg);
                    }}
                  />
                );
              })}

              {typingUserNames.length > 0 && (
                <TypingIndicator userNames={typingUserNames} />
              )}
            </>
          )}

          {loading && allMessages.length > 0 && !loadingMore && (
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
                onClick={() => {
                  loadMessages();
                }}
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
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        disabled={connectionState !== ConnectionState.CONNECTED}
      />
    </div>
  );
}
