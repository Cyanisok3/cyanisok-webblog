import { PostList } from '@/components/post-list';
import { SiteFooter } from '@/components/site-footer';
import { getPosts } from '@/lib/posts';

export const metadata = {
  title: 'Writing · @Cyanisok',
  description: 'Cyan Liu\'s complete archive of writing on AI, systems, research, and visual practice.',
};

export default function WritingArchive() {
  const posts = getPosts();

  return (
    <main className="inner-page">
      <header className="inner-nav">
        <a className="wordmark" href="/">@Cyanisok</a>
        <nav aria-label="Writing navigation">
          <a href="/">Home</a>
          <a href="/">Photography</a>
          <a href="/">About</a>
        </nav>
      </header>

      <section className="archive-hero">
        <p className="section-kicker">Writing archive · {posts.length} entries</p>
        <h1>Writing</h1>
        <p>Long-form notes on systems, agents, algorithms, and research methods.</p>
      </section>

      <section className="archive-list" aria-label="All articles">
        <PostList posts={posts} />
      </section>

      <SiteFooter />
    </main>
  );
}
