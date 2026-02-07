'use client';

import clsx from 'clsx';
import { useLandingContext } from '../../../context';
import styles from '../General.module.scss';

interface GlobalBackgroundBlockProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function GlobalBackgroundBlock({ isOpen, onToggle }: GlobalBackgroundBlockProps) {
  const { activeLang, activeView, globalBG, updateGlobalBG, clearGlobalBG } =
    useLandingContext();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => updateGlobalBG(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const currentBG = globalBG[activeLang]?.[activeView.toLowerCase() as 'web' | 'mob'];

  return (
    <div
      className={clsx(
        styles.general__block,
        !isOpen && styles['general__block--closed']
      )}
    >
      <div className={styles.general__header} onClick={onToggle}>
        <span className={styles['general__main-title']}>
          Global Background ({activeLang} - {activeView})
        </span>
      </div>
      <div className={styles.general__content}>
        <div className={styles.general__field}>
          <label>Upload Background</label>
          <input type="file" onChange={handleFileChange} accept="image/*" />
        </div>
        {currentBG && (
          <div style={{ marginTop: '10px', position: 'relative' }}>
            <img
              src={currentBG}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '4px',
                border: '1px solid #444',
              }}
              alt="Preview"
            />
            <button
              onClick={clearGlobalBG}
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
              X
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
