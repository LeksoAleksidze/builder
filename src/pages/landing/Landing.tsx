'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Authorization from '../../shared/modules/authorization/Authorization';
import Rules from '../../shared/modules/rules/Rules';
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
  ButtonElement,
  BoxChildElement,
  Popup,
  PopupTextElement,
  PopupImageElement,
} from '../dashboard/types';
import {
  STORAGE_KEY,
  DEFAULT_GLOBAL_BG,
  DEFAULT_GLOBAL_BG_COLOR,
  DEFAULT_AUTH_STYLES,
  DEFAULT_CLOSE_BUTTON_STYLES,
  DEFAULT_LOCALIZED_CONTENT,
  DEFAULT_HEADER_TEXT,
  DEFAULT_ENDPOINTS_CONFIG,
} from '../dashboard/constants';
import type { HeaderText, EndpointsConfig } from '../dashboard/types';
import styles from './Landing.module.scss';

interface LandingData {
  sections: Section[];
  authStyles: ViewportAuthStyles;
  globalBG: GlobalBackground;
  globalBGColor: ViewportBGColor;
  popups: Popup[];
  backgroundMode?: 'cover' | 'contain' | 'natural';
  headerText?: HeaderText;
  endpoints?: EndpointsConfig;
}

// Popup component for landing page
function LandingPopup({
  popup,
  activeLang,
  activeView,
  triggerSectionId,
  onClose,
}: {
  popup: Popup;
  activeLang: Language;
  activeView: Viewport;
  triggerSectionId: number | null;
  onClose: () => void;
}) {
  useEffect(() => {
    // Scroll triggering section into view
    if (triggerSectionId !== null) {
      const sectionEl = document.querySelector(`[data-section-id="${triggerSectionId}"]`);
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [triggerSectionId]);

  const pst = popup.styles[activeView];
  const closeBtn = popup.closeButton || {
    useImage: false,
    image: DEFAULT_LOCALIZED_CONTENT,
    styles: { WEB: DEFAULT_CLOSE_BUTTON_STYLES.WEB, MOB: DEFAULT_CLOSE_BUTTON_STYLES.MOB },
  };
  const closeBtnStyle = closeBtn.styles?.[activeView] || DEFAULT_CLOSE_BUTTON_STYLES[activeView];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: `${pst.width}px`,
          height: `${pst.height}px`,
          backgroundColor: pst.backgroundImage ? 'transparent' : pst.backgroundColor,
          backgroundImage: pst.backgroundImage ? `url(${pst.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: `${pst.borderRadius}px`,
          border: pst.borderWidth > 0 ? `${pst.borderWidth}px solid ${pst.borderColor}` : 'none',
          position: 'relative',
          overflow: 'visible',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: closeBtnStyle.x === -1 ? '10px' : `${closeBtnStyle.y}px`,
            right: closeBtnStyle.x === -1 ? '10px' : 'auto',
            left: closeBtnStyle.x === -1 ? 'auto' : `${closeBtnStyle.x}px`,
            width: `${closeBtnStyle.width}px`,
            height: `${closeBtnStyle.height}px`,
            borderRadius: `${closeBtnStyle.borderRadius}px`,
            border: 'none',
            background: closeBtn.useImage ? 'transparent' : closeBtnStyle.backgroundColor,
            color: closeBtnStyle.color,
            fontSize: `${closeBtnStyle.fontSize}px`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            overflow: 'hidden',
            padding: 0,
          }}
        >
          {closeBtn.useImage && closeBtn.image[activeLang] ? (
            <img
              src={closeBtn.image[activeLang]}
              alt="close"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            'X'
          )}
        </button>

        {/* Popup children elements */}
        {(popup.children || []).map((child) => {
          const est = child.styles[activeView];

          if (child.type === 'text') {
            const textStyle = est as PopupTextElement['styles']['WEB'];
            return (
              <div
                key={child.id}
                style={{
                  position: 'absolute',
                  left: `${textStyle.x}px`,
                  top: `${textStyle.y}px`,
                  width: `${textStyle.width}px`,
                  height: `${textStyle.height}px`,
                  fontSize: `${textStyle.fontSize}px`,
                  lineHeight: textStyle.lineHeight || 1.4,
                  fontFamily: textStyle.fontFamily,
                  color: textStyle.color,
                  textShadow: textStyle.textShadow || 'none',
                  textAlign: textStyle.textAlign || 'left',
                  zIndex: textStyle.zIndex || 1,
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflow: 'hidden',
                }}
                dangerouslySetInnerHTML={{ __html: child.content[activeLang] || '' }}
              />
            );
          }

          const imgStyle = est as PopupImageElement['styles']['WEB'];
          return (
            <img
              key={child.id}
              src={child.content[activeLang] || ''}
              alt=""
              style={{
                position: 'absolute',
                left: `${imgStyle.x}px`,
                top: `${imgStyle.y}px`,
                width: `${imgStyle.width}px`,
                height: `${imgStyle.height}px`,
                objectFit: 'cover',
                borderRadius: `${imgStyle.borderRadius || 0}px`,
                zIndex: imgStyle.zIndex || 1,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Render a single element (text, image, box, or button)
function LandingElement({
  element,
  activeLang,
  activeView,
  sectionId,
  onOpenPopup,
}: {
  element: Element;
  activeLang: Language;
  activeView: Viewport;
  sectionId: number;
  onOpenPopup: (popupId: number, sectionId: number) => void;
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
          backgroundColor: boxStyle.backgroundImage ? 'transparent' : boxStyle.backgroundColor,
          backgroundImage: boxStyle.backgroundImage ? `url(${boxStyle.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: boxStyle.borderWidth > 0 ? `${boxStyle.borderWidth}px solid ${boxStyle.borderColor}` : 'none',
          borderRadius: `${boxStyle.borderRadius}px`,
          zIndex: boxStyle.zIndex || 1,
          overflow: 'hidden',
        }}
      >
        {boxEl.children.map((child) => (
          <LandingChildElement
            key={child.id}
            child={child}
            activeLang={activeLang}
            activeView={activeView}
            sectionId={sectionId}
            onOpenPopup={onOpenPopup}
          />
        ))}
      </div>
    );
  }

  // Render button element
  if (element.type === 'button') {
    const btnEl = element as ButtonElement;
    const btnStyle = btnEl.styles[activeView];

    const handleClick = () => {
      if (btnEl.action.type === 'link' && btnEl.action.value) {
        window.open(btnEl.action.value, '_blank');
      } else if (btnEl.action.type === 'popup' && btnEl.action.value) {
        onOpenPopup(Number(btnEl.action.value), sectionId);
      }
    };

    return (
      <button
        onClick={handleClick}
        style={{
          position: 'absolute',
          left: `${btnStyle.x}px`,
          top: `${btnStyle.y}px`,
          width: `${btnStyle.width}px`,
          height: `${btnStyle.height}px`,
          backgroundColor: btnEl.useImage ? 'transparent' : btnStyle.backgroundColor,
          border: btnEl.useImage ? 'none' : `${btnStyle.borderWidth}px solid ${btnStyle.borderColor}`,
          borderRadius: `${btnStyle.borderRadius}px`,
          fontSize: `${btnStyle.fontSize}px`,
          lineHeight: btnStyle.lineHeight || 1.4,
          fontFamily: btnStyle.fontFamily,
          color: btnStyle.color,
          cursor: 'pointer',
          zIndex: btnStyle.zIndex || 1,
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {btnEl.useImage && btnEl.image[activeLang] ? (
          <img
            src={btnEl.image[activeLang]}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          btnEl.content[activeLang] || ''
        )}
      </button>
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
          lineHeight: textStyle.lineHeight || 1.4,
          fontFamily: textStyle.fontFamily,
          color: textStyle.color,
          textShadow: textStyle.textShadow || 'none',
          textAlign: textStyle.textAlign || 'left',
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
  sectionId,
  onOpenPopup,
}: {
  child: BoxChildElement;
  activeLang: Language;
  activeView: Viewport;
  sectionId: number;
  onOpenPopup: (popupId: number, sectionId: number) => void;
}) {
  // Button child
  if (child.type === 'button') {
    const btnEl = child as ButtonElement;
    const btnStyle = btnEl.styles[activeView];

    const handleClick = () => {
      if (btnEl.action.type === 'link' && btnEl.action.value) {
        window.open(btnEl.action.value, '_blank');
      } else if (btnEl.action.type === 'popup' && btnEl.action.value) {
        onOpenPopup(Number(btnEl.action.value), sectionId);
      }
    };

    return (
      <button
        onClick={handleClick}
        style={{
          position: 'absolute',
          left: `${btnStyle.x}px`,
          top: `${btnStyle.y}px`,
          width: `${btnStyle.width}px`,
          height: `${btnStyle.height}px`,
          backgroundColor: btnEl.useImage ? 'transparent' : btnStyle.backgroundColor,
          border: btnEl.useImage ? 'none' : `${btnStyle.borderWidth}px solid ${btnStyle.borderColor}`,
          borderRadius: `${btnStyle.borderRadius}px`,
          fontSize: `${btnStyle.fontSize}px`,
          lineHeight: btnStyle.lineHeight || 1.4,
          fontFamily: btnStyle.fontFamily,
          color: btnStyle.color,
          cursor: 'pointer',
          zIndex: btnStyle.zIndex || 1,
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {btnEl.useImage && btnEl.image[activeLang] ? (
          <img
            src={btnEl.image[activeLang]}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          btnEl.content[activeLang] || ''
        )}
      </button>
    );
  }

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
          lineHeight: (textStyle as TextElement['styles']['WEB']).lineHeight || 1.4,
          fontFamily: (textStyle as TextElement['styles']['WEB']).fontFamily,
          color: (textStyle as TextElement['styles']['WEB']).color,
          textShadow: (textStyle as TextElement['styles']['WEB']).textShadow || 'none',
          textAlign: (textStyle as TextElement['styles']['WEB']).textAlign || 'left',
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
  const [activePopupId, setActivePopupId] = useState<number | null>(null);
  const [popupTriggerSectionId, setPopupTriggerSectionId] = useState<number | null>(null);
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

          // Migrate popups if needed
          const popups = (parsed.popups || []).map((p: Popup) => {
            if (!p.children) p.children = [];
            if (!p.closeButton) {
              p.closeButton = {
                useImage: false,
                image: { ...DEFAULT_LOCALIZED_CONTENT },
                styles: {
                  WEB: { ...DEFAULT_CLOSE_BUTTON_STYLES.WEB },
                  MOB: { ...DEFAULT_CLOSE_BUTTON_STYLES.MOB },
                },
              };
            }
            return p;
          });

          setData({
            sections: parsed.sections || [],
            authStyles,
            globalBG: parsed.globalBG || DEFAULT_GLOBAL_BG,
            globalBGColor: { ...DEFAULT_GLOBAL_BG_COLOR, ...(parsed.globalBGColor || {}) },
            popups,
            backgroundMode: parsed.backgroundMode || 'cover',
            headerText: parsed.headerText || DEFAULT_HEADER_TEXT,
            endpoints: { ...DEFAULT_ENDPOINTS_CONFIG, ...(parsed.endpoints || {}) },
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

  const openPopup = (popupId: number, sectionId?: number) => {
    setPopupTriggerSectionId(sectionId ?? null);
    setActivePopupId(popupId);
    document.body.style.overflow = 'hidden';
  };

  const closePopup = () => {
    setActivePopupId(null);
    setPopupTriggerSectionId(null);
    document.body.style.overflow = '';
  };

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

  // Background style based on mode
  const getBackgroundStyle = () => {
    if (!currentBGImage) return {};

    if (data.backgroundMode === 'natural') {
      return {
        backgroundImage: `url(${currentBGImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '50% 0',
        backgroundSize: 'auto',
      };
    }

    if (data.backgroundMode === 'contain') {
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

  const activePopup = activePopupId !== null ? data.popups.find((p) => p.id === activePopupId) : null;

  return (
    <div
      className={styles.wrapper}
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: currentBGColor,
        ...getBackgroundStyle(),
      }}
    >
      <div
        className={styles.landing}
        style={{
          width: activeView === 'MOB' ? '375px' : '100%',
          margin: '0 auto',
          minHeight: '100vh',
          paddingTop: data.authStyles[activeView].marginTop,
          position: 'relative',
        }}
      >
        {/* Header Text — in normal flow, responsive */}
        {data.headerText && data.headerText.content[activeLang] && (() => {
          const ht = data.headerText!.styles[activeView];
          return (
            <div
              style={{
                width: '100%',
                maxWidth: `${ht.maxWidth}px`,
                margin: '0 auto',
                paddingTop: `${ht.paddingTop}px`,
                paddingBottom: `${ht.paddingBottom}px`,
                zIndex: 10,
                position: 'relative',
              }}
            >
              <div
                style={{
                  maxWidth: `${ht.width}px`,
                  margin: '0 auto',
                  fontSize: `${ht.fontSize}px`,
                  lineHeight: ht.lineHeight,
                  fontFamily: ht.fontFamily,
                  color: ht.color,
                  whiteSpace: 'pre-wrap',
                  textAlign: 'center',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                }}
                dangerouslySetInnerHTML={{ __html: data.headerText!.content[activeLang] }}
              />
            </div>
          );
        })()}

        <Authorization stylesProp={data.authStyles[activeView]} />

        <div className={styles.builder}>
          {data.sections.map((section) => {
            const st = section.styles[activeView];
            return (
              <div
                key={section.id}
                data-section-id={section.id}
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
                  overflow: 'visible',
                  zIndex: st.zIndex || 1,
                }}
              >
                {section.elements.map((el) => (
                  <LandingElement
                    key={el.id}
                    element={el}
                    activeLang={activeLang}
                    activeView={activeView}
                    sectionId={section.id}
                    onOpenPopup={openPopup}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {data.endpoints?.rulesKey && (
          <Rules
            rulesKey={data.endpoints.rulesKey}
            rulesBackground={data.endpoints.rulesBackground}
            lang={activeLang.toLowerCase()}
            paddingTop={data.endpoints.rulesPaddingTop}
            paddingBottom={data.endpoints.rulesPaddingBottom}
          />
        )}
      </div>

      {/* Popup */}
      {activePopup && (
        <LandingPopup
          popup={activePopup}
          activeLang={activeLang}
          activeView={activeView}
          triggerSectionId={popupTriggerSectionId}
          onClose={closePopup}
        />
      )}
    </div>
  );
}
