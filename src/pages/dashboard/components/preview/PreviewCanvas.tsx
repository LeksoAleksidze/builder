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
    globalBGColor,
    backgroundMode,
    authStyles,
    sections,
    clearAllEditing,
  } = useLandingContext();

  const bgKey = activeView.toLowerCase() as 'web' | 'mob';
  const currentBGImage = globalBG[activeLang]?.[bgKey] || '';
  const currentBGColor = globalBGColor[activeView] || '#1a1a2e';

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearAllEditing();
    }
  };

  // Background style based on mode
  const getBackgroundStyle = () => {
    if (!currentBGImage) return {};

    if (backgroundMode === 'natural') {
      return {
        backgroundImage: `url(${currentBGImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '50% 0',
        backgroundSize: 'auto',
      };
    }

    if (backgroundMode === 'contain') {
      return {
        backgroundImage: `url(${currentBGImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top center',
        backgroundSize: 'contain',
      };
    }

    // Default: cover
    return {
      backgroundImage: `url(${currentBGImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'top center',
      backgroundRepeat: 'no-repeat',
    };
  };

  return (
    <div
      className={styles.dashboard__content}
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: currentBGColor,
        ...getBackgroundStyle(),
        transition: 'all 0.3s ease',
      }}
      onClick={handleBackgroundClick}
    >
      <div
        className={styles.dashboard__landing}
        style={{
          width: activeView === 'MOB' ? '375px' : '100%',
          margin: '0 auto',
          minHeight: '100vh',
          paddingTop: authStyles[activeView].marginTop,
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
