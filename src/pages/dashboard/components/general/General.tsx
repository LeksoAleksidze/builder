import styles from './General.module.scss';
import ViewLanguageTabs from './ViewLanguageTabs';
import GlobalBackgroundBlock from './GlobalBackgroundBlock';
import SectionsBlock from './SectionsBlock';
import type { Section, ViewMode, Language, GlobalBackground } from '../../../../shared/types';

interface GeneralProps {
  activeLang: Language;
  setActiveLang: (lang: Language) => void;
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  globalBG: GlobalBackground;
  setGlobalBG: (bg: GlobalBackground) => void;
  sections: Section[];
  setSections: (sections: Section[]) => void;
  saveAllConfig: () => void;
}

export default function General({
  activeLang,
  setActiveLang,
  activeView,
  setActiveView,
  globalBG,
  setGlobalBG,
  sections,
  setSections,
  saveAllConfig,
}: GeneralProps) {
  return (
    <div className={styles.general}>
      <ViewLanguageTabs
        activeView={activeView}
        activeLang={activeLang}
        onViewChange={setActiveView}
        onLangChange={setActiveLang}
      />

      <button className={styles.general__saveBtn} onClick={saveAllConfig}>
        💾 PUBLISH CONFIG
      </button>

      <GlobalBackgroundBlock
        activeLang={activeLang}
        activeView={activeView}
        globalBG={globalBG}
        onGlobalBGChange={setGlobalBG}
      />

      <SectionsBlock
        sections={sections}
        activeView={activeView}
        activeLang={activeLang}
        onSectionsChange={setSections}
      />
    </div>
  );
}
