import { ColorSwatch } from '../../../../components/ColorSwatch';

const BLUE_SCALE: { step: string; hex: string }[] = [
  { step: '50', hex: '#E6EEFF' },
  { step: '100', hex: '#CCDEFF' },
  { step: '200', hex: '#99BDFF' },
  { step: '300', hex: '#669CFF' },
  { step: '400', hex: '#337BFF' },
  { step: '500', hex: '#0055FF' },
  { step: '600', hex: '#0044CC' },
  { step: '700', hex: '#003399' },
  { step: '800', hex: '#002266' },
  { step: '900', hex: '#001133' },
];

const NEUTRAL_SCALE: { step: string; hex: string }[] = [
  { step: '0', hex: '#FFFFFF' },
  { step: '50', hex: '#F8F9FC' },
  { step: '100', hex: '#EFF1F5' },
  { step: '200', hex: '#DDE1EA' },
  { step: '300', hex: '#C5CBDA' },
  { step: '400', hex: '#9BA5BE' },
  { step: '500', hex: '#6B7694' },
  { step: '600', hex: '#4A5270' },
  { step: '700', hex: '#2E3550' },
  { step: '800', hex: '#1A1F35' },
  { step: '900', hex: '#0C0D10' },
];

const SEMANTIC_ROWS: { token: string; light: string; dark: string; usage: string }[] = [
  { token: '--color-bg-primary', light: '#FFFFFF', dark: '#0C0D10', usage: 'Page background' },
  { token: '--color-bg-secondary', light: '#F8F9FC', dark: '#1A1F35', usage: 'Card backgrounds' },
  { token: '--color-text-primary', light: '#0C0D10', dark: '#F8F9FC', usage: 'Body text' },
  { token: '--color-text-secondary', light: '#4A5270', dark: '#9BA5BE', usage: 'Muted text' },
  { token: '--color-brand', light: '#0055FF', dark: '#669CFF', usage: 'Brand actions' },
  { token: '--color-border', light: '#DDE1EA', dark: '#2E3550', usage: 'Borders' },
];

function ColorDot({ hex }: { hex: string }) {
  return (
    <span
      className="color-dot"
      style={{ backgroundColor: hex }}
      aria-hidden
    />
  );
}

export default function ColorsPage() {
  return (
    <>
      <p className="breadcrumb">Foundations</p>
      <h1 className="page-title">Colors</h1>
      <p className="page-lead">
        Primitive color scales that power all semantic tokens in VDS.
      </p>

      <h2 className="section-title">Blue (Primary)</h2>
      <div className="swatch-grid">
        {BLUE_SCALE.map(({ step, hex }) => (
          <ColorSwatch key={step} name={`blue/${step}`} hex={hex} />
        ))}
      </div>

      <h2 className="section-title">Neutral</h2>
      <div className="swatch-grid-11">
        {NEUTRAL_SCALE.map(({ step, hex }) => (
          <ColorSwatch
            key={step}
            name={`neutral/${step}`}
            hex={hex}
            bordered={step === '0'}
          />
        ))}
      </div>

      <h2 className="section-title">Status Colors</h2>
      <div className="status-swatch-grid">
        <div className="status-swatch-col">
          <div className="status-swatch-col__label">Success</div>
          <ColorSwatch name="green/50" hex="#E6F5EE" />
          <ColorSwatch name="green/400" hex="#0A8853" />
        </div>
        <div className="status-swatch-col">
          <div className="status-swatch-col__label">Error</div>
          <ColorSwatch name="red/50" hex="#FCEAEC" />
          <ColorSwatch name="red/400" hex="#D22232" />
        </div>
        <div className="status-swatch-col">
          <div className="status-swatch-col__label">Warning</div>
          <ColorSwatch name="orange/50" hex="#FEF2EB" />
          <ColorSwatch name="orange/400" hex="#F07332" />
        </div>
      </div>

      <h2 className="section-title">Semantic Tokens</h2>
      <table className="token-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Light</th>
            <th>Dark</th>
            <th>Usage</th>
          </tr>
        </thead>
        <tbody>
          {SEMANTIC_ROWS.map((row) => (
            <tr key={row.token}>
              <td>{row.token}</td>
              <td>
                <ColorDot hex={row.light} />
                {row.light}
              </td>
              <td>
                <ColorDot hex={row.dark} />
                {row.dark}
              </td>
              <td>{row.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
