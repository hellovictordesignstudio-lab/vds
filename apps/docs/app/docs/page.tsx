'use client';

import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  Box,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  ExternalLink,
  Globe,
  Layers,
  Monitor,
  Moon,
  Palette,
  Smartphone,
  Sparkles,
  Sun,
  Tablet,
  Zap,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Button } from '@/components/vds/Button';

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

const HC = {
  keyword: '#89B4FA',
  string: '#A6E3A1',
  component: '#CBA6F7',
  prop: '#FAB387',
  comment: '#585B70',
  default: '#CDD6F4',
} as const;

const mono = "'JetBrains Mono', var(--font-mono), monospace";

function GitHubMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function chipStyleA(overrides?: CSSProperties): CSSProperties {
  return {
    background: 'rgba(10,136,83,0.10)',
    color: '#0A8853',
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 6,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    ...overrides,
  };
}

function chipStyleB(t: VDSTheme, overrides?: CSSProperties): CSSProperties {
  return {
    background: t.bg.fill.brandSubtle.default,
    color: t.text.brand.default,
    fontFamily: 'var(--font-mono), monospace',
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 6,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    width: 'fit-content',
    ...overrides,
  };
}

function dottedZone(t: VDSTheme, height: number, canvasDark?: boolean): CSSProperties {
  return {
    backgroundColor: canvasDark ? '#0F1117' : t.bg.surface.secondary.default,
    backgroundImage: `radial-gradient(circle, ${canvasDark ? 'rgba(255,255,255,0.06)' : t.border.default.default} 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    minHeight: height,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  };
}

function categoryCountChipStyle(
  t: VDSTheme,
  color: 'brand' | 'purple' | 'green' | 'orange' | 'red',
): CSSProperties {
  const map: Record<typeof color, { bg: string; fg: string }> = {
    brand: { bg: t.bg.fill.brandSubtle.default, fg: t.text.brand.default },
    purple: { bg: 'rgba(124,58,237,0.12)', fg: '#7C3AED' },
    green: { bg: 'rgba(10,136,83,0.10)', fg: '#0A8853' },
    orange: { bg: 'rgba(240,115,50,0.12)', fg: '#F07332' },
    red: { bg: 'rgba(210,34,50,0.12)', fg: '#D22232' },
  };
  return {
    ...chipStyleA({ background: map[color].bg, color: map[color].fg, fontSize: 13, fontWeight: 800, padding: '6px 14px' }),
  };
}

function LandingCodeBlock({
  label,
  code,
  children,
}: {
  label: string;
  code: string;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const [hover, setHover] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div style={{ background: '#0F1117', borderRadius: 10, overflow: 'hidden' }}>
      <div
        style={{
          background: '#1A1F35',
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 11, color: '#6B7694', fontFamily: mono }}>{label}</span>
        <button
          type="button"
          onClick={onCopy}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          aria-label={copied ? 'Copied' : 'Copy code'}
          style={{
            fontSize: 11,
            background: hover ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: 5,
            padding: '6px 10px',
            color: '#6B7694',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: mono,
          }}
        >
          {copied ? <Check size={14} strokeWidth={2} aria-hidden /> : <Copy size={14} strokeWidth={2} aria-hidden />}
        </button>
      </div>
      <div
        style={{
          padding: '16px 20px',
          fontFamily: mono,
          fontSize: 13,
          lineHeight: 1.7,
          color: '#CDD6F4',
          whiteSpace: 'pre',
          overflowX: 'auto',
          margin: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

const INSTALL_CODE = 'pnpm add @vds/react @vds/tokens';

const THEME_CODE = `import { ThemeProvider } from '@vds/react'

export default function App({ children }) {
  return (
    <ThemeProvider defaultTheme="system">
      {children}
    </ThemeProvider>
  )
}`;

const LOGIN_CODE = `import { Button, TextInput, Card } from '@vds/react'

export function LoginForm() {
  return (
    <Card>
      <Card.Body>
        <TextInput label="Email" placeholder="you@example.com" />
        <Button variant="primary" fullWidth>
          Sign in
        </Button>
      </Card.Body>
    </Card>
  )
}`;

function InstallCodeBody() {
  let k = 0;
  const s = (c: string, text: string) => (
    <span key={`install-${k++}`} style={{ color: c }}>
      {text}
    </span>
  );
  return (
    <>
      {s(HC.keyword, 'pnpm')}
      {s(HC.default, ' add ')}
      {s(HC.string, '@vds/react')}
      {s(HC.default, ' ')}
      {s(HC.string, '@vds/tokens')}
    </>
  );
}

function ThemeCodeBody() {
  let k = 0;
  const s = (c: string, text: string) => (
    <span key={`theme-${k++}`} style={{ color: c }}>
      {text}
    </span>
  );
  return (
    <>
      {s(HC.keyword, 'import')}
      {s(HC.default, ' { ThemeProvider } ')}
      {s(HC.keyword, 'from')}
      {s(HC.default, ' ')}
      {s(HC.string, "'@vds/react'")}
      {'\n\n'}
      {s(HC.keyword, 'export')}
      {s(HC.default, ' ')}
      {s(HC.keyword, 'default')}
      {s(HC.default, ' ')}
      {s(HC.keyword, 'function')}
      {s(HC.default, ' ')}
      {s(HC.component, 'App')}
      {s(HC.default, '({ children }) {')}
      {'\n  '}
      {s(HC.keyword, 'return')}
      {s(HC.default, ' (\n    ')}
      {s(HC.default, '<')}
      {s(HC.component, 'ThemeProvider')}
      {s(HC.default, ' ')}
      {s(HC.prop, 'defaultTheme')}
      {s(HC.default, '=')}
      {s(HC.string, '"system"')}
      {s(HC.default, '>\n      {children}\n    </')}
      {s(HC.component, 'ThemeProvider')}
      {s(HC.default, '>\n  )\n}')}
    </>
  );
}

function LoginCodeBody() {
  let k = 0;
  const s = (c: string, text: string) => (
    <span key={`login-${k++}`} style={{ color: c }}>
      {text}
    </span>
  );
  return (
    <>
      {s(HC.keyword, 'import')}
      {s(HC.default, ' { ')}
      {s(HC.component, 'Button')}
      {s(HC.default, ', ')}
      {s(HC.component, 'TextInput')}
      {s(HC.default, ', ')}
      {s(HC.component, 'Card')}
      {s(HC.default, ' } ')}
      {s(HC.keyword, 'from')}
      {s(HC.default, ' ')}
      {s(HC.string, "'@vds/react'")}
      {'\n\n'}
      {s(HC.keyword, 'export')}
      {s(HC.default, ' ')}
      {s(HC.keyword, 'function')}
      {s(HC.default, ' ')}
      {s(HC.component, 'LoginForm')}
      {s(HC.default, '() {')}
      {'\n  '}
      {s(HC.keyword, 'return')}
      {s(HC.default, ' (\n    ')}
      {s(HC.default, '<')}
      {s(HC.component, 'Card')}
      {s(HC.default, '>\n      <')}
      {s(HC.component, 'Card.Body')}
      {s(HC.default, '>\n        <')}
      {s(HC.component, 'TextInput')}
      {s(HC.default, ' ')}
      {s(HC.prop, 'label')}
      {s(HC.default, '=')}
      {s(HC.string, '"Email"')}
      {s(HC.default, ' ')}
      {s(HC.prop, 'placeholder')}
      {s(HC.default, '=')}
      {s(HC.string, '"you@example.com"')}
      {s(HC.default, ' />\n        <')}
      {s(HC.component, 'Button')}
      {s(HC.default, ' ')}
      {s(HC.prop, 'variant')}
      {s(HC.default, '=')}
      {s(HC.string, '"primary"')}
      {s(HC.default, ' ')}
      {s(HC.prop, 'fullWidth')}
      {s(HC.default, '>\n          Sign in\n        </')}
      {s(HC.component, 'Button')}
      {s(HC.default, '>\n      </')}
      {s(HC.component, 'Card.Body')}
      {s(HC.default, '>\n    </')}
      {s(HC.component, 'Card')}
      {s(HC.default, '>\n  )\n}')}
    </>
  );
}

function iconBox(bg: string, fg: string, icon: ReactNode) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: bg,
        color: fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
  );
}

function MiniStat({ t, label, value, tone }: { t: VDSTheme; label: string; value: string; tone: 'brand' | 'success' }) {
  const shell =
    tone === 'brand'
      ? { bg: t.bg.fill.brandSubtle.default, border: t.border.brand.default, fg: t.text.brand.default }
      : { bg: t.bg.fill.success.default, border: t.border.success.default, fg: t.text.success.default };
  return (
    <div
      style={{
        flex: 1,
        borderRadius: 10,
        border: `1px solid ${shell.border}`,
        background: shell.bg,
        padding: '8px 10px',
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 900, color: shell.fg, fontFamily: mono }}>{value}</div>
    </div>
  );
}

function DeviceLabel({ icon, text, t }: { icon: ReactNode; text: string; t: VDSTheme }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
        fontSize: 12,
        color: t.text.tertiary.default,
        fontWeight: 600,
      }}
    >
      <span style={{ display: 'flex', width: 14, height: 14 }}>{icon}</span>
      {text}
    </div>
  );
}

export default function DocsLandingPage() {
  const router = useRouter();
  const isDark = useIsDark();
  const t = buildTheme(isDark);

  const sectionPadX: CSSProperties = { paddingLeft: 56, paddingRight: 56 };

  return (
    <div className="vds-docs-landing" style={{ display: 'flex', flexDirection: 'column', gap: 0, width: '100%' }}>
      {/* Section 1 — Hero */}
      <section style={{ padding: '80px 0 64px', textAlign: 'center', ...sectionPadX }}>
        <div style={{ marginBottom: 20 }}>
          <span style={chipStyleA()}>Design System · v1.0.0 · April 2026</span>
        </div>
        <h1
          style={{
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            color: t.text.primary.default,
            margin: '0 0 16px',
          }}
        >
          Victor Design System{' '}
          <span style={{ color: t.text.brand.default }}>VDS</span>
        </h1>
        <p
          style={{
            fontSize: 18,
            color: t.text.secondary.default,
            maxWidth: 560,
            margin: '0 auto 32px',
            lineHeight: 1.65,
          }}
        >
          A complete, production-ready design system built for scale. Tokens, components, and documentation —
          everything a product team needs to build consistent interfaces fast.
        </p>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight size={18} strokeWidth={2} aria-hidden />}
            onClick={() => router.push('/docs/foundations/colors')}
          >
            Get started
          </Button>
          <a
            className="vds-button vds-button--secondary vds-button--lg"
            href="https://github.com/hellovictordesignstudio-lab/vds"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="vds-button__icon">
              <GitHubMark size={16} />
            </span>
            <span className="vds-button__label">View on GitHub</span>
            <ExternalLink size={14} strokeWidth={2} aria-hidden style={{ opacity: 0.75 }} />
          </a>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 48, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
          {[
            { v: '47', l: 'Components' },
            { v: '6', l: 'Foundations' },
            { v: '100%', l: 'TypeScript' },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: t.text.primary.default, fontFamily: mono }}>{s.v}</div>
              <div style={{ fontSize: 13, color: t.text.tertiary.default, fontWeight: 600, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2 — Visual preview */}
      <section
        style={{
          background: t.bg.surface.secondary.default,
          borderTop: `1px solid ${t.border.default.default}`,
          borderBottom: `1px solid ${t.border.default.default}`,
          padding: '48px 0',
          overflow: 'hidden',
          ...sectionPadX,
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32, textAlign: 'center', color: t.text.primary.default }}>
          Built for every surface
        </h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 32,
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          {/* Desktop */}
          <div>
            <div
              style={{
                width: 480,
                maxWidth: '100%',
                height: 280,
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: t.shadow.lg,
                padding: 0,
              }}
            >
              <div
                style={{
                  height: 36,
                  background: t.bg.surface.secondary.default,
                  borderBottom: `1px solid ${t.border.default.default}`,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  gap: 8,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5F57' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FEBC2E' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28C840' }} />
                <span style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 700, color: t.text.secondary.default }}>
                  VDS Dashboard
                </span>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <MiniStat t={t} label="Revenue" value="$48.2K" tone="brand" />
                  <MiniStat t={t} label="Growth" value="+12%" tone="success" />
                </div>
                <div
                  style={{
                    height: 60,
                    background: t.bg.surface.secondary.default,
                    borderRadius: 8,
                    border: `1px solid ${t.border.default.default}`,
                  }}
                />
              </div>
            </div>
            <DeviceLabel icon={<Monitor size={14} strokeWidth={2} aria-hidden />} text="Desktop" t={t} />
          </div>

          {/* Tablet */}
          <div>
            <div
              style={{
                width: 280,
                height: 340,
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: t.shadow.lg,
                display: 'flex',
              }}
            >
              <div
                style={{
                  width: 40,
                  borderRight: `1px solid ${t.border.default.default}`,
                  background: t.bg.surface.secondary.default,
                }}
              />
              <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ height: 8, width: '55%', borderRadius: 4, background: t.bg.surface.tertiary.default }} />
                <div style={{ flex: 1, borderRadius: 8, background: t.bg.surface.secondary.default, border: `1px solid ${t.border.default.default}` }} />
              </div>
            </div>
            <DeviceLabel icon={<Tablet size={14} strokeWidth={2} aria-hidden />} text="Tablet" t={t} />
          </div>

          {/* Mobile */}
          <div>
            <div
              style={{
                width: 160,
                height: 280,
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: t.shadow.lg,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ padding: 10, flex: 1 }}>
                <div style={{ height: 10, width: '70%', borderRadius: 5, background: t.bg.surface.tertiary.default, marginBottom: 8 }} />
                <div style={{ height: 48, borderRadius: 10, background: t.bg.surface.secondary.default, marginBottom: 8 }} />
                <div style={{ height: 48, borderRadius: 10, background: t.bg.surface.secondary.default }} />
              </div>
              <div
                style={{
                  height: 44,
                  borderTop: `1px solid ${t.border.default.default}`,
                  background: t.bg.surface.secondary.default,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  padding: '0 8px',
                }}
              >
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ width: 22, height: 22, borderRadius: 6, background: t.bg.surface.tertiary.default }} />
                ))}
              </div>
            </div>
            <DeviceLabel icon={<Smartphone size={14} strokeWidth={2} aria-hidden />} text="Mobile" t={t} />
          </div>
        </div>
      </section>

      {/* Section 3 — Features */}
      <section style={{ padding: '80px 0', ...sectionPadX }}>
        <div style={chipStyleB(t, { marginBottom: 12 })}>What&apos;s included</div>
        <h2
          style={{
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            marginBottom: 12,
            color: t.text.primary.default,
          }}
        >
          Everything you need
        </h2>
        <p style={{ fontSize: 16, color: t.text.secondary.default, maxWidth: 520, marginBottom: 48, lineHeight: 1.6 }}>
          VDS ships with a complete token architecture, 47 production-ready components, and full documentation — all in one
          package.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {/* Card 1 */}
          <article
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={dottedZone(t, 140)}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 700, color: t.text.secondary.default }}>
                  <span style={{ padding: '4px 8px', borderRadius: 6, background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}` }}>
                    Primitives
                  </span>
                  <span style={{ color: t.text.tertiary.default }}>→</span>
                  <span style={{ padding: '4px 8px', borderRadius: 6, background: t.bg.fill.brandSubtle.default, color: t.text.brand.default }}>
                    Semantic
                  </span>
                  <span style={{ color: t.text.tertiary.default }}>→</span>
                  <span style={{ padding: '4px 8px', borderRadius: 6, background: t.bg.surface.tertiary.default }}>Components</span>
                </div>
                <Layers size={24} strokeWidth={2} style={{ color: t.text.tertiary.default }} aria-hidden />
              </div>
            </div>
            <div style={{ padding: 20, display: 'flex', gap: 14, flex: 1, flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                {iconBox(t.bg.fill.primary.default, '#FFFFFF', <Palette size={20} strokeWidth={2} aria-hidden />)}
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: t.text.primary.default }}>Design Tokens</h3>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: t.text.secondary.default, lineHeight: 1.55, flex: 1 }}>
                Five-level token architecture with DTCG format. Primitives, semantic tokens, and component tokens — all synced
                with Figma via Tokens Studio.
              </p>
              <div>
                <span style={chipStyleB(t)}>Style Dictionary v4</span>
              </div>
            </div>
          </article>

          {/* Card 2 */}
          <article
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={dottedZone(t, 140)}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 6,
                  width: '100%',
                  maxWidth: 220,
                }}
              >
                {['Button', 'Input', 'Modal', 'Table', 'Card', 'Tabs', 'Select', 'Toast', 'Badge'].map((name) => (
                  <span
                    key={name}
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      textAlign: 'center',
                      padding: '6px 4px',
                      borderRadius: 6,
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      color: t.text.secondary.default,
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ padding: 20, display: 'flex', gap: 14, flex: 1, flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                {iconBox('#7C3AED', '#FFFFFF', <Box size={20} strokeWidth={2} aria-hidden />)}
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: t.text.primary.default }}>47 Components</h3>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: t.text.secondary.default, lineHeight: 1.55, flex: 1 }}>
                From basic inputs to complex trading interfaces. Every component ships with full TypeScript types,
                accessibility, dark mode, and Storybook stories.
              </p>
              <div>
                <span style={chipStyleB(t)}>React + TypeScript</span>
              </div>
            </div>
          </article>

          {/* Card 3 */}
          <article
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={dottedZone(t, 140)}>
              <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, width: '100%', maxWidth: 240, height: 100 }}>
                <div
                  style={{
                    flex: 1,
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: '8px 0 0 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sun size={22} strokeWidth={2} style={{ color: t.text.warning.default }} aria-hidden />
                </div>
                <div
                  style={{
                    width: 28,
                    flexShrink: 0,
                    background: t.bg.surface.secondary.default,
                    borderLeft: `1px solid ${t.border.default.default}`,
                    borderRight: `1px solid ${t.border.default.default}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <Sun size={14} strokeWidth={2} style={{ color: t.text.warning.default }} aria-hidden />
                  <Moon size={14} strokeWidth={2} style={{ color: '#5B9FD4' }} aria-hidden />
                </div>
                <div
                  style={{
                    flex: 1,
                    background: '#0F1117',
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: '0 8px 8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Moon size={22} strokeWidth={2} style={{ color: '#5B9FD4' }} aria-hidden />
                </div>
              </div>
            </div>
            <div style={{ padding: 20, display: 'flex', gap: 14, flex: 1, flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                {iconBox('#F07332', '#FFFFFF', <Moon size={20} strokeWidth={2} aria-hidden />)}
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: t.text.primary.default }}>Light & Dark Mode</h3>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: t.text.secondary.default, lineHeight: 1.55, flex: 1 }}>
                Every token and component responds to the system theme automatically. Override with a data-theme attribute.
                Smooth 200ms transitions included.
              </p>
              <div>
                <span style={chipStyleB(t)}>System · Light · Dark</span>
              </div>
            </div>
          </article>

          {/* Card 4 */}
          <article
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={dottedZone(t, 140)}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['Tab', '↑', '↓', '←', '→'].map((k) => (
                    <kbd
                      key={k}
                      style={{
                        minWidth: 28,
                        padding: '4px 6px',
                        borderRadius: 4,
                        border: `1px solid ${t.border.default.default}`,
                        background: t.bg.surface.primary.default,
                        fontSize: 10,
                        fontFamily: mono,
                        fontWeight: 700,
                        color: ['Tab', '↑'].includes(k) ? t.text.brand.default : t.text.secondary.default,
                      }}
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: t.text.success.default, ...chipStyleA({ fontSize: 10 }) }}>
                  aria-label
                </span>
              </div>
            </div>
            <div style={{ padding: 20, display: 'flex', gap: 14, flex: 1, flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                {iconBox('#0A8853', '#FFFFFF', <CheckCircle2 size={20} strokeWidth={2} aria-hidden />)}
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: t.text.primary.default }}>WCAG 2.1 AA</h3>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: t.text.secondary.default, lineHeight: 1.55, flex: 1 }}>
                Every component passes color contrast requirements, has complete keyboard navigation, proper ARIA roles, and
                focus management. Built for everyone.
              </p>
              <div>
                <span style={chipStyleB(t)}>WCAG 2.1 AA</span>
              </div>
            </div>
          </article>

          {/* Card 5 */}
          <article
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={dottedZone(t, 140)}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  { tag: 'EN', text: 'Hello' },
                  { tag: 'ES', text: 'Hola' },
                  { tag: 'FR', text: 'Bonjour' },
                ].map((row) => (
                  <div
                    key={row.tag}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: `1px solid ${t.border.default.default}`,
                      background: t.bg.surface.primary.default,
                      minWidth: 72,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 9, fontWeight: 800, color: t.text.brand.default }}>{row.tag}</div>
                    <div style={{ fontSize: 11, color: t.text.secondary.default, marginTop: 4 }}>{row.text}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: 20, display: 'flex', gap: 14, flex: 1, flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                {iconBox(t.bg.fill.primary.default, '#FFFFFF', <Globe size={20} strokeWidth={2} aria-hidden />)}
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: t.text.primary.default }}>Trilingual</h3>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: t.text.secondary.default, lineHeight: 1.55, flex: 1 }}>
                Documentation and component labels in English, Spanish, and French. The language preference persists in
                localStorage.
              </p>
              <div>
                <span style={chipStyleB(t)}>EN · ES · FR</span>
              </div>
            </div>
          </article>

          {/* Card 6 */}
          <article
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={dottedZone(t, 140, true)}>
              <div style={{ textAlign: 'left', width: '100%', maxWidth: 260 }}>
                <div style={{ color: HC.keyword, fontSize: 11, fontFamily: mono, lineHeight: 1.6 }}>
                  <span style={{ color: HC.keyword }}>import</span>
                  <span style={{ color: HC.default }}> {'{'} </span>
                  <span style={{ color: HC.component }}>Button</span>
                  <span style={{ color: HC.default }}> {'}'} </span>
                  <span style={{ color: HC.keyword }}>from</span>
                  <span style={{ color: HC.default }}> </span>
                  <span style={{ color: HC.string }}>&apos;@vds/react&apos;</span>
                </div>
              </div>
            </div>
            <div style={{ padding: 20, display: 'flex', gap: 14, flex: 1, flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                {iconBox('#7C3AED', '#FFFFFF', <Code2 size={20} strokeWidth={2} aria-hidden />)}
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: t.text.primary.default }}>Developer Experience</h3>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: t.text.secondary.default, lineHeight: 1.55, flex: 1 }}>
                Copy-paste ready code examples, TypeScript autocomplete, tree-shakeable imports, and a Storybook for every
                component.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={chipStyleB(t)}>pnpm + Turborepo</span>
                <Sparkles size={14} style={{ color: t.text.tertiary.default }} aria-hidden />
                <Zap size={14} style={{ color: t.text.warning.default }} aria-hidden />
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Section 4 — Quick start */}
      <section
        style={{
          padding: '80px 0',
          background: t.bg.surface.secondary.default,
          borderTop: `1px solid ${t.border.default.default}`,
          borderBottom: `1px solid ${t.border.default.default}`,
          ...sectionPadX,
        }}
      >
        <h2
          style={{
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            marginBottom: 8,
            color: t.text.primary.default,
          }}
        >
          Quick start
        </h2>
        <p style={{ fontSize: 16, color: t.text.secondary.default, marginBottom: 40 }}>Up and running in under 5 minutes.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
          {/* Step 1 */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: t.bg.fill.primary.default,
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              1
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12, color: t.text.primary.default }}>Install the package</div>
              <LandingCodeBlock label="Terminal" code={INSTALL_CODE}>
                <code>
                  <InstallCodeBody />
                </code>
              </LandingCodeBlock>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: t.bg.fill.primary.default,
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              2
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12, color: t.text.primary.default }}>
                Wrap your app with ThemeProvider
              </div>
              <LandingCodeBlock label="app.tsx" code={THEME_CODE}>
                <code>
                  <ThemeCodeBody />
                </code>
              </LandingCodeBlock>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: t.bg.fill.primary.default,
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              3
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12, color: t.text.primary.default }}>
                Import and use components
              </div>
              <LandingCodeBlock label="LoginForm.tsx" code={LOGIN_CODE}>
                <code>
                  <LoginCodeBody />
                </code>
              </LandingCodeBlock>
            </div>
          </div>

          {/* Step 4 */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#0A8853',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              4
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, color: t.text.primary.default }}>You&apos;re ready</div>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: t.text.secondary.default, lineHeight: 1.55 }}>
                Explore the component documentation, copy code examples, and start building.
              </p>
              <button
                type="button"
                onClick={() => router.push('/docs/components/button')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 700,
                  color: t.text.brand.default,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Browse components
                <ArrowRight size={16} strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 — Foundations */}
      <section style={{ padding: '80px 0', ...sectionPadX }}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            marginBottom: 8,
            color: t.text.primary.default,
          }}
        >
          Foundations
        </h2>
        <p style={{ fontSize: 16, color: t.text.secondary.default, marginBottom: 40, maxWidth: 560, lineHeight: 1.6 }}>
          Design decisions documented. Every token, scale, and principle explained.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {[
            {
              title: 'Colors',
              desc: 'Brand scale, semantic tokens, and dark mode values.',
              href: '/docs/foundations/colors',
              ill: (
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                    {['#002b49', '#0a3a5c', '#134a72', '#1c5a87', '#2a6fa0', '#4a8fc4', '#6baed9', '#a3d4f2'].map((c) => (
                      <div key={c} style={{ flex: 1, height: 22, borderRadius: 4, background: c }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ flex: 1, height: 14, borderRadius: 4, background: '#0A8853' }} />
                    <div style={{ flex: 1, height: 14, borderRadius: 4, background: '#F07332' }} />
                    <div style={{ flex: 1, height: 14, borderRadius: 4, background: '#D22232' }} />
                  </div>
                </div>
              ),
            },
            {
              title: 'Spacing',
              desc: '4px base grid with 10-step scale.',
              href: '/docs/foundations/spacing',
              ill: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                  {[
                    [4, '4px'],
                    [8, '8px'],
                    [16, '16px'],
                    [24, '24px'],
                    [32, '32px'],
                  ].map(([w, lab]) => (
                    <div key={lab} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ height: 8, width: w as number, borderRadius: 2, background: t.text.brand.default }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: t.text.tertiary.default, fontFamily: mono }}>{lab}</span>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              title: 'Typography',
              desc: 'Nunito Sans + JetBrains Mono. Complete type scale.',
              href: '/docs/foundations/typography',
              ill: (
                <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 80 }}>
                  <div style={{ fontSize: 36, fontWeight: 900, fontFamily: 'var(--font-sans)', color: t.text.primary.default }}>Aa</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: mono, color: t.text.brand.default, marginTop: 4 }}>01</div>
                  <div style={{ position: 'absolute', right: 0, bottom: 0, fontSize: 10, color: t.text.tertiary.default }}>Aa Bb Cc</div>
                </div>
              ),
            },
            {
              title: 'Layout Grid',
              desc: '12-column grid, breakpoints, and layout patterns.',
              href: '/docs/foundations/layout-grid',
              ill: (
                <div style={{ display: 'flex', gap: 3, width: '100%', height: 56, alignItems: 'stretch' }}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        background: i % 2 === 0 ? 'rgba(0,43,73,0.12)' : 'rgba(0,43,73,0.06)',
                        borderRadius: 2,
                        border: `1px solid ${t.border.brand.default}`,
                      }}
                    />
                  ))}
                </div>
              ),
            },
            {
              title: 'Elevation',
              desc: 'Shadow scale, border radius, and depth system.',
              href: '/docs/foundations/elevation',
              ill: (
                <div style={{ position: 'relative', height: 64, width: '100%' }}>
                  {[t.shadow.card, t.shadow.md, t.shadow.lg].map((sh, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: 12 + i * 14,
                        top: 8 + i * 6,
                        width: '72%',
                        height: 40,
                        borderRadius: 10,
                        background: t.bg.surface.primary.default,
                        border: `1px solid ${t.border.default.default}`,
                        boxShadow: sh,
                      }}
                    />
                  ))}
                </div>
              ),
            },
            {
              title: 'Motion',
              desc: 'Duration scale, easing curves, and reduced motion.',
              href: '/docs/foundations/motion',
              ill: (
                <div style={{ width: '100%' }}>
                  <svg width="100%" height={40} viewBox="0 0 120 40" preserveAspectRatio="none" style={{ display: 'block' }}>
                    <path
                      d="M 0 35 Q 30 35 60 18 T 120 5"
                      fill="none"
                      stroke={t.text.brand.default}
                      strokeWidth="2"
                    />
                  </svg>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {['100ms', '200ms', '300ms', '500ms'].map((d) => (
                      <span key={d} style={{ fontSize: 10, fontWeight: 700, color: t.text.secondary.default, fontFamily: mono }}>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              ),
            },
          ].map((f) => (
            <button
              key={f.href}
              type="button"
              onClick={() => router.push(f.href)}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 14,
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = t.border.brand.default;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = t.border.default.default;
              }}
            >
              <div style={{ height: 100, padding: 12, background: t.bg.surface.secondary.default, display: 'flex', alignItems: 'center' }}>
                {f.ill}
              </div>
              <div style={{ padding: '16px 44px 16px 16px', position: 'relative' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: t.text.primary.default, marginBottom: 6 }}>{f.title}</div>
                <p style={{ margin: 0, fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5 }}>{f.desc}</p>
                <ArrowRight
                  size={14}
                  style={{ position: 'absolute', right: 14, bottom: 16, color: t.text.tertiary.default }}
                  aria-hidden
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Section 6 — Categories */}
      <section
        style={{
          padding: '80px 0',
          background: t.bg.surface.secondary.default,
          borderTop: `1px solid ${t.border.default.default}`,
          ...sectionPadX,
        }}
      >
        <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: t.text.primary.default }}>Components</h2>
        <p style={{ fontSize: 16, color: t.text.secondary.default, marginBottom: 40 }}>47 components across 5 categories.</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {[
            {
              name: 'Form & Input',
              count: '12',
              color: 'brand' as const,
              items: ['Button', 'TextInput', 'Select', 'Checkbox', 'Radio', 'Switch', 'DatePicker', 'FileUpload', 'Slider'],
              href: '/docs/components/button',
            },
            {
              name: 'Feedback & Overlays',
              count: '8',
              color: 'purple' as const,
              items: ['Alert', 'Toast', 'Modal', 'Drawer', 'Popover', 'Tooltip', 'Spinner', 'Skeleton'],
              href: '/docs/components/alert',
            },
            {
              name: 'Navigation',
              count: '6',
              color: 'green' as const,
              items: ['Navigation', 'Tabs', 'Breadcrumb', 'Pagination', 'Accordion', 'CommandPalette'],
              href: '/docs/components/navigation',
            },
            {
              name: 'Data Display',
              count: '10',
              color: 'orange' as const,
              items: ['Table', 'Card', 'StatCard', 'Badge', 'Avatar', 'Divider', 'EmptyState', 'Kbd', 'Progress', 'Calendar'],
              href: '/docs/components/table',
            },
            {
              name: 'Charts & Trading',
              count: '11',
              color: 'red' as const,
              items: [
                'LineChart',
                'BarChart',
                'AreaChart',
                'DonutChart',
                'Sparkline',
                'PriceTicker',
                'CandlestickChart',
                'OrderBook',
                'PortfolioCard',
                'MarketOverview',
                'TradingPair',
              ],
              href: '/docs/components/charts',
            },
          ].map((cat) => (
            <div
              key={cat.name}
              style={{
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 14,
                padding: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={categoryCountChipStyle(t, cat.color)}>{cat.count}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: t.text.primary.default }}>{cat.name}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {cat.items.map((item) => (
                  <span
                    key={item}
                    style={{
                      background: t.bg.surface.tertiary.default,
                      color: t.text.secondary.default,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 5,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => router.push(cat.href)}
                style={{
                  marginTop: 16,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  color: t.text.brand.default,
                }}
              >
                View all →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Section 7 — Tech */}
      <section style={{ padding: '64px 0', ...sectionPadX }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 32, textAlign: 'center', color: t.text.primary.default }}>
          Built with
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {[
            'Next.js 15',
            'React 18',
            'TypeScript',
            'pnpm workspaces',
            'Turborepo',
            'Style Dictionary v4',
            'DTCG Tokens',
            'Tokens Studio',
            'Recharts',
            'Lucide Icons',
            'Nunito Sans',
            'JetBrains Mono',
          ].map((label) => (
            <div
              key={label}
              style={{
                background: t.bg.surface.secondary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 700,
                color: t.text.secondary.default,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Section 8 — Footer CTA */}
      <section
        style={{
          padding: '80px 0',
          textAlign: 'center',
          borderTop: `1px solid ${t.border.default.default}`,
          ...sectionPadX,
        }}
      >
        <h2
          style={{
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            marginBottom: 12,
            color: t.text.primary.default,
          }}
        >
          Ready to build?
        </h2>
        <p
          style={{
            fontSize: 16,
            color: t.text.secondary.default,
            maxWidth: 480,
            margin: '0 auto 32px',
            lineHeight: 1.6,
          }}
        >
          Start with the foundations, explore the components, or dive straight into the code.
        </p>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight size={18} strokeWidth={2} aria-hidden />}
            onClick={() => router.push('/docs/components/button')}
          >
            Explore components
          </Button>
          <Button
            variant="secondary"
            size="lg"
            leftIcon={<BookOpen size={18} strokeWidth={2} aria-hidden />}
            onClick={() => router.push('/docs/foundations/colors')}
          >
            Read foundations
          </Button>
          <a
            className="vds-button vds-button--tertiary vds-button--lg"
            href="https://github.com/hellovictordesignstudio-lab/vds"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <span className="vds-button__icon">
              <GitHubMark size={16} />
            </span>
            <span className="vds-button__label">GitHub</span>
            <ExternalLink size={14} strokeWidth={2} aria-hidden style={{ opacity: 0.75 }} />
          </a>
        </div>
        <p style={{ fontSize: 12, color: t.text.tertiary.default, marginTop: 24 }}>
          Made with ❤️ by Victor · VDS v1.0.0 · MIT License
        </p>
      </section>
    </div>
  );
}
