'use client';

import { useState } from 'react';
import clsx from 'clsx';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useLandingContext } from '../../../context';
import { SortableSection } from './SortableSection';
import styles from '../General.module.scss';

interface SectionsBlockProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SectionsBlock({ isOpen, onToggle }: SectionsBlockProps) {
  const { sections, addSection, reorderSections } = useLandingContext();
  const [openSections, setOpenSections] = useState<number[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderSections(active.id as number, over.id as number);
    }
  };

  const toggleSection = (sectionId: number) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div
      className={clsx(
        styles.general__block,
        !isOpen && styles['general__block--closed']
      )}
    >
      <div className={styles.general__header} onClick={onToggle}>
        <span className={styles['general__main-title']}>Sections & Reorder</span>
      </div>

      <div className={styles.general__content}>
        <button className={styles.general__addButton} onClick={addSection}>
          + New Section
        </button>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sections.map((s) => (
                <SortableSection
                  key={s.id}
                  section={s}
                  isOpen={openSections.includes(s.id)}
                  onToggle={() => toggleSection(s.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
