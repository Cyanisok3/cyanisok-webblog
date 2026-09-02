import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import { formatDate, type Post } from '@/lib/posts';

function groupByYear(posts: Post[]) {
  return posts.reduce<Record<string, Post[]>>((groups, post) => {
    const year = post.publishedAt.slice(0, 4) || 'Undated';
    groups[year] = [...(groups[year] ?? []), post];
    return groups;
  }, {});
}

export function BlogArchive({ posts }: { posts: Post[] }) {
  const groups = groupByYear(posts);

  return (
    <div className="blog-archive">
      {Object.entries(groups).map(([year, entries]) => (
        <section className="blog-year" aria-labelledby={`year-${year}`} key={year}>
          <h2 id={`year-${year}`}>{year}</h2>
          <div className="blog-year-posts">
            {entries.map((post, index) => (
              <Reveal delay={Math.min(index * 0.06, 0.18)} key={post.slug}>
                <Link className="blog-entry" href={`/blog/${post.slug}`}>
                  <span className="blog-entry-main">
                    <strong>{post.title}</strong>
                    <span>{post.summary}</span>
                  </span>
                  <span className="blog-entry-meta">
                    <span>{post.category}</span>
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                    <span>{post.readingMinutes} min read</span>
                  </span>
                  <ArrowUpRight aria-hidden="true" strokeWidth={1.5} />
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
