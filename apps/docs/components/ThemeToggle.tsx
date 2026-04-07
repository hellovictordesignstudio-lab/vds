'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

type ThemeChoice = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const active: ThemeChoice =
    theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'system';

  const options: { value: ThemeChoice; label: string }[] = [
    { value: 'light', label: '☀ Light' },
    { value: 'dark', label: '☾ Dark' },
    { value: 'system', label: '⊙ System' },
  ];

  return (
    <div className="theme-lang-toggle" role="group" aria-label="Theme">
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={`theme-lang-toggle__btn${mounted && active === value ? ' theme-lang-toggle__btn--active' : ''}`}
          onClick={() => setTheme(value)}
          aria-pressed={mounted ? active === value : false}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
