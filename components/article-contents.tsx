import type { TocItem } from '@/lib/toc';
import { ArticleReveal } from '@/components/article-reveal';

export function ArticleContents({ items }: { items: TocItem[] }) {
  return (
    <ArticleReveal as="nav" className="article-contents" label="Article contents">
      <p>Contents</p>
      <ol>
        {items.map((item) => (
          <li className={item.depth === 3 ? 'is-nested' : undefined} key={item.id}>
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ol>
    </ArticleReveal>
  );
}
