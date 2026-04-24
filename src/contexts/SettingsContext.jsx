import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'journalKeeperSettings';

const defaultSettings = {
  theme: 'system',
  accent: 'purple',
  fontSize: 'medium',
  compactLayout: false,
  showPreviews: true,
};

const themePalettes = {
  light: {
    '--bg': '#ffffff',
    '--surface': '#f8f9ff',
    '--surface-alt': '#e7e7f1',
    '--text': '#4d4b61',
    '--text-h': '#08060d',
    '--border': '#e5e4e7',
    '--code-bg': '#f4f3ec',
    '--shadow': 'rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px',
  },
  dark: {
    '--bg': '#16171d',
    '--surface': '#1f2028',
    '--surface-alt': '#262732',
    '--text': '#c8cad5',
    '--text-h': '#f3f4f6',
    '--border': '#2e303a',
    '--code-bg': '#1f2028',
    '--shadow': 'rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px',
  },
};

const accentPalettes = {
  purple: {
    '--accent': '#aa3bff',
    '--accent-bg': 'rgba(170, 59, 255, 0.1)',
    '--accent-border': 'rgba(170, 59, 255, 0.5)',
  },
  teal: {
    '--accent': '#20c997',
    '--accent-bg': 'rgba(32, 201, 151, 0.12)',
    '--accent-border': 'rgba(32, 201, 151, 0.45)',
  },
  orange: {
    '--accent': '#ff8c42',
    '--accent-bg': 'rgba(255, 140, 66, 0.12)',
    '--accent-border': 'rgba(255, 140, 66, 0.45)',
  },
};

const fontSizes = {
  small: '15px',
  medium: '18px',
  large: '20px',
};

const SettingsContext = createContext({
  settings: defaultSettings,
  updateSetting: () => {},
  resetSettings: () => {},
});

const getSystemTheme = () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const applySettings = (settings) => {
  const root = document.documentElement;

  const activeTheme = settings.theme === 'system' ? getSystemTheme() : settings.theme;
  const themeValues = themePalettes[activeTheme] || themePalettes.light;

  Object.entries(themeValues).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });

  const accentValues = accentPalettes[settings.accent] || accentPalettes.purple;
  Object.entries(accentValues).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });

  const fontSizeValue = fontSizes[settings.fontSize] || fontSizes.medium;
  root.style.setProperty('--base-font-size', fontSizeValue);
  root.style.setProperty('--content-gap', settings.compactLayout ? '0.8rem' : '1.5rem');
  root.style.setProperty('--card-padding', settings.compactLayout ? '1rem' : '1.5rem');
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (err) {
      console.warn('Unable to load settings from localStorage:', err);
    }
  }, []);

  useEffect(() => {
    try {
      applySettings(settings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error('Unable to apply settings:', err);
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
