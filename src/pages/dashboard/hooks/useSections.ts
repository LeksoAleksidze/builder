import { useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { Section, Viewport, SectionStyle } from '../types';
import { DEFAULT_SECTION_STYLES } from '../constants';

interface UseSectionsProps {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  activeView: Viewport;
}

export function useSections({ sections, setSections, activeView }: UseSectionsProps) {
  const addSection = useCallback(() => {
    const newSection: Section = {
      id: Date.now(),
      title: `Sec ${sections.length + 1}`,
      styles: { ...DEFAULT_SECTION_STYLES },
      elements: [],
    };
    setSections((prev) => [...prev, newSection]);
  }, [sections.length, setSections]);

  const deleteSection = useCallback(
    (sectionId: number) => {
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
    },
    [setSections]
  );

  const updateSectionStyle = useCallback(
    <K extends keyof SectionStyle>(sectionId: number, field: K, value: SectionStyle[K]) => {
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                styles: {
                  ...s.styles,
                  [activeView]: { ...s.styles[activeView], [field]: value },
                },
              }
            : s
        )
      );
    },
    [activeView, setSections]
  );

  const reorderSections = useCallback(
    (activeId: number, overId: number) => {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === activeId);
        const newIndex = items.findIndex((i) => i.id === overId);
        return arrayMove(items, oldIndex, newIndex);
      });
    },
    [setSections]
  );

  return {
    addSection,
    deleteSection,
    updateSectionStyle,
    reorderSections,
  };
}
