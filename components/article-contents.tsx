import type { TocItem } from '@/lib/toc';

export function ArticleContents({ items }: { items: TocItem[] }) {
  return (
    <nav className="article-contents" aria-label="Article contents">
      <p>Contents</p>
      <ol>
        {items.map((item) => (
          <li className={item.depth === 3 ? 'is-nested' : undefined} key={item.id}>
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
