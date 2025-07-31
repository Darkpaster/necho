import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Search, X, Loader2, AlertCircle, UserRound } from 'lucide-react';
import { User } from '../../services/types';
import Modal from '../../components/Modal';

export interface SearchConfig {
  title: string;
  placeholder: string;
  emptyMessage: string;
  searchFunction: (query: string) => Promise<User[]>;
  renderItem?: (item: User) => ReactNode;
  allowMultiSelect?: boolean;
  maxResults?: number;
  minQueryLength?: number;
}

interface DatabaseSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (user: User | User[]) => Promise<void>;
  config: SearchConfig;
  className?: string;
}

const DefaultItemRenderer = ({ item }: { item: User }) => {
  const getIcon = () => {
    return <UserRound className="w-4 h-4" />;
  };

  const getStatusColor = (item: User) => {
    switch (item.isOnline) {
      case true:
        return 'bg-green-500';
      case false:
      default:
        return 'bg-gray-400';
    }
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="flex items-center w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
      <div className="relative flex-shrink-0 mr-3">
        {item.avatar ? (
          <img
            src={item.avatar}
            alt={item.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300">
            {getIcon()}
          </div>
        )}

        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(item)}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {item.name}
          </h3>

          {!item.isOnline && item.lastSeen && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {formatLastSeen(item.lastSeen)}
            </span>
          )}
        </div>

        {item.email && (
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
            {item.email}
          </p>
        )}
      </div>
    </div>
  );
};

export default function DBSearchModal({
  isOpen,
  onClose,
  onSelect,
  config,
  className = '',
}: DatabaseSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [selectedItems, setSelectedItems] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    title,
    placeholder,
    emptyMessage,
    searchFunction,
    renderItem = DefaultItemRenderer,
    allowMultiSelect = false,
    maxResults = 50,
    minQueryLength = 1,
  } = config;

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedItems([]);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const performSearch = async () => {
      if (query.length < minQueryLength) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await searchFunction(query);
        setResults(searchResults.slice(0, maxResults));
      } catch (err) {
        setError('Ошибка поиска. Попробуйте еще раз.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query, searchFunction, minQueryLength, maxResults]);

  const handleItemSelect = async (item: User) => {
    if (allowMultiSelect) {
      const isSelected = selectedItems.some(
        (selected) => selected.id === item.id,
      );
      if (isSelected) {
        setSelectedItems((prev) =>
          prev.filter((selected) => selected.id !== item.id),
        );
      } else {
        setSelectedItems((prev) => [...prev, item]);
      }
    } else {
      try {
        await onSelect(item);
        onClose();
      } catch (error) {
        console.error('Error in onSelect:', error);
      }
    }
  };

  const handleConfirmSelection = async () => {
    if (selectedItems.length > 0) {
      try {
        await onSelect(selectedItems);
        onClose();
      } catch (error) {
        console.error('Error in onSelect:', error);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      className={className}
    >
      {/* Search Input */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          {isLoading && (
            <Loader2 className="w-4 h-4 absolute right-3 top-3 text-gray-400 animate-spin" />
          )}
        </div>
      </div>

      {allowMultiSelect && selectedItems.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm"
              >
                <span className="truncate max-w-24">{item.name}</span>
                <button
                  onClick={() => handleItemSelect(item)}
                  className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {error ? (
          <div className="flex flex-col items-center justify-center p-8 text-red-500 dark:text-red-400">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-center">{error}</p>
          </div>
        ) : query.length < minQueryLength ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
            <Search className="w-8 h-8 mb-2" />
            <p className="text-center">
              Введите минимум {minQueryLength} символ
              {minQueryLength > 1 ? 'а' : ''} для поиска
            </p>
          </div>
        ) : results.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-center">{emptyMessage}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {results.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemSelect(item)}
                className={`relative ${
                  allowMultiSelect &&
                  selectedItems.some((selected) => selected.id === item.id)
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : ''
                }`}
              >
                {renderItem({ item: item, ...item })}
                {allowMultiSelect &&
                  selectedItems.some((selected) => selected.id === item.id) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>

      {allowMultiSelect && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Выбрано: {selectedItems.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={selectedItems.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Выбрать
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
