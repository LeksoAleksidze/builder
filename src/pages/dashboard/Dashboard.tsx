'use client';

import { useState } from 'react';
import { LandingProvider, useLandingContext } from './context';
import { PreviewCanvas } from './components/preview';
import { ConfigModal } from './components/config-modal';
import styles from './dashboard.module.scss';

function DashboardContent() {
  const { isPreview, setIsPreview } = useLandingContext();
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <div className={styles.dashboard}>
      <PreviewCanvas />

      <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

      {/* Floating Action Buttons */}
      <div className={styles.floatingButtons}>
        {!isPreview && (
          <button
            className={styles.configBtn}
            onClick={() => setIsConfigOpen(true)}
          >
            Settings
          </button>
        )}
        <button
          className={`${styles.previewBtn} ${isPreview ? styles['previewBtn--active'] : ''}`}
          onClick={() => setIsPreview(!isPreview)}
        >
          {isPreview ? 'Edit' : 'Preview'}
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <LandingProvider>
      <DashboardContent />
    </LandingProvider>
  );
}
