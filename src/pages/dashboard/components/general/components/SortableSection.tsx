'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLandingContext } from '../../../context';
import type { Section, TextElement, ImageElement } from '../../../types';
import { TextElementEditor } from './TextElementEditor';
import { ImageElementEditor } from './ImageElementEditor';
import styles from '../General.module.scss';

interface SortableSectionProps {
  section: Section;
  isOpen: boolean;
  onToggle: () => void;
}

export function SortableSection({ section, isOpen, onToggle }: SortableSectionProps) {
  const {
    activeView,
    updateSectionStyle,
    deleteSection,
    addElement,
  } = useLandingContext();

  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const st = section.styles[activeView];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = () => updateSectionStyle(section.id, 'backgroundImage', r.result as string);
      r.readAsDataURL(f);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        styles.general__sectionCard,
        isOpen && styles['general__sectionCard--active']
      )}
    >
      <div className={styles.general__cardHeader}>
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            padding: '0 10px',
            color: '#6272a4',
            fontSize: '18px',
          }}
        >
          :::
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flex: 1,
            cursor: 'pointer',
          }}
          onClick={onToggle}
        >
          <div
            style={{
              width: '18px',
              height: '10px',
              background: st.backgroundColor,
              border: '1px solid #444',
            }}
          >
            {st.backgroundImage && (
              <img
                src={st.backgroundImage}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt=""
              />
            )}
          </div>
          <strong>{section.title}</strong>
        </div>
        <button onClick={() => deleteSection(section.id)}>X</button>
      </div>

      {isOpen && (
        <div className={styles.general__content}>
          {/* Collapsible section settings */}
          <div className={styles.general__elItem}>
            <div
              className={styles.general__elHeader}
              onClick={() => setSettingsOpen(!settingsOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={styles.general__elArrow} style={{ transform: settingsOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>&#9654;</span>
                <span style={{ fontSize: '10px', fontWeight: 700 }}>SETTINGS</span>
              </div>
            </div>

            {settingsOpen && (
              <div className={styles.general__elBody}>
                <div className={styles.general__field}>
                  <label>W / H</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      value={st.width}
                      onChange={(e) => updateSectionStyle(section.id, 'width', e.target.value)}
                    />
                    <input
                      type="number"
                      value={st.height}
                      onChange={(e) =>
                        updateSectionStyle(section.id, 'height', Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className={styles.general__field}>
                  <label>Margin T/B</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="number"
                      value={st.marginTop}
                      onChange={(e) =>
                        updateSectionStyle(section.id, 'marginTop', Number(e.target.value))
                      }
                    />
                    <input
                      type="number"
                      value={st.marginBottom}
                      onChange={(e) =>
                        updateSectionStyle(section.id, 'marginBottom', Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className={styles.general__field}>
                  <label>Border W/R</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="number"
                      value={st.borderWidth}
                      onChange={(e) =>
                        updateSectionStyle(section.id, 'borderWidth', Number(e.target.value))
                      }
                    />
                    <input
                      type="number"
                      value={st.borderRadius}
                      onChange={(e) =>
                        updateSectionStyle(section.id, 'borderRadius', Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className={styles.general__field}>
                  <label>BG / Border Color</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="color"
                      value={
                        st.backgroundColor === 'transparent' ? '#000000' : st.backgroundColor
                      }
                      onChange={(e) =>
                        updateSectionStyle(section.id, 'backgroundColor', e.target.value)
                      }
                    />
                    <button
                      onClick={() =>
                        updateSectionStyle(section.id, 'backgroundColor', 'transparent')
                      }
                      style={{ fontSize: '8px' }}
                    >
                      X
                    </button>
                    <input
                      type="color"
                      value={st.borderColor}
                      onChange={(e) =>
                        updateSectionStyle(section.id, 'borderColor', e.target.value)
                      }
                    />
                  </div>
                </div>

                <input type="file" onChange={handleFileChange} accept="image/*" />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className={styles.general__addButton}
              style={{ background: '#007aff' }}
              onClick={() => addElement(section.id, 'text')}
            >
              + T
            </button>
            <button
              className={styles.general__addButton}
              style={{ background: '#50fa7b', color: '#000' }}
              onClick={() => addElement(section.id, 'image')}
            >
              + I
            </button>
          </div>

          {section.elements.map((el) =>
            el.type === 'text' ? (
              <TextElementEditor
                key={el.id}
                sectionId={section.id}
                element={el as TextElement}
              />
            ) : (
              <ImageElementEditor
                key={el.id}
                sectionId={section.id}
                element={el as ImageElement}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
