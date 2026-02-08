import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { DOMAIN_URL } from '../services/api';

export function BuilderProtectedRoute({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'no-token' | 'denied'>('loading');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setStatus('no-token');
      return;
    }

    fetch(`${DOMAIN_URL}/auth/information`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status && data.body && data.body.stack?.includes('BUILDER')) {
          setStatus('authorized');
        } else {
          setStatus('denied');
        }
      })
      .catch(() => {
        setStatus('denied');
      });
  }, []);

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  if (status === 'no-token') {
    return <Navigate to="/login" replace />;
  }

  if (status === 'denied') {
    return <Navigate to="/server-selection" replace />;
  }

  return <>{children}</>;
}
