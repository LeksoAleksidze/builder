'use client';

import { Rnd } from 'react-rnd';
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
    headerText,
    updateHeaderTextStyle,
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

  const htStyles = headerText.styles[activeView];

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
        {/* Header Text — flow-based, same as landing */}
        {headerText.content[activeLang] && (
          <div
            style={{
              width: '100%',
              maxWidth: `${htStyles.maxWidth}px`,
              margin: '0 auto',
              paddingTop: `${htStyles.paddingTop}px`,
              paddingBottom: `${htStyles.paddingBottom}px`,
              position: 'relative',
              zIndex: 10,
            }}
          >
            <Rnd
              default={{ x: 0, y: 0, width: htStyles.width, height: 'auto' as unknown as number }}
              size={{ width: htStyles.width, height: 'auto' }}
              position={{ x: 0, y: 0 }}
              disableDragging
              enableResizing={{
                left: true,
                right: true,
                top: false,
                bottom: false,
                topLeft: false,
                topRight: false,
                bottomLeft: false,
                bottomRight: false,
              }}
              onResizeStop={(_e, _dir, ref) => {
                updateHeaderTextStyle('width', ref.offsetWidth);
              }}
              style={{
                position: 'relative',
                margin: '0 auto',
              }}
              minWidth={50}
            >
              <div
                style={{
                  fontSize: `${htStyles.fontSize}px`,
                  lineHeight: htStyles.lineHeight,
                  fontFamily: htStyles.fontFamily,
                  color: htStyles.color,
                  whiteSpace: 'pre-wrap',
                  userSelect: 'none',
                  textAlign: 'center',
                  width: '100%',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                }}
                dangerouslySetInnerHTML={{ __html: headerText.content[activeLang] }}
              />
            </Rnd>
          </div>
        )}

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
