import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/posts';

const SITE_URL = 'https://cyanisok.cn';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt,
  }));

  return [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/blog`, lastModified: new Date() },
    ...posts,
  ];
}
