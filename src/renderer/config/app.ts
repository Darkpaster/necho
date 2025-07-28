export const APP_CONFIG = {
  name: 'Necho',
  version: '1.0.0',
  description: 'Electron React NestJS Application',

  // Окружения
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },

  // URLs
  urls: {
    api: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    websocket: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
    documentation: 'https://docs.example.com',
    support: 'https://support.example.com',
  },

  // Настройки производительности
  performance: {
    virtualScrollThreshold: 100,
    debounceDelay: 300,
    throttleDelay: 100,
    requestTimeout: 30000,
  },

  // Настройки хранения
  storage: {
    keys: {
      theme: 'app_theme',
      language: 'app_language',
      user: 'app_user',
      tokens: 'app_tokens',
      preferences: 'app_preferences',
    },
    encryption: {
      enabled: true,
      algorithm: 'AES-256-GCM',
    },
  },

  // Логирование
  logging: {
    level: process.env.REACT_APP_LOG_LEVEL || 'info',
    enableConsole: process.env.NODE_ENV === 'development',
    enableRemote: process.env.NODE_ENV === 'production',
    maxEntries: 1000,
  },
} as const