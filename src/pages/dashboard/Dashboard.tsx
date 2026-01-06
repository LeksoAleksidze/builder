import { useState } from 'react';
import clsx from 'clsx';
import styles from './dashboard.module.scss';

import General from './components/general/General';
import Authorization from '../../shared/modules/authorization/Authorization.tsx';

export default function DashboardPage() {
  const imageUrl =
    'https://promotions.crocobet.com/crc/casinoviplb/assets/default/background/web/ge.jpg';
  const [isScaled, setScaled] = useState(false);

  const [authStyles, setAuthStyles] = useState({
    marginTop: '700px',
    backgroundColor: '#37445ee6',
  });

  return (
    <div className={styles.dashboard}>
      <div
        className={clsx(
          styles.dashboard__landing,
          isScaled && styles['dashboard__landing--scaled']
        )}
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <Authorization stylesProp={authStyles} />
      </div>

      <div className={styles.dashboard__aside}>
        <General
          isScaled={isScaled}
          setScaled={setScaled}
          authStyles={authStyles}
          setAuthStyles={setAuthStyles}
        />
      </div>
    </div>
  );
}
