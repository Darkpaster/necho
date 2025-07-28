import React from 'react';
import ChatSkeleton from './ChatSkeleton';

export default function SidebarSkeleton() {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header skeleton */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>

      {/* Search skeleton */}
      <div className="p-4 animate-pulse">
        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
      </div>

      {/* Chat list skeleton */}
      <div className="flex-1 overflow-y-auto">
        {Array.from({ length: 8 }).map((_, index) => (
          <ChatSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}