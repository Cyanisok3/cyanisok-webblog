import type { Metadata } from 'next';
import { BlogArchive } from '@/components/blog-archive';
import { SiteFooter } from '@/components/site-footer';
import { Reveal } from '@/components/reveal';
import { getPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Long-form notes on systems, agents, algorithms, research, and visual practice.',
  alternates: { canonical: '/blog' },
  openGraph: {
    type: 'website',
    url: 'https://cyanisok.cn/blog',
    title: 'Blog',
    description: 'Long-form notes on systems, agents, algorithms, research, and visual practice.',
  },
};

export default function BlogPage() {
  const posts = getPosts();

  return (
    <main className="inner-page blog-page">
      <header className="inner-nav">
        <a className="wordmark" href="/">@Cyanisok</a>
        <nav aria-label="Blog navigation">
          <a href="/">Home</a>
          <a href="/">Photography</a>
          <a href="/">About</a>
        </nav>
      </header>

      <section className="blog-hero" aria-labelledby="blog-page-title">
        <Reveal className="blog-hero-content">
          <h1 id="blog-page-title">Blog</h1>
          <p>Long-form notes on systems, agents, algorithms, research, and visual practice.</p>
          <span>{posts.length} posts</span>
        </Reveal>
      </section>

      <BlogArchive posts={posts} />
      <SiteFooter />
    </main>
  );
}
