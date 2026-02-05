'use client';

import { useState, useEffect } from 'react';
import Authorization from '../../shared/modules/authorization/Authorization';
import type {
  Section,
  GlobalBackground,
  ViewportAuthStyles,
  Language,
  Viewport,
} from '../dashboard/types';
import {
  STORAGE_KEY,
  DEFAULT_GLOBAL_BG,
  DEFAULT_AUTH_STYLES,
} from '../dashboard/constants';
import styles from './Landing.module.scss';

interface LandingData {
  sections: Section[];
  authStyles: ViewportAuthStyles;
  globalBG: GlobalBackground;
}

export default function LandingPage() {
  const [data, setData] = useState<LandingData | null>(null);
  const [activeLang, setActiveLang] = useState<Language>('GE');
  const [activeView, setActiveView] = useState<Viewport>('WEB');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setData({
        sections: parsed.sections || [],
        authStyles: parsed.authStyles || DEFAULT_AUTH_STYLES,
        globalBG: parsed.globalBG || DEFAULT_GLOBAL_BG,
      });
    }
  }, []);

  useEffect(() => {
    const checkViewport = () => {
      setActiveView(window.innerWidth <= 768 ? 'MOB' : 'WEB');
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  if (!data) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  const bgKey = activeView.toLowerCase() as 'web' | 'mob';
  const currentBG = data.globalBG[activeLang]?.[bgKey] || '';

  return (
    <div className={styles.landing}>
      {/* Language Switcher */}
      <div className={styles.langSwitcher}>
        {(['GE', 'EN', 'RU', 'TR'] as Language[]).map((lang) => (
          <button
            key={lang}
            className={`${styles.langBtn} ${activeLang === lang ? styles['langBtn--active'] : ''}`}
            onClick={() => setActiveLang(lang)}
          >
            {lang}
          </button>
        ))}
      </div>

      <div
        className={styles.content}
        style={{
          backgroundImage: currentBG ? `url(${currentBG})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundAttachment: 'scroll',
        }}
      >
        <Authorization stylesProp={data.authStyles[activeView]} />

        <div className={styles.sections}>
          {data.sections.map((section) => {
            const st = section.styles[activeView];
            return (
              <div
                key={section.id}
                style={{
                  width: st.width || '100%',
                  height: st.height ? `${st.height}px` : 'auto',
                  marginTop: `${st.marginTop || 0}px`,
                  marginBottom: `${st.marginBottom || 0}px`,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  backgroundColor: st.backgroundColor || 'transparent',
                  border: `${st.borderWidth || 0}px solid ${st.borderColor || 'transparent'}`,
                  borderRadius: `${st.borderRadius || 0}px`,
                  backgroundImage: st.backgroundImage ? `url(${st.backgroundImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  zIndex: st.zIndex || 1,
                }}
              >
                {section.elements.map((el) => {
                  const est = el.styles[activeView];
                  return (
                    <div
                      key={el.id}
                      style={{
                        position: 'absolute',
                        left: `${est.x}px`,
                        top: `${est.y}px`,
                        width: `${est.width}px`,
                        height: `${est.height}px`,
                        zIndex: est.zIndex || 1,
                      }}
                    >
                      {el.type === 'text' ? (
                        <div
                          style={{
                            fontSize: `${(est as { fontSize: number }).fontSize}px`,
                            fontFamily: (est as { fontFamily: string }).fontFamily,
                            color: (est as { color: string }).color,
                            textShadow: (est as { textShadow?: string }).textShadow || 'none',
                            width: '100%',
                            height: '100%',
                          }}
                          dangerouslySetInnerHTML={{
                            __html: el.content[activeLang] || '',
                          }}
                        />
                      ) : (
                        <img
                          src={el.content[activeLang] || ''}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: `${(est as { borderRadius: number }).borderRadius || 0}px`,
                          }}
                          alt=""
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
