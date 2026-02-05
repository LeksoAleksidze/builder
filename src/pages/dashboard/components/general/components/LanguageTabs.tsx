'use client';

import clsx from 'clsx';
import { useLandingContext } from '../../../context';
import { LANGUAGES } from '../../../constants';
import styles from '../General.module.scss';

export function LanguageTabs() {
  const { activeLang, setActiveLang } = useLandingContext();

  return (
    <div className={styles.general__tabGroup}>
      {LANGUAGES.map((l) => (
        <button
          key={l}
          className={clsx(
            styles.general__tab,
            activeLang === l && styles['general__tab--active']
          )}
          onClick={() => setActiveLang(l)}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
