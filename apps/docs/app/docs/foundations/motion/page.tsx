'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Activity,
  Check,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Wind,
  Zap,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { TableOfContents } from '@/components/docs/TableOfContents';

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

const DURATION_SCALE = [
  {
    token: '--duration-instant',
    value: '0ms',
    name: 'Instant',
    use: 'prefers-reduced-motion fallback. No perceptible delay.',
    components: ['Reduced motion override'],
    category: 'system',
    pct: 0,
  },
  {
    token: '--duration-fast',
    value: '100ms',
    name: 'Fast',
    use: 'Micro-interactions. Hover states, focus rings, color changes.',
    components: ['Hover', 'Focus ring', 'Color transition'],
    category: 'micro',
    pct: 20,
  },
  {
    token: '--duration-normal',
    value: '200ms',
    name: 'Normal',
    use: 'Standard state changes. The default for most transitions.',
    components: ['Toggle', 'Checkbox', 'Switch', 'Button press'],
    category: 'default',
    default: true,
    pct: 40,
  },
  {
    token: '--duration-slow',
    value: '300ms',
    name: 'Slow',
    use: 'Element enters or exits the viewport.',
    components: ['Toast', 'Dropdown', 'Tooltip', 'Badge'],
    category: 'enter-exit',
    pct: 60,
  },
  {
    token: '--duration-slower',
    value: '400ms',
    name: 'Slower',
    use: 'Large elements that need more time to feel natural.',
    components: ['Modal enter', 'Drawer', 'Sidebar'],
    category: 'overlay',
    pct: 80,
  },
  {
    token: '--duration-deliberate',
    value: '500ms',
    name: 'Deliberate',
    use: 'Page-level transitions. Use sparingly — anything longer feels broken.',
    components: ['Page transition', 'Onboarding step'],
    category: 'page',
    pct: 100,
  },
] as const;

const EASING_SCALE = [
  {
    token: '--ease-standard',
    value: 'cubic-bezier(0.2, 0, 0, 1)',
    name: 'Standard',
    use: 'Default for most transitions. Slight ease-out feel.',
    default: true,
    path: 'M 0,100 C 20,100 0,0 100,0',
    viewBox: '0 0 100 100',
  },
  {
    token: '--ease-enter',
    value: 'cubic-bezier(0, 0, 0.2, 1)',
    name: 'Enter',
    use: 'Elements entering the viewport. Decelerates to rest.',
    path: 'M 0,100 C 0,100 20,0 100,0',
    viewBox: '0 0 100 100',
  },
  {
    token: '--ease-exit',
    value: 'cubic-bezier(0.4, 0, 1, 1)',
    name: 'Exit',
    use: 'Elements leaving the viewport. Accelerates away.',
    path: 'M 0,100 C 40,100 100,0 100,0',
    viewBox: '0 0 100 100',
  },
  {
    token: '--ease-spring',
    value: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    name: 'Spring',
    use: 'Playful overshoot. Toggles, selections, success states.',
    path: 'M 0,100 C 34,156 64,0 100,0',
    viewBox: '0 -80 100 240',
  },
] as const;

const DEMO_EASINGS = [
  { label: 'Standard', token: '--ease-standard', css: 'cubic-bezier(0.2, 0, 0, 1)' },
  { label: 'Enter', token: '--ease-enter', css: 'cubic-bezier(0, 0, 0.2, 1)' },
  { label: 'Exit', token: '--ease-exit', css: 'cubic-bezier(0.4, 0, 1, 1)' },
  { label: 'Spring', token: '--ease-spring', css: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
] as const;

const tocItems = [
  { id: 'principles', label: 'Principles' },
  { id: 'duration', label: 'Duration scale' },
  { id: 'easing', label: 'Easing' },
  { id: 'demos', label: 'Live demos' },
  { id: 'reduced', label: 'Reduced motion' },
  { id: 'usage-motion', label: 'Usage' },
];

const REDUCED_MOTION_SNIPPET = `/* Apply to every animated element */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`;

function EasingCurveIllustration({
  path,
  viewBox,
  t,
  gridId,
}: {
  path: string;
  viewBox: string;
  t: VDSTheme;
  gridId: string;
}) {
  return (
    <svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      <defs>
        <pattern id={gridId} width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke={t.border.default.default} strokeWidth={0.5} opacity={0.5} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${gridId})`} opacity={0.35} />
      <line
        x1="0"
        y1="100"
        x2="100"
        y2="0"
        stroke={t.border.default.default}
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <path d={path} fill="none" stroke={t.text.brand.default} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx="0" cy="100" r="4" fill="#E8186D" />
      <circle cx="100" cy="0" r="4" fill="#0A8853" />
    </svg>
  );
}

function EasingDemoCard({
  label,
  token,
  easingCss,
  t,
}: {
  label: string;
  token: string;
  easingCss: string;
  t: VDSTheme;
}) {
  const [atEnd, setAtEnd] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const run = () => {
    if (timerRef.current) return;
    setAtEnd(true);
    timerRef.current = setTimeout(() => {
      setAtEnd(false);
      timerRef.current = null;
    }, 300);
  };

  return (
    <div
      style={{
        background: t.bg.surface.primary.default,
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 120,
          background: t.bg.surface.secondary.default,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
          <div
            style={{
              width: '100%',
              height: 2,
              background: t.border.default.default,
              borderRadius: 0,
              position: 'relative',
            }}
          >
            <div
              className="motion-demo-track"
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: t.bg.fill.primary.default,
                position: 'absolute',
                top: -7,
                left: atEnd ? 'calc(100% - 40px)' : '16px',
                transitionProperty: 'left',
                transitionTimingFunction: easingCss,
              }}
            />
          </div>
        </div>
      </div>
      <div
        style={{
          padding: '12px 16px',
          borderTop: `1px solid ${t.border.default.default}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: t.text.primary.default }}>{label}</span>
          <span style={chipStyleB(t, { fontSize: 11, padding: '3px 10px' })}>{token}</span>
        </div>
        <button
          type="button"
          onClick={run}
          style={{
            background: t.bg.fill.brandSubtle.default,
            color: t.text.brand.default,
            borderRadius: 8,
            padding: '6px 12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'inherit',
          }}
        >
          {atEnd ? <RotateCcw size={14} aria-hidden /> : <Play size={14} aria-hidden />}
          {atEnd ? 'Replay' : 'Play'}
        </button>
      </div>
    </div>
  );
}

export default function MotionFoundationsPage() {
  const [isDark, setIsDark] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const t = buildTheme(isDark);

  const sectionLead: CSSProperties = {
    fontSize: 17,
    color: t.text.secondary.default,
    lineHeight: 1.6,
    maxWidth: 640,
    marginBottom: 24,
  };

  const sectionHeadingStyle: CSSProperties = { marginBottom: 8 };

  const dottedBg: CSSProperties = {
    backgroundColor: t.bg.surface.secondary.default,
    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
    backgroundSize: '8px 8px',
  };

  function copySnippet() {
    navigator.clipboard.writeText(REDUCED_MOTION_SNIPPET);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 1500);
  }

  return (
    <>
      <style>{`
        /* En motion/page.tsx — solo para las demo cards */
        .motion-demo-track {
          transition-duration: var(--demo-duration, 300ms) !important;
        }
      `}</style>
      <p className="breadcrumb">
        Foundations <span style={{ opacity: 0.45, margin: '0 0.25em' }}>→</span> Motion
      </p>
      <h1 className="page-title">Motion</h1>
      <p className="page-lead">
        Animation communicates state — not personality. Every transition in VDS has a purpose: confirming an
        action, revealing new content, or orienting the user in space. Motion that exists only to look good is
        noise.
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
        <span style={chipStyleA()}>Stable</span>
        <span style={chipStyleA()}>v1.0</span>
      </div>

      <section id="principles" style={{ marginTop: 40, marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Principles
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: 120,
                background: t.bg.surface.secondary.default,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Zap
                size={18}
                strokeWidth={1.5}
                color={t.text.brand.default}
                style={{ alignSelf: 'flex-end', opacity: 0.35, marginBottom: -8 }}
                aria-hidden
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  alignItems: 'flex-start',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono), monospace', color: '#E8186D' }}>
                  500ms
                </span>
                <div
                  style={{
                    width: '80%',
                    height: 6,
                    background: 'rgba(232,24,109,0.3)',
                    borderRadius: 0,
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  alignItems: 'flex-start',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'var(--font-mono), monospace',
                    color: t.text.brand.default,
                  }}
                >
                  100ms
                </span>
                <div
                  style={{
                    width: '16%',
                    height: 6,
                    background: t.bg.fill.primary.default,
                    borderRadius: 0,
                  }}
                />
              </div>
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>
                Fast is trustworthy
              </div>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                Interfaces feel broken when animations are too slow. Most transitions should complete in
                100–200ms. If an animation takes more than 400ms, question whether it&apos;s necessary.
              </p>
            </div>
          </div>

          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div style={{ ...dottedBg, height: 120, padding: 16, position: 'relative' }}>
              <Activity
                size={18}
                strokeWidth={1.5}
                color={t.text.brand.default}
                style={{ position: 'absolute', top: 12, right: 12, opacity: 0.35 }}
                aria-hidden
              />
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                style={{ display: 'block' }}
              >
                <path
                  d="M 0,100 C 20,100 0,0 100,0"
                  fill="none"
                  stroke={t.text.brand.default}
                  strokeWidth={2}
                />
                <circle cx="0" cy="100" r="4" fill="#E8186D" />
                <circle cx="100" cy="0" r="4" fill="#0A8853" />
              </svg>
              <span
                style={{
                  position: 'absolute',
                  left: 12,
                  bottom: 12,
                  fontSize: 9,
                  color: '#E8186D',
                  fontFamily: 'var(--font-mono), monospace',
                }}
              >
                fast
              </span>
              <span
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 12,
                  fontSize: 9,
                  color: '#0A8853',
                  fontFamily: 'var(--font-mono), monospace',
                }}
              >
                slow
              </span>
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>
                Ease out by default
              </div>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                Elements enter fast and decelerate to rest. This mirrors physical objects — they move quickly
                when pushed and slow as they settle. The opposite (ease-in) feels sluggish to start.
              </p>
            </div>
          </div>

          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: 120,
                background: t.bg.surface.secondary.default,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                position: 'relative',
              }}
            >
              <Wind
                size={18}
                strokeWidth={1.5}
                color={t.text.brand.default}
                style={{ position: 'absolute', top: 12, right: 12, opacity: 0.35 }}
                aria-hidden
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 9, color: t.text.tertiary.default, fontFamily: 'var(--font-mono), monospace' }}>
                  No transition
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      background: t.border.default.default,
                    }}
                  />
                  <span style={{ fontSize: 11, color: t.text.tertiary.default }}>→</span>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      background: t.bg.fill.primary.default,
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <svg width={56} height={22} viewBox="0 0 56 22" aria-hidden>
                  <path d="M 2 18 Q 28 -4 54 10" fill="none" stroke="#E8186D" strokeWidth={1.5} />
                </svg>
                <div
                  style={{
                    width: 40,
                    height: 22,
                    borderRadius: 9999,
                    background: t.border.default.default,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: t.bg.fill.primary.default,
                      position: 'absolute',
                      right: 2,
                      top: 2,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    }}
                  />
                </div>
              </div>
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>
                Continuity over flash
              </div>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                Animation should create continuity — showing where something came from and where it went. An
                element that simply appears or disappears forces the user to reorient. Motion bridges that gap.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="duration" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={{ ...sectionHeadingStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={20} strokeWidth={1.5} color={t.text.brand.default} aria-hidden />
          Duration scale
        </h2>
        <p style={sectionLead}>
          Six steps from instant to deliberate. Match the duration to the weight of the interaction —
          micro-interactions are nearly instant, page-level transitions are felt.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DURATION_SCALE.map((d) => (
            <div
              key={d.token}
              style={{
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 14,
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              <div
                style={{
                  width: 180,
                  minWidth: 180,
                  background: t.bg.surface.secondary.default,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '20px 16px',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: 4,
                    background: t.border.default.default,
                    borderRadius: 0,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: `${d.pct}%`,
                      height: 4,
                      background: t.bg.fill.primary.default,
                      borderRadius: 0,
                      position: 'absolute',
                      left: 0,
                      top: 0,
                    }}
                  />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: t.bg.fill.primary.default,
                      position: 'absolute',
                      left: `calc(${d.pct}% - 4px)`,
                      top: -2,
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={chipStyleB(t)}>{d.token}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>{d.name}</span>
                    {'default' in d && d.default ? (
                      <span style={chipStyleA({ fontSize: 11, padding: '2px 8px' })}>default</span>
                    ) : null}
                  </div>
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono), monospace', color: t.text.primary.default }}>
                  {d.value}
                </span>
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>{d.use}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {d.components.map((c) => (
                    <span key={c} style={chipStyleA({ fontSize: 11, padding: '2px 8px' })}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="easing" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Easing
        </h2>
        <p style={sectionLead}>
          Easing defines the acceleration curve of a transition. The right easing makes motion feel physical.
          The wrong easing makes it feel mechanical or cheap.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {EASING_SCALE.map((e) => (
            <div
              key={e.token}
              style={{
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 14,
                overflow: 'hidden',
              }}
            >
              <div style={{ height: 160, background: t.bg.surface.secondary.default, position: 'relative', padding: 12 }}>
                <EasingCurveIllustration path={e.path} viewBox={e.viewBox} t={t} gridId={`motion-grid-${e.token.replace(/[^a-z0-9]/gi, '')}`} />
              </div>
              <div
                style={{
                  padding: '16px 20px',
                  borderTop: `1px solid ${t.border.default.default}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={chipStyleB(t, { fontSize: 11 })}>{e.token}</span>
                  {e.token === '--ease-standard' ? (
                    <span style={chipStyleA({ fontSize: 11, padding: '2px 8px' })}>default</span>
                  ) : null}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>{e.name}</div>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono), monospace',
                    color: t.text.tertiary.default,
                    background: t.bg.surface.secondary.default,
                    padding: '3px 8px',
                    borderRadius: 5,
                    width: 'fit-content',
                  }}
                >
                  {e.value}
                </span>
                <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>{e.use}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="demos" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Live demos
        </h2>
        <p style={sectionLead}>
          Every easing curve animated at 300ms. Click any demo to replay.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {DEMO_EASINGS.map((demo) => (
            <EasingDemoCard key={demo.token} label={demo.label} token={demo.token} easingCss={demo.css} t={t} />
          ))}
        </div>
      </section>

      <section id="reduced" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Reduced motion
        </h2>
        <p style={sectionLead}>
          Some users experience motion sickness, vertigo, or seizures triggered by screen animation. Respecting
          their preference is not optional — it&apos;s a hard accessibility requirement.
        </p>
        <div
          style={{
            background: '#0F1117',
            borderRadius: 14,
            overflow: 'hidden',
            border: `1px solid ${t.border.default.default}`,
          }}
        >
          <div
            style={{
              background: '#161B27',
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono), monospace', color: 'rgba(255,255,255,0.5)' }}>
              globals.css
            </span>
            <button
              type="button"
              onClick={copySnippet}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#CDD6F4',
                border: 'none',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              {codeCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre
            style={{
              margin: 0,
              padding: '20px 24px',
              fontFamily: 'JetBrains Mono, var(--font-mono), monospace',
              fontSize: 13,
              lineHeight: 1.75,
              color: '#CDD6F4',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            <span style={{ color: '#585B70' }}>{'/* Apply to every animated element */'}</span>
            {'\n'}
            <span style={{ color: '#89B4FA' }}>@media</span>
            {' '}
            <span style={{ color: '#CDD6F4' }}>(</span>
            <span style={{ color: '#A6E3A1' }}>prefers-reduced-motion: reduce</span>
            <span style={{ color: '#CDD6F4' }}>) {'{'}</span>
            {'\n'}
            <span style={{ color: '#CDD6F4' }}>  *,</span>
            {'\n'}
            <span style={{ color: '#CDD6F4' }}>  *::before,</span>
            {'\n'}
            <span style={{ color: '#CDD6F4' }}>  *::after {'{'}</span>
            {'\n'}
            <span style={{ color: '#CBA6F7' }}>    animation-duration</span>
            <span style={{ color: '#CDD6F4' }}>: </span>
            <span style={{ color: '#FAB387' }}>0.01ms</span>
            <span style={{ color: '#CDD6F4' }}> !important;</span>
            {'\n'}
            <span style={{ color: '#CBA6F7' }}>    animation-iteration-count</span>
            <span style={{ color: '#CDD6F4' }}>: </span>
            <span style={{ color: '#FAB387' }}>1</span>
            <span style={{ color: '#CDD6F4' }}> !important;</span>
            {'\n'}
            <span style={{ color: '#CBA6F7' }}>    transition-duration</span>
            <span style={{ color: '#CDD6F4' }}>: </span>
            <span style={{ color: '#FAB387' }}>0.01ms</span>
            <span style={{ color: '#CDD6F4' }}> !important;</span>
            {'\n'}
            <span style={{ color: '#CBA6F7' }}>    scroll-behavior</span>
            <span style={{ color: '#CDD6F4' }}>: </span>
            <span style={{ color: '#FAB387' }}>auto</span>
            <span style={{ color: '#CDD6F4' }}> !important;</span>
            {'\n'}
            <span style={{ color: '#CDD6F4' }}>  {'}'}</span>
            {'\n'}
            <span style={{ color: '#CDD6F4' }}>{'}'}</span>
          </pre>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(10,136,83,0.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check size={16} color="#0A8853" strokeWidth={2.5} aria-hidden />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginTop: 10 }}>
              Use --duration-instant
            </div>
            <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
              When overriding animations for reduced motion, set duration to var(--duration-instant) — not 0ms
              directly. This keeps the token system intact and is easier to audit.
            </p>
          </div>
          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ color: t.text.brand.default, display: 'flex' }}>
              <Pause size={28} strokeWidth={1.5} aria-hidden />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginTop: 10 }}>
              Reduce, don&apos;t remove
            </div>
            <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
              Instant transitions (0ms) are correct for decorative animations. But functional animations —
              progress bars, loading states — should use a static alternative, not disappear entirely.
            </p>
          </div>
          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ color: t.text.brand.default, display: 'flex' }}>
              <Activity size={28} strokeWidth={1.5} aria-hidden />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginTop: 10 }}>
              Always test
            </div>
            <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
              On macOS: System Preferences → Accessibility → Display → Reduce motion. On iOS: Settings →
              Accessibility → Motion → Reduce Motion. Run your UI with this enabled before shipping.
            </p>
          </div>
        </div>

        <Callout variant="danger" title="This is an accessibility requirement">
          WCAG 2.1 Success Criterion 2.3.3 (Level AAA) and broadly 2.3.1 (Level A for seizure triggers) require
          that motion can be disabled. Every VDS component must respect prefers-reduced-motion. No exceptions.
        </Callout>
      </section>

      <section id="usage-motion" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Usage
        </h2>
        <p style={sectionLead}>
          These rules define when motion adds clarity and when it adds noise. When in doubt, remove the
          animation — a fast, static UI is better than a slow, animated one.
        </p>
        <div
          style={{
            background: t.bg.surface.secondary.default,
            borderRadius: 14,
            border: `1px solid ${t.border.default.default}`,
            overflow: 'hidden',
            marginBottom: 24,
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${t.border.strong.default}` }}>
                {['Interaction', 'Duration', 'Easing', 'Notes'].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: t.text.tertiary.default,
                      padding: '10px 16px',
                      textAlign: 'left',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ['Hover state change', '--duration-fast (100ms)', '--ease-standard', 'Color/bg only. No transform.'],
                  ['Focus ring appear', '--duration-fast (100ms)', '--ease-standard', 'Instant feels abrupt, 100ms is imperceptible but smooth.'],
                  ['Button press', '--duration-normal (200ms)', '--ease-standard', 'scale(0.98) + color.'],
                  ['Toggle / Switch', '--duration-normal (200ms)', '--ease-spring', 'Spring adds satisfying snap.'],
                  ['Dropdown open', '--duration-slow (300ms)', '--ease-enter', 'Slides in from trigger direction.'],
                  ['Dropdown close', '--duration-fast (100ms)', '--ease-exit', 'Exits fast — user initiated.'],
                  ['Toast enter', '--duration-slow (300ms)', '--ease-enter', 'Slides in from screen edge.'],
                  ['Toast exit', '--duration-normal (200ms)', '--ease-exit', 'Quick exit — attention already captured.'],
                  ['Modal open', '--duration-slower (400ms)', '--ease-enter', 'Scale 0.96→1 + fade.'],
                  ['Modal close', '--duration-slow (300ms)', '--ease-exit', 'Faster exit than enter.'],
                  ['Page transition', '--duration-deliberate (500ms)', '--ease-standard', 'Use only if meaningful.'],
                  ['Loading/skeleton', '1500ms infinite', 'ease-in-out', 'Shimmer. Pause if reduced motion.'],
                ] as const
              ).map((row, idx) => (
                <tr
                  key={row[0]}
                  style={{
                    background: idx % 2 === 0 ? t.bg.surface.primary.default : t.bg.surface.secondary.default,
                  }}
                >
                  <td style={{ padding: '12px 16px', fontSize: 13, color: t.text.secondary.default, verticalAlign: 'top' }}>
                    {row[0]}
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                    <span style={chipStyleB(t, { fontSize: 11 })}>{row[1]}</span>
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                    <span style={chipStyleB(t, { fontSize: 11 })}>{row[2]}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: t.text.secondary.default, verticalAlign: 'top' }}>
                    {row[3]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text.primary.default, marginBottom: 16 }}>Do &amp; Don&apos;t</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: 20, background: t.bg.surface.secondary.default, minHeight: 140 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono), monospace', color: t.text.primary.default, marginBottom: 4 }}>
                  Enter · 300ms
                </div>
                <div style={{ width: '60%', height: 8, background: 'rgba(0,43,73,0.5)', borderRadius: 0 }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono), monospace', color: t.text.primary.default, marginBottom: 4 }}>
                  Exit · 100ms
                </div>
                <div style={{ width: '30%', height: 8, background: 'rgba(10,136,83,0.5)', borderRadius: 0 }} />
              </div>
            </div>
            <div style={{ height: 3, background: '#0A8853' }} />
            <div style={{ padding: '16px 20px' }}>
              <span style={chipStyleA()}>✓ Do</span>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, marginTop: 10, marginBottom: 0 }}>
                Exits are always faster than enters. The user triggered the exit — they don&apos;t need to watch
                it leave.
              </p>
            </div>
          </div>
          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: 20, background: t.bg.surface.secondary.default, minHeight: 140 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono), monospace', color: t.text.primary.default, marginBottom: 4 }}>
                  Enter · 100ms
                </div>
                <div style={{ width: '30%', height: 8, background: 'rgba(0,43,73,0.5)', borderRadius: 0 }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono), monospace', color: t.text.primary.default, marginBottom: 4 }}>
                  Exit · 300ms
                </div>
                <div style={{ width: '60%', height: 8, background: 'rgba(232,24,109,0.45)', borderRadius: 0 }} />
              </div>
            </div>
            <div style={{ height: 3, background: '#E8186D' }} />
            <div style={{ padding: '16px 20px' }}>
              <span style={chipStyleA({ background: 'rgba(232,24,109,0.10)', color: '#E8186D' })}>× Don&apos;t</span>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, marginTop: 10, marginBottom: 0 }}>
                A slow exit holds the user hostage. They&apos;ve moved on mentally — the UI should follow
                immediately.
              </p>
            </div>
          </div>

          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: 160,
                background: t.bg.surface.secondary.default,
                padding: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 80,
                  background: t.bg.surface.primary.default,
                  border: `1.5px solid ${t.border.strong.default}`,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'translateY(-8px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              >
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono), monospace', color: '#0A8853' }}>
                  transform + opacity
                </span>
              </div>
            </div>
            <div style={{ height: 3, background: '#0A8853' }} />
            <div style={{ padding: '16px 20px' }}>
              <span style={chipStyleA()}>✓ Do</span>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, marginTop: 10, marginBottom: 0 }}>
                transform and opacity are GPU-accelerated and never trigger layout recalculation. Always prefer
                these.
              </p>
            </div>
          </div>
          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: 160,
                background: t.bg.surface.secondary.default,
                padding: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 80,
                  background: t.bg.surface.primary.default,
                  border: `1.5px solid ${t.border.strong.default}`,
                  borderRadius: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: '8px 0',
                }}
              >
                <div style={{ height: 0, width: '80%', overflow: 'hidden' }} />
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono), monospace', color: '#E8186D' }}>
                  height + margin
                </span>
                <div
                  style={{
                    marginTop: 16,
                    height: 24,
                    width: '100%',
                    background: t.bg.fill.brandSubtle.default,
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
            <div style={{ height: 3, background: '#E8186D' }} />
            <div style={{ padding: '16px 20px' }}>
              <span style={chipStyleA({ background: 'rgba(232,24,109,0.10)', color: '#E8186D' })}>× Don&apos;t</span>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, marginTop: 10, marginBottom: 0 }}>
                Animating height, width, margin, or padding triggers layout — jank on low-end devices and battery
                drain on mobile.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TableOfContents items={tocItems} />
    </>
  );
}
