import React, { useState, useRef } from 'react';
import { Message } from '../services/types';
import { MessageContextMenu } from '../widgets/chat/MessageContextMenu';
import { Edit3, Reply, Trash2 } from 'lucide-react';
import { useContextMenu } from '../hooks/ui/useContextMenu';

interface Props {
  message: Message;
  isOwn: boolean;
  onEdit?: (messageId: string, content: string) => Promise<void>;
  onDelete?: (messageId: string) => Promise<void>;
  onReply?: (message: Message) => void;
  onCopy?: (content: string) => void;
  onForward?: (message: Message) => void;
}

export default function MessageContainer({
  message,
  isOwn,
  onEdit,
  onDelete,
  onReply,
  onCopy,
  onForward,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const contextMenu = useContextMenu();
  const editInputRef = useRef<HTMLInputElement>(null);

  // ================= HANDLERS =================

  const handleContextMenu = (event: React.MouseEvent) => {
    contextMenu.open(event);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 0);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      try {
        await onEdit?.(message.id, editContent.trim());
        setIsEditing(false);
      } catch (error) {
        console.error('Ошибка редактирования:', error);
        // Можно показать toast с ошибкой
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSaveEdit();
    } else if (event.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить это сообщение?')) {
      try {
        await onDelete?.(message.id);
      } catch (error) {
        console.error('Ошибка удаления:', error);
        // Можно показать toast с ошибкой
      }
    }
  };

  const handleReply = () => {
    onReply?.(message);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      // Можно показать toast об успешном копировании
    } catch (error) {
      console.error('Ошибка копирования:', error);
    }
    onCopy?.(message.content);
  };

  const handleForward = () => {
    onForward?.(message);
  };

  // ================= RENDER =================

  const formatTime = (date: Date | string) => {
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    return messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}
        onContextMenu={handleContextMenu}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative cursor-pointer select-text ${
            isOwn
              ? 'bg-blue-500 dark:bg-blue-600 text-white rounded-br-md'
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-md shadow-sm border border-gray-200 dark:border-gray-600'
          } ${isEditing ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
        >
          {message.replyTo && (
            <div
              className={`mb-2 p-2 rounded border-l-2 text-xs ${
                isOwn
                  ? 'border-blue-200 bg-blue-600/20 text-blue-100'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}
            >
              <div className="font-medium">
                {message.replyTo.sender.name || message.replyTo.sender.username}
              </div>
              <div className="truncate">{message.replyTo.content}</div>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-2">
              <input
                ref={editInputRef}
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyPress}
                className={`w-full bg-transparent border-none outline-none text-sm ${
                  isOwn
                    ? 'text-white placeholder-blue-200'
                    : 'text-gray-800 dark:text-gray-100 placeholder-gray-400'
                }`}
              />
              <div className="flex items-center justify-end space-x-2 text-xs">
                <button
                  onClick={handleCancelEdit}
                  className={`px-2 py-1 rounded ${
                    isOwn
                      ? 'text-blue-200 hover:text-white hover:bg-blue-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Отмена
                </button>
                <button
                  onClick={handleSaveEdit}
                  className={`px-2 py-1 rounded ${
                    isOwn
                      ? 'text-blue-200 hover:text-white hover:bg-blue-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Сохранить
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>

              <div
                className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                  isOwn
                    ? 'text-blue-100 dark:text-blue-200'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {message.edited && <span className="opacity-75">изменено</span>}
                <span>{formatTime(message.createdAt)}</span>

                {isOwn && (
                  <div className="flex">
                    <div className="w-1 h-1 rounded-full bg-blue-200 ml-1"></div>
                    <div className="w-1 h-1 rounded-full bg-blue-200 ml-1"></div>
                  </div>
                )}
              </div>
            </>
          )}

          <div
            className={`absolute top-0 ${isOwn ? 'left-0' : 'right-0'} transform ${isOwn ? '-translate-x-full' : 'translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
          >
            <div className="flex items-center space-x-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg px-2 py-1 ml-2 mr-2">
              <button
                onClick={handleReply}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                title="Ответить"
              >
                <Reply className="w-3 h-3" />
              </button>

              {isOwn && (
                <>
                  <button
                    onClick={handleEdit}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                    title="Редактировать"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    title="Удалить"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <MessageContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={contextMenu.close}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReply={handleReply}
        onCopy={handleCopy}
        onForward={handleForward}
        isOwn={isOwn}
        canEdit={!isEditing}
        canDelete={true}
      />
    </>
  );
}
