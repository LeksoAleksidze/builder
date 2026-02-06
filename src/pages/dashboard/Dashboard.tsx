'use client';

import { useState } from 'react';
import { LandingProvider, useLandingContext } from './context';
import { PreviewCanvas, PopupRenderer } from './components/preview';
import { ConfigModal } from './components/config-modal';
import styles from './dashboard.module.scss';

function DashboardContent() {
  const { isPreview, setIsPreview } = useLandingContext();
  const [isConfigOpen, setIsConfigOpen] = useState(true); // Default open

  return (
    <div className={styles.dashboard}>
      {/* Left side - Preview */}
      <div className={styles.dashboard__preview}>
        <PreviewCanvas />
      </div>

      <PopupRenderer />

      {/* Right side - Config Sidebar */}
      {!isPreview && (
        <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
      )}

      {/* Floating Action Buttons */}
      <div className={styles.floatingButtons}>
        {!isPreview && !isConfigOpen && (
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
