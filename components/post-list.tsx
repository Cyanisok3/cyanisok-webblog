import Link from 'next/link';
import { formatDate, type Post } from '@/lib/posts';

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <div className="post-list">
      {posts.map((post, index) => (
        <Link className="post-row" href={`/blog/${post.slug}`} key={post.slug}>
          <span className="post-number">{String(index + 1).padStart(2, '0')}</span>
          <span className="post-main">
            <strong>{post.title}</strong>
            <span>{post.summary}</span>
          </span>
          <span className="post-meta">
            <span>{post.category}</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span>{post.readingMinutes} min read</span>
          </span>
          <span className="post-arrow" aria-hidden="true">↗</span>
        </Link>
      ))}
    </div>
  );
}
