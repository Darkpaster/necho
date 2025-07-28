import ButtonContainer from '../../components/ButtonContainer';
import { useChats } from '../../hooks/useChats';
import { Chat } from '../../services/types';
import { useState } from 'react';
import MainChatArea from '../chat/MainChatArea';
import SidebarHeader from './SidebarHeader';
import ChatSkeleton from '../../components/preload/skeleton/ChatSkeleton';
import ChatAreaSkeleton from '../../components/preload/skeleton/ChatAreaSkeleton';

export default function Sidebar() {
  const { chats, createChat, loadChats, updateChat, error, loading } =
    useChats();

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const handleSelectChat = (index: number) => {
    setSelectedChat(chats[index]);
  };

  return (
    <>
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <SidebarHeader />

        <div className="flex-1 overflow-y-auto">
          {loading && chats.length === 0 ? (
            // Показать скелеты чатов при первоначальной загрузке
            <>
              {Array.from({ length: 6 }).map((_, index) => (
                <ChatSkeleton key={index} />
              ))}
            </>
          ) : error ? (
            <ButtonContainer>{error}</ButtonContainer>
          ) : (
            chats.map((chat: Chat, index: number) => (
              <ButtonContainer
                key={chat.id}
                onClick={() => handleSelectChat(index)}
                styles={
                  selectedChat?.id === chats[index].id
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500 dark:border-blue-400'
                    : ''
                }
              >
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                      chat.participants[0].isOnline
                        ? 'bg-blue-500 dark:bg-blue-600'
                        : 'bg-gray-500 dark:bg-gray-600'
                    }`}
                  >
                    {chat.avatar}
                  </div>
                  {chat.participants[0].isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>

                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {chat.lastMessage.createdAt.toTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {chat.lastMessage.content}
                    </p>
                  </div>
                </div>
              </ButtonContainer>
            ))
          )}

          {/* Показать дополнительные скелеты при подгрузке новых чатов */}
          {loading && chats.length > 0 && (
            <>
              <ChatSkeleton />
              <ChatSkeleton />
            </>
          )}
        </div>
      </div>

      {/* Показать скелет области чата если чат не выбран и идет загрузка */}
      {selectedChat ? (
        <MainChatArea currentChat={selectedChat} />
      ) : loading ? (
        <ChatAreaSkeleton />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <h3 className="text-lg font-medium mb-2">Выберите чат</h3>
            <p>Выберите чат из списка, чтобы начать переписку</p>
          </div>
        </div>
      )}
    </>
  );
}