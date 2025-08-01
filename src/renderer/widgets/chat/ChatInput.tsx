import { Loader2, Mic, Paperclip, Send, Smile } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MessageType, SendMessageDto } from '../../services/types';

interface Props extends React.HTMLProps<HTMLInputElement> {
  sendMessage: (messageDto: SendMessageDto) => Promise<void>;
  error?: string;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
}

export default function ChatInput({
  sendMessage,
  error,
  onTypingStart,
  onTypingStop,
  disabled = false,
  ...inputProps
}: Props) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingTimeRef = useRef<number>(0);

  const TYPING_TIMEOUT = 3000;
  const TYPING_DEBOUNCE = 1000;

  const startTyping = useCallback(() => {
    const now = Date.now();

    if (isTyping && now - lastTypingTimeRef.current < TYPING_DEBOUNCE) {
      return;
    }

    if (!isTyping) {
      setIsTyping(true);
      onTypingStart?.();
    }

    lastTypingTimeRef.current = now;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, TYPING_TIMEOUT);
  }, [isTyping, onTypingStart]);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      onTypingStop?.();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = undefined;
    }
  }, [isTyping, onTypingStop]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setMessage(value);

      if (value.trim() && !disabled) {
        startTyping();
      } else {
        stopTyping();
      }
    },
    [disabled, startTyping, stopTyping],
  );

  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending || disabled) {
      return;
    }

    setIsSending(true);
    stopTyping();

    try {
      await sendMessage({
        type: MessageType.TEXT,
        chatId: '', // Будет установлен в MainChatArea
        content: trimmedMessage,
      });

      setMessage('');
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    } finally {
      setIsSending(false);
    }
  }, [message, isSending, disabled, sendMessage, stopTyping]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (disabled && isTyping) {
      stopTyping();
    }
  }, [disabled, isTyping, stopTyping]);

  const showSendButton = message.trim() && !disabled;
  const showError = error && !isSending;

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center space-x-3">
        <button
          disabled={disabled}
          className={`p-2 rounded-full transition-colors ${
            disabled
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <input
            {...inputProps}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={disabled || isSending}
            placeholder={
              disabled
                ? 'Нет соединения...'
                : isSending
                  ? 'Отправка...'
                  : 'Написать сообщение...'
            }
            className={`w-full px-4 py-2 pr-10 border rounded-full focus:outline-none focus:ring-2 transition-all ${
              disabled
                ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : showError
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`}
          />

          <button
            disabled={disabled}
            className={`absolute right-3 top-2.5 transition-colors ${
              disabled
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>

          {isTyping && !disabled && (
            <div className="absolute -top-8 left-2 bg-blue-500 dark:bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              Печатаете...
            </div>
          )}

          {showError && (
            <div className="absolute -top-8 left-0 right-0">
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg px-3 py-1">
                <p className="text-red-700 dark:text-red-400 text-xs">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>

        {showSendButton ? (
          <button
            onClick={handleSendMessage}
            disabled={isSending}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all transform ${
              isSending
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 hover:scale-105 active:scale-95'
            }`}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        ) : (
          <button
            disabled={disabled}
            className={`p-2 rounded-full transition-colors ${
              disabled
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Connection Status (for mobile) */}
      {disabled && (
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Ожидание подключения...
          </span>
        </div>
      )}
    </div>
  );
}
