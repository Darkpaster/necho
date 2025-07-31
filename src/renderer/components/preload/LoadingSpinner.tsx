import React from 'react';

export default function LoadingSpinner() {
  return (
    <div
      className={`min-h-screen min-w-screen flex items-center justify-center dark:bg-gray-900 bg-gray-50`}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className={`dark:text-white text-gray-800`}>Загрузка...</p>
      </div>
    </div>
  );
}
