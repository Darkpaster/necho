import React from 'react';
import MessageSkeleton from './MessageSkeleton';

export default function ChatAreaSkeleton() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header skeleton */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
        </div>
      </div>

      {/* Messages area skeleton */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        <div className="space-y-4">
          <MessageSkeleton isOwn={false} />
          <MessageSkeleton isOwn={true} />
          <MessageSkeleton isOwn={false} />
          <MessageSkeleton isOwn={true} />
          <MessageSkeleton isOwn={false} />
        </div>
      </div>

      {/* Input area skeleton */}
      <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex space-x-2">
          <div className="flex-1 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}