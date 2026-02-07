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
import GitHubSettings from '../github-settings/GitHubSettings';

export default function General() {
  const { saveAllConfig, gitHub } = useLandingContext();
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

      <button
        className={styles.general__saveBtn}
        onClick={saveAllConfig}
        disabled={gitHub.isPublishing}
      >
        {gitHub.isPublishing ? 'PUBLISHING...' : 'PUBLISH CONFIG'}
      </button>

      <GitHubSettings />

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
