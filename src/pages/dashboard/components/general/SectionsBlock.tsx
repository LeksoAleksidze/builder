import { useState } from 'react';
import clsx from 'clsx';
import styles from './General.module.scss';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableSectionCard from './SortableSectionCard';
import type { Section, ViewMode, Language } from '../../../../shared/types';

interface SectionsBlockProps {
  sections: Section[];
  activeView: ViewMode;
  activeLang: Language;
  onSectionsChange: (sections: Section[]) => void;
}

export default function SectionsBlock({ sections, activeView, activeLang, onSectionsChange }: SectionsBlockProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [openSections, setOpenSections] = useState<number[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      onSectionsChange(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const addSection = () => {
    const newSection: Section = {
      id: Date.now(),
      title: `Sec ${sections.length + 1}`,
      styles: {
        WEB: { width: '100%', height: 400, marginTop: 0, marginBottom: 0, backgroundColor: '#161925', borderWidth: 0, borderRadius: 0, borderColor: '#333' },
        MOB: { width: '100%', height: 300, marginTop: 0, marginBottom: 0, backgroundColor: '#161925', borderWidth: 0, borderRadius: 0, borderColor: '#333' },
      },
      elements: [],
    };
    onSectionsChange([...sections, newSection]);
  };

  const updateSectionStyle = (sectionId: number, field: string, value: unknown) => {
    onSectionsChange(sections.map((s) => s.id === sectionId ? { ...s, styles: { ...s.styles, [activeView]: { ...s.styles[activeView], [field]: value } } } : s));
  };

  const addElement = (sectionId: number, type: 'text' | 'image') => {
    const newEl = {
      id: Date.now(),
      type,
      content: { GE: '', EN: '', RU: '', TR: '' },
      styles: {
        WEB: type === 'text' ? { x: 50, y: 50, width: 200, height: 50, fontSize: 24, fontFamily: 'Arial', color: '#fff' } : { x: 50, y: 150, width: 200, height: 200, borderRadius: 0 },
        MOB: type === 'text' ? { x: 20, y: 20, width: 150, height: 40, fontSize: 18, fontFamily: 'Arial', color: '#fff' } : { x: 20, y: 100, width: 150, height: 150, borderRadius: 0 },
      },
    };
    onSectionsChange(sections.map((s) => s.id === sectionId ? { ...s, elements: [...s.elements, newEl] } : s));
  };

  const deleteElement = (sectionId: number, elementId: number) => {
    onSectionsChange(sections.map((s) => s.id === sectionId ? { ...s, elements: s.elements.filter((el) => el.id !== elementId) } : s));
  };

  const updateElementContent = (sectionId: number, elementId: number, value: string) => {
    onSectionsChange(sections.map((s) => s.id === sectionId ? { ...s, elements: s.elements.map((el) => el.id === elementId ? { ...el, content: { ...el.content, [activeLang]: value } } : el) } : s));
  };

  const updateElementStyle = (sectionId: number, elementId: number, field: string, value: unknown) => {
    onSectionsChange(sections.map((s) => s.id === sectionId ? { ...s, elements: s.elements.map((el) => el.id === elementId ? { ...el, styles: { ...el.styles, [activeView]: { ...el.styles[activeView], [field]: value } } } : el) } : s));
  };

  return (
    <div className={clsx(styles.general__block, !isOpen && styles['general__block--closed'])}>
      <div className={styles.general__header} onClick={() => setIsOpen(!isOpen)}>
        <span className={styles['general__main-title']}>Sections & Reorder</span>
      </div>
      <div className={styles.general__content}>
        <button className={styles.general__addButton} onClick={addSection}>+ New Section</button>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sections.map((section) => (
                <SortableSectionCard
                  key={section.id}
                  section={section}
                  activeView={activeView}
                  activeLang={activeLang}
                  isOpen={openSections.includes(section.id)}
                  onToggle={() => setOpenSections((prev) => prev.includes(section.id) ? prev.filter((id) => id !== section.id) : [...prev, section.id])}
                  onDelete={() => onSectionsChange(sections.filter((s) => s.id !== section.id))}
                  onSectionStyleUpdate={(field, value) => updateSectionStyle(section.id, field, value)}
                  onElementAdd={(type) => addElement(section.id, type)}
                  onElementDelete={(elId) => deleteElement(section.id, elId)}
                  onElementContentChange={(elId, value) => updateElementContent(section.id, elId, value)}
                  onElementStyleChange={(elId, field, value) => updateElementStyle(section.id, elId, field, value)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
