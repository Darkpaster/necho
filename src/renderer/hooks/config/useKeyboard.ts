import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const matches =
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrlKey &&
          !!event.shiftKey === !!shortcut.shiftKey &&
          !!event.altKey === !!shortcut.altKey;

        if (matches) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.callback();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export const useDefaultShortcuts = (callbacks: {
  onSave?: () => void;
  onToggleTheme?: () => void;
  onToggleSidebar?: () => void;
  onFind?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [];

  if (callbacks.onSave) {
    shortcuts.push({ key: 's', ctrlKey: true, callback: callbacks.onSave });
  }
  if (callbacks.onToggleTheme) {
    shortcuts.push({
      key: 't',
      ctrlKey: true,
      shiftKey: true,
      callback: callbacks.onToggleTheme,
    });
  }
  if (callbacks.onToggleSidebar) {
    shortcuts.push({
      key: 'b',
      ctrlKey: true,
      callback: callbacks.onToggleSidebar,
    });
  }
  if (callbacks.onFind) {
    shortcuts.push({ key: 'f', ctrlKey: true, callback: callbacks.onFind });
  }
  if (callbacks.onUndo) {
    shortcuts.push({ key: 'z', ctrlKey: true, callback: callbacks.onUndo });
  }
  if (callbacks.onRedo) {
    shortcuts.push({ key: 'y', ctrlKey: true, callback: callbacks.onRedo });
  }

  useKeyboardShortcuts(shortcuts);
};
