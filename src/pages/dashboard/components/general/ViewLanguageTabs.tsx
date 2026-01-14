import clsx from 'clsx';
import styles from './General.module.scss';
import { LANGUAGES, VIEW_MODES } from './constants';
import type { ViewMode, Language } from '../../../../shared/types';

interface ViewLanguageTabsProps {
  activeView: ViewMode;
  activeLang: Language;
  onViewChange: (view: ViewMode) => void;
  onLangChange: (lang: Language) => void;
}

export default function ViewLanguageTabs({
  activeView,
  activeLang,
  onViewChange,
  onLangChange,
}: ViewLanguageTabsProps) {
  return (
    <div className={styles.general__topControls}>
      <div className={styles.general__tabGroup}>
        {VIEW_MODES.map((v) => (
          <button
            key={v}
            className={clsx(
              styles.general__tab,
              activeView === v && styles['general__tab--active']
            )}
            onClick={() => onViewChange(v)}
          >
            {v}
          </button>
        ))}
      </div>
      <div className={styles.general__tabGroup}>
        {LANGUAGES.map((l) => (
          <button
            key={l}
            className={clsx(
              styles.general__tab,
              activeLang === l && styles['general__tab--active']
            )}
            onClick={() => onLangChange(l)}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
