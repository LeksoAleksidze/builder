import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Authorization from '../../shared/modules/authorization/Authorization';
import Rules from '../../shared/modules/rules/Rules';
import type {
  Section,
  Element,
  TextElement,
  ImageElement,
  BoxElement,
  ButtonElement,
  BoxChildElement,
  Popup,
  PopupCloseButton,
  Language,
  Viewport,
  HeaderText,
  EndpointsConfig,
  AuthTexts,
  AuthVisibility,
  ViewportAuthStyles,
  GlobalBackground,
  ViewportBGColor,
} from '../dashboard/types';
import styles from './Landing.module.scss';

interface ProdConfig {
  sections: Section[];
  authStyles: ViewportAuthStyles;
  globalBG: GlobalBackground;
  globalBGColor: ViewportBGColor;
  backgroundMode?: 'cover' | 'contain' | 'natural';
  popups: Popup[];
  headerText?: HeaderText;
  endpoints?: EndpointsConfig;
  authBlockVisibility?: AuthVisibility;
  authTexts?: AuthTexts;
}

function getLanguage(l?: string): Language {
  if (!l) return 'EN';
  const n = l.toUpperCase();
  if (n === 'KA' || n === 'GE') return 'GE';
  if (n === 'EN') return 'EN';
  if (n === 'RU') return 'RU';
  if (n === 'TR') return 'TR';
  return 'EN';
}

function isUserAuthorized(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has('ftk') || params.has('tk');
}

function shouldShow(visibility: AuthVisibility | undefined, authorized: boolean): boolean {
  if (!visibility || visibility === 'all') return true;
  if (visibility === 'auth') return authorized;
  return !authorized;
}

export default function LandingPage() {
  const { lang } = useParams<{ lang: string }>();
  const [activeLang, setActiveLang] = useState<Language>(() => getLanguage(lang));
  const [data, setData] = useState<ProdConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<Viewport>('WEB');
  const [activePopupId, setActivePopupId] = useState<number | null>(null);
  const [popupTriggerSectionId, setPopupTriggerSectionId] = useState<number | null>(null);
  const isAuthorized = isUserAuthorized();

  // Sync language from URL param without page refresh
  useEffect(() => {
    setActiveLang(getLanguage(lang));
  }, [lang]);

  // Measure container width for proportional header text positioning
  const containerRef = useRef<HTMLDivElement>(null);
  const initialWidthRef = useRef(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (initialWidthRef.current === 0) initialWidthRef.current = w;
      setContainerWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  // Load config.json from local (Vite public/)
  useEffect(() => {
    const BASE = import.meta.env.BASE_URL || '/';
    fetch(`${BASE}config.json`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.text();
      })
      .then((text) => {
        const resolved = text.replace(/"assets\//g, `"${BASE}assets/`);
        setData(JSON.parse(resolved));
      })
      .catch(() => setError('კონფიგურაციის ჩატვირთვა ვერ მოხერხდა'))
      .finally(() => setLoading(false));
  }, []);

  // Viewport detection
  useEffect(() => {
    const check = () => setActiveView(window.innerWidth <= 768 ? 'MOB' : 'WEB');
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Popup helpers
  const openPopup = (popupId: number, sectionId: number) => {
    setPopupTriggerSectionId(sectionId);
    setActivePopupId(popupId);
    document.body.style.overflow = 'hidden';
  };
  const closePopup = () => {
    setActivePopupId(null);
    setPopupTriggerSectionId(null);
    document.body.style.overflow = '';
  };

  if (loading) {
    return <div className={styles.landing__empty}><p>იტვირთება...</p></div>;
  }
  if (error || !data) {
    return <div className={styles.landing__empty}><p>{error || 'კონფიგურაცია ვერ მოიძებნა'}</p></div>;
  }

  const bgKey = activeView.toLowerCase() as 'web' | 'mob';
  const currentBGImage = data.globalBG[activeLang]?.[bgKey] || '';
  const currentBGColor = data.globalBGColor?.[activeView] || '#1a1a2e';

  const getBackgroundStyle = (): React.CSSProperties => {
    if (!currentBGImage) return {};
    if (data.backgroundMode === 'natural') {
      return { backgroundImage: `url(${currentBGImage})`, backgroundRepeat: 'no-repeat', backgroundPosition: '50% 0', backgroundSize: 'auto' };
    }
    if (data.backgroundMode === 'contain') {
      return { backgroundImage: `url(${currentBGImage})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'top center', backgroundSize: 'contain' };
    }
    return { backgroundImage: `url(${currentBGImage})`, backgroundSize: 'cover', backgroundPosition: 'top center', backgroundRepeat: 'no-repeat' };
  };

  const ht = data.headerText;
  const htStyle = ht?.styles?.[activeView];
  const activePopup = activePopupId !== null ? data.popups?.find((p) => p.id === activePopupId) : null;

  return (
    <div
      className={styles.landing}
      style={{ width: '100%', minHeight: '100vh', backgroundColor: currentBGColor, ...getBackgroundStyle() }}
    >
      <div
        ref={containerRef}
        style={{
          width: activeView === 'MOB' ? '375px' : '100%',
          margin: '0 auto',
          minHeight: '100vh',
          paddingTop: data.authStyles[activeView].marginTop,
          position: 'relative',
        }}
      >
        {/* Header Text — positioned proportionally to container width */}
        {ht && htStyle && ht.content[activeLang] && (() => {
          const refW = htStyle.referenceWidth || initialWidthRef.current;
          const scale = refW && containerWidth ? containerWidth / refW : 1;
          const scaledX = htStyle.x * scale;
          const scaledWidth = htStyle.width * scale;
          return (
          <div
            style={{
              paddingTop: `${htStyle.paddingTop}px`,
              paddingBottom: `${htStyle.paddingBottom}px`,
              position: 'relative',
              zIndex: 10,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: `${scaledX}px`,
                top: `${htStyle.y}px`,
                width: `${scaledWidth}px`,
              }}
            >
              <div
                style={{
                  maxWidth: `${htStyle.maxWidth}px`,
                  fontSize: `${htStyle.fontSize}px`,
                  lineHeight: htStyle.lineHeight,
                  fontFamily: htStyle.fontFamily,
                  color: htStyle.color,
                  whiteSpace: 'pre-wrap',
                  textAlign: 'center',
                  width: '100%',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                }}
                dangerouslySetInnerHTML={{ __html: ht.content[activeLang] }}
              />
            </div>
          </div>
          );
        })()}

        {/* Authorization */}
        {shouldShow(data.authBlockVisibility, isAuthorized) && (
          <Authorization stylesProp={data.authStyles[activeView]} texts={data.authTexts} lang={activeLang} />
        )}

        {/* Sections */}
        <div className={styles.landing__content}>
          {data.sections.filter((s) => shouldShow(s.visibility, isAuthorized)).map((section) => (
            <ProdSection key={section.id} section={section} activeView={activeView} activeLang={activeLang} isAuthorized={isAuthorized} onOpenPopup={openPopup} />
          ))}
        </div>

        {/* Rules */}
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

      {/* Popup overlay */}
      {activePopup && (
        <ProdPopup popup={activePopup} activeLang={activeLang} activeView={activeView} triggerSectionId={popupTriggerSectionId} onClose={closePopup} />
      )}
    </div>
  );
}

/* ─── Section ─── */

function ProdSection({ section, activeView, activeLang, isAuthorized, onOpenPopup }: {
  section: Section; activeView: Viewport; activeLang: Language; isAuthorized: boolean;
  onOpenPopup: (popupId: number, sectionId: number) => void;
}) {
  const st = section.styles[activeView];
  return (
    <div
      className={styles.landing__section}
      data-section-id={section.id}
      style={{
        width: st.width || '100%',
        height: st.height ? `${st.height}px` : 'auto',
        marginTop: `${st.marginTop || 0}px`,
        marginBottom: `${st.marginBottom || 0}px`,
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: st.backgroundImage ? 'transparent' : (st.backgroundColor || 'transparent'),
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
      {section.elements.filter((el) => shouldShow(el.visibility, isAuthorized)).map((el) => (
        <ProdElement key={el.id} element={el} sectionId={section.id} activeView={activeView} activeLang={activeLang} isAuthorized={isAuthorized} onOpenPopup={onOpenPopup} />
      ))}
    </div>
  );
}

/* ─── Element (text / image / button / box) ─── */

function ProdElement({ element, sectionId, activeView, activeLang, isAuthorized, onOpenPopup }: {
  element: Element; sectionId: number; activeView: Viewport; activeLang: Language; isAuthorized: boolean;
  onOpenPopup: (popupId: number, sectionId: number) => void;
}) {
  // Box
  if (element.type === 'box') {
    const box = element as BoxElement;
    const bs = box.styles[activeView];
    return (
      <div
        style={{
          position: 'absolute',
          left: `${bs.x}px`,
          top: `${bs.y}px`,
          width: `${bs.width}px`,
          height: `${bs.height}px`,
          backgroundColor: bs.backgroundImage ? 'transparent' : bs.backgroundColor,
          backgroundImage: bs.backgroundImage ? `url(${bs.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: bs.borderWidth > 0 ? `${bs.borderWidth}px solid ${bs.borderColor}` : 'none',
          borderRadius: `${bs.borderRadius}px`,
          zIndex: bs.zIndex || 1,
          overflow: 'hidden',
        }}
      >
        {box.children.filter((c) => shouldShow(c.visibility, isAuthorized)).map((child) => (
          <ProdBoxChild key={child.id} child={child} sectionId={sectionId} activeView={activeView} activeLang={activeLang} onOpenPopup={onOpenPopup} />
        ))}
      </div>
    );
  }

  // Button
  if (element.type === 'button') {
    const btn = element as ButtonElement;
    const bs = btn.styles[activeView];
    const handleClick = () => {
      if (btn.action.type === 'link' && btn.action.value) {
        window.open(btn.action.value, '_blank');
      } else if (btn.action.type === 'popup' && btn.action.value) {
        onOpenPopup(Number(btn.action.value), sectionId);
      }
    };
    return (
      <button
        onClick={handleClick}
        style={{
          position: 'absolute',
          left: `${bs.x}px`,
          top: `${bs.y}px`,
          width: `${bs.width}px`,
          height: `${bs.height}px`,
          backgroundColor: btn.useImage ? 'transparent' : bs.backgroundColor,
          border: btn.useImage ? 'none' : `${bs.borderWidth}px solid ${bs.borderColor}`,
          borderRadius: `${bs.borderRadius}px`,
          fontSize: `${bs.fontSize}px`,
          lineHeight: bs.lineHeight || 1.4,
          fontFamily: bs.fontFamily,
          color: bs.color,
          cursor: 'pointer',
          zIndex: bs.zIndex || 1,
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {btn.useImage && btn.image[activeLang] ? (
          <img src={btn.image[activeLang]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          btn.content[activeLang] || ''
        )}
      </button>
    );
  }

  // Text
  if (element.type === 'text') {
    const txt = element as TextElement;
    const ts = txt.styles[activeView];
    return (
      <div
        style={{
          position: 'absolute',
          left: `${ts.x}px`,
          top: `${ts.y}px`,
          width: `${ts.width}px`,
          height: `${ts.height}px`,
          fontSize: `${ts.fontSize}px`,
          lineHeight: ts.lineHeight || 1.4,
          fontFamily: ts.fontFamily,
          color: ts.color,
          textShadow: ts.textShadow || 'none',
          textAlign: ts.textAlign || 'left',
          zIndex: ts.zIndex || 1,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
        dangerouslySetInnerHTML={{ __html: txt.content[activeLang] || '' }}
      />
    );
  }

  // Image
  const img = element as ImageElement;
  const is = img.styles[activeView];
  return (
    <div style={{ position: 'absolute', left: `${is.x}px`, top: `${is.y}px`, width: `${is.width}px`, height: `${is.height}px`, zIndex: is.zIndex || 1 }}>
      <img src={img.content[activeLang] || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: `${is.borderRadius || 0}px` }} />
    </div>
  );
}

/* ─── Box Child (text / image / button) ─── */

function ProdBoxChild({ child, sectionId, activeView, activeLang, onOpenPopup }: {
  child: BoxChildElement; sectionId: number; activeView: Viewport; activeLang: Language;
  onOpenPopup: (popupId: number, sectionId: number) => void;
}) {
  if (child.type === 'button') {
    const btn = child as ButtonElement;
    const bs = btn.styles[activeView];
    const handleClick = () => {
      if (btn.action.type === 'link' && btn.action.value) window.open(btn.action.value, '_blank');
      else if (btn.action.type === 'popup' && btn.action.value) onOpenPopup(Number(btn.action.value), sectionId);
    };
    return (
      <button
        onClick={handleClick}
        style={{
          position: 'absolute',
          left: `${bs.x}px`,
          top: `${bs.y}px`,
          width: `${bs.width}px`,
          height: `${bs.height}px`,
          backgroundColor: btn.useImage ? 'transparent' : bs.backgroundColor,
          border: btn.useImage ? 'none' : `${bs.borderWidth}px solid ${bs.borderColor}`,
          borderRadius: `${bs.borderRadius}px`,
          fontSize: `${bs.fontSize}px`,
          lineHeight: bs.lineHeight || 1.4,
          fontFamily: bs.fontFamily,
          color: bs.color,
          cursor: 'pointer',
          zIndex: bs.zIndex || 1,
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {btn.useImage && btn.image[activeLang] ? (
          <img src={btn.image[activeLang]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          btn.content[activeLang] || ''
        )}
      </button>
    );
  }

  if (child.type === 'text') {
    const txt = child as TextElement;
    const ts = txt.styles[activeView];
    return (
      <div
        style={{
          position: 'absolute',
          left: `${ts.x}px`,
          top: `${ts.y}px`,
          width: `${ts.width}px`,
          height: `${ts.height}px`,
          fontSize: `${ts.fontSize}px`,
          lineHeight: ts.lineHeight || 1.4,
          fontFamily: ts.fontFamily,
          color: ts.color,
          textShadow: ts.textShadow || 'none',
          textAlign: ts.textAlign || 'left',
          zIndex: ts.zIndex || 1,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflow: 'hidden',
        }}
        dangerouslySetInnerHTML={{ __html: txt.content[activeLang] || '' }}
      />
    );
  }

  // Image
  const img = child as ImageElement;
  const is = img.styles[activeView];
  return (
    <div style={{ position: 'absolute', left: `${is.x}px`, top: `${is.y}px`, width: `${is.width}px`, height: `${is.height}px`, zIndex: is.zIndex || 1 }}>
      <img src={img.content[activeLang] || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: `${is.borderRadius || 0}px` }} />
    </div>
  );
}

/* ─── Popup ─── */

function ProdPopup({ popup, activeLang, activeView, triggerSectionId, onClose }: {
  popup: Popup; activeLang: Language; activeView: Viewport; triggerSectionId: number | null; onClose: () => void;
}) {
  useEffect(() => {
    if (triggerSectionId !== null) {
      const el = document.querySelector(`[data-section-id="${triggerSectionId}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [triggerSectionId]);

  const pst = popup.styles[activeView];
  const closeBtn: PopupCloseButton | undefined = popup.closeButton;
  const closeBtnStyle = closeBtn?.styles?.[activeView];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
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
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: closeBtnStyle && closeBtnStyle.x !== -1 ? `${closeBtnStyle.y}px` : '10px',
            right: closeBtnStyle && closeBtnStyle.x !== -1 ? 'auto' : '10px',
            left: closeBtnStyle && closeBtnStyle.x !== -1 ? `${closeBtnStyle.x}px` : 'auto',
            width: `${closeBtnStyle?.width || 32}px`,
            height: `${closeBtnStyle?.height || 32}px`,
            borderRadius: `${closeBtnStyle?.borderRadius || 16}px`,
            border: 'none',
            background: closeBtn?.useImage ? 'transparent' : (closeBtnStyle?.backgroundColor || 'rgba(255,255,255,0.1)'),
            color: closeBtnStyle?.color || '#fff',
            fontSize: `${closeBtnStyle?.fontSize || 16}px`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            overflow: 'hidden',
            padding: 0,
          }}
        >
          {closeBtn?.useImage && closeBtn.image[activeLang] ? (
            <img src={closeBtn.image[activeLang]} alt="close" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : 'X'}
        </button>

        {/* Popup children */}
        {(popup.children || []).map((child) => {
          const est = child.styles[activeView];
          if (child.type === 'text') {
            return (
              <div
                key={child.id}
                style={{
                  position: 'absolute',
                  left: `${est.x}px`,
                  top: `${est.y}px`,
                  width: `${est.width}px`,
                  height: `${est.height}px`,
                  fontSize: `${'fontSize' in est ? est.fontSize : 16}px`,
                  fontFamily: 'fontFamily' in est ? est.fontFamily : undefined,
                  color: 'color' in est ? est.color : undefined,
                  textShadow: ('textShadow' in est ? est.textShadow : undefined) || 'none',
                  zIndex: est.zIndex || 1,
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflow: 'hidden',
                }}
                dangerouslySetInnerHTML={{ __html: child.content[activeLang] || '' }}
              />
            );
          }
          return (
            <img
              key={child.id}
              src={child.content[activeLang] || ''}
              alt=""
              style={{
                position: 'absolute',
                left: `${est.x}px`,
                top: `${est.y}px`,
                width: `${est.width}px`,
                height: `${est.height}px`,
                objectFit: 'cover',
                borderRadius: `${'borderRadius' in est ? est.borderRadius : 0}px`,
                zIndex: est.zIndex || 1,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
