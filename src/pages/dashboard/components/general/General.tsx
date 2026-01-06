'use client';

import React, { useState } from 'react';
import styles from './General.module.scss';
import clsx from 'clsx';
import Checkbox from '../../../../shared/components/checkbox/Checkbox.tsx';

interface GeneralProps {
  isScaled: boolean;
  setScaled: (val: boolean) => void;
  authStyles: { marginTop: string; backgroundColor: string };
  setAuthStyles: React.Dispatch<
    React.SetStateAction<{ marginTop: string; backgroundColor: string }>
  >;
}

const LANGUAGES = [
  { code: 'GE', label: 'GE' },
  { code: 'EN', label: 'EN' },
  { code: 'RU', label: 'RU' },
  { code: 'TR', label: 'TR' },
];

export default function General({
  isScaled,
  setScaled,
  authStyles,
  setAuthStyles,
}: GeneralProps) {
  const [activeLang, setActiveLang] = useState('GE');
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className={clsx(styles.general, !isOpen && styles['general--closed'])}>
      <div
        className={styles.general__header}
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className={styles['general__main-title']}>General Settings</h2>
        <span
          className={clsx(
            styles.general__arrow,
            isOpen && styles['general__arrow--active']
          )}
        >
          ▼
        </span>
      </div>
      {isOpen && (
        <div className={styles.general__content}>
          <div className={styles.general__section}>
            <h3 className={styles.general__title}>Localization</h3>
            <div className={styles['general__lang-grid']}>
              {LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => setActiveLang(lang.code)}
                  className={clsx(
                    styles['general__lang-item'],
                    activeLang === lang.code &&
                      styles['general__lang-item--active']
                  )}
                >
                  {lang.label}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.general__section}>
            <h3 className={styles.general__title}>View Settings</h3>
            <div className={styles.general__row}>
              <Checkbox
                id="scale-background"
                label="Scale Background Image"
                checked={isScaled}
                onChange={setScaled}
              />
            </div>
          </div>
        </div>
      )}

      <div
        className={clsx(
          styles.general__block,
          !isAuthOpen && styles['general__block--closed']
        )}
      >
        <div
          className={styles.general__header}
          onClick={() => setIsAuthOpen(!isAuthOpen)}
        >
          <h2 className={styles['general__main-title']}>Authorization block</h2>
          <span
            className={clsx(
              styles.general__arrow,
              isAuthOpen && styles['general__arrow--active']
            )}
          >
            ▼
          </span>
        </div>

        {isAuthOpen && (
          <div className={styles.general__content}>
            <div className={styles.general__section}>
              <h3 className={styles.general__title}>
                დაშორება ზემოდან (Margin Top)
              </h3>
              <input
                type="range"
                min="0"
                max="2000"
                value={parseInt(authStyles.marginTop)}
                onChange={(e) =>
                  setAuthStyles({
                    ...authStyles,
                    marginTop: `${e.target.value}px`,
                  })
                }
                className={styles.general__input}
              />
              <span className={styles.general__value}>
                {authStyles.marginTop}
              </span>
            </div>

            <div className={styles.general__section}>
              <h3 className={styles.general__title}>ფონის ფერი</h3>
              <input
                type="color"
                value={authStyles.backgroundColor}
                onChange={(e) =>
                  setAuthStyles({
                    ...authStyles,
                    backgroundColor: e.target.value,
                  })
                }
                className={styles.general__colorPicker}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
