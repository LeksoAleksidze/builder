import { useCallback } from 'react';
import type {
  Popup,
  PopupChildElement,
  Viewport,
  Language,
  LocalizedContent,
} from '../types';
import {
  DEFAULT_POPUP_STYLES,
  DEFAULT_CLOSE_BUTTON_STYLES,
  DEFAULT_TEXT_ELEMENT_STYLES,
  DEFAULT_IMAGE_ELEMENT_STYLES,
  DEFAULT_LOCALIZED_CONTENT,
  LANGUAGES,
} from '../constants';

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
      children: [],
      closeButton: {
        useImage: false,
        image: { ...DEFAULT_LOCALIZED_CONTENT },
        styles: {
          WEB: { ...DEFAULT_CLOSE_BUTTON_STYLES.WEB },
          MOB: { ...DEFAULT_CLOSE_BUTTON_STYLES.MOB },
        },
      },
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

  // Update popup title
  const updatePopupTitle = useCallback(
    (popupId: number, title: string) => {
      setPopups((prev) => prev.map((p) => (p.id === popupId ? { ...p, title } : p)));
    },
    [setPopups]
  );

  // Toggle popup sameForAllLangs
  const setPopupSameForAllLangs = useCallback(
    (popupId: number, value: boolean) => {
      setPopups((prev) =>
        prev.map((p) => {
          if (p.id !== popupId) return p;
          // Sync all children content
          const newChildren = p.children.map((child) => {
            if (value) {
              const currentContent = child.content[activeLang] || '';
              const newContent = LANGUAGES.reduce(
                (acc, lang) => ({ ...acc, [lang]: currentContent }),
                {} as LocalizedContent
              );
              return { ...child, content: newContent, sameForAllLangs: value };
            }
            return { ...child, sameForAllLangs: value };
          });
          return { ...p, sameForAllLangs: value, children: newChildren };
        })
      );
    },
    [activeLang, setPopups]
  );

  // Add element to popup (text or image)
  const addPopupElement = useCallback(
    (popupId: number, type: 'text' | 'image') => {
      const newElement: PopupChildElement =
        type === 'text'
          ? {
              id: Date.now(),
              type: 'text',
              content: { ...DEFAULT_LOCALIZED_CONTENT, GE: 'ტექსტი', EN: 'Text', RU: 'Текст', TR: 'Metin' },
              styles: {
                WEB: { ...DEFAULT_TEXT_ELEMENT_STYLES.WEB, x: 20, y: 20 },
                MOB: { ...DEFAULT_TEXT_ELEMENT_STYLES.MOB, x: 10, y: 10 },
              },
            }
          : {
              id: Date.now(),
              type: 'image',
              content: { ...DEFAULT_LOCALIZED_CONTENT },
              styles: {
                WEB: { ...DEFAULT_IMAGE_ELEMENT_STYLES.WEB, x: 20, y: 20, width: 150, height: 150 },
                MOB: { ...DEFAULT_IMAGE_ELEMENT_STYLES.MOB, x: 10, y: 10, width: 100, height: 100 },
              },
            };

      setPopups((prev) =>
        prev.map((p) => (p.id === popupId ? { ...p, children: [...p.children, newElement] } : p))
      );
    },
    [setPopups]
  );

  // Delete popup element
  const deletePopupElement = useCallback(
    (popupId: number, elementId: number) => {
      setPopups((prev) =>
        prev.map((p) =>
          p.id === popupId ? { ...p, children: p.children.filter((c) => c.id !== elementId) } : p
        )
      );
    },
    [setPopups]
  );

  // Update popup element style
  const updatePopupElementStyle = useCallback(
    (popupId: number, elementId: number, field: string, value: unknown) => {
      setPopups((prev) =>
        prev.map((p) => {
          if (p.id !== popupId) return p;
          return {
            ...p,
            children: p.children.map((child) => {
              if (child.id !== elementId) return child;
              return {
                ...child,
                styles: {
                  ...child.styles,
                  [activeView]: { ...child.styles[activeView], [field]: value },
                },
              } as PopupChildElement;
            }),
          };
        })
      );
    },
    [activeView, setPopups]
  );

  // Update popup element styles (bulk)
  const updatePopupElementStyles = useCallback(
    (popupId: number, elementId: number, styles: PopupChildElement['styles']) => {
      setPopups((prev) =>
        prev.map((p) => {
          if (p.id !== popupId) return p;
          return {
            ...p,
            children: p.children.map((child) => {
              if (child.id !== elementId) return child;
              return { ...child, styles } as PopupChildElement;
            }),
          };
        })
      );
    },
    [setPopups]
  );

  // Update popup element content
  const updatePopupElementContent = useCallback(
    (popupId: number, elementId: number, content: string, targetLang?: Language) => {
      setPopups((prev) =>
        prev.map((p) => {
          if (p.id !== popupId) return p;
          return {
            ...p,
            children: p.children.map((child) => {
              if (child.id !== elementId) return child;
              const langToUpdate = targetLang || activeLang;
              const newContent: LocalizedContent =
                child.sameForAllLangs || p.sameForAllLangs
                  ? LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: content }), {} as LocalizedContent)
                  : { ...child.content, [langToUpdate]: content };
              return { ...child, content: newContent } as PopupChildElement;
            }),
          };
        })
      );
    },
    [activeLang, setPopups]
  );

  // Update close button style
  const updateCloseButtonStyle = useCallback(
    (popupId: number, field: string, value: unknown) => {
      setPopups((prev) =>
        prev.map((p) => {
          if (p.id !== popupId) return p;
          return {
            ...p,
            closeButton: {
              ...p.closeButton,
              styles: {
                ...p.closeButton.styles,
                [activeView]: { ...p.closeButton.styles[activeView], [field]: value },
              },
            },
          };
        })
      );
    },
    [activeView, setPopups]
  );

  // Set close button use image
  const setCloseButtonUseImage = useCallback(
    (popupId: number, useImage: boolean) => {
      setPopups((prev) =>
        prev.map((p) => {
          if (p.id !== popupId) return p;
          return {
            ...p,
            closeButton: { ...p.closeButton, useImage },
          };
        })
      );
    },
    [setPopups]
  );

  // Update close button image
  const updateCloseButtonImage = useCallback(
    (popupId: number, imageData: string, targetLang?: Language) => {
      setPopups((prev) =>
        prev.map((p) => {
          if (p.id !== popupId) return p;
          const langToUpdate = targetLang || activeLang;
          const newImage: LocalizedContent = p.sameForAllLangs
            ? LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: imageData }), {} as LocalizedContent)
            : { ...p.closeButton.image, [langToUpdate]: imageData };
          return {
            ...p,
            closeButton: { ...p.closeButton, image: newImage },
          };
        })
      );
    },
    [activeLang, setPopups]
  );

  return {
    addPopup,
    deletePopup,
    updatePopupStyle,
    updatePopupTitle,
    setPopupSameForAllLangs,
    addPopupElement,
    deletePopupElement,
    updatePopupElementStyle,
    updatePopupElementStyles,
    updatePopupElementContent,
    updateCloseButtonStyle,
    setCloseButtonUseImage,
    updateCloseButtonImage,
  };
}
