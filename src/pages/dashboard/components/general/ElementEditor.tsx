import styles from './General.module.scss';
import TextElementEditor from './TextElementEditor';
import ImageElementEditor from './ImageElementEditor';
import type { Element, ViewMode, Language } from '../../../../shared/types';

interface ElementEditorProps {
  element: Element;
  activeView: ViewMode;
  activeLang: Language;
  onContentChange: (value: string) => void;
  onStyleChange: (field: string, value: unknown) => void;
  onDelete: () => void;
}

export default function ElementEditor({
  element,
  activeView,
  activeLang,
  onContentChange,
  onStyleChange,
  onDelete,
}: ElementEditorProps) {
  const elementStyles = element.styles[activeView];
  const content = element.content[activeLang] || '';

  return (
    <div className={styles.general__elItem}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700 }}>
          {element.type.toUpperCase()}
        </span>
        <button onClick={onDelete}>✕</button>
      </div>

      {element.type === 'text' ? (
        <TextElementEditor
          content={content}
          elementStyles={elementStyles}
          activeLang={activeLang}
          onContentChange={onContentChange}
          onStyleChange={onStyleChange}
        />
      ) : (
        <ImageElementEditor
          elementStyles={elementStyles}
          onContentChange={onContentChange}
          onStyleChange={onStyleChange}
        />
      )}
    </div>
  );
}
