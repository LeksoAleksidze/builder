import styles from './General.module.scss';
import { FONTS } from './constants';
import type { ElementStyles, Language } from '../../../../shared/types';

interface TextElementEditorProps {
  content: string;
  elementStyles: ElementStyles;
  activeLang: Language;
  onContentChange: (value: string) => void;
  onStyleChange: (field: string, value: unknown) => void;
}

export default function TextElementEditor({
  content,
  elementStyles,
  onContentChange,
  onStyleChange,
}: TextElementEditorProps) {
  return (
    <>
      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
      />
      <div className={styles.general__field}>
        <label>Size / Color</label>
        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            type="number"
            value={elementStyles.fontSize || 16}
            onChange={(e) => onStyleChange('fontSize', Number(e.target.value))}
          />
          <input
            type="color"
            value={elementStyles.color || '#ffffff'}
            onChange={(e) => onStyleChange('color', e.target.value)}
          />
        </div>
      </div>
      <div className={styles.general__field}>
        <label>Font</label>
        <select
          value={elementStyles.fontFamily || 'Arial'}
          onChange={(e) => onStyleChange('fontFamily', e.target.value)}
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
      <div className={styles.general__field}>
        <label>Shadow CSS</label>
        <input
          type="text"
          value={elementStyles.textShadow || ''}
          onChange={(e) => onStyleChange('textShadow', e.target.value)}
        />
      </div>
    </>
  );
}
