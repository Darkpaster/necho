import "./styles/globalStyles.css";
import { useState } from 'react';
import Sidebar from './widgets/Sidebar';
import MainChatArea from './widgets/MainChatArea';

export default function TelegramInterface() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`flex h-screen w-screen ${darkMode ? 'dark' : 'light'}`}>
      <div className="flex h-full w-full bg-gray-100 dark:bg-gray-900">

        <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />

        <MainChatArea />

      </div>
    </div>
  );
}