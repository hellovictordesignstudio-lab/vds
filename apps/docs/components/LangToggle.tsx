'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'vds-lang';
type Lang = 'en' | 'es' | 'fr';

export function LangToggle() {
  const [lang, setLangState] = useState<Lang>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored === 'en' || stored === 'es' || stored === 'fr') {
        setLangState(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const options: { value: Lang; label: string }[] = [
    { value: 'en', label: 'EN' },
    { value: 'es', label: 'ES' },
    { value: 'fr', label: 'FR' },
  ];

  return (
    <div className="theme-lang-toggle" role="group" aria-label="Language">
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={`theme-lang-toggle__btn${mounted && lang === value ? ' theme-lang-toggle__btn--active' : ''}`}
          onClick={() => setLang(value)}
          aria-pressed={mounted ? lang === value : value === 'en'}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
