'use client';

import { Info } from 'lucide-react';
import {
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

const VARIANTS_LIGHT = {
  info: {
    background: 'rgba(0,43,73,0.04)',
    border: 'rgba(0,43,73,0.12)',
    iconColor: '#002b49',
  },
  tip: {
    background: 'rgba(10,136,83,0.05)',
    border: 'rgba(10,136,83,0.15)',
    iconColor: '#0A8853',
  },
  warning: {
    background: 'rgba(240,115,50,0.06)',
    border: 'rgba(240,115,50,0.18)',
    iconColor: '#F07332',
  },
  danger: {
    background: 'rgba(200,16,46,0.05)',
    border: 'rgba(200,16,46,0.15)',
    iconColor: '#C8102E',
  },
} as const;

const VARIANTS_DARK = {
  info: {
    background: 'rgba(0,43,73,0.15)',
    border: 'rgba(0,43,73,0.35)',
    iconColor: '#5B9FD4',
  },
  tip: {
    background: 'rgba(52,199,123,0.08)',
    border: 'rgba(52,199,123,0.2)',
    iconColor: '#34C77B',
  },
  warning: {
    background: 'rgba(255,181,71,0.08)',
    border: 'rgba(255,181,71,0.2)',
    iconColor: '#FFB547',
  },
  danger: {
    background: 'rgba(255,77,106,0.08)',
    border: 'rgba(255,77,106,0.2)',
    iconColor: '#FF4D6A',
  },
} as const;

type CalloutVariant = keyof typeof VARIANTS_LIGHT;

type CalloutProps = {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
  variant?: CalloutVariant;
};

type IconElementProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
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

export function Callout({ icon, title, children, variant = 'info' }: CalloutProps) {
  const isDark = useIsDark();
  const palette = isDark ? VARIANTS_DARK : VARIANTS_LIGHT;
  const vs = palette[variant];

  const iconWrapStyle: CSSProperties = {
    flexShrink: 0,
    marginTop: 2,
    display: 'flex',
    alignItems: 'flex-start',
  };

  const resolvedIcon =
    icon != null && isValidElement(icon) ? (
      cloneElement(icon as ReactElement<IconElementProps>, {
        size: 20,
        color: vs.iconColor,
        strokeWidth: 2,
        'aria-hidden': true,
      })
    ) : (
      <Info size={20} color={vs.iconColor} strokeWidth={2} aria-hidden />
    );

  return (
    <div
      style={{
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        border: `1px solid ${vs.border}`,
        background: vs.background,
      }}
    >
      <span style={iconWrapStyle}>{resolvedIcon}</span>
      <div style={{ minWidth: 0 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 4,
            display: 'block',
          }}
        >
          {title}
        </span>
        <div
          style={{
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
