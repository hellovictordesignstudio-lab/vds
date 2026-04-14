import Link from 'next/link';

const FOUNDATIONS: { href: string; label: string; description: string }[] = [
  { href: '/docs/foundations/colors', label: 'Colors', description: 'Brand, neutral, status, and semantic tokens.' },
  { href: '/docs/foundations/typography', label: 'Typography', description: 'Type scale, families, and usage rules.' },
  { href: '/docs/foundations/spacing', label: 'Spacing', description: '8px grid, scale, and semantic aliases.' },
  { href: '/docs/foundations/elevation', label: 'Elevation & Radius', description: 'Shadow depth, corner radius, and pairing.' },
  { href: '/docs/foundations/layout-grid', label: 'Layout grid', description: 'Columns, gutters, and breakpoints.' },
  { href: '/docs/foundations/icons', label: 'Icons', description: 'Stroke, sizing, and Lucide usage.' },
];

export default function FoundationsIndex() {
  return (
    <>
      <p className="breadcrumb">Documentation</p>
      <h1 className="page-title">Foundations</h1>
      <p className="page-lead">
        Core tokens and rules that every VDS surface builds on — color, type, space, elevation, layout, and
        iconography.
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '32px 0 0', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {FOUNDATIONS.map((item) => (
          <li
            key={item.href}
            style={{
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <Link
              href={item.href}
              style={{
                display: 'block',
                padding: '18px 0',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                {item.label}
              </span>
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {item.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
