import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

export interface Colors {
  bg: string;
  surface: string;
  surface2: string;
  line: string;
  ink: string;
  muted: string;
  primary: string;
  onPrimary: string;
  soft: string;
  accent: string;
  danger: string;
  scrim: string;
}

export const LIGHT: Colors = {
  bg: '#F5F6FA',
  surface: '#FFFFFF',
  surface2: '#EEF0F6',
  line: '#E4E7EF',
  ink: '#0F172A',
  muted: '#5B6478',
  primary: '#0E7C7B',
  onPrimary: '#FFFFFF',
  soft: '#DDF1EF',
  accent: '#F59E0B',
  danger: '#C62F3E',
  scrim: 'rgba(15,23,42,0.4)',
};

export const DARK: Colors = {
  bg: '#0B1220',
  surface: '#141C2E',
  surface2: '#1C2640',
  line: '#26314D',
  ink: '#F1F5F9',
  muted: '#9DA9C0',
  primary: '#2DD4BF',
  onPrimary: '#04201D',
  soft: '#12363A',
  accent: '#FBBF24',
  danger: '#FF8A94',
  scrim: 'rgba(0,0,0,0.6)',
};

export type ThemePref = 'system' | 'light' | 'dark';
const KEY = 'mb.theme';

interface Ctx {
  colors: Colors;
  isDark: boolean;
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
}

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState<ThemePref>('system');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark' || v === 'system') setPrefState(v);
      })
      .catch(() => {});
  }, []);

  const value = useMemo<Ctx>(() => {
    const isDark = pref === 'system' ? system === 'dark' : pref === 'dark';
    return {
      colors: isDark ? DARK : LIGHT,
      isDark,
      pref,
      setPref: (p) => {
        setPrefState(p);
        AsyncStorage.setItem(KEY, p).catch(() => {});
      },
    };
  }, [pref, system]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): Ctx {
  const v = useContext(ThemeCtx);
  if (!v) throw new Error('useTheme outside ThemeProvider');
  return v;
}
