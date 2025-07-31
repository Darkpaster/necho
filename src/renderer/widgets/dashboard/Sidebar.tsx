import ButtonContainer from '../../components/ButtonContainer';
import { useChats } from '../../hooks/api/useChats';
import { Chat, CreateChatDto, User } from '../../services/types';
import { useEffect, useState } from 'react';
import MainChatArea from '../chat/MainChatArea';
import SidebarHeader from './SidebarHeader';
import ChatSkeleton from '../../components/preload/skeleton/ChatSkeleton';
import ChatAreaSkeleton from '../../components/preload/skeleton/ChatAreaSkeleton';
import { useAppDispatch } from '../../store/store';

export default function Sidebar() {
  const { chats, createChat, updateChat, error, loading } = useChats();
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);

  const handleSelectChat = (id: string) => {
    const selectedChat: Chat = chats.find((chat) => chat.id === id);
    if (!selectedChat) {
      console.error('Error due selecting chat');
      return;
    }
    setCurrentChat(selectedChat);
  };

  const handleSelectUser = async (selectedUser: User | User[]) => {
    if (Array.isArray(selectedUser)) {
      console.warn('Multiple user selection not supported');
      return;
    }

    const createChatDto: CreateChatDto = {
      participantIds: [selectedUser.id],
      isGroup: false,
    };

    const newChat = await createChat(createChatDto);

    const chat = chats.find((chat) => chat.id === newChat.id);
    if (!chat) {
      console.error('Chat not found');
      return;
    }

    setCurrentChat(chat);
  };

  return (
    <>
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <SidebarHeader chats={chats} handleSelectChat={handleSelectChat} handleSelectUser={handleSelectUser} />

        <div className="flex-1 overflow-y-auto">
          {loading && chats.length === 0 ? (
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
                onClick={() => handleSelectChat(chat.id)}
                styles={
                  currentChat?.id === chats[index].id
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
                      {chat.lastMessage.createdAt &&
                        chat.lastMessage.createdAt.toString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {chat.lastMessage && chat.lastMessage.content}
                    </p>
                  </div>
                </div>
              </ButtonContainer>
            ))
          )}

          {loading && chats.length > 0 && (
            <>
              <ChatSkeleton />
              <ChatSkeleton />
            </>
          )}
        </div>
      </div>

      {currentChat ? (
        <MainChatArea currentChat={currentChat} />
      ) : loading ? (
        <ChatAreaSkeleton />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <h3 className="text-lg font-medium mb-2">Выберите чат</h3>
          </div>
        </div>
      )}
    </>
  );
}
