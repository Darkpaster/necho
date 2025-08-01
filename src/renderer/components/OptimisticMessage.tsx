import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface OptimisticMessageProps {
  content: string;
  isOwn: boolean;
  isPending?: boolean;
  hasError?: boolean;
  timestamp?: Date;
}

export default function OptimisticMessage({
  content,
  isOwn,
  isPending = false,
  hasError = false,
  timestamp = new Date(),
}: OptimisticMessageProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
          isOwn
            ? hasError
              ? 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700'
              : isPending
                ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                : 'bg-blue-500 dark:bg-blue-600 text-white'
            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
        }`}
      >
        {isPending && (
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
          </div>
        )}

        {hasError && (
          <div className="absolute -top-1 -right-1">
            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
          </div>
        )}

        <p
          className={`text-sm ${
            isOwn
              ? hasError || isPending
                ? 'text-gray-700 dark:text-gray-300'
                : 'text-white'
              : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {content}
        </p>

        <div
          className={`flex items-center justify-end mt-1 space-x-1 ${
            isOwn
              ? hasError || isPending
                ? 'text-gray-500 dark:text-gray-400'
                : 'text-blue-100 dark:text-blue-200'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {isPending && <Clock className="w-3 h-3" />}
          <span className="text-xs">
            {timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isPending && (
            <span className="text-xs opacity-75">Отправляется...</span>
          )}
          {hasError && (
            <span className="text-xs text-red-500 dark:text-red-400">
              Ошибка
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
