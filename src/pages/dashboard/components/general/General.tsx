'use client';

import { useState } from 'react';
import styles from './General.module.scss';
import { useLandingContext } from '../../context';
import {
  ViewportTabs,
  LanguageTabs,
  GlobalBackgroundBlock,
  SectionsBlock,
} from './components';

export default function General() {
  const { saveAllConfig } = useLandingContext();
  const [openBlocks, setOpenBlocks] = useState<string[]>(['bg', 'sections']);

  const toggleBlock = (block: string) => {
    setOpenBlocks((prev) =>
      prev.includes(block) ? prev.filter((b) => b !== block) : [...prev, block]
    );
  };

  return (
    <div className={styles.general}>
      <div className={styles.general__topControls}>
        <ViewportTabs />
        <LanguageTabs />
      </div>

      <button className={styles.general__saveBtn} onClick={saveAllConfig}>
        PUBLISH CONFIG
      </button>

      <GlobalBackgroundBlock
        isOpen={openBlocks.includes('bg')}
        onToggle={() => toggleBlock('bg')}
      />

      <SectionsBlock
        isOpen={openBlocks.includes('sections')}
        onToggle={() => toggleBlock('sections')}
      />
    </div>
  );
}
