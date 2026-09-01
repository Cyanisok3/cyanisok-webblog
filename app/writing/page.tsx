import Link from 'next/link';
import { PostList } from '@/components/post-list';
import { SiteFooter } from '@/components/site-footer';
import { getPosts } from '@/lib/posts';

export const metadata = {
  title: '文章 · 微光志',
  description: 'Cyan Liu 关于 AI、系统工程、研究方法与视觉创作的完整文章存档。',
};

export default function WritingArchive() {
  const posts = getPosts();

  return (
    <main className="inner-page">
      <header className="inner-nav">
        <Link className="wordmark" href="/">微光志</Link>
        <nav aria-label="文章页导航">
          <Link href="/">首页</Link>
          <a href="/#photography">摄影</a>
          <a href="/#about">关于</a>
        </nav>
      </header>

      <section className="archive-hero">
        <p className="section-kicker">Writing archive · {posts.length} entries</p>
        <h1>文章</h1>
        <p>关于系统、Agent、算法与研究方法的长期学习记录。</p>
      </section>

      <section className="archive-list" aria-label="全部文章">
        <PostList posts={posts} />
      </section>

      <SiteFooter />
    </main>
  );
}
