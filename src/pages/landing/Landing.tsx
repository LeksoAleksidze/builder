'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Authorization from '../../shared/modules/authorization/Authorization';
import type {
  Section,
  GlobalBackground,
  ViewportBGColor,
  ViewportAuthStyles,
  Language,
  Viewport,
  Element,
  BoxElement,
  TextElement,
  ImageElement,
  BoxChildElement,
} from '../dashboard/types';
import {
  STORAGE_KEY,
  DEFAULT_GLOBAL_BG,
  DEFAULT_GLOBAL_BG_COLOR,
  DEFAULT_AUTH_STYLES,
} from '../dashboard/constants';
import styles from './Landing.module.scss';

interface LandingData {
  sections: Section[];
  authStyles: ViewportAuthStyles;
  globalBG: GlobalBackground;
  globalBGColor: ViewportBGColor;
}

// Render a single element (text, image, or box)
function LandingElement({
  element,
  activeLang,
  activeView,
}: {
  element: Element;
  activeLang: Language;
  activeView: Viewport;
}) {
  // Render box element
  if (element.type === 'box') {
    const boxEl = element as BoxElement;
    const boxStyle = boxEl.styles[activeView];

    return (
      <div
        style={{
          position: 'absolute',
          left: `${boxStyle.x}px`,
          top: `${boxStyle.y}px`,
          width: `${boxStyle.width}px`,
          height: `${boxStyle.height}px`,
          backgroundColor: boxStyle.backgroundColor,
          border: `${boxStyle.borderWidth}px solid ${boxStyle.borderColor}`,
          borderRadius: `${boxStyle.borderRadius}px`,
          zIndex: boxStyle.zIndex || 1,
          overflow: 'hidden',
        }}
      >
        {boxEl.children.map((child) => (
          <LandingChildElement key={child.id} child={child} activeLang={activeLang} activeView={activeView} />
        ))}
      </div>
    );
  }

  // Render text element
  if (element.type === 'text') {
    const textEl = element as TextElement;
    const textStyle = textEl.styles[activeView];

    return (
      <div
        style={{
          position: 'absolute',
          left: `${textStyle.x}px`,
          top: `${textStyle.y}px`,
          width: `${textStyle.width}px`,
          height: `${textStyle.height}px`,
          fontSize: `${textStyle.fontSize}px`,
          fontFamily: textStyle.fontFamily,
          color: textStyle.color,
          textShadow: textStyle.textShadow || 'none',
          zIndex: textStyle.zIndex || 1,
        }}
        dangerouslySetInnerHTML={{ __html: textEl.content[activeLang] || '' }}
      />
    );
  }

  // Render image element
  const imgEl = element as ImageElement;
  const imgStyle = imgEl.styles[activeView];

  return (
    <div
      style={{
        position: 'absolute',
        left: `${imgStyle.x}px`,
        top: `${imgStyle.y}px`,
        width: `${imgStyle.width}px`,
        height: `${imgStyle.height}px`,
        zIndex: imgStyle.zIndex || 1,
      }}
    >
      <img
        src={imgEl.content[activeLang] || ''}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: `${imgStyle.borderRadius || 0}px`,
        }}
        alt=""
      />
    </div>
  );
}

// Render child elements inside a box
function LandingChildElement({
  child,
  activeLang,
  activeView,
}: {
  child: BoxChildElement;
  activeLang: Language;
  activeView: Viewport;
}) {
  if (child.type === 'text') {
    const textStyle = child.styles[activeView];

    return (
      <div
        style={{
          position: 'absolute',
          left: `${textStyle.x}px`,
          top: `${textStyle.y}px`,
          width: `${textStyle.width}px`,
          height: `${textStyle.height}px`,
          fontSize: `${(textStyle as TextElement['styles']['WEB']).fontSize}px`,
          fontFamily: (textStyle as TextElement['styles']['WEB']).fontFamily,
          color: (textStyle as TextElement['styles']['WEB']).color,
          textShadow: (textStyle as TextElement['styles']['WEB']).textShadow || 'none',
          zIndex: textStyle.zIndex || 1,
        }}
        dangerouslySetInnerHTML={{ __html: child.content[activeLang] || '' }}
      />
    );
  }

  // Image child
  const imgStyle = child.styles[activeView];

  return (
    <div
      style={{
        position: 'absolute',
        left: `${imgStyle.x}px`,
        top: `${imgStyle.y}px`,
        width: `${imgStyle.width}px`,
        height: `${imgStyle.height}px`,
        zIndex: imgStyle.zIndex || 1,
      }}
    >
      <img
        src={child.content[activeLang] || ''}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: `${(imgStyle as ImageElement['styles']['WEB']).borderRadius || 0}px`,
        }}
        alt=""
      />
    </div>
  );
}

export default function LandingPage() {
  const { key, lang } = useParams<{ key: string; lang?: string }>();

  // ge ან ka = GE
  const getLanguage = (l?: string): Language => {
    if (!l) return 'GE';
    const normalized = l.toUpperCase();
    if (normalized === 'KA' || normalized === 'GE') return 'GE';
    if (normalized === 'EN') return 'EN';
    if (normalized === 'RU') return 'RU';
    if (normalized === 'TR') return 'TR';
    return 'GE';
  };

  const [data, setData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeLang = getLanguage(lang);
  const [activeView, setActiveView] = useState<Viewport>('WEB');

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: მომავალში API-დან ჩატვირთვა key-ით
        // const response = await fetch(`/api/landing/${key}`);
        // const config = await response.json();

        // ჯერჯერობით localStorage-დან
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
          const parsed = JSON.parse(saved);

          // Merge authStyles with defaults to ensure new properties have values
          const authStyles: ViewportAuthStyles = {
            WEB: { ...DEFAULT_AUTH_STYLES.WEB, ...(parsed.authStyles?.WEB || {}) },
            MOB: { ...DEFAULT_AUTH_STYLES.MOB, ...(parsed.authStyles?.MOB || {}) },
          };

          setData({
            sections: parsed.sections || [],
            authStyles,
            globalBG: parsed.globalBG || DEFAULT_GLOBAL_BG,
            globalBGColor: { ...DEFAULT_GLOBAL_BG_COLOR, ...(parsed.globalBGColor || {}) },
          });
        } else {
          setError('კონფიგურაცია ვერ მოიძებნა');
        }
      } catch (err) {
        setError('კონფიგურაციის ჩატვირთვა ვერ მოხერხდა');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [key]);

  useEffect(() => {
    const checkViewport = () => {
      setActiveView(window.innerWidth <= 768 ? 'MOB' : 'WEB');
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>იტვირთება...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.error}>
        <div className={styles.errorIcon}>!</div>
        <p>{error || 'კონფიგურაცია ვერ მოიძებნა'}</p>
        {key && <span className={styles.errorKey}>Key: {key}</span>}
      </div>
    );
  }

  const bgKey = activeView.toLowerCase() as 'web' | 'mob';
  const currentBGImage = data.globalBG[activeLang]?.[bgKey] || '';
  const currentBGColor = data.globalBGColor[activeView] || '#1a1a2e';

  return (
    <div
      className={styles.wrapper}
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: currentBGColor,
        backgroundImage: currentBGImage ? `url(${currentBGImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className={styles.landing}
        style={{
          width: activeView === 'MOB' ? '375px' : '100%',
          margin: '0 auto',
          minHeight: '100vh',
          paddingTop: data.authStyles[activeView].marginTop,
        }}
      >
        <Authorization stylesProp={data.authStyles[activeView]} />

        <div className={styles.builder}>
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
                {section.elements.map((el) => (
                  <LandingElement key={el.id} element={el} activeLang={activeLang} activeView={activeView} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
