'use client';

import { useState } from 'react';
import { useLandingContext } from '../../../context';
import type { ImageElement } from '../../../types';
import styles from '../General.module.scss';

interface ImageElementEditorProps {
  sectionId: number;
  element: ImageElement;
}

export function ImageElementEditor({ sectionId, element }: ImageElementEditorProps) {
  const { activeView, updateElementStyle, updateElementContent, deleteElement } =
    useLandingContext();
  const [isOpen, setIsOpen] = useState(false);

  const est = element.styles[activeView];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = () => updateElementContent(sectionId, element.id, r.result as string);
      r.readAsDataURL(f);
    }
  };

  return (
    <div className={styles.general__elItem}>
      <div
        className={styles.general__elHeader}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className={styles.general__elArrow} style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>&#9654;</span>
          <span style={{ fontSize: '10px', fontWeight: 700 }}>IMAGE</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); deleteElement(sectionId, element.id); }}>X</button>
      </div>

      {isOpen && (
        <div className={styles.general__elBody}>
          <input type="file" onChange={handleFileChange} accept="image/*" />

          <div className={styles.general__field}>
            <label>W / H / Rad</label>
            <div style={{ display: 'flex', gap: '3px' }}>
              <input
                type="number"
                value={est.width}
                onChange={(e) =>
                  updateElementStyle(sectionId, element.id, 'width', Number(e.target.value))
                }
              />
              <input
                type="number"
                value={est.height}
                onChange={(e) =>
                  updateElementStyle(sectionId, element.id, 'height', Number(e.target.value))
                }
              />
              <input
                type="number"
                value={est.borderRadius}
                onChange={(e) =>
                  updateElementStyle(sectionId, element.id, 'borderRadius', Number(e.target.value))
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
