export default function DocsHomePage() {
  return (
    <>
      <p className="breadcrumb">Getting Started</p>
      <h1 className="page-title">Introduction</h1>
      <p className="page-lead">
        VDS is an open-source design system built for the community. React components, design tokens,
        and Figma resources — all free.
      </p>
      <h2 className="section-title">What&apos;s included</h2>
      <div className="cards-grid-3">
        <div className="info-card">
          <div className="info-card-title">React Components</div>
          <p className="info-card-body">
            39 accessible, themeable components ready to use in production.
          </p>
        </div>
        <div className="info-card">
          <div className="info-card-title">Design Tokens</div>
          <p className="info-card-body">
            Color, spacing, and typography tokens in DTCG format. CSS custom properties out of the box.
          </p>
        </div>
        <div className="info-card">
          <div className="info-card-title">Figma Resources</div>
          <p className="info-card-body">
            Variables, components, and modes. Fully synchronized with the code.
          </p>
        </div>
      </div>
    </>
  );
}
