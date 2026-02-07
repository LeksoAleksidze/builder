import { useState, useEffect, useCallback } from 'react';
import type {
  Section,
  GlobalBackground,
  ViewportBGColor,
  ViewportAuthStyles,
  Viewport,
  Language,
  Popup,
  HeaderText,
  HeaderTextStyle,
  EndpointsConfig,
  AuthVisibility,
  AuthTexts,
} from '../types';
import { DEFAULT_GLOBAL_BG, DEFAULT_GLOBAL_BG_COLOR, DEFAULT_AUTH_STYLES, DEFAULT_HEADER_TEXT, DEFAULT_ENDPOINTS_CONFIG, DEFAULT_AUTH_TEXTS, LANGUAGES } from '../constants';
import { useSections } from './useSections';
import { useElements } from './useElements';
import { usePopups } from './usePopups';
import { useGitHub } from './useGitHub';

export type BackgroundMode = 'cover' | 'contain' | 'natural';

export function useLandingData() {
  const [activeLang, setActiveLang] = useState<Language>('GE');
  const [activeView, setActiveView] = useState<Viewport>('WEB');
  const [isPreview, setIsPreview] = useState(false);
  const [globalBG, setGlobalBG] = useState<GlobalBackground>(DEFAULT_GLOBAL_BG);
  const [globalBGColor, setGlobalBGColor] = useState<ViewportBGColor>(DEFAULT_GLOBAL_BG_COLOR);
  const [sameBackgroundForAllLangs, setSameBackgroundForAllLangs] = useState(true);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('cover');
  const [authStyles, setAuthStyles] = useState<ViewportAuthStyles>(DEFAULT_AUTH_STYLES);
  const [sections, setSections] = useState<Section[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [headerText, setHeaderText] = useState<HeaderText>({ ...DEFAULT_HEADER_TEXT, content: { ...DEFAULT_HEADER_TEXT.content }, styles: { WEB: { ...DEFAULT_HEADER_TEXT.styles.WEB }, MOB: { ...DEFAULT_HEADER_TEXT.styles.MOB } } });
  const [endpoints, setEndpoints] = useState<EndpointsConfig>({ ...DEFAULT_ENDPOINTS_CONFIG });
  const [authBlockVisibility, setAuthBlockVisibility] = useState<AuthVisibility>('non-auth');
  const [authTexts, setAuthTexts] = useState<AuthTexts>({ ...DEFAULT_AUTH_TEXTS });
  const [activePopupId, setActivePopupId] = useState<number | null>(null);
  const [popupTriggerSectionId, setPopupTriggerSectionId] = useState<number | null>(null);
  const [editingPopupId, setEditingPopupId] = useState<number | null>(null);

  const gitHub = useGitHub();

  useEffect(() => {
    if (!gitHub.isConfigured) return;

    let cancelled = false;
    gitHub.loadConfig().then((data) => {
      if (cancelled || !data) return;
      setSections(data.sections || []);
      setAuthStyles(data.authStyles || DEFAULT_AUTH_STYLES);
      setGlobalBG(data.globalBG || DEFAULT_GLOBAL_BG);
      setGlobalBGColor(data.globalBGColor || DEFAULT_GLOBAL_BG_COLOR);
      setSameBackgroundForAllLangs(data.sameBackgroundForAllLangs ?? true);
      setBackgroundMode(data.backgroundMode || 'cover');
      setPopups(data.popups || []);
      setHeaderText(data.headerText || { ...DEFAULT_HEADER_TEXT, content: { ...DEFAULT_HEADER_TEXT.content }, styles: { WEB: { ...DEFAULT_HEADER_TEXT.styles.WEB }, MOB: { ...DEFAULT_HEADER_TEXT.styles.MOB } } });
      setEndpoints(data.endpoints || { ...DEFAULT_ENDPOINTS_CONFIG });
      setAuthBlockVisibility(data.authBlockVisibility || 'non-auth');
      setAuthTexts(data.authTexts || { ...DEFAULT_AUTH_TEXTS });
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gitHub.isConfigured]);

  const saveAllConfig = useCallback(() => {
    const data = { sections, authStyles, globalBG, globalBGColor, sameBackgroundForAllLangs, backgroundMode, popups, headerText, endpoints, authBlockVisibility, authTexts };
    if (gitHub.isConfigured) {
      gitHub.publish(data);
    } else {
      alert('Please configure GitHub settings first.');
    }
  }, [gitHub, sections, authStyles, globalBG, globalBGColor, sameBackgroundForAllLangs, backgroundMode, popups, headerText, endpoints, authBlockVisibility, authTexts]);

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

  const openPopup = useCallback((popupId: number, sectionId?: number) => {
    setPopupTriggerSectionId(sectionId ?? null);
    setActivePopupId(popupId);
  }, []);

  const closePopup = useCallback(() => {
    setActivePopupId(null);
    setPopupTriggerSectionId(null);
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

  const updateHeaderTextContent = useCallback(
    (value: string) => {
      setHeaderText((prev) => {
        const newContent = { ...prev.content };
        if (prev.sameForAllLangs) {
          LANGUAGES.forEach((lang) => {
            newContent[lang] = value;
          });
        } else {
          newContent[activeLang] = value;
        }
        return { ...prev, content: newContent };
      });
    },
    [activeLang]
  );

  const updateHeaderTextStyle = useCallback(
    <K extends keyof HeaderTextStyle>(field: K, value: HeaderTextStyle[K]) => {
      setHeaderText((prev) => ({
        ...prev,
        styles: {
          ...prev.styles,
          [activeView]: { ...prev.styles[activeView], [field]: value },
        },
      }));
    },
    [activeView]
  );

  const setHeaderTextSameForAllLangs = useCallback(
    (value: boolean) => {
      setHeaderText((prev) => {
        const updated = { ...prev, sameForAllLangs: value };
        if (value) {
          // Sync current language content to all languages
          const currentContent = prev.content[activeLang];
          const newContent = { ...prev.content };
          LANGUAGES.forEach((lang) => {
            newContent[lang] = currentContent;
          });
          updated.content = newContent;
        }
        return updated;
      });
    },
    [activeLang]
  );

  const updateEndpoints = useCallback(
    <K extends keyof EndpointsConfig>(field: K, value: EndpointsConfig[K]) => {
      setEndpoints((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateAuthText = useCallback(
    (field: keyof AuthTexts, lang: Language, value: string) => {
      setAuthTexts((prev) => ({
        ...prev,
        [field]: { ...prev[field], [lang]: value },
      }));
    },
    []
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
    backgroundMode,
    authStyles,
    sections,
    popups,
    activePopupId,
    popupTriggerSectionId,
    editingPopupId,
    headerText,
    endpoints,
    authBlockVisibility,
    authTexts,

    // State setters
    setActiveLang,
    setActiveView,
    setIsPreview,
    setGlobalBG,
    setGlobalBGColor,
    setSameBackgroundForAllLangs: setSameBackgroundForAllLangsWithSync,
    setBackgroundMode,
    setAuthStyles,
    setSections,
    setPopups,
    setEditingPopupId,
    setHeaderText,
    setEndpoints,
    setAuthBlockVisibility,
    setAuthTexts,

    // GitHub
    gitHub,

    // Actions
    saveAllConfig,
    updateGlobalBG,
    updateGlobalBGColor,
    clearGlobalBG,
    updateAuthStyle,
    updateEndpoints,
    updateAuthText,
    updateHeaderTextContent,
    updateHeaderTextStyle,
    setHeaderTextSameForAllLangs,
    openPopup,
    closePopup,
    ...sectionActions,
    ...elementActions,
    ...popupActions,
  };
}

export type LandingDataContextType = ReturnType<typeof useLandingData>;
