'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { AlignLeft, Check, Grid, Hash, Type } from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TYPE_SCALE = [
  // DISPLAY
  {
    category: 'Display',
    token: 'display/xl',
    size: 56,
    weight: 800,
    lh: 1.1,
    ls: '-0.02em',
    use: 'Hero headlines',
  },
  {
    category: 'Display',
    token: 'display/lg',
    size: 48,
    weight: 800,
    lh: 1.15,
    ls: '-0.015em',
    use: 'Section heroes',
  },
  {
    category: 'Display',
    token: 'display/md',
    size: 40,
    weight: 700,
    lh: 1.2,
    ls: '-0.01em',
    use: 'Page titles',
  },
  // HEADING
  {
    category: 'Heading',
    token: 'heading/h1',
    size: 36,
    weight: 700,
    lh: 1.25,
    ls: '-0.005em',
    use: 'Main headings',
  },
  {
    category: 'Heading',
    token: 'heading/h2',
    size: 28,
    weight: 700,
    lh: 1.3,
    ls: '-0.003em',
    use: 'Section headings',
  },
  {
    category: 'Heading',
    token: 'heading/h3',
    size: 22,
    weight: 600,
    lh: 1.35,
    ls: '0',
    use: 'Sub-section headings',
  },
  {
    category: 'Heading',
    token: 'heading/h4',
    size: 18,
    weight: 600,
    lh: 1.4,
    ls: '0',
    use: 'Component headings',
  },
  {
    category: 'Heading',
    token: 'heading/h5',
    size: 16,
    weight: 600,
    lh: 1.4,
    ls: '0',
    use: 'Small headings',
  },
  // BODY
  {
    category: 'Body',
    token: 'body/lg',
    size: 18,
    weight: 400,
    lh: 1.65,
    ls: '0',
    use: 'Lead paragraphs',
  },
  {
    category: 'Body',
    token: 'body/md',
    size: 16,
    weight: 400,
    lh: 1.65,
    ls: '0',
    use: 'Default body text',
  },
  {
    category: 'Body',
    token: 'body/sm',
    size: 14,
    weight: 400,
    lh: 1.6,
    ls: '0',
    use: 'Secondary text',
  },
  {
    category: 'Body',
    token: 'body/xs',
    size: 12,
    weight: 400,
    lh: 1.5,
    ls: '0',
    use: 'Captions, annotations',
  },
  // LABEL
  {
    category: 'Label',
    token: 'label/lg',
    size: 16,
    weight: 600,
    lh: 1.4,
    ls: '0.005em',
    use: 'Large UI labels',
  },
  {
    category: 'Label',
    token: 'label/md',
    size: 14,
    weight: 600,
    lh: 1.4,
    ls: '0.005em',
    use: 'Buttons, standard labels',
  },
  {
    category: 'Label',
    token: 'label/sm',
    size: 12,
    weight: 600,
    lh: 1.4,
    ls: '0.01em',
    use: 'Small labels, badges',
  },
  {
    category: 'Label',
    token: 'label/xs',
    size: 10,
    weight: 700,
    lh: 1.4,
    ls: '0.015em',
    use: 'Uppercase tags, overlines',
  },
  // CODE
  {
    category: 'Code',
    token: 'code/lg',
    size: 16,
    weight: 400,
    lh: 1.6,
    ls: '0',
    use: 'Large code blocks',
  },
  {
    category: 'Code',
    token: 'code/md',
    size: 14,
    weight: 400,
    lh: 1.6,
    ls: '0',
    use: 'Standard code blocks',
  },
  {
    category: 'Code',
    token: 'code/sm',
    size: 12,
    weight: 400,
    lh: 1.6,
    ls: '0',
    use: 'Inline code',
  },
  {
    category: 'Code',
    token: 'code/xs',
    size: 11,
    weight: 400,
    lh: 1.5,
    ls: '0',
    use: 'Token chips, annotations',
  },
] as const;

type TypeScaleItem = (typeof TYPE_SCALE)[number];

const tocItems = [
  { id: 'principles', label: 'Principles' },
  { id: 'scale', label: 'Type scale' },
  { id: 'fonts', label: 'Font families' },
  { id: 'usage-type', label: 'Usage' },
];

function chipStyleA(): CSSProperties {
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
  };
}

function chipStyleB(t: VDSTheme, fontSize = 12): CSSProperties {
  return {
    background: t.bg.fill.brandSubtle.default,
    color: t.text.brand.default,
    fontFamily: 'var(--font-mono), monospace',
    fontSize,
    padding: '4px 10px',
    borderRadius: 6,
    display: 'inline-flex',
    alignItems: 'center',
    width: 'fit-content',
  };
}

function previewTextForItem(item: TypeScaleItem): string {
  if (item.category === 'Display' || item.category === 'Heading') {
    return 'The quick brown fox';
  }
  if (item.category === 'Body') {
    return 'Interface text for reading and scanning';
  }
  if (item.category === 'Label') {
    return 'Button label';
  }
  if (item.category === 'Code') {
    return "const color = '#002b49'";
  }
  return '';
}

export default function TypographyPage() {
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [hoveredToken, setHoveredToken] = useState<string | null>(null);

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

  const categories = [...new Set(TYPE_SCALE.map((i) => i.category))];

  function copyToken(token: string) {
    navigator.clipboard.writeText(token);
    setCopied(token);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <>
      <p className="breadcrumb">Foundations</p>
      <h1 className="page-title">Typography</h1>
      <p className="page-lead">
        Nunito Sans for all UI text. JetBrains Mono for code. Twenty styles across five categories — each
        optically distinct, semantically named, and tied to the 4px baseline grid.
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
        <span style={chipStyleA()}>Stable</span>
        <span style={chipStyleA()}>v1.0</span>
      </div>

      <section id="principles" style={{ marginTop: 40, marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Principles
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
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
                position: 'relative',
              }}
            >
              <Type
                size={20}
                strokeWidth={1.5}
                color={t.text.brand.default}
                style={{ position: 'absolute', top: 16, right: 16, opacity: 0.35 }}
                aria-hidden
              />
              <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-sans), Nunito Sans, sans-serif',
                    fontSize: 48,
                    fontWeight: 800,
                    color: t.text.primary.default,
                  }}
                >
                  A
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-sans), Nunito Sans, sans-serif',
                    fontSize: 36,
                    fontWeight: 400,
                    color: t.text.primary.default,
                  }}
                >
                  g
                </span>
              </span>
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>
                Optical distinction
              </div>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                Every step is visibly different from its neighbors. If two styles look similar at a glance,
                one is redundant. The scale has no decorative stops.
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                flexDirection: 'column',
                gap: 0,
                position: 'relative',
              }}
            >
              <AlignLeft
                size={20}
                strokeWidth={1.5}
                color={t.text.brand.default}
                style={{ position: 'absolute', top: 16, right: 16, opacity: 0.35 }}
                aria-hidden
              />
              <div
                style={{
                  height: 10,
                  width: '60%',
                  background: t.text.primary.default,
                  borderRadius: 2,
                  opacity: 0.8,
                  marginBottom: 8,
                }}
              />
              <div
                style={{
                  height: 6,
                  width: '85%',
                  background: t.text.secondary.default,
                  borderRadius: 2,
                  opacity: 0.5,
                  marginBottom: 6,
                }}
              />
              <div
                style={{
                  height: 5,
                  width: '75%',
                  background: t.text.tertiary.default,
                  borderRadius: 2,
                  opacity: 0.35,
                }}
              />
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>
                Semantic meaning
              </div>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                Size and weight encode role — not decoration. Display for heroes, Heading for structure, Body
                for reading, Label for UI chrome. Never use display sizes for body copy.
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                position: 'relative',
              }}
            >
              <Grid
                size={20}
                strokeWidth={1.5}
                color={t.text.brand.default}
                style={{ position: 'absolute', top: 16, right: 16, opacity: 0.35 }}
                aria-hidden
              />
              <div style={{ position: 'relative', width: 'min(100%, 200px)', height: 64 }}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `repeating-linear-gradient(
                      to bottom,
                      ${t.border.default.default} 0,
                      ${t.border.default.default} 1px,
                      transparent 1px,
                      transparent 4px
                    )`,
                    opacity: 0.5,
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 20,
                    width: '100%',
                    height: 16,
                    background: t.bg.fill.brandSubtle.default,
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default, marginBottom: 6 }}>
                4px baseline grid
              </div>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                All line-heights are multiples of 4. Type and layout breathe at the same cadence — spacing
                tokens and type tokens are part of the same rhythm system.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="scale" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Type scale
        </h2>
        <p style={sectionLead}>
          Twenty styles across five categories. Each has a token name, a live preview at actual size, and a
          defined use case. The scale has no gaps and no redundancy.
        </p>

        {categories.map((cat) => {
          const items = TYPE_SCALE.filter((i) => i.category === cat);
          return (
            <div key={cat}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '20px 0 10px',
                  borderBottom: `1px solid ${t.border.default.default}`,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: t.text.tertiary.default,
                  }}
                >
                  {cat}
                </span>
                <span style={{ ...chipStyleB(t, 11), fontSize: 11, padding: '2px 8px' }}>
                  {items.length} styles
                </span>
              </div>
              {items.map((item) => (
                <div
                  key={item.token}
                  role="button"
                  tabIndex={0}
                  onMouseEnter={() => setHoveredToken(item.token)}
                  onMouseLeave={() => setHoveredToken(null)}
                  onClick={() => copyToken(item.token)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      copyToken(item.token);
                    }
                  }}
                  style={{
                    background:
                      hoveredToken === item.token
                        ? t.bg.surface.primary.default
                        : t.bg.surface.secondary.default,
                    borderRadius: 10,
                    border: `1px solid ${t.border.default.default}`,
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 24,
                    marginBottom: 6,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <div
                      style={{
                        fontFamily:
                          item.category === 'Code'
                            ? 'JetBrains Mono, var(--font-mono), monospace'
                            : 'Nunito Sans, var(--font-sans), sans-serif',
                        fontSize: item.size,
                        fontWeight: item.weight,
                        lineHeight: item.lh,
                        letterSpacing: item.ls,
                        color: t.text.primary.default,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {previewTextForItem(item)}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 220,
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 5,
                      alignItems: 'flex-start',
                    }}
                  >
                    <span style={{ ...chipStyleB(t, 11), fontSize: 11 }}>
                      {copied === item.token ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Check size={12} aria-hidden />
                          Copied
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Hash size={12} aria-hidden />
                          {item.token}
                        </span>
                      )}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: t.text.tertiary.default,
                        fontFamily: 'var(--font-mono), monospace',
                      }}
                    >
                      {item.size}px · {item.weight} · lh {item.lh}
                    </span>
                    <span style={{ ...chipStyleA(), fontSize: 11, padding: '2px 8px' }}>{item.use}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </section>

      <section id="fonts" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Font families
        </h2>
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
                height: 200,
                background: t.bg.surface.secondary.default,
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
                  fontSize: 72,
                  fontWeight: 800,
                  color: t.text.primary.default,
                  lineHeight: 1,
                }}
              >
                Aa
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {(
                  [
                    ['Light', 300],
                    ['Regular', 400],
                    ['SemiBold', 600],
                    ['Bold', 700],
                    ['ExtraBold', 800],
                    ['Black', 900],
                  ] as const
                ).map(([label, w]) => (
                  <span
                    key={label}
                    style={{
                      fontSize: 13,
                      color: t.text.secondary.default,
                      fontWeight: w,
                      fontFamily: 'Nunito Sans, var(--font-sans), sans-serif',
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div
              style={{
                padding: '20px 24px',
                borderTop: `1px solid ${t.border.default.default}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: t.text.primary.default }}>Nunito Sans</div>
              <div style={{ height: 1, background: t.border.default.default }} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: t.text.tertiary.default,
                }}
              >
                When to use
              </span>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                All UI text — headings, paragraphs, labels, buttons, and navigation. The humanist rounded
                letterforms create warmth without sacrificing clarity.
              </p>
              <span style={chipStyleA()}>Google Fonts · Variable</span>
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
                height: 200,
                background: t.bg.surface.secondary.default,
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  fontFamily: 'JetBrains Mono, var(--font-mono), monospace',
                  fontSize: 64,
                  fontWeight: 400,
                  color: t.text.primary.default,
                  lineHeight: 1,
                }}
              >
                Aa
              </div>
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1.5px solid ${t.border.strong.default}`,
                  borderRadius: 8,
                  padding: '8px 14px',
                }}
              >
                <code
                  style={{
                    fontFamily: 'JetBrains Mono, var(--font-mono), monospace',
                    fontSize: 13,
                    color: t.text.brand.default,
                  }}
                >
                  const color = &apos;#002b49&apos;
                </code>
              </div>
            </div>
            <div
              style={{
                padding: '20px 24px',
                borderTop: `1px solid ${t.border.default.default}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: t.text.primary.default }}>JetBrains Mono</div>
              <div style={{ height: 1, background: t.border.default.default }} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: t.text.tertiary.default,
                }}
              >
                When to use
              </span>
              <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                Code blocks, token names, hex values, CSS properties, and numeric data where character-level
                alignment matters. Never for UI copy or reading-length text.
              </p>
              <span style={chipStyleA()}>JetBrains · Free</span>
            </div>
          </div>
        </div>
      </section>

      <section id="usage-type" style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={sectionHeadingStyle}>
          Usage
        </h2>
        <p style={sectionLead}>
          Typography communicates hierarchy before the user reads a word. These rules preserve that signal.
        </p>

        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: t.text.primary.default,
            marginBottom: 12,
          }}
        >
          Style roles
        </h3>
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
                {['Category', 'Use for', 'Never use for'].map((h) => (
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
                  {
                    cat: 'Display',
                    use: 'Hero sections, splash screens, marketing headlines above fold',
                    never: 'Body copy, UI labels, anything in scrollable content',
                  },
                  {
                    cat: 'Heading',
                    use: 'Page titles, section headers, card headings, dialog titles',
                    never: 'Decorative text, captions, form labels',
                  },
                  {
                    cat: 'Body',
                    use: 'Paragraphs, descriptions, long-form reading, tooltips',
                    never: 'UI chrome, buttons, navigation, badges',
                  },
                  {
                    cat: 'Label',
                    use: 'Buttons, inputs, tabs, nav items, badges, form labels',
                    never: 'Long-form reading, paragraphs, anything >2 lines',
                  },
                  {
                    cat: 'Code',
                    use: 'Code blocks, token names, hex values, CSS, terminal output',
                    never: 'UI copy, headings, body text, labels',
                  },
                ] as const
              ).map((row, idx) => (
                <tr
                  key={row.cat}
                  style={{
                    background:
                      idx % 2 === 0 ? t.bg.surface.primary.default : t.bg.surface.secondary.default,
                  }}
                >
                  <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                    <span style={chipStyleB(t, 12)}>{row.cat}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: t.text.secondary.default }}>
                    {row.use}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: t.text.secondary.default }}>
                    {row.never}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: t.text.primary.default,
            marginBottom: 12,
          }}
        >
          Line length
        </h3>
        <p style={{ ...sectionLead, marginBottom: 16 }}>
          Optimal reading comfort lives between 60 and 80 characters per line. Below 45, lines feel choppy.
          Above 90, the eye loses its return path between lines.
        </p>
        <div
          style={{
            background: t.bg.surface.secondary.default,
            borderRadius: 12,
            border: `1px solid ${t.border.default.default}`,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 8,
          }}
        >
          {(
            [
              {
                label: '< 45 chr',
                labelColor: '#E8186D',
                barWidth: '35%',
                barBg: 'rgba(232,24,109,0.3)',
                chip: 'Too narrow',
                chipColor: '#E8186D',
              },
              {
                label: '60–80 chr',
                labelColor: '#0A8853',
                barWidth: '65%',
                barBg: 'rgba(10,136,83,0.4)',
                chip: 'Optimal ✓',
                chipColor: '#0A8853',
              },
              {
                label: '> 90 chr',
                labelColor: '#E8186D',
                barWidth: '95%',
                barBg: 'rgba(232,24,109,0.3)',
                chip: 'Too wide',
                chipColor: '#E8186D',
              },
            ] as const
          ).map((row) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span
                style={{
                  width: 80,
                  flexShrink: 0,
                  fontSize: 11,
                  fontFamily: 'var(--font-mono), monospace',
                  color: row.labelColor,
                }}
              >
                {row.label}
              </span>
              <div style={{ flex: 1, minWidth: 0, height: 8, display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    height: 8,
                    borderRadius: 2,
                    background: row.barBg,
                    width: row.barWidth,
                  }}
                />
              </div>
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 11,
                  fontFamily: 'var(--font-mono), monospace',
                  fontWeight: 600,
                  color: row.chipColor,
                }}
              >
                {row.chip}
              </span>
            </div>
          ))}
        </div>
        <p
          style={{
            fontSize: 12,
            color: t.text.tertiary.default,
            marginTop: 8,
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          VDS docs content is capped at 900px — approximately 80 characters at body/md. This is intentional.
        </p>

        <Callout variant="tip" title="Heading + Body is the safest pair">
          Most pages use one Heading style for the title and body/md or body/sm for the content below. This
          combination is optically balanced at every viewport size and requires no adjustment.
        </Callout>
        <Callout variant="info" title="Labels carry positive letter-spacing">
          Buttons, inputs, tabs, badges, and navigation always use a Label style. The slight positive tracking
          (+0.5% to +1.5%) makes short UI strings more legible at small sizes — something Body styles
          aren&apos;t designed for.
        </Callout>
        <Callout variant="warning" title="Don&apos;t size by feel">
          If a style doesn&apos;t feel right, the problem is almost always spacing, color, or weight contrast
          — not font size. Resist picking a size between two steps. Every off-scale value creates a
          maintenance burden.
        </Callout>
        <Callout variant="danger" title="New type styles require a DS discussion">
          Every new style needs documentation, a token, a Figma style, and a CSS class — and must be
          maintained forever. Use existing styles creatively. If you genuinely need a new style, open a
          GitHub discussion in the VDS repo before adding it.
        </Callout>
      </section>

      <TableOfContents items={tocItems} />
    </>
  );
}
