import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildTheme, lightTheme, Theme, ThemeMode, TextScale, PaletteChoice, RadiusStyle, Density } from './theme';
import { FontChoice } from './typography';

const STORAGE_KEY = 'otter-companion/theme-settings';

export type ThemeModePreference = ThemeMode | 'system';

interface StoredThemeSettings {
  preference: ThemeModePreference;
  textScale: TextScale;
  paletteChoice: PaletteChoice;
  fontChoice: FontChoice;
  radiusStyle: RadiusStyle;
  density: Density;
}

const DEFAULT_SETTINGS: StoredThemeSettings = {
  preference: 'system',
  textScale: 'default',
  paletteChoice: 'sunset',
  fontChoice: 'plusJakarta',
  radiusStyle: 'rounded',
  density: 'cozy',
};

interface ThemeSettingsContextValue {
  preference: ThemeModePreference;
  resolvedMode: ThemeMode;
  setPreference: (preference: ThemeModePreference) => void;
  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;
  paletteChoice: PaletteChoice;
  setPaletteChoice: (choice: PaletteChoice) => void;
  fontChoice: FontChoice;
  setFontChoice: (choice: FontChoice) => void;
  radiusStyle: RadiusStyle;
  setRadiusStyle: (style: RadiusStyle) => void;
  density: Density;
  setDensity: (density: Density) => void;
}

const ThemeContext = createContext<Theme>(lightTheme);
const ThemeSettingsContext = createContext<ThemeSettingsContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [settings, setSettings] = useState<StoredThemeSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<StoredThemeSettings>) });
      } catch {
        // ignore malformed local cache
      }
    });
  }, []);

  function persist(next: StoredThemeSettings) {
    setSettings(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }

  const resolvedMode: ThemeMode = settings.preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : settings.preference;

  const theme = useMemo(
    () => buildTheme({ ...settings, mode: resolvedMode }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedMode, settings.textScale, settings.paletteChoice, settings.fontChoice, settings.radiusStyle, settings.density]
  );

  const settingsValue = useMemo<ThemeSettingsContextValue>(
    () => ({
      preference: settings.preference,
      resolvedMode,
      setPreference: (preference) => persist({ ...settings, preference }),
      textScale: settings.textScale,
      setTextScale: (textScale) => persist({ ...settings, textScale }),
      paletteChoice: settings.paletteChoice,
      setPaletteChoice: (paletteChoice) => persist({ ...settings, paletteChoice }),
      fontChoice: settings.fontChoice,
      setFontChoice: (fontChoice) => persist({ ...settings, fontChoice }),
      radiusStyle: settings.radiusStyle,
      setRadiusStyle: (radiusStyle) => persist({ ...settings, radiusStyle }),
      density: settings.density,
      setDensity: (density) => persist({ ...settings, density }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, resolvedMode]
  );

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeSettingsContext.Provider value={settingsValue}>{children}</ThemeSettingsContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export function useThemeSettings(): ThemeSettingsContextValue {
  const ctx = useContext(ThemeSettingsContext);
  if (!ctx) throw new Error('useThemeSettings must be used within ThemeProvider');
  return ctx;
}
