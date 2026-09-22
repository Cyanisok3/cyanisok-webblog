/* oxlint-disable nextjs/no-html-link-for-pages -- vinext currently requires native anchors for client navigation; see the routing note below. */
type InnerNavigationProps = {
  active: 'photography' | 'blog' | 'about' | null;
  className?: string;
  label: string;
};

// Plain anchors: the current vinext client build cannot drive
// next/link navigation, so every link on the site must be a native <a>.
export function InnerNavigation({ active, className = '', label }: InnerNavigationProps) {
  return (
    <header className={`inner-nav ${className}`.trim()}>
      <a className="inner-wordmark" href="/" aria-label="@Cyanisok — Home">@Cyanisok</a>
      <nav aria-label={label}>
        <a href="/photography" aria-current={active === 'photography' ? 'page' : undefined}>Photography</a>
        <a href="/blog" aria-current={active === 'blog' ? 'page' : undefined}>Blog</a>
        <a href="/about" aria-current={active === 'about' ? 'page' : undefined}>About</a>
      </nav>
    </header>
  );
}
