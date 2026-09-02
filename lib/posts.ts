import type { ComponentType, ElementType } from 'react';
import { extractTableOfContents } from '@/lib/toc';

type MdxProps = {
  components?: Record<string, ElementType>;
};

type Frontmatter = {
  title?: string;
  summary?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  image?: string;
  category?: string;
  tags?: string[];
};

type MdxModule = {
  default: ComponentType<MdxProps>;
  frontmatter?: Frontmatter;
};

export type Post = {
  slug: string;
  title: string;
  summary: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
  category: string;
  tags?: string[];
  readingMinutes: number;
  toc: import('@/lib/toc').TocItem[];
  Content: ComponentType<MdxProps>;
};

const compiledPosts = import.meta.glob('../content/*.mdx', {
  eager: true,
}) as Record<string, MdxModule>;

const rawPosts = import.meta.glob('../content/*.mdx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, unknown>;

function getReadingMinutes(content: string) {
  const readable = content.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
  const latin = readable.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g)?.length ?? 0;
  const cjk = readable.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  return Math.max(1, Math.ceil((latin + cjk / 2) / 220));
}

function getRawContent(value: unknown) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'default' in value) {
    const fallback = (value as { default?: unknown }).default;
    if (typeof fallback === 'string') return fallback;
  }
  return '';
}

const posts = Object.entries(compiledPosts)
  .map(([path, module]) => {
    const slug = path.split('/').pop()?.replace(/\.mdx$/, '') ?? '';
    const data = module.frontmatter ?? {};
    const raw = getRawContent(rawPosts[path]);

    return {
      slug,
      title: String(data.title ?? slug),
      summary: String(data.summary ?? ''),
      author: String(data.author ?? 'Cyan Liu'),
      publishedAt: String(data.publishedAt ?? ''),
      updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
      image: data.image ? String(data.image) : undefined,
      category: String(data.category ?? 'Notes'),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
      readingMinutes: getReadingMinutes(raw),
      toc: extractTableOfContents(raw),
      Content: module.default,
    } satisfies Post;
  })
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export function getPosts() {
  return posts;
}

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
    .format(parsed);
}
