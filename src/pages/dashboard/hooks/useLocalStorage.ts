import { useCallback } from 'react';
import type { Section, GlobalBackground, ViewportAuthStyles, ViewportBGColor, Popup } from '../types';
import {
  STORAGE_KEY,
  DEFAULT_GLOBAL_BG,
  DEFAULT_GLOBAL_BG_COLOR,
  DEFAULT_AUTH_STYLES,
  DEFAULT_CLOSE_BUTTON_STYLES,
  DEFAULT_LOCALIZED_CONTENT,
} from '../constants';

export interface LandingData {
  sections: Section[];
  authStyles: ViewportAuthStyles;
  globalBG: GlobalBackground;
  globalBGColor: ViewportBGColor;
  sameBackgroundForAllLangs: boolean;
  popups: Popup[];
}

// Migrate old popup structure to new structure with children and closeButton
function migratePopups(popups: unknown[]): Popup[] {
  if (!popups || !Array.isArray(popups)) return [];

  return popups.map((p: unknown) => {
    const popup = p as Record<string, unknown>;

    // If already has children array, it's new structure
    if (Array.isArray(popup.children)) {
      // Ensure closeButton exists
      if (!popup.closeButton) {
        return {
          id: popup.id,
          title: popup.title,
          children: popup.children,
          styles: popup.styles,
          sameForAllLangs: popup.sameForAllLangs,
          closeButton: {
            useImage: false,
            image: { ...DEFAULT_LOCALIZED_CONTENT },
            styles: {
              WEB: { ...DEFAULT_CLOSE_BUTTON_STYLES.WEB },
              MOB: { ...DEFAULT_CLOSE_BUTTON_STYLES.MOB },
            },
          },
        } as unknown as Popup;
      }
      return popup as unknown as Popup;
    }

    // Migrate old structure to new structure
    return {
      id: popup.id as number,
      title: (popup.title as string) || 'Popup',
      children: [], // Start fresh with empty children
      closeButton: {
        useImage: false,
        image: { ...DEFAULT_LOCALIZED_CONTENT },
        styles: {
          WEB: { ...DEFAULT_CLOSE_BUTTON_STYLES.WEB },
          MOB: { ...DEFAULT_CLOSE_BUTTON_STYLES.MOB },
        },
      },
      styles: popup.styles,
      sameForAllLangs: popup.sameForAllLangs,
    } as unknown as Popup;
  });
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
        popups: migratePopups(parsed.popups),
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
