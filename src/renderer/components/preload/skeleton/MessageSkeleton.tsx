import React from 'react';

interface MessageSkeletonProps {
  isOwn?: boolean;
}

export default function MessageSkeleton({ isOwn = false }: MessageSkeletonProps) {
  return (
    <div className={`flex animate-pulse ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwn
          ? 'bg-gray-300 dark:bg-gray-600'
          : 'bg-gray-200 dark:bg-gray-700'
      }`}>
        {/* Message content skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-full"></div>
          <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-3/4"></div>
          <div className="h-3 bg-gray-400 dark:bg-gray-500 rounded w-16 mt-2"></div>
        </div>
      </div>
    </div>
  );
}