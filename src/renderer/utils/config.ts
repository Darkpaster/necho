import { CONSTANTS } from '../config/constants';
import { APP_CONFIG } from '../config/app';

/**
 * Валидация файлов по конфигурации
 */
export const validateFile = (
  file: File,
  type: 'image' | 'document' | 'avatar',
) => {
  const errors: string[] = [];

  // Проверка размера
  let maxSize: number;
  switch (type) {
    case 'avatar':
      maxSize = CONSTANTS.fileSize.maxAvatar;
      break;
    case 'image':
      maxSize = CONSTANTS.fileSize.maxImage;
      break;
    case 'document':
      maxSize = CONSTANTS.fileSize.maxDocument;
      break;
    default:
      maxSize = CONSTANTS.fileSize.maxDocument;
  }

  if (file.size > maxSize) {
    errors.push(
      `Файл слишком большой. Максимальный размер: ${formatFileSize(maxSize)}`,
    );
  }

  // Проверка типа
  const extension = file.name.split('.').pop()?.toLowerCase();
  let allowedTypes: readonly string[];

  switch (type) {
    case 'avatar':
    case 'image':
      allowedTypes = CONSTANTS.fileTypes.images;
      break;
    case 'document':
      allowedTypes = CONSTANTS.fileTypes.documents;
      break;
    default:
      allowedTypes = [
        ...CONSTANTS.fileTypes.images,
        ...CONSTANTS.fileTypes.documents,
      ];
  }

  if (!extension || !allowedTypes.includes(extension)) {
    errors.push(
      `Неподдерживаемый тип файла. Разрешены: ${allowedTypes.join(', ')}`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Форматирование размера файла
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Валидация пароля по конфигурации
 */
export const validatePassword = (password: string) => {
  const { validation } = CONSTANTS;
  const errors: string[] = [];

  if (password.length < validation.password.minLength) {
    errors.push(`Минимум ${validation.password.minLength} символов`);
  }

  if (password.length > validation.password.maxLength) {
    errors.push(`Максимум ${validation.password.maxLength} символов`);
  }

  if (validation.password.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Требуется заглавная буква');
  }

  if (validation.password.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Требуется строчная буква');
  }

  if (validation.password.requireNumbers && !/\d/.test(password)) {
    errors.push('Требуется цифра');
  }

  if (
    validation.password.requireSpecialChars &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    errors.push('Требуется специальный символ');
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password),
  };
};

/**
 * Вычисление силы пароля
 */
const calculatePasswordStrength = (
  password: string,
): 'weak' | 'medium' | 'strong' => {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
};

/**
 * Валидация email
 */
export const validateEmail = (email: string) => {
  const { validation } = CONSTANTS;
  const isValid = validation.email.pattern.test(email);

  return {
    isValid,
    errors: isValid ? [] : ['Некорректный формат email'],
  };
};

/**
 * Валидация имени пользователя
 */
export const validateUsername = (username: string) => {
  const { validation } = CONSTANTS;
  const errors: string[] = [];

  if (username.length < validation.username.minLength) {
    errors.push(`Минимум ${validation.username.minLength} символов`);
  }

  if (username.length > validation.username.maxLength) {
    errors.push(`Максимум ${validation.username.maxLength} символов`);
  }

  if (!validation.username.pattern.test(username)) {
    errors.push('Разрешены только буквы, цифры, _ и -');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Создание URL с параметры пагинации
 */
export const createPaginationUrl = (
  baseUrl: string,
  page: number,
  pageSize?: number,
) => {
  const { pagination } = CONSTANTS;
  const size = pageSize || pagination.defaultPageSize;
  const url = new URL(baseUrl, window.location.origin);

  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', size.toString());

  return url.toString();
};

/**
 * Проверка поддержки функции браузером
 */
export const checkBrowserSupport = () => {
  return {
    webgl: !!window.WebGLRenderingContext,
    webgl2: !!window.WebGL2RenderingContext,
    webAssembly: 'WebAssembly' in window,
    serviceWorker: 'serviceWorker' in navigator,
    notifications: 'Notification' in window,
    mediaRecorder: 'MediaRecorder' in window,
    intersection: 'IntersectionObserver' in window,
    mutation: 'MutationObserver' in window,
    performance: 'performance' in window,
  };
};

/**
 * Генерация уникального ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Дебаунс функции
 */
// export const debounce = <T extends (...args: any[]) => void>(
//   func: T,
//   wait: number = CONSTANTS.performance?.debounceDelay || 300,
// ) => {
//   let timeout: NodeJS.Timeout;
//
//   return (...args: Parameters<T>) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// };

/**
 * Троттлинг функции
 */
// export const throttle = <T extends (...args: any[]) => void>(
//   func: T,
//   limit: number = CONSTANTS.performance?.throttleDelay || 100,
// ) => {
//   let inThrottle: boolean;
//
//   return (...args: Parameters<T>) => {
//     if (!inThrottle) {
//       func(...args);
//       inThrottle = true;
//       setTimeout(() => (inThrottle = false), limit);
//     }
//   };
// };

/**
 * Логирование с уровнями
 */
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (
      APP_CONFIG.logging.enableConsole &&
      APP_CONFIG.logging.level === 'debug'
    ) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: any[]) => {
    if (APP_CONFIG.logging.enableConsole) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (APP_CONFIG.logging.enableConsole) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  error: (message: string, ...args: any[]) => {
    if (APP_CONFIG.logging.enableConsole) {
      console.error(`[ERROR] ${message}`, ...args);
    }

    // Отправка на сервер в продакшене
    if (APP_CONFIG.logging.enableRemote && APP_CONFIG.env.isProduction) {
      // Здесь можно добавить отправку на сервер логирования
    }
  },
};

/**
 * Управление полноэкранным режимом
 */
export const fullscreen = {
  enter: (element?: Element) => {
    const el = element || document.documentElement;
    if (el.requestFullscreen) {
      return el.requestFullscreen();
    }
  },

  exit: () => {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    }
  },

  toggle: (element?: Element) => {
    if (document.fullscreenElement) {
      return fullscreen.exit();
    } else {
      return fullscreen.enter(element);
    }
  },

  isSupported: () => {
    return !!document.documentElement.requestFullscreen;
  },
};

/**
 * Копирование в буфер обмена
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    logger.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Загрузка файла
 */
export const downloadFile = (
  data: Blob | string,
  filename: string,
  mimeType?: string,
) => {
  const blob =
    data instanceof Blob
      ? data
      : new Blob([data], { type: mimeType || 'text/plain' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Проверка поддержки темной темы системой
 */
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
};

/**
 * Получение информации о устройстве
 */
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;

  return {
    isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    ),
    isTablet: /iPad|Android.*(?!.*Mobile)/i.test(userAgent),
    isDesktop: !/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    ),
    browser: getBrowserName(userAgent),
    os: getOperatingSystem(userAgent),
    touchSupport: 'ontouchstart' in window,
    retina: window.devicePixelRatio > 1,
  };
};

const getBrowserName = (userAgent: string) => {
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
};

const getOperatingSystem = (userAgent: string) => {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
};
