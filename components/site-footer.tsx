import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>© 2026 Cyan Liu</p>
      <div>
        <Link href="/writing">Writing</Link>
        <a href="https://github.com/Cyanisok3" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </footer>
  );
}
