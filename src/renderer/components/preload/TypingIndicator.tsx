import React from 'react';

interface TypingIndicatorProps {
  userName?: string;
  userNames?: string[]; // Для поддержки множественных пользователей
  maxDisplayNames?: number;
}

export default function TypingIndicator({
  userName,
  userNames = [],
  maxDisplayNames = 3,
}: TypingIndicatorProps) {
  // Определяем список имен для отображения
  const names = userName ? [userName] : userNames;

  if (names.length === 0) {
    return null;
  }

  // Формируем текст индикатора
  const getTypingText = () => {
    if (names.length === 1) {
      return `${names[0]} печатает`;
    } else if (names.length === 2) {
      return `${names[0]} и ${names[1]} печатают`;
    } else if (names.length <= maxDisplayNames) {
      const lastUser = names.pop();
      return `${names.join(', ')} и ${lastUser} печатают`;
    } else {
      const displayNames = names.slice(0, maxDisplayNames);
      const remaining = names.length - maxDisplayNames;
      return `${displayNames.join(', ')} и еще ${remaining} печатают`;
    }
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {getTypingText()}
          </span>

          <div className="flex space-x-1">
            <div
              className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
            />
            <div
              className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}
            />
            <div
              className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
