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

      <section className="photography-section" id="photography" aria-labelledby="photography-title">
        <header className="section-heading photography-heading">
          <div>
            <p className="section-kicker">02 · Photography</p>
            <h2 id="photography-title">Photo Notes</h2>
          </div>
          <p className="section-note">A growing archive of photographs, places, and passing light.</p>
        </header>

        <div className="photo-grid">
          <figure className="photo-card photo-card-tall">
            <img src="/archive/polaroid.webp" alt="A personal photograph with a teddy bear" />
            <figcaption>
              <span>Private archive</span>
              <span>01 / 03</span>
            </figcaption>
          </figure>
          <figure className="photo-card">
            <img
              src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1500&q=88"
              alt="A traveller in the mountains"
            />
            <figcaption>
              <span>On the road</span>
              <span>02 / 03</span>
            </figcaption>
          </figure>
          <figure className="photo-card">
            <img
              src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1500&q=88"
              alt="A lake framed by distant mountains"
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
