import Link from 'next/link';
import { LangToggle } from './LangToggle';
import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  return (
    <header className="docs-header">
      <div className="docs-header__inner">
        <Link href="/docs" className="docs-header__brand">
          <span className="docs-header__logo">VDS</span>
          <span className="docs-header__sep" aria-hidden />
          <span className="docs-header__tagline">Design System</span>
        </Link>
        <div className="docs-header__actions">
          <ThemeToggle />
          <LangToggle />
          <a
            className="docs-header__github"
            href="https://github.com/hellovictordesignstudio-lab/vds"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
