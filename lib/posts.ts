import type { ComponentType, ElementType } from 'react';

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
  readingMinutes: number;
  Content: ComponentType<MdxProps>;
};

const compiledPosts = import.meta.glob('../content/*.mdx', {
  eager: true,
}) as Record<string, MdxModule>;

const categories: Record<string, string> = {
  'ai-agent-fundamentals': 'Agentic AI',
  'ai-infra': 'AI Infrastructure',
  'dependency-management': 'Engineering',
  'epirical-research-prerequisites': 'Research',
  'film-editing-basics': 'Visual Notes',
  'git-workflow-guide': 'Engineering',
  'grind-leetcode': 'Algorithms',
  'grind-leetcode2': 'Algorithms',
  'mdx-writing-guide': 'Writing',
  'network-programming': 'Systems',
};

const readingTimes: Record<string, number> = {
  'ai-agent-fundamentals': 8,
  'ai-infra': 3,
  'dependency-management': 1,
  'epirical-research-prerequisites': 4,
  'film-editing-basics': 2,
  'git-workflow-guide': 2,
  'grind-leetcode': 27,
  'grind-leetcode2': 3,
  'mdx-writing-guide': 5,
  'network-programming': 8,
};

const posts = Object.entries(compiledPosts)
  .map(([path, module]) => {
    const slug = path.split('/').pop()?.replace(/\.mdx$/, '') ?? '';
    const data = module.frontmatter ?? {};

    return {
      slug,
      title: String(data.title ?? slug),
      summary: String(data.summary ?? ''),
      author: String(data.author ?? 'Cyan Liu'),
      publishedAt: String(data.publishedAt ?? ''),
      updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
      image: data.image ? String(data.image) : undefined,
      category: categories[slug] ?? 'Notes',
      readingMinutes: readingTimes[slug] ?? 5,
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

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(parsed)
    .replaceAll('/', '.');
}
