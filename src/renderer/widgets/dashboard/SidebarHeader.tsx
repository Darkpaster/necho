import {
  MoreVertical,
  Search,
  Settings,
  UserRoundSearch,
  UsersRound,
  X,
} from 'lucide-react';
import SettingsModal from './SettingsModal';
import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../store/store';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { Chat, Message, User } from '../../services/types';
import ButtonContainer from '../../components/ButtonContainer';
import SearchResults from './SearchResults';
import DBSearchModal from './DBSearchModal';
import { userSearchConfig } from '../../config/userSearchConfig';
import { useModal } from '../../hooks/ui/useModal';

interface Props {
  chats: Chat[];
  handleSelectChat: (id: string) => void;
  handleSelectUser: (selectedUser: User | User[]) => Promise<void>;
}

export default function SidebarHeader({
  chats,
  handleSelectChat,
  handleSelectUser,
}: Props) {
  const user: User = useAppSelector(selectCurrentUser);
  const settingsModal = useModal();
  const findUserModal = useModal();
  const findGroupModal = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    chats: Chat[];
    messages: Array<{ chat: Chat; message: Message }>;
  }>({ chats: [], messages: [] });
  const searchInputRef = useRef<HTMLInputElement>(null);

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults({ chats: [], messages: [] });
      return;
    }

    const lowerQuery = query.toLowerCase();

    const foundChats = chats.filter((chat) =>
      chat.name?.toLowerCase().includes(lowerQuery),
    );

    const foundMessages: Array<{ chat: Chat; message: Message }> = [];

    chats.forEach((chat) => {
      chat.messages?.forEach((message) => {
        if (
          message.content.toLowerCase().includes(lowerQuery) ||
          message.sender.name.toLowerCase().includes(lowerQuery)
        ) {
          foundMessages.push({ chat, message });
        }
      });
    });

    setSearchResults({ chats: foundChats, messages: foundMessages });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleDropdownClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    // Задержка для обработки кликов по результатам
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ chats: [], messages: [] });
    searchInputRef.current?.focus();
  };

  const showSearchResults = isSearchFocused && searchQuery.trim().length > 0;

  const DropdownMenu = ({ isOpen }: { isOpen: boolean }) => {
    if (!isOpen) return null;

    return (
      <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[150px] z-40">
        <ButtonContainer
          styles="rounded-t-lg"
          onClick={findUserModal.open}
          // disabled={isCreatingChat}
        >
          <UserRoundSearch className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
          <span className="text-gray-800 dark:text-gray-100 text-sm">
            Найти пользователя
          </span>
        </ButtonContainer>
        <ButtonContainer styles="rounded-t-lg" onClick={findGroupModal.open}>
          <UsersRound className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
          <span className="text-gray-800 dark:text-gray-100 text-sm">
            Найти группу
          </span>
        </ButtonContainer>
        <ButtonContainer styles="rounded-t-lg" onClick={settingsModal.open}>
          <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
          <span className="text-gray-800 dark:text-gray-100 text-sm">
            Настройки
          </span>
        </ButtonContainer>
      </div>
    );
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        {/* User Info */}
        <div className="flex items-center">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full mr-3"
          />
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {user.email}
          </h1>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <ButtonContainer
            styles="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            onClick={handleDropdownClick}
          >
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </ButtonContainer>

          {/* Dropdown Menu */}
          {DropdownMenu({ isOpen: isDropdownOpen })}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Поиск по чатам и сообщениям..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />

        {/* Clear search button */}
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Search Results */}
        {showSearchResults && (
          <SearchResults
            results={searchResults}
            onChatSelect={handleSelectChat}
            onClose={() => setIsSearchFocused(false)}
          />
        )}
      </div>

      {/* Settings Modal */}
      {settingsModal.isOpen && (
        <SettingsModal
          isOpen={settingsModal.isOpen}
          onClose={settingsModal.close}
        />
      )}

      {/* User Search Modal */}
      <DBSearchModal
        isOpen={findUserModal.isOpen}
        onClose={findUserModal.close}
        onSelect={handleSelectUser}
        config={userSearchConfig}
      />

      {/* Overlay to close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
