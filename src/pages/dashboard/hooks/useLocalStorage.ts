import { useCallback } from 'react';
import type { Section, GlobalBackground, ViewportAuthStyles } from '../types';
import { STORAGE_KEY, DEFAULT_GLOBAL_BG, DEFAULT_AUTH_STYLES } from '../constants';

export interface LandingData {
  sections: Section[];
  authStyles: ViewportAuthStyles;
  globalBG: GlobalBackground;
}

export function useLocalStorage() {
  const load = useCallback((): LandingData => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        sections: parsed.sections || [],
        authStyles: parsed.authStyles || DEFAULT_AUTH_STYLES,
        globalBG: parsed.globalBG || DEFAULT_GLOBAL_BG,
      };
    }
    return {
      sections: [],
      authStyles: DEFAULT_AUTH_STYLES,
      globalBG: DEFAULT_GLOBAL_BG,
    };
  }, []);

  const save = useCallback((data: LandingData): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  return { load, save };
}
