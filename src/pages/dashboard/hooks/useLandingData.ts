import { useState, useEffect, useCallback } from 'react';
import type {
  Section,
  GlobalBackground,
  ViewportAuthStyles,
  Viewport,
  Language,
} from '../types';
import { DEFAULT_GLOBAL_BG, DEFAULT_AUTH_STYLES } from '../constants';
import { useLocalStorage } from './useLocalStorage';
import { useSections } from './useSections';
import { useElements } from './useElements';

export function useLandingData() {
  const [activeLang, setActiveLang] = useState<Language>('GE');
  const [activeView, setActiveView] = useState<Viewport>('WEB');
  const [isPreview, setIsPreview] = useState(false);
  const [globalBG, setGlobalBG] = useState<GlobalBackground>(DEFAULT_GLOBAL_BG);
  const [authStyles, setAuthStyles] = useState<ViewportAuthStyles>(DEFAULT_AUTH_STYLES);
  const [sections, setSections] = useState<Section[]>([]);

  const { load, save } = useLocalStorage();

  useEffect(() => {
    const data = load();
    setSections(data.sections);
    setAuthStyles(data.authStyles);
    setGlobalBG(data.globalBG);
  }, [load]);

  const saveAllConfig = useCallback(() => {
    save({ sections, authStyles, globalBG });
    alert('Configuration saved!');
  }, [save, sections, authStyles, globalBG]);

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

  const updateGlobalBG = useCallback(
    (imageData: string) => {
      setGlobalBG((prev) => ({
        ...prev,
        [activeLang]: {
          ...prev[activeLang],
          [activeView.toLowerCase()]: imageData,
        },
      }));
    },
    [activeLang, activeView]
  );

  const clearGlobalBG = useCallback(() => {
    setGlobalBG((prev) => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        [activeView.toLowerCase()]: '',
      },
    }));
  }, [activeLang, activeView]);

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

  return {
    // State
    activeLang,
    activeView,
    isPreview,
    globalBG,
    authStyles,
    sections,

    // State setters
    setActiveLang,
    setActiveView,
    setIsPreview,
    setGlobalBG,
    setAuthStyles,
    setSections,

    // Actions
    saveAllConfig,
    updateGlobalBG,
    clearGlobalBG,
    updateAuthStyle,
    ...sectionActions,
    ...elementActions,
  };
}

export type LandingDataContextType = ReturnType<typeof useLandingData>;
