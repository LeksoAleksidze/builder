'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useLandingData, type LandingDataContextType } from '../hooks';

const LandingContext = createContext<LandingDataContextType | null>(null);

interface LandingProviderProps {
  children: ReactNode;
}

export function LandingProvider({ children }: LandingProviderProps) {
  const landingData = useLandingData();

  return (
    <LandingContext.Provider value={landingData}>
      {children}
    </LandingContext.Provider>
  );
}

export function useLandingContext(): LandingDataContextType {
  const context = useContext(LandingContext);
  if (!context) {
    throw new Error('useLandingContext must be used within LandingProvider');
  }
  return context;
}
