import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  TranslationResources,
  I18N_CONFIG,
  SupportedLanguage,
} from '../config/i18n';

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translations: TranslationResources;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (date: Date, format?: 'short' | 'long' | 'dateTime') => string;
  formatNumber: (num: number) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(
      I18N_CONFIG.storageKey,
    ) as SupportedLanguage;
    if (saved && I18N_CONFIG.resources[saved]) {
      return saved;
    }

    const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
    return I18N_CONFIG.resources[browserLang]
      ? browserLang
      : I18N_CONFIG.defaultLanguage;
  });

  const translations = I18N_CONFIG.resources[language];

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(I18N_CONFIG.storageKey, lang);
    document.documentElement.lang = lang;
  };

  // Функция перевода с поддержкой интерполяции
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== 'string') {
      console.warn(
        `Translation key "${key}" not found for language "${language}"`,
      );
      return key;
    }

    if (params) {
      return value.replace(
        /\{\{(\w+)\}\}/g,
        (match: string, paramKey: string) => {
          return params[paramKey]?.toString() || match;
        },
      );
    }

    return value;
  };

  const formatDate = (
    date: Date,
    format: 'short' | 'long' | 'dateTime' = 'short',
  ): string => {
    const formatString = I18N_CONFIG.dateFormats[language][format];
    return new Intl.DateTimeFormat(language, {
      year: 'numeric',
      month: format === 'long' ? 'long' : '2-digit',
      day: '2-digit',
      hour: format === 'dateTime' ? '2-digit' : undefined,
      minute: format === 'dateTime' ? '2-digit' : undefined,
    }).format(date);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(language).format(num);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        translations,
        t,
        formatDate,
        formatNumber,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
