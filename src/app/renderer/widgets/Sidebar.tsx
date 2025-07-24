import { Moon, MoreVertical, Search, Sun } from 'lucide-react';
import ButtonContainer from '../components/ButtonContainer';
import { useChats } from '../hooks/useChats';
import { Chat } from '../services/types';
import { useState } from 'react';
import MainChatArea from './MainChatArea';

interface Props {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

export default function Sidebar({ darkMode, setDarkMode }: Props) {
  const { chats, createChat, loadChats, updateChat, error, loading } =
    useChats();

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const handleSelectChat = (index: number) => {
    setSelectedChat(chats[index]);
  };

  return (
    <>
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Necho
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400 cursor-pointer" />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Поиск"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading && <ButtonContainer>Загрузка...</ButtonContainer>}
          {error && <ButtonContainer>{error}</ButtonContainer>}
          {chats.map((chat: Chat, index: number) => (
            <ButtonContainer
              key={chat.id}
              onClick={() => handleSelectChat(index)}
              styles={
                selectedChat.id === chats[index].id
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
                  {/*{chat.unread > 0 && (*/}
                  {/*  <span className="bg-blue-500 dark:bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-5 text-center">*/}
                  {/*    {chat.unread}*/}
                  {/*  </span>*/}
                  {/*)}*/}
                </div>
              </div>
            </ButtonContainer>
          ))}
        </div>
      </div>
      {selectedChat && <MainChatArea currentChat={selectedChat} />}
    </>
  );
}
