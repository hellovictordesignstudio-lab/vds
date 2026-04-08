import Link from 'next/link';
import { GitHubStarButton } from './GitHubStarButton';
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
          <GitHubStarButton />
        </div>
      </div>
    </header>
  );
}
