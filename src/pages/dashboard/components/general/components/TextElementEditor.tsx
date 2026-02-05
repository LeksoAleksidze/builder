'use client';

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

  const est = element.styles[activeView];

  return (
    <div className={styles.general__elItem}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <span style={{ fontSize: '10px', fontWeight: 700 }}>TEXT</span>
        <button onClick={() => deleteElement(sectionId, element.id)}>X</button>
      </div>

      <textarea
        value={element.content[activeLang] || ''}
        onChange={(e) => updateElementContent(sectionId, element.id, e.target.value)}
      />

      <div className={styles.general__field}>
        <label>Size / Color</label>
        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            type="number"
            value={est.fontSize}
            onChange={(e) =>
              updateElementStyle(sectionId, element.id, 'fontSize', Number(e.target.value))
            }
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
  );
}
