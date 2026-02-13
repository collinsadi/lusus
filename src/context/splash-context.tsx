/**
 * Splash Context
 * Manages splash screen state across the app
 */
import React, { createContext, useContext, ReactNode } from 'react';
import { useSplash, type UseSplashReturn } from '@/hooks/useSplash';

type SplashContextValue = UseSplashReturn;

const SplashContext = createContext<SplashContextValue | undefined>(undefined);

interface SplashProviderProps {
  children: ReactNode;
}

export const SplashProvider: React.FC<SplashProviderProps> = ({ children }) => {
  const splash = useSplash();

  return (
    <SplashContext.Provider value={splash}>
      {children}
    </SplashContext.Provider>
  );
};

export const useSplashContext = (): SplashContextValue => {
  const context = useContext(SplashContext);
  if (!context) {
    throw new Error('useSplashContext must be used within a SplashProvider');
  }
  return context;
};
