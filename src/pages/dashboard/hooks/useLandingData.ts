import { useState, useEffect, useCallback } from 'react';
import type {
  Section,
  GlobalBackground,
  ViewportBGColor,
  ViewportAuthStyles,
  Viewport,
  Language,
  Popup,
} from '../types';
import { DEFAULT_GLOBAL_BG, DEFAULT_GLOBAL_BG_COLOR, DEFAULT_AUTH_STYLES, LANGUAGES } from '../constants';
import { useLocalStorage } from './useLocalStorage';
import { useSections } from './useSections';
import { useElements } from './useElements';
import { usePopups } from './usePopups';

export function useLandingData() {
  const [activeLang, setActiveLang] = useState<Language>('GE');
  const [activeView, setActiveView] = useState<Viewport>('WEB');
  const [isPreview, setIsPreview] = useState(false);
  const [globalBG, setGlobalBG] = useState<GlobalBackground>(DEFAULT_GLOBAL_BG);
  const [globalBGColor, setGlobalBGColor] = useState<ViewportBGColor>(DEFAULT_GLOBAL_BG_COLOR);
  const [sameBackgroundForAllLangs, setSameBackgroundForAllLangs] = useState(true);
  const [authStyles, setAuthStyles] = useState<ViewportAuthStyles>(DEFAULT_AUTH_STYLES);
  const [sections, setSections] = useState<Section[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [activePopupId, setActivePopupId] = useState<number | null>(null);
  const [editingPopupId, setEditingPopupId] = useState<number | null>(null);

  const { load, save } = useLocalStorage();

  useEffect(() => {
    const data = load();
    setSections(data.sections);
    setAuthStyles(data.authStyles);
    setGlobalBG(data.globalBG);
    setGlobalBGColor(data.globalBGColor);
    setSameBackgroundForAllLangs(data.sameBackgroundForAllLangs ?? true);
    setPopups(data.popups || []);
  }, [load]);

  const saveAllConfig = useCallback(() => {
    save({ sections, authStyles, globalBG, globalBGColor, sameBackgroundForAllLangs, popups });
    alert('Configuration saved!');
  }, [save, sections, authStyles, globalBG, globalBGColor, sameBackgroundForAllLangs, popups]);

  const sectionActions = useSections({
    sections,
    setSections,
    activeView,
  });

  const elementActions = useElements({
    setSections,
    activeView,
    activeLang,
  });

  const popupActions = usePopups({
    setPopups,
    activeView,
    activeLang,
  });

  const openPopup = useCallback((popupId: number) => {
    setActivePopupId(popupId);
  }, []);

  const closePopup = useCallback(() => {
    setActivePopupId(null);
  }, []);

  const updateGlobalBG = useCallback(
    (imageData: string) => {
      setGlobalBG((prev) => {
        if (sameBackgroundForAllLangs) {
          // Update all languages with the same background
          const viewKey = activeView.toLowerCase() as 'web' | 'mob';
          const updated: GlobalBackground = { ...prev };
          LANGUAGES.forEach((lang) => {
            updated[lang] = {
              ...updated[lang],
              [viewKey]: imageData,
            };
          });
          return updated;
        } else {
          // Update only current language
          return {
            ...prev,
            [activeLang]: {
              ...prev[activeLang],
              [activeView.toLowerCase()]: imageData,
            },
          };
        }
      });
    },
    [activeLang, activeView, sameBackgroundForAllLangs]
  );

  const clearGlobalBG = useCallback(() => {
    setGlobalBG((prev) => {
      if (sameBackgroundForAllLangs) {
        // Clear all languages
        const viewKey = activeView.toLowerCase() as 'web' | 'mob';
        const updated: GlobalBackground = { ...prev };
        LANGUAGES.forEach((lang) => {
          updated[lang] = {
            ...updated[lang],
            [viewKey]: '',
          };
        });
        return updated;
      } else {
        // Clear only current language
        return {
          ...prev,
          [activeLang]: {
            ...prev[activeLang],
            [activeView.toLowerCase()]: '',
          },
        };
      }
    });
  }, [activeLang, activeView, sameBackgroundForAllLangs]);

  const updateAuthStyle = useCallback(
    <K extends keyof ViewportAuthStyles['WEB']>(
      field: K,
      value: ViewportAuthStyles['WEB'][K]
    ) => {
      setAuthStyles((prev) => ({
        ...prev,
        [activeView]: { ...prev[activeView], [field]: value },
      }));
    },
    [activeView]
  );

  // Sync backgrounds when enabling "Same for all languages"
  const setSameBackgroundForAllLangsWithSync = useCallback(
    (value: boolean) => {
      setSameBackgroundForAllLangs(value);
      if (value) {
        // When enabling, sync current language's background to all languages
        setGlobalBG((prev) => {
          const currentBgWeb = prev[activeLang]?.web || '';
          const currentBgMob = prev[activeLang]?.mob || '';
          const updated: GlobalBackground = { ...prev };
          LANGUAGES.forEach((lang) => {
            updated[lang] = {
              web: currentBgWeb,
              mob: currentBgMob,
            };
          });
          return updated;
        });
      }
    },
    [activeLang]
  );

  const updateGlobalBGColor = useCallback(
    (color: string) => {
      setGlobalBGColor((prev) => ({
        ...prev,
        [activeView]: color,
      }));
    },
    [activeView]
  );

  return {
    // State
    activeLang,
    activeView,
    isPreview,
    globalBG,
    globalBGColor,
    sameBackgroundForAllLangs,
    authStyles,
    sections,
    popups,
    activePopupId,
    editingPopupId,

    // State setters
    setActiveLang,
    setActiveView,
    setIsPreview,
    setGlobalBG,
    setGlobalBGColor,
    setSameBackgroundForAllLangs: setSameBackgroundForAllLangsWithSync,
    setAuthStyles,
    setSections,
    setPopups,
    setEditingPopupId,

    // Actions
    saveAllConfig,
    updateGlobalBG,
    updateGlobalBGColor,
    clearGlobalBG,
    updateAuthStyle,
    openPopup,
    closePopup,
    ...sectionActions,
    ...elementActions,
    ...popupActions,
  };
}

export type LandingDataContextType = ReturnType<typeof useLandingData>;
