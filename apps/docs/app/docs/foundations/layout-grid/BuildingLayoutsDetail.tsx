'use client';

import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { Callout } from '@/components/docs/Callout';
import type { VDSTheme } from '@/lib/theme';

const ANN = '#E8186D';

export type ThemeTokensBL = VDSTheme;

export function vdsSuccessChipStyle(t: Pick<VDSTheme, 'bg' | 'text'>): CSSProperties {
  return {
    background: t.bg.fill.success.default,
    color: t.text.success.default,
    fontSize: 12,
    fontFamily: 'inherit',
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 6,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  };
}

export function vdsTokenChipStyle(t: Pick<VDSTheme, 'bg' | 'text'>): CSSProperties {
  return {
    background: t.bg.fill.brandSubtle.default,
    color: t.text.brand.default,
    fontSize: 12,
    fontFamily: 'var(--font-mono), monospace',
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 6,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  };
}

function defaultBadgeStyle(t: Pick<VDSTheme, 'bg' | 'text'>): CSSProperties {
  return {
    marginLeft: 8,
    fontSize: 9,
    fontWeight: 700,
    fontFamily: 'var(--font-mono), monospace',
    background: t.bg.fill.brandSubtle.default,
    color: t.text.brand.default,
    padding: '1px 6px',
    borderRadius: 4,
  };
}

function dontPillStyle(): CSSProperties {
  return {
    background: 'rgba(232,24,109,0.10)',
    color: ANN,
    fontSize: 12,
    fontFamily: 'inherit',
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 6,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  };
}

const colTint = (isDark: boolean) => (isDark ? 'rgba(21,101,168,0.08)' : 'rgba(0,43,73,0.08)');
const colTintStrong = (isDark: boolean) => (isDark ? 'rgba(21,101,168,0.25)' : 'rgba(0,43,73,0.3)');

type Props = {
  t: VDSTheme;
  isDark: boolean;
  sectionLead: CSSProperties;
  sectionHeadingStyle: CSSProperties;
};

export function BuildingLayoutsDetail({ t, isDark, sectionLead, sectionHeadingStyle }: Props) {
  const h3Style: CSSProperties = { fontSize: 18, marginBottom: 8, color: t.text.primary.default };
  const cardBottom: CSSProperties = {
    padding: '16px 20px',
    borderTop: `1px solid ${t.border.default.default}`,
  };

  return (
    <>
      <section id="container" style={{ marginBottom: 48 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Container
        </h2>
        <p style={sectionLead}>
          The container is the boundary that holds your grid. Understanding how it behaves — fixed or fluid —
          determines how your layout responds to viewport changes.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Fixed */}
          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div style={{ height: 180, background: t.bg.surface.secondary.default, padding: 20, boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, height: '100%' }}>
                <div style={{ width: '45%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0, height: 120 }}>
                  <div
                    style={{
                      flex: 1,
                      background: 'rgba(0,43,73,0.04)',
                      border: '1px dashed rgba(0,43,73,0.15)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'stretch',
                      padding: 0,
                }}
                  >
                    <div style={{ width: 8, background: 'rgba(232,24,109,0.12)' }} />
                    <div
                      style={{
                        flex: 1,
                        background: t.bg.surface.primary.default,
                        border: `1.5px solid ${t.border.strong.default}`,
                        borderRadius: 6,
                        padding: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5,
                        minWidth: 0,
                      }}
                    >
                      {[1, 2, 3].map((k) => (
                        <div key={k} style={{ height: 6, background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                      ))}
                    </div>
                    <div style={{ width: 8, background: 'rgba(232,24,109,0.12)' }} />
                  </div>
                </div>
                <span style={{ fontSize: 12, color: ANN, fontFamily: 'var(--font-mono), monospace', flexShrink: 0 }}>→</span>
                <div style={{ width: '45%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0, height: 120 }}>
                  <div
                    style={{
                      flex: 1,
                      background: 'rgba(0,43,73,0.04)',
                      border: '1px dashed rgba(0,43,73,0.15)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'stretch',
                      position: 'relative',
                    }}
                  >
                    <div style={{ width: 20, background: 'rgba(232,24,109,0.12)', position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%) rotate(-90deg)',
                          fontSize: 9,
                          color: ANN,
                          fontFamily: 'var(--font-mono), monospace',
                          whiteSpace: 'nowrap',
                      fontWeight: 600,
                        }}
                      >
                        margins grow
                      </span>
                    </div>
                    <div
                      style={{
                        width: 140,
                        maxWidth: '55%',
                        margin: '0 auto',
                        background: t.bg.surface.primary.default,
                        border: `1.5px solid ${t.border.strong.default}`,
                        borderRadius: 6,
                        padding: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5,
                        alignSelf: 'stretch',
                        justifyContent: 'center',
                      }}
                    >
                      {[1, 2, 3].map((k) => (
                        <div key={k} style={{ height: 6, background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                      ))}
                    </div>
                    <div style={{ width: 20, background: 'rgba(232,24,109,0.12)' }} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ ...cardBottom, padding: '16px 20px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>Fixed</div>
              <div style={{ height: 1, background: t.border.default.default, margin: '8px 0' }} />
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: '0 0 10px' }}>
                The container has a set max-width. As the viewport grows beyond it, margins expand to absorb the extra
                space. Content width never exceeds the defined limit.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <span style={vdsSuccessChipStyle(t)}>✓ Docs &amp; product</span>
                <span style={vdsSuccessChipStyle(t)}>✓ Long-form content</span>
              </div>
            </div>
          </div>

          {/* Fluid */}
          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div style={{ height: 180, background: t.bg.surface.secondary.default, padding: 20, boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, height: '100%' }}>
                <div style={{ width: '45%', minWidth: 0, height: 120, display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      flex: 1,
                      background: 'rgba(0,43,73,0.04)',
                      border: '1px dashed rgba(0,43,73,0.15)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'stretch',
                    }}
                  >
                    <div style={{ width: 8, background: 'rgba(232,24,109,0.12)' }} />
                    <div
                      style={{
                        flex: 1,
                        background: t.bg.surface.primary.default,
                        border: `1.5px solid ${t.border.strong.default}`,
                        borderRadius: 6,
                        padding: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5,
                        minWidth: 0,
                      }}
                    >
                      {[1, 2, 3].map((k) => (
                        <div key={k} style={{ height: 6, background: t.bg.surface.tertiary.default, borderRadius: 2, width: '100%' }} />
                      ))}
                    </div>
                    <div style={{ width: 8, background: 'rgba(232,24,109,0.12)' }} />
                  </div>
                </div>
                <span style={{ fontSize: 12, color: ANN, fontFamily: 'var(--font-mono), monospace', flexShrink: 0 }}>→</span>
                <div style={{ width: '45%', minWidth: 0, height: 120, display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      flex: 1,
                      background: 'rgba(0,43,73,0.04)',
                      border: '1px dashed rgba(0,43,73,0.15)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'stretch',
                      position: 'relative',
                    }}
                  >
                    <div style={{ width: 8, background: 'rgba(232,24,109,0.12)' }} />
                    <div
                      style={{
                        flex: 1,
                        background: t.bg.surface.primary.default,
                        border: `1.5px solid ${t.border.strong.default}`,
                        borderRadius: 6,
                        padding: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          bottom: -2,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: 9,
                          color: ANN,
                          fontFamily: 'var(--font-mono), monospace',
                          fontWeight: 600,
                        }}
                      >
                        container grows
                      </span>
                      {[1, 2, 3].map((k) => (
                        <div key={k} style={{ height: 6, background: t.bg.surface.tertiary.default, borderRadius: 2, width: '100%' }} />
                      ))}
                    </div>
                    <div style={{ width: 8, background: 'rgba(232,24,109,0.12)' }} />
                  </div>
                </div>
              </div>
            </div>
            <div style={cardBottom}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>Fluid</div>
              <div style={{ height: 1, background: t.border.default.default, margin: '8px 0' }} />
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: '0 0 10px' }}>
                The container fills 100% of the viewport minus fixed margins. Columns scale proportionally as the viewport
                grows. Content breathes into the available space.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <span style={vdsSuccessChipStyle(t)}>✓ Dashboards</span>
                <span style={vdsSuccessChipStyle(t)}>✓ High-density tools</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: t.bg.surface.secondary.default,
            borderRadius: 14,
            border: `1px solid ${t.border.default.default}`,
            overflow: 'hidden',
          }}
        >
          <table className="props-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>SIZE</th>
                <th>MAX WIDTH</th>
                <th>BEHAVIOR</th>
                <th>USE CASE</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ['sm', '640px', 'Fixed, centered', 'Modals, dialogs, focused forms'],
                  ['md', '768px', 'Fixed, centered', 'Reading-heavy content, articles'],
                  ['lg', '1024px', 'Fixed, centered', 'Standard product pages'],
                  ['xl', '1200px', 'Fixed, centered', 'Default VDS docs layout', true],
                  ['2xl', '1400px', 'Fixed, centered', 'Wide desktop applications'],
                  ['full', '100%', 'Fluid', 'Dashboards, data-heavy screens'],
                ] as const
              ).map(([size, max, behavior, use, def]) => (
                <tr key={size}>
                  <td>
                    <code>{size}</code>
                  </td>
                  <td>{max}</td>
                  <td>{behavior}</td>
                  <td>
                    {use}
                    {def ? <span style={defaultBadgeStyle(t)}>default</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="responsive-grid" style={{ marginBottom: 48 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Responsive grid
        </h2>
        <p style={sectionLead}>
          The grid adapts at each breakpoint — columns reduce, gutters tighten, and margins shrink. The content priorities
          shift to match the available space.
        </p>

        <div
          style={{
            background: t.bg.surface.secondary.default,
            borderRadius: 14,
            border: `1px solid ${t.border.default.default}`,
            padding: '28px 24px 20px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'nowrap' }}>
            {(
              [
                { k: 'xs', flex: 0.6, h: 80, cols: 4, range: '0–575px', chip: '4 col', def: false },
                { k: 'sm', flex: 0.8, h: 100, cols: 4, range: '576–767px', chip: '4 col', def: false },
                { k: 'md', flex: 1.2, h: 120, cols: 8, range: '768–1023px', chip: '8 col', def: false },
                { k: 'lg', flex: 1.8, h: 150, cols: 12, range: '1024–1279px', chip: '12 col', def: true },
                { k: 'xl', flex: 2.2, h: 160, cols: 12, range: '1280px+', chip: '12 col', def: false },
              ] as const
            ).map((bp, idx) => (
              <Fragment key={bp.k}>
                {idx > 0 ? (
                  <span
                    style={{
                      fontSize: 12,
                      color: ANN,
                      fontFamily: 'var(--font-mono), monospace',
                      alignSelf: 'center',
                      flexShrink: 0,
                    }}
                  >
                    →
                  </span>
                ) : null}
                <div style={{ flex: bp.flex, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: '100%',
                      height: bp.h,
                      background: t.bg.surface.primary.default,
                      border: `1.5px solid ${t.border.strong.default}`,
                      borderRadius: 8,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: 4,
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ height: 12, background: t.bg.surface.tertiary.default, marginBottom: 4, flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', gap: 2, minHeight: 0 }}>
                      {Array.from({ length: bp.cols }).map((_, i) => (
                        <div key={i} style={{ flex: 1, background: colTint(isDark), minWidth: 0 }} />
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono), monospace', color: t.text.primary.default }}>
                    {bp.k}
                  </span>
                  <span style={{ fontSize: 10, color: t.text.tertiary.default, fontFamily: 'var(--font-mono), monospace' }}>{bp.range}</span>
                  <span
                    style={{
                      ...vdsTokenChipStyle(t),
                      ...(bp.def
                        ? {
                            border: `1px solid ${t.text.brand.default}`,
                            boxSizing: 'border-box',
                          }
                        : {}),
                    }}
                  >
                    {bp.chip}
                    {bp.def ? (
                      <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700 }}>default</span>
                    ) : null}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        <div
          style={{
            background: t.bg.surface.primary.default,
            border: `1px solid ${t.border.default.default}`,
            borderRadius: 12,
            overflow: 'hidden',
            marginTop: 16,
          }}
        >
          <table className="props-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>BREAKPOINT</th>
                <th>COLUMNS</th>
                <th>GUTTER</th>
                <th>MARGIN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>xs–sm</td>
                <td>4</td>
                <td>16px</td>
                <td>16px / 24px</td>
              </tr>
              <tr>
                <td>md</td>
                <td>8</td>
                <td>24px</td>
                <td>40px</td>
              </tr>
              <tr style={{ background: t.bg.fill.brandSubtle.default }}>
                <td style={{ color: t.text.brand.default, fontWeight: 600 }}>lg</td>
                <td style={{ color: t.text.brand.default, fontWeight: 600 }}>12</td>
                <td style={{ color: t.text.brand.default, fontWeight: 600 }}>24px</td>
                <td style={{ color: t.text.brand.default, fontWeight: 600 }}>56px</td>
              </tr>
              <tr>
                <td>xl</td>
                <td>12</td>
                <td>32px</td>
                <td>auto</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 style={{ ...h3Style, marginTop: 28 }}>Spacing at breakpoints</h3>
        <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 12 }}>
          As breakpoints narrow, spacing drops exactly one step. Never skip levels — abrupt jumps feel jarring and break
          rhythm.
        </p>
        <div className="props-table-wrap" style={{ marginBottom: 16 }}>
          <table className="props-table">
            <thead>
              <tr>
                <th>CONTEXT</th>
                <th>lg / xl</th>
                <th>md</th>
                <th>xs / sm</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ['Page margin', '--space-layout-xl (56px)', '--space-layout-md (40px)', '--space-4 (16px)'],
                  ['Section gap', '--space-layout-lg (48px)', '--space-layout-md (32px)', '--space-layout-sm (24px)'],
                  ['Card padding', '--space-component-lg (24px)', '--space-component-md (16px)', '--space-component-sm (12px)'],
                  ['Button padding (H)', '--space-5 (20px)', '--space-4 (16px)', '--space-3 (12px)'],
                  ['Grid gutter', '24–32px', '24px', '16px'],
                ] as const
              ).map(([ctx, lg, md, xs]) => (
                <tr key={ctx}>
                  <td>{ctx}</td>
                  <td>
                    <span style={vdsTokenChipStyle(t)}>{lg}</span>
                  </td>
                  <td>
                    <span style={vdsTokenChipStyle(t)}>{md}</span>
                  </td>
                  <td>
                    <span style={vdsTokenChipStyle(t)}>{xs}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout variant="info" title="One step at a time">
          When adapting spacing for mobile, step down the scale exactly once. <code>--space-6</code> (24px) at desktop
          becomes <code>--space-4</code> (16px) at tablet, then <code>--space-3</code> (12px) at mobile. This preserves
          rhythm without cramping.
        </Callout>
      </section>

      <LayoutPatternsSection t={t} isDark={isDark} sectionHeadingStyle={sectionHeadingStyle} />

      <NestingSection t={t} isDark={isDark} sectionLead={sectionLead} sectionHeadingStyle={sectionHeadingStyle} />

      <DosDontsSection t={t} isDark={isDark} sectionLead={sectionLead} sectionHeadingStyle={sectionHeadingStyle} />
    </>
  );
}

function LayoutPatternsSection({
  t,
  isDark,
  sectionHeadingStyle,
}: {
  t: VDSTheme;
  isDark: boolean;
  sectionHeadingStyle: CSSProperties;
}) {
  const ct = colTint(isDark);
  const cts = colTintStrong(isDark);
  const cardBottom: CSSProperties = {
    padding: '16px 20px',
    borderTop: `1px solid ${t.border.default.default}`,
  };

  return (
    <section id="layout-patterns" style={{ marginBottom: 48 }}>
      <h2 className="section-title" style={sectionHeadingStyle}>
        Layout patterns
      </h2>
      <p
        style={{
          fontSize: 17,
          color: t.text.secondary.default,
          lineHeight: 1.6,
          maxWidth: 640,
          marginBottom: 24,
        }}
      >
        These five patterns cover virtually every VDS screen. Each combines the container, grid, and spacing system
        differently based on content density and user goals.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {/* 1 Single column */}
        <div
          style={{
            background: t.bg.surface.primary.default,
            border: `1px solid ${t.border.default.default}`,
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <div style={{ height: 200, background: t.bg.surface.secondary.default, padding: 16, boxSizing: 'border-box' }}>
            <div
              style={{
                width: '100%',
                height: 168,
                background: t.bg.surface.primary.default,
                border: `1.5px solid ${t.border.strong.default}`,
                borderRadius: 10,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <div style={{ height: 16, background: t.bg.surface.tertiary.default, borderBottom: `1px solid ${t.border.default.default}`, flexShrink: 0 }} />
              <div style={{ flex: 1, padding: 10, position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', left: 4, top: 10, bottom: 10, width: 1, background: ANN, opacity: 0.5 }} />
                <div style={{ position: 'absolute', right: 4, top: 10, bottom: 10, width: 1, background: ANN, opacity: 0.5 }} />
                <span style={{ position: 'absolute', left: 2, top: '45%', fontSize: 8, color: ANN, fontFamily: 'var(--font-mono), monospace' }}>
                  auto
                </span>
                <span style={{ position: 'absolute', right: 2, top: '45%', fontSize: 8, color: ANN, fontFamily: 'var(--font-mono), monospace' }}>
                  auto
                </span>
                <div style={{ width: '60%', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: 8, background: cts, borderRadius: 2, marginBottom: 8, width: '50%' }} />
                  {[100, 90, 95, 85, 70].map((w, i) => (
                    <div key={i} style={{ height: 5, background: t.bg.surface.tertiary.default, borderRadius: 2, marginBottom: 4, width: `${w}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={cardBottom}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 4 }}>Single column</div>
            <div style={{ height: 1, background: t.border.default.default, margin: '8px 0' }} />
            <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: '0 0 10px' }}>
              Centered content with auto margins. Maximum readability for long-form text, articles, and focused tasks.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={vdsSuccessChipStyle(t)}>✓ Articles</span>
              <span style={vdsSuccessChipStyle(t)}>✓ Forms</span>
              <span style={vdsSuccessChipStyle(t)}>✓ Onboarding</span>
            </div>
          </div>
        </div>

        {/* 2 Two column */}
        <div
          style={{
            background: t.bg.surface.primary.default,
            border: `1px solid ${t.border.default.default}`,
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <div style={{ height: 200, background: t.bg.surface.secondary.default, padding: 16, boxSizing: 'border-box', position: 'relative' }}>
            <div
              style={{
                width: '100%',
                height: 168,
                background: t.bg.surface.primary.default,
                border: `1.5px solid ${t.border.strong.default}`,
                borderRadius: 10,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ height: 16, background: t.bg.surface.tertiary.default, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', gap: 10, padding: 10, minHeight: 0 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ height: 7, background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                  {[100, 85, 90, 75].map((w, i) => (
                    <div key={i} style={{ height: 5, background: t.bg.surface.tertiary.default, borderRadius: 2, width: `${w}%` }} />
                  ))}
                </div>
                <div style={{ width: 1, background: t.border.default.default, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ height: 7, background: t.bg.surface.tertiary.default, borderRadius: 2 }} />
                  {[100, 85, 90, 75].map((w, i) => (
                    <div key={i} style={{ height: 5, background: t.bg.surface.tertiary.default, borderRadius: 2, width: `${w}%` }} />
                  ))}
                </div>
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 9,
                color: ANN,
                fontFamily: 'var(--font-mono), monospace',
                fontWeight: 600,
              }}
            >
              6 col + 6 col
            </div>
          </div>
          <div style={cardBottom}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 4 }}>Two column</div>
            <div style={{ height: 1, background: t.border.default.default, margin: '8px 0' }} />
            <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: '0 0 10px' }}>
              Equal split for comparing content, settings panels, or parallel information streams.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={vdsSuccessChipStyle(t)}>✓ Comparisons</span>
              <span style={vdsSuccessChipStyle(t)}>✓ Settings</span>
              <span style={vdsSuccessChipStyle(t)}>✓ Split views</span>
            </div>
          </div>
        </div>

        {/* 3 Sidebar + content */}
        <div
          style={{
            background: t.bg.surface.primary.default,
            border: `1px solid ${t.border.default.default}`,
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <div style={{ height: 200, background: t.bg.surface.secondary.default, padding: 16, boxSizing: 'border-box', position: 'relative' }}>
            <div
              style={{
                width: '100%',
                height: 168,
                background: t.bg.surface.primary.default,
                border: `1.5px solid ${t.border.strong.default}`,
                borderRadius: 10,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ height: 16, background: t.bg.surface.tertiary.default, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', gap: 6, padding: 8, minHeight: 0 }}>
                <div
                  style={{
                    width: 36,
                    flexShrink: 0,
                    background: isDark ? 'rgba(21,101,168,0.06)' : 'rgba(0,43,73,0.06)',
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 6,
                    padding: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  {[85, 65, 75, 55, 70].map((w, i) => (
                    <div key={i} style={{ height: 4, background: t.bg.surface.tertiary.default, borderRadius: 2, width: `${w}%` }} />
                  ))}
                </div>
                <div
                  style={{
                    flex: 1,
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 6,
                    padding: 7,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ height: 7, background: isDark ? 'rgba(21,101,168,0.25)' : 'rgba(0,43,73,0.25)', borderRadius: 2, marginBottom: 6 }} />
                  {[100, 90, 85, 80].map((w, i) => (
                    <div key={i} style={{ height: 5, background: t.bg.surface.tertiary.default, borderRadius: 2, marginBottom: 4, width: `${w}%` }} />
                  ))}
                </div>
                <div
                  style={{
                    width: 24,
                    flexShrink: 0,
                    background: isDark ? 'rgba(21,101,168,0.04)' : 'rgba(0,43,73,0.04)',
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 6,
                    padding: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  {[90, 80, 85, 75].map((w, i) => (
                    <div key={i} style={{ height: 3, background: t.bg.surface.tertiary.default, borderRadius: 2, width: `${w}%` }} />
                  ))}
                </div>
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: 6,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 9,
                color: ANN,
                fontFamily: 'var(--font-mono), monospace',
                fontWeight: 600,
              }}
            >
              3 col + 7 col + 2 col
            </div>
          </div>
          <div style={cardBottom}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 4 }}>Sidebar + content</div>
            <div style={{ height: 1, background: t.border.default.default, margin: '8px 0' }} />
            <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: '0 0 10px' }}>
              Fixed sidebar navigation with a flexible content area. The sidebar is a grid influencer — it compresses the
              main grid when open.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={vdsSuccessChipStyle(t)}>✓ Product docs</span>
              <span style={vdsSuccessChipStyle(t)}>✓ Admin panels</span>
              <span style={vdsSuccessChipStyle(t)}>✓ VDS layout</span>
            </div>
          </div>
        </div>

        {/* 4 Dashboard */}
        <div
          style={{
            background: t.bg.surface.primary.default,
            border: `1px solid ${t.border.default.default}`,
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <div style={{ height: 200, background: t.bg.surface.secondary.default, padding: 16, boxSizing: 'border-box' }}>
            <div
              style={{
                width: '100%',
                height: 168,
                background: t.bg.surface.primary.default,
                border: `1.5px solid ${t.border.strong.default}`,
                borderRadius: 10,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ height: 16, background: t.bg.surface.tertiary.default, flexShrink: 0 }} />
              <div
                style={{
                  flex: 1,
                  padding: 8,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 4,
                  minHeight: 0,
                }}
              >
                <div
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 6,
                    padding: 5,
                    height: 36,
                  }}
                />
                <div
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 6,
                    padding: 5,
                    height: 36,
                  }}
                />
                <div
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 6,
                    padding: 5,
                    height: 36,
                  }}
                />
                <div
                  style={{
                    gridColumn: 'span 2',
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 6,
                    padding: 5,
                    height: 44,
                  }}
                />
                <div
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 6,
                    padding: 5,
                    height: 44,
                  }}
                />
              </div>
            </div>
          </div>
          <div style={cardBottom}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 4 }}>Dashboard grid</div>
            <div style={{ height: 1, background: t.border.default.default, margin: '8px 0' }} />
            <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: '0 0 10px' }}>
              Dense grid of cards and data visualizations. Uses Condensed gutter mode. No sidebar — full width maximizes
              data density.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={vdsSuccessChipStyle(t)}>✓ Analytics</span>
              <span style={vdsSuccessChipStyle(t)}>✓ Dashboards</span>
              <span style={vdsSuccessChipStyle(t)}>✓ Monitoring</span>
            </div>
          </div>
        </div>

        {/* 5 Full bleed */}
        <div
          style={{
            background: t.bg.surface.primary.default,
            border: `1px solid ${t.border.default.default}`,
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <div style={{ height: 200, background: t.bg.surface.secondary.default, padding: 16, boxSizing: 'border-box', position: 'relative' }}>
            <div
              style={{
                width: '100%',
                height: 168,
                background: t.bg.surface.primary.default,
                border: `1.5px solid ${t.border.strong.default}`,
                borderRadius: 10,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  height: 50,
                  background: colCell(isDark),
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 9,
                    color: ANN,
                    fontFamily: 'var(--font-mono), monospace',
                    fontWeight: 600,
                  }}
                >
                  no margins
                </span>
                <div
                  style={{
                    height: 6,
                    width: '40%',
                    margin: '0 auto',
                    marginTop: 10,
                    background: 'rgba(255,255,255,0.4)',
                    borderRadius: 2,
                  }}
                />
              </div>
              <div style={{ flex: 1, padding: 8, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, minHeight: 0 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ background: t.bg.surface.tertiary.default, borderRadius: 4 }} />
                ))}
              </div>
            </div>
          </div>
          <div style={cardBottom}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 4 }}>Full bleed</div>
            <div style={{ height: 1, background: t.border.default.default, margin: '8px 0' }} />
            <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: '0 0 10px' }}>
              Hero sections and image backgrounds that intentionally break the grid to span the full viewport width.
              Content inside still aligns to the grid.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={vdsSuccessChipStyle(t)}>✓ Landing pages</span>
              <span style={vdsSuccessChipStyle(t)}>✓ Marketing</span>
              <span style={vdsSuccessChipStyle(t)}>✓ Hero sections</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function colCell(isDark: boolean) {
  return isDark ? 'rgba(21,101,168,0.65)' : 'rgba(0,43,73,0.55)';
}

function NestingSection({
  t,
  isDark,
  sectionLead,
  sectionHeadingStyle,
}: {
  t: VDSTheme;
  isDark: boolean;
  sectionLead: CSSProperties;
  sectionHeadingStyle: CSSProperties;
}) {
  return (
    <section id="nesting" style={{ marginBottom: 48 }}>
      <h2 className="section-title" style={sectionHeadingStyle}>
        Nesting grids
      </h2>
      <p style={sectionLead}>
        A grid inside another grid. The nested grid inherits the parent column count or defines its own. Use for complex
        component layouts that need precise internal alignment.
      </p>

      <div
        style={{
          background: t.bg.surface.secondary.default,
          borderRadius: 14,
          border: `1px solid ${t.border.default.default}`,
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', gap: 4, marginBottom: 6, paddingLeft: 2 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: t.text.tertiary.default, fontFamily: 'var(--font-mono), monospace' }}>
              {i + 1}
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 4,
            height: 160,
            position: 'relative',
            background: isDark ? 'rgba(21,101,168,0.06)' : 'rgba(0,43,73,0.06)',
            borderRadius: 10,
            padding: 12,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              gridColumn: 'span 8',
              background: isDark ? 'rgba(21,101,168,0.08)' : 'rgba(0,43,73,0.08)',
              borderRadius: 8,
              padding: 8,
              border: '1.5px dashed rgba(0,43,73,0.2)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono), monospace', color: t.text.brand.default, marginBottom: 4 }}>
              Nested grid (8 col)
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: 3,
                height: 80,
                marginTop: 4,
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: isDark ? 'rgba(21,101,168,0.15)' : 'rgba(0,43,73,0.15)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: 2,
                  }}
                >
                  <span style={{ fontSize: 7, color: t.text.brand.default, fontFamily: 'var(--font-mono), monospace' }}>{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              gridColumn: 'span 4',
              background: isDark ? 'rgba(21,101,168,0.04)' : 'rgba(0,43,73,0.04)',
              borderRadius: 8,
              padding: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono), monospace', color: t.text.secondary.default }}>Aside (4 col)</span>
            {[40, 60, 50, 70].map((w, i) => (
              <div key={i} style={{ height: 6, background: t.bg.surface.tertiary.default, borderRadius: 2, width: `${w}%` }} />
            ))}
          </div>
        </div>
        <p style={{ fontSize: 12, color: t.text.tertiary.default, textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
          The nested grid on the left defines 8 columns within its 8-column parent span. The aside on the right uses the
          remaining 4 columns.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>
            <span style={{ color: t.text.success.default, marginRight: 6 }}>✓</span>
            Inherit parent columns
          </div>
          <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
            When a nested grid&apos;s container spans N columns, the child grid typically defines N columns to maintain
            perfect alignment with the outer grid.
          </p>
        </div>
        <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>
            <span style={{ color: t.text.success.default, marginRight: 6 }}>✓</span>
            Nest for components, not pages
          </div>
          <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
            Nesting is ideal for complex components like data tables, form layouts, and card grids. Avoid deep nesting at
            the page level — it adds complexity without benefit.
          </p>
        </div>
      </div>
    </section>
  );
}

function DosDontsSection({
  t,
  isDark,
  sectionLead,
  sectionHeadingStyle,
}: {
  t: VDSTheme;
  isDark: boolean;
  sectionLead: CSSProperties;
  sectionHeadingStyle: CSSProperties;
}) {
  const ct = colTint(isDark);
  const colCell = isDark ? 'rgba(21,101,168,0.65)' : 'rgba(0,43,73,0.55)';

  const pair = (
    doIll: ReactNode,
    dontIll: ReactNode,
    doCap: string,
    dontCap: string,
  ) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
      <div
        style={{
          background: t.bg.surface.primary.default,
          border: `1px solid ${t.border.default.default}`,
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <div style={{ height: 200, background: t.bg.surface.secondary.default, padding: 24, boxSizing: 'border-box', position: 'relative' }}>
          {doIll}
        </div>
        <div style={{ height: 3, background: '#0A8853' }} />
        <div style={{ padding: '16px 20px' }}>
          <span style={vdsSuccessChipStyle(t)}>✓ Do</span>
          <p style={{ fontSize: 13, color: t.text.secondary.default, margin: '10px 0 0' }}>{doCap}</p>
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
        <div style={{ height: 200, background: t.bg.surface.secondary.default, padding: 24, boxSizing: 'border-box', position: 'relative' }}>
          {dontIll}
        </div>
        <div style={{ height: 3, background: ANN }} />
        <div style={{ padding: '16px 20px' }}>
          <span style={dontPillStyle()}>× Don&apos;t</span>
          <p style={{ fontSize: 13, color: t.text.secondary.default, margin: '10px 0 0' }}>{dontCap}</p>
        </div>
      </div>
    </div>
  );

  return (
    <section id="dos-donts-grid" style={{ marginBottom: 56 }}>
      <h2 className="section-title" style={sectionHeadingStyle}>
        Do &amp; Don&apos;t
      </h2>
      <p style={sectionLead}>
        Grid decisions have a compounding effect. A misaligned foundation makes every component harder to place and every
        breakpoint harder to maintain.
      </p>

      {pair(
        <div style={{ display: 'flex', gap: 4, height: '100%', alignItems: 'stretch', position: 'relative' }}>
          {Array.from({ length: 4 }).map((_, c) => (
            <div key={c} style={{ flex: 1, background: ct, borderRadius: 2, position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 8,
                  bottom: 8,
                  width: 1,
                  background: ANN,
                  opacity: 0.7,
                }}
              />
            </div>
          ))}
          {[0, 1, 2].map((i) => (
            <div
              key={`card-${i}`}
              style={{
                position: 'absolute',
                left: `${8 + i * (100 / 4)}%`,
                width: `${100 / 4 - 4}%`,
                top: 24,
                height: 100,
                background: t.bg.surface.primary.default,
                border: `1.5px solid ${t.border.strong.default}`,
                borderRadius: 10,
              }}
            />
          ))}
        </div>,
        <div style={{ display: 'flex', gap: 4, height: '100%', alignItems: 'stretch', position: 'relative' }}>
          {Array.from({ length: 4 }).map((_, c) => (
            <div key={c} style={{ flex: 1, background: ct, borderRadius: 2, position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 8,
                  bottom: 8,
                  width: 1,
                  background: ANN,
                  opacity: 0.7,
                }}
              />
            </div>
          ))}
          <div
            style={{
              position: 'absolute',
              left: '8%',
              width: '18%',
              top: 24,
              height: 100,
              background: t.bg.surface.primary.default,
              border: `1.5px solid ${t.border.strong.default}`,
              borderRadius: 10,
              marginLeft: 13,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '38%',
              width: '18%',
              top: 24,
              height: 100,
              background: t.bg.surface.primary.default,
              border: `1.5px solid ${t.border.strong.default}`,
              borderRadius: 10,
              marginLeft: 7,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '65%',
              width: '18%',
              top: 24,
              height: 100,
              background: t.bg.surface.primary.default,
              border: `1.5px solid ${t.border.strong.default}`,
              borderRadius: 10,
            }}
          />
        </div>,
        'Content edges snap to column boundaries. The eye reads structure effortlessly.',
        'Arbitrary offsets create visual noise. Each element needs to be individually evaluated — the grid stops being a system.',
      )}

      {pair(
        <div style={{ display: 'flex', gap: 4, height: '100%', alignItems: 'stretch' }}>
          <div style={{ flex: 1, background: ct, borderRadius: 2, padding: 8, boxSizing: 'border-box' }}>
            <div style={{ height: 40, background: t.bg.surface.primary.default, border: `1.5px solid ${t.border.strong.default}`, borderRadius: 8 }} />
          </div>
          <div style={{ width: 8, minWidth: 8, background: 'rgba(232,24,109,0.35)', borderRadius: 2 }} />
          <div style={{ flex: 1, background: ct, borderRadius: 2, padding: 8, boxSizing: 'border-box' }}>
            <div style={{ height: 40, background: t.bg.surface.primary.default, border: `1.5px solid ${t.border.strong.default}`, borderRadius: 8 }} />
          </div>
        </div>,
        <div style={{ display: 'flex', gap: 4, height: '100%', alignItems: 'stretch' }}>
          <div style={{ flex: 1, background: ct, borderRadius: 2, padding: 16, boxSizing: 'border-box' }}>
            <div style={{ height: 40, background: t.bg.surface.primary.default, border: `1.5px solid ${t.border.strong.default}`, borderRadius: 8 }} />
          </div>
          <div style={{ width: 8, minWidth: 8, background: 'rgba(232,24,109,0.2)', borderRadius: 2 }} />
          <div style={{ flex: 1, background: ct, borderRadius: 2, padding: 16, boxSizing: 'border-box' }}>
            <div style={{ height: 40, background: t.bg.surface.primary.default, border: `1.5px solid ${t.border.strong.default}`, borderRadius: 8 }} />
          </div>
        </div>,
        'The gutter creates natural breathing room between content groups. Trust the system.',
        'Adding internal padding to “match” the gutter duplicates spacing and breaks the grid logic.',
      )}

      {pair(
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: '100%' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 8, color: ANN, fontFamily: 'var(--font-mono), monospace' }}>12 col</span>
            <div style={{ display: 'flex', gap: 2, width: '100%', height: 80 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ flex: 1, background: colCell, borderRadius: 4 }} />
              ))}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 8, color: ANN, fontFamily: 'var(--font-mono), monospace' }}>8 col</span>
            <div style={{ display: 'flex', gap: 2, width: '100%', height: 80 }}>
              {[0, 1].map((i) => (
                <div key={i} style={{ flex: 1, background: colCell, borderRadius: 4 }} />
              ))}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 8, color: ANN, fontFamily: 'var(--font-mono), monospace' }}>4 col</span>
            <div style={{ display: 'flex', gap: 2, width: '100%', height: 80 }}>
              <div style={{ flex: 1, background: colCell, borderRadius: 4 }} />
            </div>
          </div>
        </div>,
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%', justifyContent: 'center' }}>
          <span style={{ fontSize: 8, color: ANN, fontFamily: 'var(--font-mono), monospace', textAlign: 'center' }}>4 col (cramped)</span>
          <div style={{ display: 'flex', gap: 2, height: 72 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ flex: 1, background: colCell, borderRadius: 4, minWidth: 0 }} />
            ))}
          </div>
        </div>,
        'Reduce columns at breakpoints to maintain readability. Let the grid do the reflow work.',
        'Squeezing the same layout into fewer columns destroys readability. Adapt the layout, don’t shrink it.',
      )}
    </section>
  );
}
