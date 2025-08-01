import React, { useState, useEffect, useCallback, useRef } from 'react';

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface UseContextMenuReturn {
  isOpen: boolean;
  position: ContextMenuPosition;
  open: (event: React.MouseEvent | MouseEvent) => void;
  close: () => void;
  targetRef: React.RefObject<HTMLElement>;
}

export function useContextMenu(): UseContextMenuReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });
  const targetRef = useRef<HTMLElement>(null);

  const open = useCallback((event: React.MouseEvent | MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = event.clientX;
    let y = event.clientY;

    const menuWidth = 200;
    const menuHeight = 150;

    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10;
    }

    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10;
    }

    setPosition({ x, y });
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        close();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('scroll', close);
      window.addEventListener('resize', close);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('scroll', close);
      window.removeEventListener('resize', close);
    };
  }, [isOpen, close]);

  return {
    isOpen,
    position,
    open,
    close,
    targetRef,
  };
}