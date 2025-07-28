export interface TranslationResources {
  common: {
    ok: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  auth: {
    login: string;
    logout: string;
    register: string;
    email: string;
    password: string;
    forgotPassword: string;
    rememberMe: string;
  };
  navigation: {
    home: string;
    profile: string;
    settings: string;
    help: string;
    about: string;
  };
  validation: {
    required: string;
    email: string;
    minLength: string;
    maxLength: string;
    passwordMismatch: string;
  };
}

// Английские переводы
export const enTranslations: TranslationResources = {
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
  },
  auth: {
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember Me',
  },
  navigation: {
    home: 'Home',
    profile: 'Profile',
    settings: 'Settings',
    help: 'Help',
    about: 'About',
  },
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email',
    minLength: 'Minimum {{count}} characters required',
    maxLength: 'Maximum {{count}} characters allowed',
    passwordMismatch: 'Passwords do not match',
  },
};

// Русские переводы
export const ruTranslations: TranslationResources = {
  common: {
    ok: 'ОК',
    cancel: 'Отмена',
    save: 'Сохранить',
    delete: 'Удалить',
    edit: 'Редактировать',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    warning: 'Предупреждение',
    info: 'Информация',
  },
  auth: {
    login: 'Войти',
    logout: 'Выйти',
    register: 'Регистрация',
    email: 'Электронная почта',
    password: 'Пароль',
    forgotPassword: 'Забыли пароль?',
    rememberMe: 'Запомнить меня',
  },
  navigation: {
    home: 'Главная',
    profile: 'Профиль',
    settings: 'Настройки',
    help: 'Помощь',
    about: 'О программе',
  },
  validation: {
    required: 'Это поле обязательно',
    email: 'Введите корректный email',
    minLength: 'Минимум {{count}} символов',
    maxLength: 'Максимум {{count}} символов',
    passwordMismatch: 'Пароли не совпадают',
  },
};

export const I18N_CONFIG = {
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  storageKey: 'app_language',
  resources: {
    en: enTranslations,
    ru: ruTranslations,
  },
  supportedLanguages: [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  ],
  dateFormats: {
    en: {
      short: 'MM/dd/yyyy',
      long: 'MMMM d, yyyy',
      dateTime: 'MM/dd/yyyy HH:mm',
    },
    ru: {
      short: 'dd.MM.yyyy',
      long: 'd MMMM yyyy г.',
      dateTime: 'dd.MM.yyyy HH:mm',
    },
  },
  numberFormats: {
    en: {
      decimal: '.',
      thousands: ',',
    },
    ru: {
      decimal: ',',
      thousands: ' ',
    },
  },
} as const;

export type SupportedLanguage =
  (typeof I18N_CONFIG.supportedLanguages)[number]['code'];
