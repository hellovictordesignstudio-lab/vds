export default function HomePage() {
  return (
    <main className="home">
      <div className="home-content">
        <div className="home-eyebrow">Open Source · Free · Community</div>
        <h1 className="home-title">VDS</h1>
        <p className="home-subtitle">Victor Design System</p>
        <p className="home-description">
          A professional design system with React components, design tokens, and Figma resources. Built for the community.
        </p>
        <div className="home-actions">
          <a href="/docs" className="btn-primary">Get Started</a>
          <a href="https://github.com/hellovictordesignstudio-lab/vds" className="btn-secondary" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
        <div className="home-badges">
          <span className="badge">React 18</span>
          <span className="badge">TypeScript</span>
          <span className="badge">CSS Custom Properties</span>
          <span className="badge">Figma Variables</span>
          <span className="badge">MIT License</span>
        </div>
      </div>
    </main>
  );
}
