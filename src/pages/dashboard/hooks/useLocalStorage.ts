import { useCallback } from 'react';
import type { Section, GlobalBackground, ViewportAuthStyles, ViewportBGColor, Popup } from '../types';
import { STORAGE_KEY, DEFAULT_GLOBAL_BG, DEFAULT_GLOBAL_BG_COLOR, DEFAULT_AUTH_STYLES } from '../constants';

export interface LandingData {
  sections: Section[];
  authStyles: ViewportAuthStyles;
  globalBG: GlobalBackground;
  globalBGColor: ViewportBGColor;
  sameBackgroundForAllLangs: boolean;
  popups: Popup[];
}

export function useLocalStorage() {
  const load = useCallback((): LandingData => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);

      // Merge authStyles with defaults to ensure new properties have values
      const authStyles: ViewportAuthStyles = {
        WEB: { ...DEFAULT_AUTH_STYLES.WEB, ...(parsed.authStyles?.WEB || {}) },
        MOB: { ...DEFAULT_AUTH_STYLES.MOB, ...(parsed.authStyles?.MOB || {}) },
      };

      return {
        sections: parsed.sections || [],
        authStyles,
        globalBG: parsed.globalBG || DEFAULT_GLOBAL_BG,
        globalBGColor: { ...DEFAULT_GLOBAL_BG_COLOR, ...(parsed.globalBGColor || {}) },
        sameBackgroundForAllLangs: parsed.sameBackgroundForAllLangs ?? true,
        popups: parsed.popups || [],
      };
    }
    return {
      sections: [],
      authStyles: DEFAULT_AUTH_STYLES,
      globalBG: DEFAULT_GLOBAL_BG,
      globalBGColor: DEFAULT_GLOBAL_BG_COLOR,
      sameBackgroundForAllLangs: true,
      popups: [],
    };
  }, []);

  const save = useCallback((data: LandingData): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  return { load, save };
}
