import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Authorization from '../../shared/modules/authorization/Authorization';
import type { Section, Language, ViewMode } from '../../shared/types';
import styles from './Landing.module.scss';

interface ProdConfig {
  sections: Section[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authStyles: Record<string, any>;
  globalBG: Record<string, { web: string; mob: string }>;
}

function getLanguage(l?: string): Language {
  if (!l) return 'GE';
  const n = l.toUpperCase();
  if (n === 'KA' || n === 'GE') return 'GE';
  if (n === 'EN') return 'EN';
  if (n === 'RU') return 'RU';
  if (n === 'TR') return 'TR';
  return 'GE';
}

export default function LandingPage() {
  const { lang } = useParams<{ lang: string }>();
  const [data, setData] = useState<ProdConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<Language>(getLanguage(lang));
  const [activeView, setActiveView] = useState<ViewMode>('WEB');

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

  useEffect(() => {
    setActiveLang(getLanguage(lang));
  }, [lang]);

  useEffect(() => {
    const check = () => setActiveView(window.innerWidth <= 768 ? 'MOB' : 'WEB');
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const msg = e.data;
      if (msg && typeof msg === 'object' && msg.type === 'changeLang' && msg.lang) {
        setActiveLang(getLanguage(msg.lang));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (loading) {
    return (
      <div className={styles.landing__empty}>
        <p>იტვირთება...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.landing__empty}>
        <p>{error || 'კონფიგურაცია ვერ მოიძებნა'}</p>
      </div>
    );
  }

  const bgKey = activeView.toLowerCase() as 'web' | 'mob';
  const bgUrl = data.globalBG[activeLang]?.[bgKey] || '';

  return (
    <div
      className={styles.landing}
      style={{
        backgroundImage: bgUrl ? `url(${bgUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
      }}
    >
      <div style={{ paddingTop: data.authStyles[activeView].marginTop }}>
        <Authorization stylesProp={data.authStyles[activeView]} />
      </div>

      <div className={styles.landing__content}>
        {data.sections.map((section) => (
          <ProdSection
            key={section.id}
            section={section}
            activeView={activeView}
            activeLang={activeLang}
          />
        ))}
      </div>
    </div>
  );
}

function ProdSection({
  section,
  activeView,
  activeLang,
}: {
  section: Section;
  activeView: ViewMode;
  activeLang: Language;
}) {
  const st = section.styles[activeView];

  return (
    <div
      className={styles.landing__section}
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
        <ProdElement key={el.id} element={el} activeView={activeView} activeLang={activeLang} />
      ))}
    </div>
  );
}

function ProdElement({
  element,
  activeView,
  activeLang,
}: {
  element: Section['elements'][number];
  activeView: ViewMode;
  activeLang: Language;
}) {
  const est = element.styles[activeView];

  if (element.type === 'text') {
    return (
      <div
        style={{
          position: 'absolute',
          left: `${est.x}px`,
          top: `${est.y}px`,
          width: `${est.width}px`,
          height: `${est.height}px`,
          fontSize: `${est.fontSize}px`,
          fontFamily: est.fontFamily,
          color: est.color,
          textShadow: est.textShadow || 'none',
          zIndex: est.zIndex || 1,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
        dangerouslySetInnerHTML={{ __html: element.content[activeLang] || '' }}
      />
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: `${est.x}px`,
        top: `${est.y}px`,
        width: `${est.width}px`,
        height: `${est.height}px`,
        zIndex: est.zIndex || 1,
      }}
    >
      <img
        src={element.content[activeLang] || ''}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: `${est.borderRadius || 0}px`,
        }}
      />
    </div>
  );
}
