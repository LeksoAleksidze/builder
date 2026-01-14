import { useState } from 'react';
import clsx from 'clsx';
import styles from './General.module.scss';
import type { ViewMode, Language, GlobalBackground } from '../../../../shared/types';

interface GlobalBackgroundBlockProps {
  activeLang: Language;
  activeView: ViewMode;
  globalBG: GlobalBackground;
  onGlobalBGChange: (bg: GlobalBackground) => void;
}

export default function GlobalBackgroundBlock({
  activeLang,
  activeView,
  globalBG,
  onGlobalBGChange,
}: GlobalBackgroundBlockProps) {
  const [isOpen, setIsOpen] = useState(true);
  const viewKey = activeView.toLowerCase() as 'web' | 'mob';
  const bgUrl = globalBG[activeLang]?.[viewKey] || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onGlobalBGChange({
          ...globalBG,
          [activeLang]: {
            ...globalBG[activeLang],
            [viewKey]: reader.result as string,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    onGlobalBGChange({
      ...globalBG,
      [activeLang]: { ...globalBG[activeLang], [viewKey]: '' },
    });
  };

  return (
    <div className={clsx(styles.general__block, !isOpen && styles['general__block--closed'])}>
      <div className={styles.general__header} onClick={() => setIsOpen(!isOpen)}>
        <span className={styles['general__main-title']}>
          Global Background ({activeLang} - {activeView})
        </span>
      </div>
      <div className={styles.general__content}>
        <div className={styles.general__field}>
          <label>Upload Background</label>
          <input type="file" onChange={handleFileChange} accept="image/*" />
        </div>
        {bgUrl && (
          <div style={{ marginTop: '10px', position: 'relative' }}>
            <img
              src={bgUrl}
              style={{ width: '100px', height: '100px', borderRadius: '4px', border: '1px solid #444' }}
              alt="Preview"
            />
            <button
              onClick={handleRemove}
              style={{
                position: 'absolute',
                top: 5,
                right: 5,
                background: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
