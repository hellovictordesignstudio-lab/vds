'use client';

import { Fragment, useEffect, useState, type CSSProperties } from 'react';
import { ComponentTabs } from '@/components/docs/ComponentTabs';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { BuildingLayoutsDetail } from './BuildingLayoutsDetail';
import { buildTheme, type VDSTheme } from '@/lib/theme';

const ANN = '#E8186D';

function vdsSuccessChipStyle(t: Pick<VDSTheme, 'bg' | 'text'>): CSSProperties {
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

const BUILDING_IDS = new Set([
  'building-layouts',
  'container',
  'responsive-grid',
  'layout-patterns',
  'nesting',
  'dos-donts-grid',
]);

const tocItems = [
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'usage-grid', label: 'Usage' },
  { id: 'building-layouts', label: 'Building layouts' },
  { id: 'container', label: 'Container', level: 2 as const },
  { id: 'responsive-grid', label: 'Responsive grid', level: 2 as const },
  { id: 'layout-patterns', label: 'Layout patterns', level: 2 as const },
  { id: 'nesting', label: 'Nesting grids', level: 2 as const },
  { id: 'dos-donts-grid', label: "Do & Don't", level: 2 as const },
];

const annMono = (extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: 'var(--font-mono), monospace',
  color: ANN,
  fontWeight: 600,
  ...extra,
});

const PAGE_TABS = ['Overview', 'Building layouts'] as const;

export default function LayoutGridFoundationsPage() {
  const [isDark, setIsDark] = useState(false);
  const [pageTab, setPageTab] = useState<(typeof PAGE_TABS)[number]>('Overview');

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const t = buildTheme(isDark);
  const colBg = isDark ? 'rgba(21,101,168,0.15)' : 'rgba(0,43,73,0.10)';
  const colCell = isDark ? 'rgba(21,101,168,0.65)' : 'rgba(0,43,73,0.55)';
  const colBgSoft = isDark ? 'rgba(21,101,168,0.12)' : 'rgba(0,43,73,0.06)';
  const colBgMed = isDark ? 'rgba(21,101,168,0.18)' : 'rgba(0,43,73,0.12)';

  const sectionLead: CSSProperties = {
    fontSize: 17,
    color: t.text.secondary.default,
    lineHeight: 1.6,
    maxWidth: 640,
    marginBottom: 24,
  };
  const sectionHeadingStyle: CSSProperties = { marginBottom: 8 };
  const h3Style: CSSProperties = { fontSize: 18, marginBottom: 8, color: t.text.primary.default };

  return (
    <>
      <p className="breadcrumb">Foundations</p>
      <h1 className="page-title">Layout Grid</h1>
      <p className="page-lead">
        Columns, gutters, and margins are the skeleton of every VDS layout. Understanding how they interact at each
        breakpoint is the foundation of building consistent, responsive interfaces.
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
        <span style={vdsSuccessChipStyle(t)}>Stable</span>
        <span style={vdsSuccessChipStyle(t)}>v1.0</span>
      </div>

      <div style={{ marginTop: 24, marginBottom: 8 }}>
        <ComponentTabs
          tabs={[...PAGE_TABS]}
          activeTab={pageTab}
          onChange={(tab) => setPageTab(tab as (typeof PAGE_TABS)[number])}
        />
      </div>

      <div style={{ display: pageTab === 'Overview' ? 'block' : 'none' }}>
      <section id="anatomy" style={{ marginTop: 24, marginBottom: 56 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Anatomy
        </h2>
        <p style={sectionLead}>
          Every layout grid is composed of three elements that work together to create structure and alignment.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {/* Columns */}
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
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: 140,
                  background: colBgSoft,
                  borderRadius: 8,
                  padding: '0 20px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'stretch',
                }}
              >
                <div style={{ display: 'flex', gap: 4, height: '100%', width: '100%', alignItems: 'stretch' }}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        background: colCell,
                        borderRadius: 0,
                        minWidth: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>Columns</div>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                Content aligns to columns. Column widths scale with the container — they are fluid, not fixed.
              </p>
            </div>
          </div>

          {/* Gutters */}
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
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: 140,
                  background: colBgMed,
                  borderRadius: 8,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'stretch',
                }}
              >
                <div style={{ display: 'flex', flex: 1, height: '100%', alignItems: 'stretch', width: '100%' }}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Fragment key={i}>
                      <div style={{ flex: 1, background: colBgMed, minWidth: 0 }} />
                      {i < 11 ? (
                        <div
                          style={{
                            width: 8,
                            minWidth: 8,
                            background: 'rgba(232,24,109,0.35)',
                          }}
                        />
                      ) : null}
                    </Fragment>
                  ))}
                </div>
                <span
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: 10,
                    fontFamily: 'var(--font-mono), monospace',
                    color: ANN,
                    fontWeight: 700,
                  }}
                >
                  8px
                </span>
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>Gutters</div>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                Fixed space between columns. Gutter width stays constant as columns scale — it never changes with the
                viewport.
              </p>
            </div>
          </div>

          {/* Margins */}
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
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: 140,
                  background: colBgSoft,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'stretch',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: 28,
                    minWidth: 28,
                    background: 'rgba(232,24,109,0.15)',
                    borderRight: '1px dashed rgba(232,24,109,0.4)',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 9,
                      fontFamily: 'var(--font-mono), monospace',
                      color: ANN,
                      fontWeight: 700,
                    }}
                  >
                    56px
                  </span>
                </div>
                <div style={{ flex: 1, display: 'flex', gap: 4, padding: '0 4px', alignItems: 'stretch' }}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        background: colBgMed,
                        borderRadius: 0,
                        minWidth: 0,
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    width: 28,
                    minWidth: 28,
                    background: 'rgba(232,24,109,0.15)',
                    borderLeft: '1px dashed rgba(232,24,109,0.4)',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 9,
                      fontFamily: 'var(--font-mono), monospace',
                      color: ANN,
                      fontWeight: 700,
                    }}
                  >
                    56px
                  </span>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>Margins</div>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                Space between the outer columns and the container edge. Margins protect content from the viewport
                boundary.
              </p>
            </div>
          </div>
        </div>

        {/* Master diagram */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono), monospace',
              color: ANN,
              fontWeight: 600,
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            lg breakpoint · 1200px max content
          </div>
          <div
            style={{
              background: t.bg.surface.secondary.default,
              borderRadius: 14,
              border: `1px solid ${t.border.default.default}`,
              padding: '32px 24px 20px',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                minHeight: 18,
                marginBottom: 6,
                gap: 0,
                pointerEvents: 'none',
              }}
            >
              <div style={{ width: 48, minWidth: 48, textAlign: 'center' }}>
                <span style={{ ...annMono({ fontSize: 10, fontWeight: 600 }) }}>Margin · 56px</span>
              </div>
              <div style={{ flex: 1, display: 'flex', minWidth: 0, alignItems: 'flex-end' }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <Fragment key={`lab-${i}`}>
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        paddingBottom: 2,
                      }}
                    >
                      {i === 5 ? (
                        <span style={{ ...annMono({ fontSize: 10, fontWeight: 600 }) }}>Column</span>
                      ) : null}
                    </div>
                    {i < 11 ? (
                      <div
                        style={{
                          width: 8,
                          minWidth: 8,
                          display: 'flex',
                          justifyContent: 'center',
                          paddingBottom: 2,
                        }}
                      >
                        {i === 6 ? (
                          <span style={{ ...annMono({ fontSize: 10, fontWeight: 600 }) }}>Gutter · 8px</span>
                        ) : null}
                      </div>
                    ) : null}
                  </Fragment>
                ))}
              </div>
              <div style={{ width: 48, minWidth: 48, textAlign: 'center' }}>
                <span style={{ ...annMono({ fontSize: 10, fontWeight: 600 }) }}>Margin · 56px</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'stretch', height: 80, gap: 0 }}>
              <div
                style={{
                  width: 48,
                  minWidth: 48,
                  background: 'rgba(232,24,109,0.08)',
                  border: '1px solid rgba(232,24,109,0.2)',
                  borderRight: 'none',
                }}
              />
              <div style={{ flex: 1, display: 'flex', gap: 0, minWidth: 0 }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        flex: 1,
                        background: colBg,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        paddingBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 8, color: t.text.brand.default, fontFamily: 'var(--font-mono), monospace' }}>
                        {i + 1}
                      </span>
                    </div>
                    {i < 11 ? <div style={{ width: 8, minWidth: 8, background: t.bg.surface.secondary.default }} /> : null}
                  </div>
                ))}
              </div>
              <div
                style={{
                  width: 48,
                  minWidth: 48,
                  background: 'rgba(232,24,109,0.08)',
                  border: '1px solid rgba(232,24,109,0.2)',
                  borderLeft: 'none',
                  borderRight: '1px solid rgba(232,24,109,0.2)',
                }}
              />
            </div>

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono), monospace', color: ANN, fontWeight: 600 }}>
                  Max content · 1200px
                </div>
                <div
                  style={{
                    marginTop: 6,
                    height: 1,
                    background: 'rgba(232,24,109,0.3)',
                    width: 'calc(100% - 96px)',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono), monospace', color: ANN, fontWeight: 600 }}>
                  Viewport
                </div>
                <div style={{ marginTop: 6, height: 1, background: 'rgba(232,24,109,0.3)', width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="usage-grid" style={{ marginBottom: 56 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Usage
        </h2>
        <p style={sectionLead}>
          Three concepts cover the majority of grid decisions: content alignment, span, and responsive hiding.
        </p>

        <h3 style={h3Style}>Content alignment</h3>
        <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 12 }}>
          All content aligns to the columns. Cells that don&apos;t fit in a single row wrap to the next row automatically.
        </p>
        <div
          style={{
            background: t.bg.surface.secondary.default,
            borderRadius: 14,
            border: `1px solid ${t.border.default.default}`,
            padding: 20,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              background: colBgSoft,
              borderRadius: 8,
              padding: 8,
              position: 'relative',
              minHeight: 216,
            }}
          >
            <div style={{ display: 'flex', gap: 4, height: 200, position: 'absolute', top: 8, left: 8, right: 8 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ flex: 1, background: colBg, borderRadius: 0, minWidth: 0 }} />
              ))}
            </div>
            <div
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gridTemplateRows: '44px 44px',
                gap: 8,
                paddingTop: 0,
              }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`r1-${i}`}
                  style={{
                    gridColumn: i + 1,
                    gridRow: 1,
                    background: colCell,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono), monospace',
                    fontWeight: 600,
                    borderRadius: 0,
                  }}
                >
                  {i + 1}
                </div>
              ))}
              <div
                style={{
                  gridColumn: '1 / 2',
                  gridRow: 2,
                  background: colCell,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono), monospace',
                  fontWeight: 600,
                }}
              >
                13
              </div>
              <div
                style={{
                  gridColumn: '2 / 3',
                  gridRow: 2,
                  background: colCell,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono), monospace',
                  fontWeight: 600,
                }}
              >
                14
              </div>
            </div>
          </div>
        </div>

        <h3 style={{ ...h3Style, marginTop: 8 }}>Span</h3>
        <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 12 }}>
          Use span to control how many columns a cell occupies. Cells that exceed the available columns wrap to the next
          row.
        </p>

        {/* Span diagram 1 */}
        <div
          style={{
            background: t.bg.surface.secondary.default,
            borderRadius: 14,
            border: `1px solid ${t.border.default.default}`,
            padding: 20,
            marginBottom: 12,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <span style={vdsSuccessChipStyle(t)}>Regular spans</span>
          </div>
          <div style={{ background: colBgSoft, borderRadius: 8, padding: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 8, marginBottom: 8 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    gridColumn: `${i * 2 + 1} / span 2`,
                    height: 40,
                    background: colCell,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 10,
                    fontFamily: 'var(--font-mono), monospace',
                    fontWeight: 600,
                  }}
                >
                  {`span={2}`}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 8, marginBottom: 8 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    gridColumn: `${i * 4 + 1} / span 4`,
                    height: 40,
                    background: colCell,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 10,
                    fontFamily: 'var(--font-mono), monospace',
                    fontWeight: 600,
                  }}
                >
                  {`span={4}`}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 8 }}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    gridColumn: `${i * 6 + 1} / span 6`,
                    height: 40,
                    background: colCell,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 10,
                    fontFamily: 'var(--font-mono), monospace',
                    fontWeight: 600,
                  }}
                >
                  {`span={6}`}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wrap */}
        <div
          style={{
            background: t.bg.surface.secondary.default,
            borderRadius: 14,
            border: `1px solid ${t.border.default.default}`,
            padding: 20,
            marginBottom: 12,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <span style={vdsSuccessChipStyle(t)}>Wrap behavior</span>
          </div>
          <div style={{ background: colBgSoft, borderRadius: 8, padding: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  gridColumn: '1 / span 2',
                  height: 40,
                  background: colCell,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono), monospace',
                  fontWeight: 600,
                }}
              >
                {`span={2}`}
              </div>
              <div
                style={{
                  gridColumn: '3 / span 4',
                  height: 40,
                  background: colCell,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono), monospace',
                  fontWeight: 600,
                }}
              >
                {`span={4}`}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 8 }}>
              <div
                style={{
                  gridColumn: '1 / span 8',
                  height: 40,
                  background: colCell,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono), monospace',
                  fontWeight: 600,
                }}
              >
                {`span={8}`}
              </div>
            </div>
          </div>
        </div>

        {/* Clamp */}
        <div
          style={{
            background: t.bg.surface.secondary.default,
            borderRadius: 14,
            border: `1px solid ${t.border.default.default}`,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <span style={vdsSuccessChipStyle(t)}>Overflow clamp</span>
          </div>
          <div style={{ background: colBgSoft, borderRadius: 8, padding: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 8 }}>
              <div
                style={{
                  gridColumn: '1 / span 12',
                  height: 44,
                  background: colCell,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono), monospace',
                  fontWeight: 600,
                }}
              >
                {`span={20}`} → clamped to 12
              </div>
            </div>
          </div>
        </div>

        <h3 style={h3Style}>Hide &amp; Skip</h3>
        <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 12 }}>
          Set span to 0 to remove a cell from the flow entirely. Use skip to offset cells without filling the gap.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 }}>
          {/* Hide */}
          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div style={{ height: 180, background: t.bg.surface.secondary.default, padding: 16, boxSizing: 'border-box' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, 1fr)',
                  gridTemplateRows: '44px 44px',
                  gap: 4,
                  alignContent: 'start',
                }}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={`h-r1-${i}`}
                    style={{
                      gridColumn: i + 1,
                      gridRow: 1,
                      background: colCell,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 11,
                      fontFamily: 'var(--font-mono), monospace',
                      fontWeight: 600,
                    }}
                  >
                    {i + 2}
                  </div>
                ))}
                <div
                  style={{
                    gridColumn: 1,
                    gridRow: 2,
                    background: colCell,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono), monospace',
                    fontWeight: 600,
                  }}
                >
                  14
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>Hide</div>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                <code>{'span={0}'}</code> removes the cell from flow. Other cells backfill the empty space.
              </p>
            </div>
          </div>

          {/* Skip */}
          <div
            style={{
              background: t.bg.surface.primary.default,
              border: `1px solid ${t.border.default.default}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div style={{ height: 180, background: t.bg.surface.secondary.default, padding: 16, boxSizing: 'border-box' }}>
              <div style={{ position: 'relative', height: 44, width: '100%' }}>
                <div style={{ display: 'flex', gap: 4, height: 44, width: '100%' }}>
                  {Array.from({ length: 12 }).map((_, c) => (
                    <div key={`sk-bg-${c}`} style={{ flex: 1, background: colBg, minWidth: 0, borderRadius: 0 }} />
                  ))}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    gap: 4,
                    pointerEvents: 'none',
                  }}
                >
                  {Array.from({ length: 12 }).map((_, c) => (
                    <div
                      key={`sk-o-${c}`}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {c === 1 || c === 4 ? (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            background: colCell,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 10,
                            fontFamily: 'var(--font-mono), monospace',
                            fontWeight: 600,
                            pointerEvents: 'auto',
                          }}
                        >
                          {`skip={1}`}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>Skip</div>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>
                skip offsets a cell without filling the columns it jumps over. Use for intentional asymmetric layouts.
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>

      <div style={{ display: pageTab === 'Building layouts' ? 'block' : 'none' }}>
        <section id="building-layouts" style={{ marginTop: 24, marginBottom: 56 }}>
          <h2 className="section-title" style={sectionHeadingStyle}>
            Building layouts
          </h2>
          <p style={sectionLead}>
            Patterns for containers, responsive grids, common screen layouts, nesting, and how to keep the system
            coherent at every breakpoint.
          </p>
          <BuildingLayoutsDetail
            t={t}
            isDark={isDark}
            sectionLead={sectionLead}
            sectionHeadingStyle={sectionHeadingStyle}
          />
        </section>
      </div>

      <TableOfContents
        items={tocItems}
        onItemClick={(id) => {
          if (BUILDING_IDS.has(id)) setPageTab('Building layouts');
          else if (id === 'anatomy' || id === 'usage-grid') setPageTab('Overview');
        }}
      />
    </>
  );
}
