'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getStoredLanguage, markLanguageHydrated, setStoredLanguage, translate, type Language, type TranslationKey } from '@/lib/i18n';
import { getCurrentAccountId } from '@/lib/auth';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

async function syncLanguageToDatabase(userId: string | null, language: Language) {
  if (!userId) return;
  try {
    await fetch(`/api/language-preference?userId=${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language }),
    });
  } catch (err) {
    console.error('Failed to sync language to database:', err);
  }
}

async function loadLanguageFromDatabase(userId: string | null): Promise<Language | null> {
  if (!userId) return null;
  try {
    const response = await fetch(`/api/language-preference?userId=${encodeURIComponent(userId)}`);
    if (response.ok) {
      const data = await response.json();
      const preference = data?.preference;
      if (preference?.language) {
        return preference.language === 'pt-BR' ? 'pt-BR' : 'en';
      }
    }
  } catch (err) {
    console.error('Failed to load language from database:', err);
  }
  return null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    markLanguageHydrated();
    const userId = getCurrentAccountId();

    const initializeLanguage = async () => {
      // Try to load from database first
      const dbLanguage = await loadLanguageFromDatabase(userId);
      if (dbLanguage) {
        setLanguageState(dbLanguage);
        document.documentElement.lang = dbLanguage === 'pt-BR' ? 'pt-BR' : 'en';
        return;
      }

      // Fall back to localStorage
      const storedLanguage = window.localStorage.getItem('atlas-language') === 'pt-BR' ? 'pt-BR' : getStoredLanguage();
      setLanguageState(storedLanguage);
      document.documentElement.lang = storedLanguage === 'pt-BR' ? 'pt-BR' : 'en';
      
      // Sync localStorage to database
      if (userId) {
        void syncLanguageToDatabase(userId, storedLanguage);
      }
    };

    const timer = window.setTimeout(() => {
      void initializeLanguage();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage: (nextLanguage) => {
      setLanguageState(nextLanguage);
      setStoredLanguage(nextLanguage);
      
      // Sync to database
      const userId = getCurrentAccountId();
      void syncLanguageToDatabase(userId, nextLanguage);
      
      document.documentElement.lang = nextLanguage === 'pt-BR' ? 'pt-BR' : 'en';
    },
    t: (key) => translate(language, key),
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}