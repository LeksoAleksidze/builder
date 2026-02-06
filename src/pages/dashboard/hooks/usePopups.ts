import { useCallback } from 'react';
import type { Popup, Viewport, Language, LocalizedContent } from '../types';
import { DEFAULT_POPUP_STYLES, DEFAULT_LOCALIZED_CONTENT, LANGUAGES } from '../constants';

interface UsePopupsProps {
  setPopups: React.Dispatch<React.SetStateAction<Popup[]>>;
  activeView: Viewport;
  activeLang: Language;
}

export function usePopups({ setPopups, activeView, activeLang }: UsePopupsProps) {
  // Add a new popup
  const addPopup = useCallback(() => {
    const newPopup: Popup = {
      id: Date.now(),
      title: `Popup ${Date.now() % 1000}`,
      content: { ...DEFAULT_LOCALIZED_CONTENT },
      image: { ...DEFAULT_LOCALIZED_CONTENT },
      useImage: false,
      styles: {
        WEB: { ...DEFAULT_POPUP_STYLES.WEB },
        MOB: { ...DEFAULT_POPUP_STYLES.MOB },
      },
    };

    setPopups((prev) => [...prev, newPopup]);
  }, [setPopups]);

  // Delete a popup
  const deletePopup = useCallback(
    (popupId: number) => {
      setPopups((prev) => prev.filter((p) => p.id !== popupId));
    },
    [setPopups]
  );

  // Update popup style
  const updatePopupStyle = useCallback(
    (popupId: number, field: string, value: unknown) => {
      setPopups((prev) =>
        prev.map((p) =>
          p.id === popupId
            ? {
                ...p,
                styles: {
                  ...p.styles,
                  [activeView]: { ...p.styles[activeView], [field]: value },
                },
              }
            : p
        )
      );
    },
    [activeView, setPopups]
  );

  // Update popup content (text)
  const updatePopupContent = useCallback(
    (popupId: number, content: string, targetLang?: Language) => {
      setPopups((prev) =>
        prev.map((p) => {
          if (p.id !== popupId) return p;
          const langToUpdate = targetLang || activeLang;
          const newContent: LocalizedContent = p.sameForAllLangs
            ? LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: content }), {} as LocalizedContent)
            : { ...p.content, [langToUpdate]: content };
          return { ...p, content: newContent };
        })
      );
    },
    [activeLang, setPopups]
  );

  // Update popup image
  const updatePopupImage = useCallback(
    (popupId: number, imageData: string, targetLang?: Language) => {
      setPopups((prev) =>
        prev.map((p) => {
          if (p.id !== popupId) return p;
          const langToUpdate = targetLang || activeLang;
          const newImage: LocalizedContent = p.sameForAllLangs
            ? LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: imageData }), {} as LocalizedContent)
            : { ...p.image, [langToUpdate]: imageData };
          return { ...p, image: newImage };
        })
      );
    },
    [activeLang, setPopups]
  );

  // Update popup title
  const updatePopupTitle = useCallback(
    (popupId: number, title: string) => {
      setPopups((prev) => prev.map((p) => (p.id === popupId ? { ...p, title } : p)));
    },
    [setPopups]
  );

  // Toggle popup useImage
  const setPopupUseImage = useCallback(
    (popupId: number, useImage: boolean) => {
      setPopups((prev) => prev.map((p) => (p.id === popupId ? { ...p, useImage } : p)));
    },
    [setPopups]
  );

  // Toggle popup sameForAllLangs
  const setPopupSameForAllLangs = useCallback(
    (popupId: number, value: boolean) => {
      setPopups((prev) =>
        prev.map((p) => {
          if (p.id !== popupId) return p;
          let newContent = p.content;
          let newImage = p.image;
          if (value) {
            const currentContent = p.content[activeLang] || '';
            const currentImage = p.image[activeLang] || '';
            newContent = LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: currentContent }), {} as LocalizedContent);
            newImage = LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: currentImage }), {} as LocalizedContent);
          }
          return { ...p, sameForAllLangs: value, content: newContent, image: newImage };
        })
      );
    },
    [activeLang, setPopups]
  );

  return {
    addPopup,
    deletePopup,
    updatePopupStyle,
    updatePopupContent,
    updatePopupImage,
    updatePopupTitle,
    setPopupUseImage,
    setPopupSameForAllLangs,
  };
}
