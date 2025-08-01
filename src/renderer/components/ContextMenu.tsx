import React from 'react';
import { createPortal } from 'react-dom';
import { ContextMenuPosition } from '../hooks/ui/useContextMenu';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
}

export interface ContextMenuProps {
  isOpen: boolean;
  position: ContextMenuPosition;
  items: ContextMenuItem[];
  onClose: () => void;
  className?: string;
}

export function ContextMenu({
  isOpen,
  position,
  items,
  onClose,
  className = '',
}: ContextMenuProps) {
  if (!isOpen) return null;

  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      onClose();
    }
  };

  return createPortal(
    <div
      className={`fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[180px] py-1 ${className}`}
      style={{
        left: position.x,
        top: position.y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return (
            <div
              key={`separator-${index}`}
              className="my-1 border-t border-gray-200 dark:border-gray-600"
            />
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={`w-full flex items-center px-3 py-2 text-sm text-left transition-colors ${
              item.disabled
                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : item.destructive
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {item.icon && (
              <span className="mr-3 flex-shrink-0">{item.icon}</span>
            )}
            <span className="flex-1">{item.label}</span>
          </button>
        );
      })}
    </div>,
    document.body,
  );
}
