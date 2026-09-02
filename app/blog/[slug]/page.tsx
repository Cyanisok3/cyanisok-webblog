import type { ComponentPropsWithoutRef } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArticleContents } from '@/components/article-contents';
import { CodeBlock } from '@/components/code-block';
import { MobileArticleNav } from '@/components/mobile-article-nav';
import { SiteFooter } from '@/components/site-footer';
import { formatDate, getPost, getPosts } from '@/lib/posts';

const SITE_URL = 'https://cyanisok.cn';

type PageProps = {
  params: Promise<{ slug: string }>;
};

type MediaContainerProps = {
  src: string;
  type?: 'image' | 'video';
  alt?: string;
  caption?: string;
  aspectRatio?: string;
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
  pre: CodeBlock as never,
};

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Article not found' };

  const image = post.image ? new URL(post.image, SITE_URL).toString() : null;
  const images = image ? [image] : [];

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      url: `${SITE_URL}/blog/${post.slug}`,
      title: post.title,
      description: post.summary,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: post.title,
      description: post.summary,
      images,
    },
  };
}

export default async function BlogArticle({ params }: PageProps) {
  const { slug } = await params;
  const posts = getPosts();
  const post = getPost(slug);

  if (!post) {
    return (
      <main className="inner-page">
        <div className="missing-page">
          <p>Article not found</p>
          <h1>This article does not exist.</h1>
          <Link className="text-link" href="/blog">Back to Blog</Link>
        </div>
      </main>
    );
  }

  const currentIndex = posts.findIndex((entry) => entry.slug === post.slug);
  const nextPost = posts[(currentIndex + 1) % posts.length];
  const hasContents = post.toc.length >= 2;
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    url: `${SITE_URL}/blog/${post.slug}`,
    author: { '@type': 'Person', name: post.author },
    ...(post.image ? { image: new URL(post.image, SITE_URL).toString() } : {}),
  }).replace(/</g, '\\u003c');

  return (
    <main className="inner-page article-page" id="article-top">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <header className="inner-nav article-nav">
        <Link className="wordmark" href="/">@Cyanisok</Link>
        <nav aria-label="Article navigation">
          <Link href="/blog">Blog</Link>
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
            {post.updatedAt ? <span>Updated {formatDate(post.updatedAt)}</span> : null}
          </div>
        </header>

        <div className={`article-layout ${hasContents ? 'has-contents' : ''}`} id="article-body">
          <aside className="article-side">
            <Link href="/blog">Back to Blog</Link>
            <span>{post.author}</span>
          </aside>
          <div className="prose">
            <post.Content components={mdxComponents} />
          </div>
          {hasContents ? <ArticleContents items={post.toc} /> : null}
        </div>
      </article>

      {hasContents ? <MobileArticleNav items={post.toc} /> : null}

      <aside className="next-article" aria-label="Next article">
        <p className="next-label">Continue reading</p>
        <Link href={`/blog/${nextPost.slug}`}>
          <span>{nextPost.title}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </aside>

      <SiteFooter />
    </main>
  );
}
