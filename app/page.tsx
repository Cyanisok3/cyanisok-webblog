import Link from 'next/link';
import { HeroSlideshow } from '@/components/hero-slideshow';
import { PostList } from '@/components/post-list';
import { SiteFooter } from '@/components/site-footer';
import { getPosts } from '@/lib/posts';

export default function Home() {
  const posts = getPosts();
  const latest = posts[0];

  return (
    <main>
      <HeroSlideshow latestTitle={latest.title} latestSlug={latest.slug} />

      <section className="writing-section" id="writing" aria-labelledby="writing-title">
        <header className="section-heading">
          <div>
            <p className="section-kicker">01 · Writing</p>
            <h2 id="writing-title">最近文章</h2>
          </div>
          <p className="section-note">系统、AI、研究方法，以及一些视觉笔记。</p>
        </header>

        <PostList posts={posts.slice(0, 5)} />

        <Link className="text-link" href="/writing">
          查看全部 {posts.length} 篇文章 <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="photography-section" id="photography" aria-labelledby="photography-title">
        <header className="section-heading photography-heading">
          <div>
            <p className="section-kicker">02 · Photography</p>
            <h2 id="photography-title">相册札记</h2>
          </div>
          <p className="section-note">照片会慢慢替换成你的个人摄影档案。</p>
        </header>

        <div className="photo-grid">
          <figure className="photo-card photo-card-tall">
            <img src="/archive/polaroid.webp" alt="与玩偶熊一起拍下的个人照片" />
            <figcaption>
              <span>Private archive</span>
              <span>01 / 03</span>
            </figcaption>
          </figure>
          <figure className="photo-card">
            <img
              src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1500&q=88"
              alt="山间旅行者"
            />
            <figcaption>
              <span>On the road</span>
              <span>02 / 03</span>
            </figcaption>
          </figure>
          <figure className="photo-card">
            <img
              src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1500&q=88"
              alt="湖泊与远山"
            />
            <figcaption>
              <span>Between mountains</span>
              <span>03 / 03</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="about-section" id="about" aria-labelledby="about-title">
        <p className="section-kicker">03 · About</p>
        <div className="about-grid">
          <h2 id="about-title">这里不是终稿，<br />而是一份持续生长的私人档案。</h2>
          <div className="about-copy">
            <p>
              我是 Cyan Liu。这里收集我关于 AI Agent、系统工程、经验研究与视觉创作的长期笔记，也会保存旅途中偶然看见的光。
            </p>
            <p>
              文章内容来自我原有的技术博客，完整正文与代码示例均已保留；照片区则为你接下来整理个人摄影作品预留了位置。
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
