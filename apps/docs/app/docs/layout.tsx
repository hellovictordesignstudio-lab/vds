import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="docs-shell">
        <Sidebar />
        <main className="docs-main">{children}</main>
      </div>
    </>
  );
}
