'use client';

import clsx from 'clsx';
import { useLandingContext } from '../../../context';
import { VIEWPORTS } from '../../../constants';
import styles from '../General.module.scss';

export function ViewportTabs() {
  const { activeView, setActiveView } = useLandingContext();

  return (
    <div className={styles.general__tabGroup}>
      {VIEWPORTS.map((v) => (
        <button
          key={v}
          className={clsx(
            styles.general__tab,
            activeView === v && styles['general__tab--active']
          )}
          onClick={() => setActiveView(v)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
