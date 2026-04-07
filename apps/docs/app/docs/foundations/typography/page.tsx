const TYPE_SCALE: {
  name: string;
  spec: string;
  text: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing?: string;
  fontFamily?: 'mono' | 'sans';
}[] = [
  { name: 'Display/XL', spec: '72px / 800', text: 'The quick brown fox', fontSize: 72, fontWeight: 800 },
  { name: 'Display/LG', spec: '56px / 800', text: 'The quick brown fox', fontSize: 56, fontWeight: 800 },
  { name: 'Display/MD', spec: '48px / 700', text: 'The quick brown fox', fontSize: 48, fontWeight: 700 },
  { name: 'Heading/H1', spec: '40px / 700', text: 'The quick brown fox', fontSize: 40, fontWeight: 700 },
  { name: 'Heading/H2', spec: '32px / 700', text: 'The quick brown fox', fontSize: 32, fontWeight: 700 },
  { name: 'Heading/H3', spec: '24px / 600', text: 'The quick brown fox', fontSize: 24, fontWeight: 600 },
  { name: 'Heading/H4', spec: '20px / 600', text: 'The quick brown fox', fontSize: 20, fontWeight: 600 },
  {
    name: 'Body/LG',
    spec: '18px / 400',
    text: 'The quick brown fox jumps over the lazy dog',
    fontSize: 18,
    fontWeight: 400,
  },
  {
    name: 'Body/MD',
    spec: '16px / 400',
    text: 'The quick brown fox jumps over the lazy dog',
    fontSize: 16,
    fontWeight: 400,
  },
  {
    name: 'Body/SM',
    spec: '14px / 400',
    text: 'The quick brown fox jumps over the lazy dog',
    fontSize: 14,
    fontWeight: 400,
  },
  {
    name: 'Label/LG',
    spec: '16px / 600',
    text: 'BUTTON LABEL',
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: '0.5%',
  },
  {
    name: 'Label/SM',
    spec: '12px / 600',
    text: 'CAPTION TEXT',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '1%',
  },
  {
    name: 'Code',
    spec: '14px / JetBrains Mono',
    text: "const vds = 'design system'",
    fontSize: 14,
    fontWeight: 400,
    fontFamily: 'mono',
  },
];

export default function TypographyPage() {
  return (
    <>
      <p className="breadcrumb">Foundations</p>
      <h1 className="page-title">Typography</h1>
      <p className="page-lead">
        VDS uses Nunito Sans for UI and JetBrains Mono for code. Both loaded from Google Fonts.
      </p>

      <h2 className="section-title">Type Scale</h2>
      <div>
        {TYPE_SCALE.map((row) => (
          <div key={row.name} className="type-scale-row">
            <div className="type-scale-label">
              <span className="type-scale-name">{row.name}</span>
              <span className="type-scale-spec">{row.spec}</span>
            </div>
            <div
              className={`type-scale-preview${row.fontFamily === 'mono' ? ' type-scale-preview--mono' : ''}`}
              style={{
                fontSize: row.fontSize,
                fontWeight: row.fontWeight,
                letterSpacing: row.letterSpacing,
              }}
            >
              {row.text}
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Font Families</h2>
      <div className="font-families-grid">
        <div className="info-card">
          <div
            className="font-families-sample font-families-sample--sans"
            style={{ fontSize: 32, fontWeight: 400 }}
          >
            Aa Bb Cc 123
          </div>
          <p className="info-card-body font-families-desc">
            Used for all UI text, labels, headings, and body copy.
          </p>
        </div>
        <div className="info-card">
          <div
            className="font-families-sample font-families-sample--mono"
            style={{ fontSize: 24, fontWeight: 400 }}
          >
            const x = 42;
          </div>
          <p className="info-card-body font-families-desc">
            Used for code blocks, token names, and technical values.
          </p>
        </div>
      </div>
    </>
  );
}
