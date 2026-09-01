import type { ComponentPropsWithoutRef } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { formatDate, getPost, getPosts } from '@/lib/posts';

type PageProps = {
  params: Promise<{ slug: string }>;
};

type MediaContainerProps = {
  src: string;
  type?: 'image' | 'video';
  alt?: string;
  caption?: string;
};

function MediaContainer({ src, type = 'image', alt = '', caption }: MediaContainerProps) {
  return (
    <figure className="article-media">
      {type === 'video' ? (
        <video src={src} controls preload="metadata" aria-label={alt} />
      ) : (
        <img src={src} alt={alt} loading="lazy" />
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

function ArticleLink({ href = '', ...props }: ComponentPropsWithoutRef<'a'>) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      {...props}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    />
  );
}

const mdxComponents = {
  MediaContainer,
  a: ArticleLink,
};

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) return { title: 'Article not found · @Cyanisok' };

  const images = post.image?.startsWith('http') ? [post.image] : [];

  return {
    title: `${post.title} · @Cyanisok`,
    description: post.summary,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.summary,
      publishedTime: post.publishedAt,
      authors: [post.author],
      images,
    },
    twitter: {
      card: images.length ? 'summary_large_image' : 'summary',
      title: post.title,
      description: post.summary,
      images,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const posts = getPosts();
  const post = getPost(slug);

  if (!post) {
    return (
      <main className="inner-page">
        <div className="missing-page">
          <p className="section-kicker">404 · Not found</p>
          <h1>This article does not exist.</h1>
          <Link className="text-link" href="/writing">Back to writing →</Link>
        </div>
      </main>
    );
  }

  const currentIndex = posts.findIndex((entry) => entry.slug === post.slug);
  const nextPost = posts[(currentIndex + 1) % posts.length];
  const heroImage = post.image || '/archive/background_bright.webp';

  return (
    <main className="inner-page article-page">
      <header className="inner-nav article-nav">
        <Link className="wordmark" href="/">@Cyanisok</Link>
        <nav aria-label="Article navigation">
          <Link href="/writing">All articles</Link>
          <a href="#article-body">Article</a>
        </nav>
      </header>

      <article>
        <header className="article-header">
          <div className="article-meta-line">
            <span>{post.category}</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span>{post.readingMinutes} min read</span>
          </div>
          <h1>{post.title}</h1>
          <p>{post.summary}</p>
          <div className="article-author">
            <span>Written by {post.author}</span>
            {post.updatedAt ? <span>Updated {post.updatedAt}</span> : null}
          </div>
        </header>

        <figure className="article-cover">
          <img src={heroImage} alt="" />
        </figure>

        <div className="article-layout" id="article-body">
          <aside className="article-side">
            <span>Archive / {String(currentIndex + 1).padStart(2, '0')}</span>
            <Link href="/writing">← Back to writing</Link>
          </aside>
          <div className="prose">
            <post.Content components={mdxComponents} />
          </div>
        </div>
      </article>

      <aside className="next-article" aria-label="Next article">
        <p className="section-kicker">Next entry</p>
        <Link href={`/writing/${nextPost.slug}`}>
          <span>{nextPost.title}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </aside>

      <SiteFooter />
    </main>
  );
}
