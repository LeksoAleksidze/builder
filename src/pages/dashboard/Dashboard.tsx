'use client';

import clsx from 'clsx';
import styles from './dashboard.module.scss';
import { LandingProvider, useLandingContext } from './context';
import General from './components/general/General';
import { PreviewCanvas } from './components/preview';

function DashboardContent() {
  const { isPreview, setIsPreview } = useLandingContext();

  return (
    <div
      className={clsx(styles.dashboard, isPreview && styles['dashboard--preview'])}
    >
      <PreviewCanvas />

      {!isPreview && (
        <div className={styles.dashboard__aside}>
          <General />
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
        {isPreview ? 'EDIT MODE' : 'PREVIEW'}
      </button>
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
