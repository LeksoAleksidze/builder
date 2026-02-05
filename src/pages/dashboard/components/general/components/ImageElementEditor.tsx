'use client';

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
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <span style={{ fontSize: '10px', fontWeight: 700 }}>IMAGE</span>
        <button onClick={() => deleteElement(sectionId, element.id)}>X</button>
      </div>

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
  );
}
