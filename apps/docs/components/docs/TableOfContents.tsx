'use client';

import { useEffect, useLayoutEffect, useState, type MouseEvent } from 'react';

export type TocItem = { id: string; label: string; level?: 1 | 2 };

type TableOfContentsProps = {
  items: TocItem[];
  /** Called before scroll; use to switch tabs/panels so the target id is visible. */
  onItemClick?: (id: string) => void;
  /** Optional subheading under “On this page” (e.g. component docs: “Components”). */
  groupLabel?: string;
};

function getResolvedIsDark(): boolean {
  if (typeof document === 'undefined') return false;
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(false);

  useLayoutEffect(() => {
    setIsDark(getResolvedIsDark());
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(getResolvedIsDark());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setIsDark(getResolvedIsDark());
    mq.addEventListener('change', onChange);

    return () => {
      observer.disconnect();
      mq.removeEventListener('change', onChange);
    };
  }, []);

  return isDark;
}

export function TableOfContents({ items, onItemClick, groupLabel }: TableOfContentsProps) {
  const isDark = useIsDark();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const elements = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        visible.sort(
          (a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top,
        );
        setActiveId(visible[0].target.id);
      },
      { root: null, rootMargin: '-88px 0px -40% 0px', threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    onItemClick?.(id);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const labelColor = isDark ? 'rgba(255,255,255,0.25)' : 'var(--color-text-tertiary)';
  const trackBorder = isDark ? 'rgba(255,255,255,0.08)' : 'var(--color-border)';
  const activeTextColor = isDark ? '#5B9FD4' : '#002b49';
  const activeBorderColor = isDark ? '#5B9FD4' : '#002b49';

  return (
    <nav
      className="toc-wrapper"
      aria-label="On this page"
      style={{
        position: 'fixed',
        top: '88px',
        right: '0',
        width: '220px',
        paddingRight: '40px',
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
        zIndex: 10,
        scrollbarWidth: 'none',
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: labelColor,
          marginBottom: 16,
          display: 'block',
          fontFamily: 'inherit',
        }}
      >
        On this page
      </span>
      {groupLabel ? (
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: labelColor,
            marginBottom: 10,
            marginTop: -8,
            display: 'block',
            fontFamily: 'inherit',
          }}
        >
          {groupLabel}
        </span>
      ) : null}
      <div
        style={{
          borderLeft: `1px solid ${trackBorder}`,
          paddingLeft: 0,
        }}
      >
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {items.map((item) => {
            const isActive = activeId === item.id;
            const isHovered = hoveredId === item.id;
            const level2 = item.level === 2;
            const color = isActive
              ? activeTextColor
              : isHovered
                ? isDark
                  ? 'rgba(255,255,255,0.65)'
                  : 'var(--color-text-primary)'
                : isDark
                  ? 'rgba(255,255,255,0.35)'
                  : 'var(--color-text-tertiary)';
            const borderLeftColor = isActive
              ? activeBorderColor
              : isHovered
                ? isDark
                  ? 'rgba(255,255,255,0.08)'
                  : 'var(--color-border-strong)'
                : 'transparent';
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={(e) => handleClick(e, item.id)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: level2 ? 12 : 13,
                    lineHeight: 1.5,
                    padding: level2 ? '5px 0 5px 28px' : '5px 0 5px 16px',
                    marginLeft: '-1px',
                    color,
                    position: 'relative',
                    transition: 'color 0.15s',
                    borderLeft: '2px solid transparent',
                    borderLeftColor,
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
