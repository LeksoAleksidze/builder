import { useState } from 'react';
import styles from './GitHubSettings.module.scss';
import { useLandingContext } from '../../context';

export default function GitHubSettings() {
  const { gitHub } = useLandingContext();
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        className={styles.openBtn}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        GitHub Settings
        {gitHub.isConfigured && <span className={styles.dot} />}
      </button>
    );
  }

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span>GitHub Settings</span>
          <button onClick={() => setIsOpen(false)} type="button">
            &times;
          </button>
        </div>

        <div className={styles.body}>
          <label className={styles.field}>
            <span>Personal Access Token</span>
            <input
              type="password"
              value={gitHub.token}
              onChange={(e) => gitHub.setToken(e.target.value)}
              placeholder="ghp_..."
            />
          </label>

          <label className={styles.field}>
            <span>Branch Name</span>
            <input
              type="text"
              value={gitHub.branch}
              onChange={(e) => gitHub.setBranch(e.target.value)}
              placeholder="e.g. landing-config"
            />
          </label>

          <div className={styles.status}>
            <span
              className={
                gitHub.isConfigured ? styles.statusOn : styles.statusOff
              }
            />
            {gitHub.isConfigured ? 'Configured' : 'Not configured'}
          </div>
        </div>
      </div>
    </div>
  );
}
