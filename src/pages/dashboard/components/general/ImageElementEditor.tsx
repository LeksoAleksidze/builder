import styles from './General.module.scss';
import type { ElementStyles } from '../../../../shared/types';

interface ImageElementEditorProps {
  elementStyles: ElementStyles;
  onContentChange: (value: string) => void;
  onStyleChange: (field: string, value: unknown) => void;
}

export default function ImageElementEditor({
  elementStyles,
  onContentChange,
  onStyleChange,
}: ImageElementEditorProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => onContentChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <div className={styles.general__field}>
        <label>W / H / Rad</label>
        <div style={{ display: 'flex', gap: '3px' }}>
          <input
            type="number"
            value={elementStyles.width}
            onChange={(e) => onStyleChange('width', Number(e.target.value))}
          />
          <input
            type="number"
            value={elementStyles.height}
            onChange={(e) => onStyleChange('height', Number(e.target.value))}
          />
          <input
            type="number"
            value={elementStyles.borderRadius || 0}
            onChange={(e) => onStyleChange('borderRadius', Number(e.target.value))}
          />
        </div>
      </div>
    </>
  );
}
