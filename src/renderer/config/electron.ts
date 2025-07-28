export const ELECTRON_CONFIG = {
  // Настройки окна
  window: {
    default: {
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
    },
    titleBarStyle: 'default' as const,
    frame: true,
    resizable: true,
    maximizable: true,
    minimizable: true,
  },

  // Настройки меню
  menu: {
    showDeveloperTools: process.env.NODE_ENV === 'development',
    showInspectElement: process.env.NODE_ENV === 'development',
  },

  // Автообновления
  updater: {
    enabled: process.env.NODE_ENV === 'production',
    checkInterval: 24 * 60 * 60 * 1000, // 24 часа
    autoDownload: true,
    autoInstall: false,
  },

  // Безопасность
  security: {
    nodeIntegration: false,
    contextIsolation: true,
    enableRemoteModule: false,
    webSecurity: true,
  },
} as const