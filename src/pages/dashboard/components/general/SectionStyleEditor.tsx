import styles from './General.module.scss';
import type { SectionStyles } from '../../../../shared/types';

interface SectionStyleEditorProps {
  sectionStyles: SectionStyles;
  onUpdate: (field: string, value: unknown) => void;
}

export default function SectionStyleEditor({
  sectionStyles: st,
  onUpdate,
}: SectionStyleEditorProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => onUpdate('backgroundImage', reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className={styles.general__field}>
        <label>W / H</label>
        <div style={{ display: 'flex', gap: '4px' }}>
          <input type="text" value={st.width} onChange={(e) => onUpdate('width', e.target.value)} />
          <input type="number" value={st.height} onChange={(e) => onUpdate('height', Number(e.target.value))} />
        </div>
      </div>

      <div className={styles.general__field}>
        <label>Margin T/B</label>
        <div style={{ display: 'flex', gap: '4px' }}>
          <input type="number" value={st.marginTop} onChange={(e) => onUpdate('marginTop', Number(e.target.value))} />
          <input type="number" value={st.marginBottom} onChange={(e) => onUpdate('marginBottom', Number(e.target.value))} />
        </div>
      </div>

      <div className={styles.general__field}>
        <label>Border W/R</label>
        <div style={{ display: 'flex', gap: '4px' }}>
          <input type="number" value={st.borderWidth} onChange={(e) => onUpdate('borderWidth', Number(e.target.value))} />
          <input type="number" value={st.borderRadius} onChange={(e) => onUpdate('borderRadius', Number(e.target.value))} />
        </div>
      </div>

      <div className={styles.general__field}>
        <label>BG / Border Color</label>
        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            type="color"
            value={st.backgroundColor === 'transparent' ? '#000000' : st.backgroundColor}
            onChange={(e) => onUpdate('backgroundColor', e.target.value)}
          />
          <button onClick={() => onUpdate('backgroundColor', 'transparent')} style={{ fontSize: '8px' }}>X</button>
          <input type="color" value={st.borderColor} onChange={(e) => onUpdate('borderColor', e.target.value)} />
        </div>
      </div>

      <input type="file" onChange={handleFileChange} accept="image/*" />
    </>
  );
}
