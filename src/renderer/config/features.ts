export const FEATURE_FLAGS = {
  // Основные функции
  enableDarkMode: true,
  enableNotifications: true,
  enableOfflineMode: false,
  enableAnalytics: process.env.NODE_ENV === 'production',

  // Экспериментальные функции
  experimental: {
    enableNewEditor: false,
    enableVirtualScrolling: true,
    enableServiceWorker: false,
  },

  // A/B тесты
  abTests: {
    newDesign: false,
    improvedSearch: true,
  },

  // Интеграции
  integrations: {
    googleAnalytics: process.env.REACT_APP_GA_ID || null,
    sentry: process.env.REACT_APP_SENTRY_DSN || null,
    hotjar: process.env.REACT_APP_HOTJAR_ID || null,
  },
} as const