'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { Box, Check, ChevronRight, Circle, Copy, Layers } from 'lucide-react';
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

const SHADOW_SCALE = [
  {
    token: '--shadow-xs',
    name: 'Extra small',
    value: '0 1px 2px rgba(0,0,0,0.05)',
    valueDark: '0 1px 2px rgba(0,0,0,0.4)',
    use: 'Subtle lift — inputs on hover, inactive cards',
    components: ['Input hover', 'Inactive card'],
  },
  {
    token: '--shadow-sm',
    name: 'Small',
    value: '0 1px 4px rgba(0,0,0,0.08)',
    valueDark: '0 1px 4px rgba(0,0,0,0.5)',
    use: 'Default card elevation — the standard resting state',
    components: ['Card', 'Button elevated'],
  },
  {
    token: '--shadow-md',
    name: 'Medium',
    value: '0 4px 12px rgba(0,0,0,0.10)',
    valueDark: '0 4px 12px rgba(0,0,0,0.55)',
    use: 'Floating elements — dropdowns, popovers, tooltips',
    components: ['Dropdown', 'Popover', 'Tooltip'],
  },
  {
    token: '--shadow-lg',
    name: 'Large',
    value: '0 8px 24px rgba(0,0,0,0.12)',
    valueDark: '0 8px 24px rgba(0,0,0,0.6)',
    use: 'Overlays that block content — modals, drawers',
    components: ['Modal', 'Drawer', 'Sheet'],
  },
  {
    token: '--shadow-xl',
    name: 'Extra large',
    value: '0 16px 48px rgba(0,0,0,0.16)',
    valueDark: '0 16px 48px rgba(0,0,0,0.7)',
    use: 'Full-screen overlays — command palette, lightbox',
    components: ['Command palette', 'Lightbox'],
  },
] as const;

const RADIUS_SCALE = [
  { token: '--radius-none', value: '0px', name: 'None', use: 'Dividers, separators, table cells' },
  { token: '--radius-xs', value: '4px', name: 'XSmall', use: 'Inline badges, tight chips, code spans' },
  { token: '--radius-sm', value: '6px', name: 'Small', use: 'Subtle containers, inline tags' },
  {
    token: '--radius-md',
    value: '8px',
    name: 'Medium',
    use: 'Buttons, inputs, selects — default interactive',
    default: true,
  },
  { token: '--radius-lg', value: '12px', name: 'Large', use: 'Cards, panels, containers' },
  { token: '--radius-xl', value: '16px', name: 'XLarge', use: 'Large cards, feature panels' },
  { token: '--radius-2xl', value: '20px', name: '2XLarge', use: 'Sheets, modals, featured cards' },
  { token: '--radius-full', value: '9999px', name: 'Full', use: 'Pills, avatars, toggles, status dots' },
] as const;

const tocItems = [
  { id: 'principles', label: 'Principles' },
  { id: 'shadows', label: 'Shadow scale' },
  { id: 'radius', label: 'Radius scale' },
  { id: 'pairing', label: 'Elevation + radius pairing' },
  { id: 'dark-mode-elev', label: 'Dark mode' },
  { id: 'usage-elev', label: 'Usage' },
];

export default function ElevationFoundationsPage() {
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

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

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  }

  const dottedPreviewBg: CSSProperties = {
    backgroundColor: t.bg.surface.secondary.default,
    backgroundImage: `radial-gradient(circle, ${t.border.default.default} 1px, transparent 1px)`,
    backgroundSize: '10px 10px',
  };

  return (
    <>
      <p className="breadcrumb">
        Foundations <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} />{' '}
        Elevation
      </p>
      <h1 className="page-title">Elevation &amp; Radius</h1>
      <p className="page-lead">
        Elevation and radius work as a pair. Shadow depth communicates z-axis position — how far above the
        surface a layer floats. Border radius signals tactility — rounder means more interactive. Together
        they create spatial depth without color.
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
          {/* Card 1 */}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
              }}
            >
              <div style={{ position: 'relative', width: 120, height: 120 }}>
                <Layers
                  size={18}
                  strokeWidth={1.5}
                  color={t.text.brand.default}
                  style={{ position: 'absolute', top: 8, right: 8, opacity: 0.35 }}
                  aria-hidden
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: 80,
                    height: 48,
                    background: t.bg.surface.secondary.default,
                    border: `1.5px solid ${t.border.strong.default}`,
                    borderRadius: 8,
                    zIndex: 1,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 36,
                    left: 12,
                    width: 80,
                    height: 48,
                    background: t.bg.surface.primary.default,
                    border: `1.5px solid ${t.border.strong.default}`,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    zIndex: 2,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 72,
                    left: 24,
                    width: 80,
                    height: 48,
                    background: t.bg.surface.primary.default,
                    border: `1.5px solid ${t.border.strong.default}`,
                    borderRadius: 8,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    zIndex: 3,
                  }}
                />
              </div>
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>
                Shadow = z-axis
              </div>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                Every shadow level represents a specific elevation above the base surface. Higher elevation =
                larger, softer shadow. Never use shadow decoratively.
              </p>
            </div>
          </div>

          {/* Card 2 */}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                gap: 8,
                position: 'relative',
              }}
            >
              <Circle
                size={18}
                strokeWidth={1.5}
                color={t.text.brand.default}
                style={{ position: 'absolute', top: 16, right: 16, opacity: 0.35 }}
                aria-hidden
              />
              {[0, 8, 16, 9999].map((r) => (
                <div
                  key={r}
                  style={{
                    width: 52,
                    height: 52,
                    background: t.bg.surface.primary.default,
                    border: `1.5px solid ${t.border.strong.default}`,
                    borderRadius: r,
                  }}
                />
              ))}
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>
                Radius = tactility
              </div>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                Rounder shapes feel more touchable and interactive. Sharp corners feel structural and static.
                Use radius consistently within a component family.
              </p>
            </div>
          </div>

          {/* Card 3 */}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                gap: 16,
                position: 'relative',
              }}
            >
              <Box
                size={18}
                strokeWidth={1.5}
                color={t.text.brand.default}
                style={{ position: 'absolute', top: 16, right: 16, opacity: 0.35 }}
                aria-hidden
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 90,
                    height: 70,
                    background: t.bg.surface.primary.default,
                    borderRadius: 4,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: 'var(--font-mono), monospace',
                    color: t.text.tertiary.default,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  radius-xs + shadow-lg{' '}
                  <span style={{ color: '#E8186D', fontWeight: 700 }} aria-hidden>
                    ×
                  </span>
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 90,
                    height: 70,
                    background: t.bg.surface.primary.default,
                    borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: 'var(--font-mono), monospace',
                    color: t.text.tertiary.default,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  radius-lg + shadow-lg{' '}
                  <span style={{ color: '#0A8853', fontWeight: 700 }} aria-hidden>
                    ✓
                  </span>
                </span>
              </div>
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>
                Pair intentionally
              </div>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                Shadow and radius should feel like they belong to the same layer. A large shadow with a tiny
                radius creates visual tension. Match their scale level.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="shadows" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Shadow scale
        </h2>
        <p style={sectionLead}>
          Five levels from barely-there to full-depth overlay. Each level has a specific use case — using the
          wrong level for a context breaks the spatial model.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SHADOW_SCALE.map((shadow) => {
            const cssVal = isDark ? shadow.valueDark : shadow.value;
            return (
              <div
                key={shadow.token}
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
                    width: 200,
                    minWidth: 200,
                    background: t.bg.surface.secondary.default,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      width: 120,
                      height: 72,
                      background: t.bg.surface.primary.default,
                      borderRadius: 10,
                      boxShadow: cssVal,
                    }}
                  />
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => copyText(shadow.token)}
                        style={{
                          ...chipStyleB(t),
                          cursor: 'pointer',
                          border: 'none',
                        }}
                      >
                        {copied === shadow.token ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Check size={12} aria-hidden />
                            Copied
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Copy size={12} aria-hidden />
                            {shadow.token}
                          </span>
                        )}
                      </button>
                      <span style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>
                        {shadow.name}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      fontSize: 12,
                      color: t.text.tertiary.default,
                      background: t.bg.surface.secondary.default,
                      padding: '4px 10px',
                      borderRadius: 6,
                      width: 'fit-content',
                    }}
                  >
                    {cssVal}
                  </span>
                  <div style={{ height: 1, background: t.border.default.default }} />
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                    {shadow.use}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {shadow.components.map((c) => (
                      <span key={c} style={chipStyleA({ fontSize: 11, padding: '2px 8px' })}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="radius" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Radius scale
        </h2>
        <p style={sectionLead}>
          Eight stops from sharp to full pill. Radius is not decorative — each stop maps to a specific type
          of component.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {RADIUS_SCALE.map((item) => (
            <div
              key={item.token}
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
                  width: 120,
                  minWidth: 120,
                  background: t.bg.surface.secondary.default,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 20,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 48,
                    background: t.bg.surface.primary.default,
                    border: `1.5px solid ${t.border.strong.default}`,
                    borderRadius: item.value,
                  }}
                />
              </div>
              <div
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={chipStyleB(t, { fontSize: 11, padding: '3px 10px' })}>{item.token}</span>
                  {'default' in item && item.default ? (
                    <span style={chipStyleA({ fontSize: 11, padding: '2px 8px' })}>default</span>
                  ) : null}
                </div>
                <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>
                  {item.value}
                </span>
                <span style={{ fontSize: 12, color: t.text.secondary.default, lineHeight: 1.5 }}>{item.use}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="pairing" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Elevation + radius pairing
        </h2>
        <p style={sectionLead}>
          Shadow level and border radius should feel like they belong to the same spatial layer. This table
          shows the recommended pairings for every VDS component type.
        </p>
        <div
          style={{
            background: t.bg.surface.secondary.default,
            borderRadius: 14,
            border: `1px solid ${t.border.default.default}`,
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${t.border.strong.default}` }}>
                {['Component type', 'Shadow', 'Radius', 'Example'].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: t.text.tertiary.default,
                      padding: '12px 16px',
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
                  ['Inline elements (badges, chips, tags)', 'none', 'radius-xs / radius-full', 'Badge, Tag, Kbd'],
                  ['Interactive controls (buttons, inputs)', 'none / xs', 'radius-md', 'Button, Input, Select'],
                  ['Cards (default)', 'shadow-sm', 'radius-lg', 'Card, Feature card'],
                  ['Floating UI (dropdowns, tooltips)', 'shadow-md', 'radius-lg', 'Dropdown, Popover, Tooltip'],
                  ['Overlays (modals, drawers)', 'shadow-lg', 'radius-xl / radius-2xl', 'Modal, Drawer'],
                  ['Full-screen overlays', 'shadow-xl', 'radius-2xl', 'Command palette, Lightbox'],
                ] as const
              ).map((row, idx) => (
                <tr
                  key={row[0]}
                  style={{
                    background: idx % 2 === 0 ? t.bg.surface.primary.default : t.bg.surface.secondary.default,
                  }}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={`${row[0]}-${ci}`}
                      style={{ padding: '12px 16px', fontSize: 13, color: t.text.secondary.default, verticalAlign: 'top' }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              <tr
                style={{
                  background: 'rgba(232,24,109,0.04)',
                  borderTop: '2px solid rgba(232,24,109,0.2)',
                }}
              >
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#E8186D' }}>Avoid</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: t.text.secondary.default }}>shadow-xl</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: t.text.secondary.default }}>radius-xs</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: t.text.secondary.default }}>
                  Creates visual tension — never combine max shadow with min radius
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
          {/* Example 1 Card */}
          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div style={{ ...dottedPreviewBg, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 140 }}>
              <div
                style={{
                  width: 120,
                  height: 80,
                  background: t.bg.surface.primary.default,
                  borderRadius: 12,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}
              />
            </div>
            <div style={{ padding: '14px 16px', borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Card</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={chipStyleB(t, { fontSize: 11 })}>shadow-sm</span>
                <span style={chipStyleB(t, { fontSize: 11 })}>radius-lg</span>
              </div>
            </div>
          </div>

          {/* Example 2 Modal */}
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
                position: 'relative',
                width: '100%',
                minHeight: 140,
                background: 'rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
              }}
            >
              <div
                style={{
                  width: 140,
                  height: 90,
                  background: t.bg.surface.primary.default,
                  borderRadius: 16,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}
              />
            </div>
            <div style={{ padding: '14px 16px', borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Modal</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={chipStyleB(t, { fontSize: 11 })}>shadow-lg</span>
                <span style={chipStyleB(t, { fontSize: 11 })}>radius-xl</span>
              </div>
            </div>
          </div>

          {/* Example 3 Dropdown */}
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
                background: t.bg.surface.secondary.default,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0,
                minHeight: 140,
              }}
            >
              <div
                style={{
                  height: 28,
                  width: 100,
                  background: t.bg.surface.primary.default,
                  border: `1.5px solid ${t.border.strong.default}`,
                  borderRadius: 8,
                }}
              />
              <div
                style={{
                  marginTop: 4,
                  width: 120,
                  background: t.bg.surface.primary.default,
                  borderRadius: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {[0.6, 0.45, 0.35].map((op) => (
                  <div
                    key={op}
                    style={{
                      height: 6,
                      borderRadius: 2,
                      background: t.text.secondary.default,
                      opacity: op,
                      width: '100%',
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ padding: '14px 16px', borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Dropdown</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={chipStyleB(t, { fontSize: 11 })}>shadow-md</span>
                <span style={chipStyleB(t, { fontSize: 11 })}>radius-lg</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="dark-mode-elev" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Dark mode elevation
        </h2>
        <p style={sectionLead}>
          Shadows become invisible on dark backgrounds — a black shadow on a near-black surface has zero
          contrast. VDS solves this two ways: stronger shadow values and subtle surface lightening.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                background: '#0F1117',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                margin: 16,
              }}
            >
              {[
                '0 1px 4px rgba(0,0,0,0.5)',
                '0 4px 12px rgba(0,0,0,0.55)',
                '0 8px 24px rgba(0,0,0,0.6)',
              ].map((sh) => (
                <div
                  key={sh}
                  style={{
                    width: 60,
                    height: 44,
                    background: '#161B27',
                    borderRadius: 8,
                    boxShadow: sh,
                  }}
                />
              ))}
            </div>
            <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>
                Amplified opacity
              </div>
              <div style={{ height: 1, background: t.border.default.default, marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                Dark mode shadows use 4–5× higher opacity than light mode. The same pixel blur — just deeper.
                This preserves spatial depth without introducing colored shadows.
              </p>
              <table style={{ width: '100%', marginTop: 10, borderCollapse: 'collapse', fontSize: 11, fontFamily: 'var(--font-mono), monospace' }}>
                <tbody>
                  {(
                    [
                      ['shadow-sm', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.5)'],
                      ['shadow-md', 'rgba(0,0,0,0.10)', 'rgba(0,0,0,0.55)'],
                      ['shadow-lg', 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.6)'],
                    ] as const
                  ).map((row) => (
                    <tr key={row[0]}>
                      <td style={{ padding: '4px 8px 4px 0', color: t.text.tertiary.default }}>{row[0]}</td>
                      <td style={{ padding: '4px 4px', color: t.text.secondary.default }}>light: {row[1]}</td>
                      <td style={{ padding: '4px 0', color: t.text.secondary.default }}>dark: {row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                background: '#0F1117',
                borderRadius: 10,
                margin: 16,
                position: 'relative',
                overflow: 'hidden',
                padding: 12,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 12,
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: 'var(--font-mono), monospace',
                }}
              >
                Base · bg.surface.primary
              </span>
              <div
                style={{
                  marginTop: 28,
                  background: '#161B27',
                  borderRadius: 8,
                  padding: 10,
                }}
              >
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono), monospace' }}>
                  Elevated · bg.surface.secondary
                </span>
                <div
                  style={{
                    marginTop: 8,
                    background: '#1E2435',
                    borderRadius: 6,
                    padding: 8,
                  }}
                >
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono), monospace' }}>
                    Top · bg.surface.tertiary
                  </span>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>
                Surface lightening
              </div>
              <div style={{ height: 1, background: t.border.default.default, marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                In dark mode, elevation is also communicated by lightening the surface color. Higher layers use
                progressively lighter bg tokens. This mirrors how light physically bounces off surfaces.
              </p>
            </div>
          </div>
        </div>

        <Callout variant="info" title="Never use colored shadows">
          Adding a color tint to shadows (blue glow, brand glow) is a trend that breaks the spatial model and
          creates accessibility issues. VDS shadows are always neutral — rgba(0,0,0,N). Color belongs in the
          surface and border, not the shadow.
        </Callout>
      </section>

      <section id="usage-elev" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Usage
        </h2>
        <p style={sectionLead}>
          Elevation mistakes compound. A card with the wrong shadow level disrupts the entire spatial hierarchy
          of the page.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text.primary.default, marginBottom: 16 }}>Do &amp; Don&apos;t</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {/* Pair 1 DO */}
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
                height: 180,
                background: t.bg.surface.secondary.default,
                padding: 24,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 16,
                  background: t.bg.surface.secondary.default,
                  borderRadius: 8,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 28,
                  top: 36,
                  width: 140,
                  padding: 12,
                  background: t.bg.surface.primary.default,
                  borderRadius: 12,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}
              >
                {[10, 8, 6].map((h) => (
                  <div
                    key={h}
                    style={{
                      height: h,
                      borderRadius: 2,
                      background: t.text.secondary.default,
                      opacity: 0.35,
                      marginBottom: 6,
                      width: h === 10 ? '70%' : '90%',
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 100,
                  top: 52,
                  width: 88,
                  padding: 8,
                  background: t.bg.surface.primary.default,
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                  zIndex: 2,
                }}
              >
                {[5, 5, 5].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      height: h,
                      borderRadius: 2,
                      background: t.text.secondary.default,
                      opacity: 0.4,
                      marginBottom: 4,
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ height: 3, background: '#0A8853' }} />
            <div style={{ padding: '16px 20px' }}>
              <span style={chipStyleA()}>✓ Do</span>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, marginTop: 10, marginBottom: 0 }}>
                Each layer has exactly the shadow it needs. The dropdown visually floats above the card because
                its shadow is proportionally deeper.
              </p>
            </div>
          </div>

          {/* Pair 1 DON'T */}
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
                height: 180,
                background: t.bg.surface.secondary.default,
                padding: 24,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 28,
                  top: 36,
                  width: 140,
                  padding: 12,
                  background: t.bg.surface.primary.default,
                  borderRadius: 12,
                  boxShadow: '0 16px 48px rgba(0,0,0,0.16)',
                }}
              >
                {[10, 8, 6].map((h) => (
                  <div
                    key={h}
                    style={{
                      height: h,
                      borderRadius: 2,
                      background: t.text.secondary.default,
                      opacity: 0.35,
                      marginBottom: 6,
                      width: h === 10 ? '70%' : '90%',
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 100,
                  top: 52,
                  width: 88,
                  padding: 8,
                  background: t.bg.surface.primary.default,
                  borderRadius: 8,
                  boxShadow: 'none',
                  border: `1px solid ${t.border.default.default}`,
                  zIndex: 2,
                }}
              >
                {[5, 5, 5].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      height: h,
                      borderRadius: 2,
                      background: t.text.secondary.default,
                      opacity: 0.4,
                      marginBottom: 4,
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ height: 3, background: '#E8186D' }} />
            <div style={{ padding: '16px 20px' }}>
              <span style={chipStyleA({ background: 'rgba(232,24,109,0.10)', color: '#E8186D' })}>× Don&apos;t</span>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, marginTop: 10, marginBottom: 0 }}>
                Mismatched shadow levels break the spatial model. A card that out-shadows its own dropdown
                makes the UI feel disordered and heavy.
              </p>
            </div>
          </div>

          {/* Pair 2 DO */}
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
                height: 180,
                background: t.bg.surface.secondary.default,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                alignItems: 'stretch',
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={
                    i === 3
                      ? {
                          height: 32,
                          background: t.bg.fill.primary.default,
                          borderRadius: 8,
                          width: 100,
                        }
                      : {
                          height: 32,
                          background: t.bg.surface.primary.default,
                          border: `1.5px solid ${t.border.strong.default}`,
                          borderRadius: 8,
                        }
                  }
                />
              ))}
            </div>
            <div style={{ height: 3, background: '#0A8853' }} />
            <div style={{ padding: '16px 20px' }}>
              <span style={chipStyleA()}>✓ Do</span>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, marginTop: 10, marginBottom: 0 }}>
                Consistent radius-md across the form creates a unified family. Input, select, and button feel
                like they belong together.
              </p>
            </div>
          </div>

          {/* Pair 2 DON'T */}
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
                height: 180,
                background: t.bg.surface.secondary.default,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                alignItems: 'stretch',
              }}
            >
              <div
                style={{
                  height: 32,
                  background: t.bg.surface.primary.default,
                  border: `1.5px solid ${t.border.strong.default}`,
                  borderRadius: 4,
                }}
              />
              <div
                style={{
                  height: 32,
                  background: t.bg.surface.primary.default,
                  border: `1.5px solid ${t.border.strong.default}`,
                  borderRadius: 12,
                }}
              />
              <div
                style={{
                  height: 32,
                  background: t.bg.fill.primary.default,
                  borderRadius: 9999,
                  width: 100,
                }}
              />
            </div>
            <div style={{ height: 3, background: '#E8186D' }} />
            <div style={{ padding: '16px 20px' }}>
              <span style={chipStyleA({ background: 'rgba(232,24,109,0.10)', color: '#E8186D' })}>× Don&apos;t</span>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, marginTop: 10, marginBottom: 0 }}>
                Mixed radius levels inside a single component group creates visual noise. Users don&apos;t
                consciously notice — but the form feels unpolished.
              </p>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text.primary.default, marginBottom: 16 }}>Quick reference</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div
            style={{
              background: t.bg.surface.secondary.default,
              borderRadius: 14,
              border: `1px solid ${t.border.default.default}`,
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${t.border.strong.default}` }}>
                  {['Token', 'Value', 'Use'].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        color: t.text.tertiary.default,
                        padding: '10px 12px',
                        textAlign: 'left',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SHADOW_SCALE.map((s, idx) => (
                  <tr
                    key={s.token}
                    style={{
                      background: idx % 2 === 0 ? t.bg.surface.primary.default : t.bg.surface.secondary.default,
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono), monospace', fontSize: 12, color: t.text.brand.default }}>
                      {s.token}
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: t.text.secondary.default }}>
                      {isDark ? s.valueDark : s.value}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: t.text.secondary.default }}>{s.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              background: t.bg.surface.secondary.default,
              borderRadius: 14,
              border: `1px solid ${t.border.default.default}`,
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${t.border.strong.default}` }}>
                  {['Token', 'Value', 'Use'].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        color: t.text.tertiary.default,
                        padding: '10px 12px',
                        textAlign: 'left',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RADIUS_SCALE.map((r, idx) => (
                  <tr
                    key={r.token}
                    style={{
                      background: idx % 2 === 0 ? t.bg.surface.primary.default : t.bg.surface.secondary.default,
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono), monospace', fontSize: 12, color: t.text.brand.default }}>
                      {r.token}
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: t.text.secondary.default }}>
                      {r.value}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: t.text.secondary.default }}>{r.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <TableOfContents items={tocItems} />
    </>
  );
}
