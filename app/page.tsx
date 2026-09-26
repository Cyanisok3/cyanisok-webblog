import { HeroSlideshow } from '@/components/hero-slideshow';
import { PostList } from '@/components/post-list';
import { SiteFooter } from '@/components/site-footer';
import { getPosts } from '@/lib/posts';

export default function Home() {
  const posts = getPosts();

  return (
    <main>
      <HeroSlideshow />

      <section className="writing-section" id="blog" aria-labelledby="blog-title">
        <header className="section-heading">
          <div>
            <p className="section-kicker">01 · Blog</p>
            <h2 id="blog-title">Selected Posts</h2>
          </div>
          <p className="section-note">Notes on systems, AI, research methods, and visual practice.</p>
        </header>

        <PostList posts={posts.slice(0, 5)} />

        <a className="text-link" href="/blog">
          View all {posts.length} entries <span aria-hidden="true">→</span>
        </a>
      </section>

      <section className="about-section" id="about" aria-labelledby="about-title">
        <p className="section-kicker">02 · About</p>
        <div className="about-grid">
          <h2 id="about-title">Taste matters<br />not only in art<br /> but also in technology.</h2>
          <div className="about-copy">
            <p>
              Hello there behind the screen. You may call me Cyan. 
            </p>
            <p>
              If you are also attuned to the flow of time, you would likely agree that the essence of all greatest things lies in a kind of "serenity", or a "constant state free from constraints".
            </p>
            <p>
              This draws me to voice my emotions from the deepest reaches of the universe, hoping to radiate a glimmer of light and warmth within the utter darkness.
            </p>
            <p>
              And that is why we are still documenting these days.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
