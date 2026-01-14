import clsx from 'clsx';
import styles from './General.module.scss';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SectionStyleEditor from './SectionStyleEditor';
import ElementEditor from './ElementEditor';
import type { Section, ViewMode, Language } from '../../../../shared/types';

interface SortableSectionCardProps {
  section: Section;
  activeView: ViewMode;
  activeLang: Language;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onSectionStyleUpdate: (field: string, value: unknown) => void;
  onElementAdd: (type: 'text' | 'image') => void;
  onElementDelete: (elementId: number) => void;
  onElementContentChange: (elementId: number, value: string) => void;
  onElementStyleChange: (elementId: number, field: string, value: unknown) => void;
}

export default function SortableSectionCard({
  section,
  activeView,
  activeLang,
  isOpen,
  onToggle,
  onDelete,
  onSectionStyleUpdate,
  onElementAdd,
  onElementDelete,
  onElementContentChange,
  onElementStyleChange,
}: SortableSectionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 999 : 1, opacity: isDragging ? 0.6 : 1 };
  const st = section.styles[activeView];

  return (
    <div ref={setNodeRef} style={style} className={clsx(styles.general__sectionCard, isOpen && styles['general__sectionCard--active'])}>
      <div className={styles.general__cardHeader}>
        <div {...attributes} {...listeners} style={{ cursor: 'grab', padding: '0 10px', color: '#6272a4', fontSize: '18px' }}>⠿</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, cursor: 'pointer' }} onClick={onToggle}>
          <div style={{ width: '18px', height: '10px', background: st.backgroundColor, border: '1px solid #444' }}>
            {st.backgroundImage && <img src={st.backgroundImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
          </div>
          <strong>{section.title}</strong>
        </div>
        <button onClick={onDelete}>✕</button>
      </div>

      {isOpen && (
        <div className={styles.general__content}>
          <SectionStyleEditor sectionStyles={st} onUpdate={onSectionStyleUpdate} />

          <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
            <button className={styles.general__addButton} style={{ background: '#007aff' }} onClick={() => onElementAdd('text')}>+ T</button>
            <button className={styles.general__addButton} style={{ background: '#50fa7b', color: '#000' }} onClick={() => onElementAdd('image')}>+ I</button>
          </div>

          {section.elements.map((el) => (
            <ElementEditor
              key={el.id}
              element={el}
              activeView={activeView}
              activeLang={activeLang}
              onContentChange={(value) => onElementContentChange(el.id, value)}
              onStyleChange={(field, value) => onElementStyleChange(el.id, field, value)}
              onDelete={() => onElementDelete(el.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
