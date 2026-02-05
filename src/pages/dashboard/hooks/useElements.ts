import { useCallback } from 'react';
import type {
  Section,
  Element,
  TextElement,
  ImageElement,
  Viewport,
  Language,
} from '../types';
import {
  DEFAULT_TEXT_ELEMENT_STYLES,
  DEFAULT_IMAGE_ELEMENT_STYLES,
  DEFAULT_LOCALIZED_CONTENT,
} from '../constants';

interface UseElementsProps {
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  activeView: Viewport;
  activeLang: Language;
}

export function useElements({ setSections, activeView, activeLang }: UseElementsProps) {
  const addElement = useCallback(
    (sectionId: number, type: 'text' | 'image') => {
      const newElement: Element =
        type === 'text'
          ? ({
              id: Date.now(),
              type: 'text',
              content: { ...DEFAULT_LOCALIZED_CONTENT },
              styles: { ...DEFAULT_TEXT_ELEMENT_STYLES },
            } as TextElement)
          : ({
              id: Date.now(),
              type: 'image',
              content: { ...DEFAULT_LOCALIZED_CONTENT },
              styles: { ...DEFAULT_IMAGE_ELEMENT_STYLES },
            } as ImageElement);

      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, elements: [...s.elements, newElement] } : s
        )
      );
    },
    [setSections]
  );

  const deleteElement = useCallback(
    (sectionId: number, elementId: number) => {
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, elements: s.elements.filter((el) => el.id !== elementId) }
            : s
        )
      );
    },
    [setSections]
  );

  const updateElementStyle = useCallback(
    (sectionId: number, elementId: number, field: string, value: unknown) => {
      setSections((prev) =>
        prev.map((s): Section => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            elements: s.elements.map((el): Element => {
              if (el.id !== elementId) return el;
              if (el.type === 'text') {
                return {
                  ...el,
                  styles: {
                    ...el.styles,
                    [activeView]: { ...el.styles[activeView], [field]: value },
                  },
                } as TextElement;
              }
              return {
                ...el,
                styles: {
                  ...el.styles,
                  [activeView]: { ...el.styles[activeView], [field]: value },
                },
              } as ImageElement;
            }),
          };
        })
      );
    },
    [activeView, setSections]
  );

  const updateElementContent = useCallback(
    (sectionId: number, elementId: number, content: string) => {
      setSections((prev) =>
        prev.map((s): Section => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            elements: s.elements.map((el): Element => {
              if (el.id !== elementId) return el;
              if (el.type === 'text') {
                return {
                  ...el,
                  content: { ...el.content, [activeLang]: content },
                } as TextElement;
              }
              return {
                ...el,
                content: { ...el.content, [activeLang]: content },
              } as ImageElement;
            }),
          };
        })
      );
    },
    [activeLang, setSections]
  );

  const updateElementStyles = useCallback(
    (sectionId: number, elementId: number, styles: Element['styles']) => {
      setSections((prev) =>
        prev.map((s): Section => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            elements: s.elements.map((el): Element => {
              if (el.id !== elementId) return el;
              if (el.type === 'text') {
                return { ...el, styles } as TextElement;
              }
              return { ...el, styles } as ImageElement;
            }),
          };
        })
      );
    },
    [setSections]
  );

  const setElementEditing = useCallback(
    (sectionId: number, elementId: number, isEditing: boolean) => {
      setSections((prev) =>
        prev.map((s): Section => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            elements: s.elements.map((el): Element => {
              if (el.id !== elementId) return el;
              if (el.type === 'text') {
                return { ...el, isEditing } as TextElement;
              }
              return { ...el, isEditing } as ImageElement;
            }),
          };
        })
      );
    },
    [setSections]
  );

  const clearAllEditing = useCallback(() => {
    setSections((prev) =>
      prev.map((s): Section => ({
        ...s,
        elements: s.elements.map((el): Element => {
          if (!el.isEditing) return el;
          if (el.type === 'text') {
            return { ...el, isEditing: false } as TextElement;
          }
          return { ...el, isEditing: false } as ImageElement;
        }),
      }))
    );
  }, [setSections]);

  return {
    addElement,
    deleteElement,
    updateElementStyle,
    updateElementContent,
    updateElementStyles,
    setElementEditing,
    clearAllEditing,
  };
}
