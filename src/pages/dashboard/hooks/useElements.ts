import { useCallback } from 'react';
import type {
  Section,
  Element,
  TextElement,
  ImageElement,
  BoxElement,
  BoxChildElement,
  Viewport,
  Language,
  LocalizedContent,
} from '../types';
import {
  DEFAULT_TEXT_ELEMENT_STYLES,
  DEFAULT_IMAGE_ELEMENT_STYLES,
  DEFAULT_BOX_ELEMENT_STYLES,
  DEFAULT_LOCALIZED_CONTENT,
  LANGUAGES,
} from '../constants';

interface UseElementsProps {
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  activeView: Viewport;
  activeLang: Language;
}

// Helper to deep clone an element with a new ID
function cloneElement(el: Element): Element {
  const newId = Date.now() + Math.random();

  if (el.type === 'box') {
    return {
      ...el,
      id: newId,
      children: el.children.map((child) => ({
        ...child,
        id: Date.now() + Math.random(),
        content: { ...child.content },
        styles: {
          WEB: { ...child.styles.WEB },
          MOB: { ...child.styles.MOB },
        },
      })),
      styles: {
        WEB: { ...el.styles.WEB },
        MOB: { ...el.styles.MOB },
      },
    } as BoxElement;
  }

  if (el.type === 'text') {
    return {
      ...el,
      id: newId,
      content: { ...el.content },
      styles: {
        WEB: { ...el.styles.WEB },
        MOB: { ...el.styles.MOB },
      },
    } as TextElement;
  }

  return {
    ...el,
    id: newId,
    content: { ...el.content },
    styles: {
      WEB: { ...el.styles.WEB },
      MOB: { ...el.styles.MOB },
    },
  } as ImageElement;
}

// Helper to update an element in the tree (handles nested box children)
function updateElementInTree(
  elements: Element[],
  elementId: number,
  updater: (el: Element) => Element
): Element[] {
  return elements.map((el): Element => {
    if (el.id === elementId) {
      return updater(el);
    }

    // Check inside boxes
    if (el.type === 'box') {
      const updatedChildren = el.children.map((child): BoxChildElement => {
        if (child.id === elementId) {
          return updater(child) as BoxChildElement;
        }
        return child;
      });
      return { ...el, children: updatedChildren } as BoxElement;
    }

    return el;
  });
}

export function useElements({ setSections, activeView, activeLang }: UseElementsProps) {
  // Add element to section (text, image, or box)
  const addElement = useCallback(
    (sectionId: number, type: 'text' | 'image' | 'box') => {
      let newElement: Element;

      if (type === 'text') {
        newElement = {
          id: Date.now(),
          type: 'text',
          content: { ...DEFAULT_LOCALIZED_CONTENT },
          styles: {
            WEB: { ...DEFAULT_TEXT_ELEMENT_STYLES.WEB },
            MOB: { ...DEFAULT_TEXT_ELEMENT_STYLES.MOB },
          },
        } as TextElement;
      } else if (type === 'image') {
        newElement = {
          id: Date.now(),
          type: 'image',
          content: { ...DEFAULT_LOCALIZED_CONTENT },
          styles: {
            WEB: { ...DEFAULT_IMAGE_ELEMENT_STYLES.WEB },
            MOB: { ...DEFAULT_IMAGE_ELEMENT_STYLES.MOB },
          },
        } as ImageElement;
      } else {
        newElement = {
          id: Date.now(),
          type: 'box',
          title: `Box ${Date.now() % 1000}`,
          children: [],
          styles: {
            WEB: { ...DEFAULT_BOX_ELEMENT_STYLES.WEB },
            MOB: { ...DEFAULT_BOX_ELEMENT_STYLES.MOB },
          },
        } as BoxElement;
      }

      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, elements: [...s.elements, newElement] } : s
        )
      );
    },
    [setSections]
  );

  // Add element inside a box
  const addElementToBox = useCallback(
    (sectionId: number, boxId: number, type: 'text' | 'image') => {
      const newChild: BoxChildElement =
        type === 'text'
          ? {
              id: Date.now(),
              type: 'text',
              content: { ...DEFAULT_LOCALIZED_CONTENT },
              styles: {
                WEB: { ...DEFAULT_TEXT_ELEMENT_STYLES.WEB, x: 10, y: 10 },
                MOB: { ...DEFAULT_TEXT_ELEMENT_STYLES.MOB, x: 10, y: 10 },
              },
            }
          : {
              id: Date.now(),
              type: 'image',
              content: { ...DEFAULT_LOCALIZED_CONTENT },
              styles: {
                WEB: { ...DEFAULT_IMAGE_ELEMENT_STYLES.WEB, x: 10, y: 10 },
                MOB: { ...DEFAULT_IMAGE_ELEMENT_STYLES.MOB, x: 10, y: 10 },
              },
            };

      setSections((prev) =>
        prev.map((s): Section => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            elements: s.elements.map((el): Element => {
              if (el.id !== boxId || el.type !== 'box') return el;
              return {
                ...el,
                children: [...el.children, newChild],
              } as BoxElement;
            }),
          };
        })
      );
    },
    [setSections]
  );

  // Duplicate an element (works for box, text, image)
  const duplicateElement = useCallback(
    (sectionId: number, elementId: number) => {
      setSections((prev) =>
        prev.map((s): Section => {
          if (s.id !== sectionId) return s;

          const elementToCopy = s.elements.find((el) => el.id === elementId);
          if (!elementToCopy) return s;

          const cloned = cloneElement(elementToCopy);
          // Offset the cloned element slightly
          if (cloned.type === 'box') {
            cloned.styles[activeView].x += 20;
            cloned.styles[activeView].y += 20;
          } else {
            (cloned.styles as { WEB: { x: number; y: number }; MOB: { x: number; y: number } })[activeView].x += 20;
            (cloned.styles as { WEB: { x: number; y: number }; MOB: { x: number; y: number } })[activeView].y += 20;
          }

          return { ...s, elements: [...s.elements, cloned] };
        })
      );
    },
    [activeView, setSections]
  );

  // Duplicate a child element inside a box
  const duplicateBoxChild = useCallback(
    (sectionId: number, boxId: number, childId: number) => {
      setSections((prev) =>
        prev.map((s): Section => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            elements: s.elements.map((el): Element => {
              if (el.id !== boxId || el.type !== 'box') return el;

              const childToCopy = el.children.find((c) => c.id === childId);
              if (!childToCopy) return el;

              const cloned = cloneElement(childToCopy) as BoxChildElement;
              cloned.styles[activeView].x += 20;
              cloned.styles[activeView].y += 20;

              return {
                ...el,
                children: [...el.children, cloned],
              } as BoxElement;
            }),
          };
        })
      );
    },
    [activeView, setSections]
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

  // Delete a child from a box
  const deleteBoxChild = useCallback(
    (sectionId: number, boxId: number, childId: number) => {
      setSections((prev) =>
        prev.map((s): Section => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            elements: s.elements.map((el): Element => {
              if (el.id !== boxId || el.type !== 'box') return el;
              return {
                ...el,
                children: el.children.filter((c) => c.id !== childId),
              } as BoxElement;
            }),
          };
        })
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
            elements: updateElementInTree(s.elements, elementId, (el) => {
              if (el.type === 'text') {
                return {
                  ...el,
                  styles: {
                    ...el.styles,
                    [activeView]: { ...el.styles[activeView], [field]: value },
                  },
                } as TextElement;
              }
              if (el.type === 'image') {
                return {
                  ...el,
                  styles: {
                    ...el.styles,
                    [activeView]: { ...el.styles[activeView], [field]: value },
                  },
                } as ImageElement;
              }
              // box
              return {
                ...el,
                styles: {
                  ...el.styles,
                  [activeView]: { ...el.styles[activeView], [field]: value },
                },
              } as BoxElement;
            }),
          };
        })
      );
    },
    [activeView, setSections]
  );

  const updateElementContent = useCallback(
    (sectionId: number, elementId: number, content: string, targetLang?: Language) => {
      setSections((prev) =>
        prev.map((s): Section => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            elements: updateElementInTree(s.elements, elementId, (el) => {
              if (el.type === 'box') return el; // boxes don't have content

              const langToUpdate = targetLang || activeLang;
              const typedEl = el as TextElement | ImageElement;
              const newContent: LocalizedContent = typedEl.sameForAllLangs
                ? LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: content }), {} as LocalizedContent)
                : { ...typedEl.content, [langToUpdate]: content };

              if (el.type === 'text') {
                return { ...el, content: newContent } as TextElement;
              }
              return { ...el, content: newContent } as ImageElement;
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
            elements: updateElementInTree(s.elements, elementId, (el) => {
              if (el.type === 'text') {
                return { ...el, styles } as TextElement;
              }
              if (el.type === 'image') {
                return { ...el, styles } as ImageElement;
              }
              return { ...el, styles } as BoxElement;
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
            elements: updateElementInTree(s.elements, elementId, (el) => {
              if (el.type === 'text') {
                return { ...el, isEditing } as TextElement;
              }
              if (el.type === 'image') {
                return { ...el, isEditing } as ImageElement;
              }
              return { ...el, isEditing } as BoxElement;
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
          if (el.type === 'box') {
            return {
              ...el,
              isEditing: false,
              children: el.children.map((child) => ({
                ...child,
                isEditing: false,
              })),
            } as BoxElement;
          }
          if (el.type === 'text') {
            return { ...el, isEditing: false } as TextElement;
          }
          return { ...el, isEditing: false } as ImageElement;
        }),
      }))
    );
  }, [setSections]);

  const setElementSameForAllLangs = useCallback(
    (sectionId: number, elementId: number, value: boolean) => {
      setSections((prev) =>
        prev.map((s): Section => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            elements: updateElementInTree(s.elements, elementId, (el) => {
              if (el.type === 'box') return el;

              const typedEl = el as TextElement | ImageElement;
              let newContent = typedEl.content;
              if (value) {
                const currentContent = typedEl.content[activeLang] || '';
                newContent = LANGUAGES.reduce(
                  (acc, lang) => ({ ...acc, [lang]: currentContent }),
                  {} as LocalizedContent
                );
              }

              if (el.type === 'text') {
                return { ...el, sameForAllLangs: value, content: newContent } as TextElement;
              }
              return { ...el, sameForAllLangs: value, content: newContent } as ImageElement;
            }),
          };
        })
      );
    },
    [activeLang, setSections]
  );

  // Update box title
  const updateBoxTitle = useCallback(
    (sectionId: number, boxId: number, title: string) => {
      setSections((prev) =>
        prev.map((s): Section => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            elements: s.elements.map((el): Element => {
              if (el.id !== boxId || el.type !== 'box') return el;
              return { ...el, title } as BoxElement;
            }),
          };
        })
      );
    },
    [setSections]
  );

  return {
    addElement,
    addElementToBox,
    duplicateElement,
    duplicateBoxChild,
    deleteElement,
    deleteBoxChild,
    updateElementStyle,
    updateElementContent,
    updateElementStyles,
    setElementEditing,
    clearAllEditing,
    setElementSameForAllLangs,
    updateBoxTitle,
  };
}
