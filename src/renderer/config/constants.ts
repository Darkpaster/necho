export const CONSTANTS = {
  // Размеры файлов
  fileSize: {
    maxAvatar: 5 * 1024 * 1024, // 5MB
    maxDocument: 50 * 1024 * 1024, // 50MB
    maxImage: 10 * 1024 * 1024, // 10MB
  },

  // Форматы файлов
  fileTypes: {
    images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    documents: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    archives: ['zip', 'rar', '7z', 'tar', 'gz'],
  },

  // Паджинация
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    maxPageSize: 100,
  },

  // Валидация
  validation: {
    password: {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    username: {
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]+$/,
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
  },

  // Уведомления
  notifications: {
    duration: {
      success: 3000,
      info: 5000,
      warning: 7000,
      error: 0, // Не скрывать автоматически
    },
    maxCount: 5,
    position: 'top-right' as const,
  },

  // Клавиатурные сочетания
  shortcuts: {
    save: 'Ctrl+S',
    copy: 'Ctrl+C',
    paste: 'Ctrl+V',
    undo: 'Ctrl+Z',
    redo: 'Ctrl+Y',
    find: 'Ctrl+F',
    toggleTheme: 'Ctrl+Shift+T',
    toggleSidebar: 'Ctrl+B',
  },

  // Animation durations
  animations: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // Z-index levels
  zIndex: {
    dropdown: 1000,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },
} as const