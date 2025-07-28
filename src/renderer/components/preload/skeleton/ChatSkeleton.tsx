import React from 'react';

export default function ChatSkeleton() {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-center space-x-3">
        {/* Avatar skeleton */}
        <div className="relative">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
          </div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
}