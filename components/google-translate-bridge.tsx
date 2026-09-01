'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { useLanguage } from './language-provider';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean }, elementId: string) => unknown;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

function applyGoogleTranslateCookie(language: 'en' | 'pt-BR') {
  const target = language === 'pt-BR' ? 'pt' : 'en';
  const value = `/en/${target}`;

  document.cookie = `googtrans=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
  document.cookie = `googtrans=${encodeURIComponent(value)}; path=/; domain=${window.location.hostname}; SameSite=Lax`;
}

function applyGoogleTranslateLanguage(language: 'en' | 'pt-BR') {
  const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  if (!select) return;

  const target = language === 'pt-BR' ? 'pt' : 'en';
  if (select.value !== target) select.value = target;
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

export function GoogleTranslateBridge() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        const root = document.getElementById('google_translate_element');
        if (!root) return;

        root.innerHTML = '';
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', includedLanguages: 'en,pt', autoDisplay: false },
          'google_translate_element',
        );
      }
    };

    applyGoogleTranslateCookie(language);
    window.googleTranslateElementInit?.();
    const timer = window.setTimeout(() => applyGoogleTranslateLanguage(language), 250);
    return () => window.clearTimeout(timer);
  }, [language]);

  // Reinitialize Google Translate when pathname changes (page navigation)
  useEffect(() => {
    if (scriptLoadedRef.current) {
      // Add a small delay to ensure DOM content is fully loaded
      const timer = setTimeout(() => applyGoogleTranslateLanguage(language), 350);
      return () => clearTimeout(timer);
    }
  }, [language, pathname]);

  return (
    <>
      <div id="google_translate_element" className="hidden" aria-hidden="true" />
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
        onLoad={() => {
          scriptLoadedRef.current = true;
          applyGoogleTranslateCookie(language);
          window.googleTranslateElementInit?.();
          window.setTimeout(() => applyGoogleTranslateLanguage(language), 250);
        }}
      />
    </>
  );
}