'use client';

import { useLandingContext } from '../../context';
import Authorization from '../../../../shared/modules/authorization/Authorization';
import { SectionRenderer } from './SectionRenderer';
import styles from '../../dashboard.module.scss';

export function PreviewCanvas() {
  const {
    activeLang,
    activeView,
    globalBG,
    authStyles,
    sections,
    clearAllEditing,
  } = useLandingContext();

  const bgKey = activeView.toLowerCase() as 'web' | 'mob';

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearAllEditing();
    }
  };

  return (
    <div
      className={styles.dashboard__content}
      style={{
        width: activeView === 'MOB' ? '375px' : '100%',
        margin: '0 auto',
        minHeight: '100vh',
        transition: 'width 0.3s ease',
      }}
      onClick={handleBackgroundClick}
    >
      <div
        className={styles.dashboard__landing}
        style={{
          backgroundImage: `url(${globalBG[activeLang]?.[bgKey] || ''})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundAttachment: 'scroll',
          minHeight: '100vh',
        }}
        onClick={handleBackgroundClick}
      >
        <Authorization stylesProp={authStyles[activeView]} />

        <div className={styles.dashboard__builder}>
          {sections.map((s) => (
            <SectionRenderer key={s.id} section={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
