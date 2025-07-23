import React from 'react';
import { useState } from 'react';
import AuthForm from './widgets/AuthForm';
import { AuthProvider } from './hooks/useAuth';

export default function Necho() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      className={`flex h-screen w-screen bg-gray-100 dark:bg-gray-900 ${darkMode ? 'dark' : 'light'}`}
    >
      <AuthProvider>
        <AuthForm darkMode={darkMode} setDarkMode={setDarkMode} />
      </AuthProvider>
    </div>
  );
}
