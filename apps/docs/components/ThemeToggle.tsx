'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const active = mounted && resolvedTheme === 'dark' ? 'dark' : 'light';

  /* VDS dual brand (Option A): interactive tokens switch in [data-theme="dark"] — see globals.css */
  return (
    <div className="docs-header-theme-toggle" role="group" aria-label="Theme">
      <button
        type="button"
        className={`docs-header-theme-pill${active === 'light' ? ' docs-header-theme-pill--active' : ''}`}
        onClick={() => setTheme('light')}
        aria-label="Light mode"
        aria-pressed={active === 'light'}
      >
        <Sun size={16} strokeWidth={2} aria-hidden />
      </button>
      <button
        type="button"
        className={`docs-header-theme-pill${active === 'dark' ? ' docs-header-theme-pill--active' : ''}`}
        onClick={() => setTheme('dark')}
        aria-label="Dark mode"
        aria-pressed={active === 'dark'}
      >
        <Moon size={16} strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
