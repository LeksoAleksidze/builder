'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useLandingContext } from '../../context';
import Authorization from '../../../../shared/modules/authorization/Authorization';
import Rules from '../../../../shared/modules/rules/Rules';
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
    endpoints,
    authTexts,
    updateHeaderTextStyle,
    clearAllEditing,
  } = useLandingContext();

  const [showCenterGuide, setShowCenterGuide] = useState(false);
  const landingRef = useRef<HTMLDivElement>(null);
  const [editorWidth, setEditorWidth] = useState(0);

  useEffect(() => {
    const el = landingRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setEditorWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const bgKey = activeView.toLowerCase() as 'web' | 'mob';
  const currentBGImage = globalBG[activeLang]?.[bgKey] || '';
  const currentBGColor = globalBGColor[activeView] || '#1a1a2e';

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearAllEditing();
    }
  };

  const checkCenterAlignment = useCallback((x: number, elWidth: number) => {
    if (!landingRef.current) return;
    const parentWidth = landingRef.current.offsetWidth;
    const elCenterX = x + elWidth / 2;
    const parentCenterX = parentWidth / 2;
    setShowCenterGuide(Math.abs(elCenterX - parentCenterX) < 8);
  }, []);

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

  // Scale header text position proportionally when container resizes
  const htRefW = htStyles.referenceWidth;
  const htScale = htRefW && editorWidth ? editorWidth / htRefW : 1;
  const htDisplayX = htStyles.x * htScale;
  const htDisplayWidth = htStyles.width * htScale;

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
        ref={landingRef}
        className={styles.dashboard__landing}
        style={{
          width: activeView === 'MOB' ? '375px' : '100%',
          margin: '0 auto',
          minHeight: '100vh',
          paddingTop: authStyles[activeView].marginTop,
          position: 'relative',
        }}
        onClick={handleBackgroundClick}
      >
        {/* Vertical center alignment guide */}
        {showCenterGuide && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '50%',
              width: '2px',
              backgroundColor: '#ff00ff',
              pointerEvents: 'none',
              zIndex: 1001,
            }}
          />
        )}

        {/* Header Text — draggable + resizable width */}
        {headerText.content[activeLang] && (
          <div
            style={{
              paddingTop: `${htStyles.paddingTop}px`,
              paddingBottom: `${htStyles.paddingBottom}px`,
              position: 'relative',
              zIndex: 10,
            }}
          >
            <Rnd
              position={{ x: htDisplayX, y: htStyles.y }}
              size={{ width: htDisplayWidth, height: 'auto' }}
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
              onDrag={(_e, d) => {
                checkCenterAlignment(d.x, htDisplayWidth);
              }}
              onDragStop={(_e, d) => {
                setShowCenterGuide(false);
                updateHeaderTextStyle('x', d.x);
                updateHeaderTextStyle('y', d.y);
                updateHeaderTextStyle('referenceWidth', editorWidth || landingRef.current?.offsetWidth || 0);
              }}
              onResizeStop={(_e, _dir, ref, _delta, pos) => {
                updateHeaderTextStyle('width', ref.offsetWidth);
                updateHeaderTextStyle('x', pos.x);
                updateHeaderTextStyle('referenceWidth', editorWidth || landingRef.current?.offsetWidth || 0);
              }}
              style={{ zIndex: 10 }}
              minWidth={50}
            >
              <div
                style={{
                  maxWidth: `${htStyles.maxWidth}px`,
                  fontSize: `${htStyles.fontSize}px`,
                  lineHeight: htStyles.lineHeight,
                  fontFamily: htStyles.fontFamily,
                  color: htStyles.color,
                  cursor: 'move',
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

        <Authorization stylesProp={authStyles[activeView]} texts={authTexts} lang={activeLang} />

        <div className={styles.dashboard__builder}>
          {sections.map((s) => (
            <SectionRenderer key={s.id} section={s} />
          ))}
        </div>

        {endpoints.rulesKey && (
          <Rules
            rulesKey={endpoints.rulesKey}
            rulesBackground={endpoints.rulesBackground}
            lang={activeLang.toLowerCase()}
            paddingTop={endpoints.rulesPaddingTop}
            paddingBottom={endpoints.rulesPaddingBottom}
          />
        )}
      </div>
    </div>
  );
}
