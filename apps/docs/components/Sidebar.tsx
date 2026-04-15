'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = { label: string; href: string };

type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Introduction', href: '/docs' },
      { label: 'Installation', href: '/docs/getting-started/installation' },
      { label: 'Theming', href: '/docs/getting-started/theming' },
    ],
  },
  {
    title: 'Foundations',
    items: [
      { label: 'Colors', href: '/docs/foundations/colors' },
      { label: 'Typography', href: '/docs/foundations/typography' },
      { label: 'Spacing', href: '/docs/foundations/spacing' },
      { label: 'Elevation', href: '/docs/foundations/elevation' },
      { label: 'Motion', href: '/docs/foundations/motion' },
      { label: 'Layout Grid', href: '/docs/foundations/layout-grid' },
      { label: 'Icons', href: '/docs/foundations/icons' },
    ],
  },
  {
    title: 'Components',
    items: [
      { label: 'Alert', href: '/docs/components/alert' },
      { label: 'Avatar', href: '/docs/components/avatar' },
      { label: 'Badge', href: '/docs/components/badge' },
      { label: 'Button', href: '/docs/components/button' },
      { label: 'Card', href: '/docs/components/card' },
      { label: 'Checkbox', href: '/docs/components/checkbox' },
      { label: 'Modal', href: '/docs/components/modal' },
      { label: 'Select', href: '/docs/components/select' },
      { label: 'Switch', href: '/docs/components/switch' },
      { label: 'Tabs', href: '/docs/components/tabs' },
      { label: 'Text Input', href: '/docs/components/text-input' },
      { label: 'Toast', href: '/docs/components/toast' },
      { label: 'Tooltip', href: '/docs/components/tooltip' },
    ],
  },
  {
    title: 'Patterns',
    items: [
      { label: 'Forms', href: '/docs/patterns/forms' },
      { label: 'Navigation', href: '/docs/patterns/navigation' },
    ],
  },
];

function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
}

function isNavActive(pathname: string, href: string): boolean {
  const p = normalizePath(pathname);
  const h = normalizePath(href);
  if (h === '/docs') return p === '/docs';
  return p === h || p.startsWith(`${h}/`);
}

export default function Sidebar() {
  const pathname = usePathname() ?? '';

  return (
    <aside className="docs-sidebar">
      <nav className="docs-sidebar__nav" aria-label="Documentation">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className={`docs-sidebar__section${section.title === 'Components' ? ' docs-sidebar__section--components' : ''}`}
          >
            <div className="docs-sidebar__section-label">{section.title}</div>
            <ul className="docs-sidebar__list">
              {section.items.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`docs-sidebar__link${active ? ' docs-sidebar__link--active' : ''}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
