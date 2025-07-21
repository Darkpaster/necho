import { Mic, Paperclip, Send, Smile } from 'lucide-react';
import { useState } from 'react';

interface props {
  message?: string;
  setMessage: (message: string) => void;
}

export default function ChatInput() {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center space-x-3">
        <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200" />

        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Написать сообщение..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <Smile className="w-5 h-5 absolute right-3 top-2.5 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200" />
        </div>

        {message.trim() ? (
          <button
            onClick={handleSendMessage}
            className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        ) : (
          <Mic className="w-5 h-5 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200" />
        )}
      </div>
    </div>
  )
}