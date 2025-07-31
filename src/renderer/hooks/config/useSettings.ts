import { useLocalStorage } from './useLocalStorage';
import { APP_CONFIG } from '../../config/app';

interface UserSettings {
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    email: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
    usageData: boolean;
  };
  interface: {
    compactMode: boolean;
    showTooltips: boolean;
    animationsEnabled: boolean;
    sidebarCollapsed: boolean;
  };
  editor: {
    fontSize: number;
    tabSize: number;
    wordWrap: boolean;
    lineNumbers: boolean;
    minimap: boolean;
  };
}

const defaultSettings: UserSettings = {
  notifications: {
    enabled: true,
    sound: true,
    desktop: true,
    email: false,
  },
  privacy: {
    analytics: false,
    crashReports: true,
    usageData: false,
  },
  interface: {
    compactMode: false,
    showTooltips: true,
    animationsEnabled: true,
    sidebarCollapsed: false,
  },
  editor: {
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    lineNumbers: true,
    minimap: true,
  },
};

export const useSettings = () => {
  const [settings, setSettings, resetSettings] = useLocalStorage(
    APP_CONFIG.storage.keys.preferences,
    defaultSettings,
  );

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
      notifications: { ...prev.notifications, ...updates.notifications },
      privacy: { ...prev.privacy, ...updates.privacy },
      interface: { ...prev.interface, ...updates.interface },
      editor: { ...prev.editor, ...updates.editor },
    }));
  };

  const resetToDefaults = () => {
    resetSettings();
  };

  return {
    settings,
    updateSettings,
    resetToDefaults,
  };
};
