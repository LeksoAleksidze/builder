'use client';

import { useState } from 'react';
import { useLandingContext } from '../../../context';
import { FONTS } from '../../../constants';
import type { TextElement } from '../../../types';
import styles from '../General.module.scss';

interface TextElementEditorProps {
  sectionId: number;
  element: TextElement;
}

export function TextElementEditor({ sectionId, element }: TextElementEditorProps) {
  const { activeView, activeLang, updateElementStyle, updateElementContent, deleteElement } =
    useLandingContext();
  const [isOpen, setIsOpen] = useState(false);

  const est = element.styles[activeView];

  return (
    <div className={styles.general__elItem}>
      <div
        className={styles.general__elHeader}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className={styles.general__elArrow} style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>&#9654;</span>
          <span style={{ fontSize: '10px', fontWeight: 700 }}>TEXT</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); deleteElement(sectionId, element.id); }}>X</button>
      </div>

      {isOpen && (
        <div className={styles.general__elBody}>
          <textarea
            value={element.content[activeLang] || ''}
            onChange={(e) => updateElementContent(sectionId, element.id, e.target.value)}
          />

          <div className={styles.general__field}>
            <label>Size / Line H / Color</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input
                type="number"
                value={est.fontSize}
                onChange={(e) =>
                  updateElementStyle(sectionId, element.id, 'fontSize', Number(e.target.value))
                }
              />
              <input
                type="number"
                value={est.lineHeight ?? 1.4}
                onChange={(e) =>
                  updateElementStyle(sectionId, element.id, 'lineHeight', Number(e.target.value))
                }
                placeholder="Line H"
                step="0.1"
                min="0.5"
                max="5"
                style={{ width: '60px' }}
              />
              <input
                type="color"
                value={est.color}
                onChange={(e) =>
                  updateElementStyle(sectionId, element.id, 'color', e.target.value)
                }
              />
            </div>
          </div>

          <div className={styles.general__field}>
            <label>Font</label>
            <select
              value={est.fontFamily}
              onChange={(e) =>
                updateElementStyle(sectionId, element.id, 'fontFamily', e.target.value)
              }
            >
              {FONTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.general__field}>
            <label>Shadow CSS</label>
            <input
              type="text"
              value={est.textShadow || ''}
              onChange={(e) =>
                updateElementStyle(sectionId, element.id, 'textShadow', e.target.value)
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
