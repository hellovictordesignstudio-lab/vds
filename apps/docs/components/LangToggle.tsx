'use client';

import { ChevronDown, Globe } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'vds-lang';

type Lang = 'en' | 'es' | 'fr';

const LANG_META: Record<Lang, { code: string; name: string }> = {
  en: { code: 'EN', name: 'English' },
  es: { code: 'ES', name: 'Español' },
  fr: { code: 'FR', name: 'Français' },
};

export function LangToggle() {
  const [lang, setLangState] = useState<Lang>('en');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const onDocMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const others = (['en', 'es', 'fr'] as const).filter((l) => l !== lang);

  return (
    <div className="docs-header-lang" ref={wrapRef}>
      <button
        type="button"
        className="docs-header-lang__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Language"
      >
        <Globe size={15} strokeWidth={2} className="docs-header-lang__trigger-icon" aria-hidden />
        <span>{LANG_META[lang].code}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`docs-header-lang__chevron${open ? ' docs-header-lang__chevron--open' : ''}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="docs-header-lang__menu" role="listbox">
          {others.map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              className="docs-header-lang__option"
              onClick={() => setLang(code)}
            >
              {LANG_META[code].name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
