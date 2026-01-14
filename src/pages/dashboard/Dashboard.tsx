import { useState, useEffect } from 'react';
import clsx from 'clsx';
import styles from './dashboard.module.scss';
import General from './components/general/General';
import Landing from '../landing/Landing';
import type { Section, Language, ViewMode, GlobalBackground, AuthStyles } from '../../shared/types';

const defaultGlobalBG: GlobalBackground = {
  GE: { web: '', mob: '' },
  EN: { web: '', mob: '' },
  RU: { web: '', mob: '' },
  TR: { web: '', mob: '' },
};

const defaultAuthStyles: AuthStyles = {
  WEB: { marginTop: '700px', backgroundColor: 'transparent' },
  MOB: { marginTop: '300px', backgroundColor: 'transparent' },
};

export default function DashboardPage() {
  const [activeLang, setActiveLang] = useState<Language>('GE');
  const [activeView, setActiveView] = useState<ViewMode>('WEB');
  const [isPreview, setIsPreview] = useState(false);
  const [globalBG, setGlobalBG] = useState<GlobalBackground>(defaultGlobalBG);
  const [authStyles, setAuthStyles] = useState<AuthStyles>(defaultAuthStyles);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('landing_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSections(parsed.sections || []);
        setAuthStyles(parsed.authStyles || defaultAuthStyles);
        setGlobalBG(parsed.globalBG || defaultGlobalBG);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
  }, []);

  const saveAllConfig = () => {
    localStorage.setItem('landing_data', JSON.stringify({ sections, authStyles, globalBG }));
    alert('✅ კონფიგურაცია შენახულია!');
  };

  const handleElementUpdate = (sectionId: number, elementId: number, field: string, value: unknown) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, elements: s.elements.map((el) => (el.id === elementId ? { ...el, [field]: value } : el)) }
          : s
      )
    );
  };

  return (
    <div className={clsx(styles.dashboard, isPreview && styles['dashboard--preview'])}>
      <div
        className={styles.dashboard__content}
        style={{
          width: activeView === 'MOB' ? '375px' : '100%',
          margin: '0 auto',
          minHeight: '100vh',
          transition: 'width 0.3s ease',
        }}
      >
        <Landing
          sections={sections}
          globalBG={globalBG}
          authStyles={authStyles}
          activeLang={activeLang}
          activeView={activeView}
          isPreview={isPreview}
          onElementUpdate={handleElementUpdate}
        />
      </div>

      {!isPreview && (
        <div className={styles.dashboard__aside}>
          <General
            activeLang={activeLang}
            setActiveLang={setActiveLang}
            activeView={activeView}
            setActiveView={setActiveView}
            globalBG={globalBG}
            setGlobalBG={setGlobalBG}
            sections={sections}
            setSections={setSections}
            saveAllConfig={saveAllConfig}
          />
        </div>
      )}

      <button
        onClick={() => setIsPreview(!isPreview)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 9999,
          padding: '10px 20px',
          background: isPreview ? '#ff4757' : '#2ed573',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {isPreview ? '🛠 EDIT MODE' : '👁 PREVIEW'}
      </button>
    </div>
  );
}
