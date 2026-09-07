import type { Metadata } from 'next';
import { PhotographyGallery } from '@/components/photography-gallery';
import { photographs } from '@/lib/photographs';
import './photography.css';

const description = 'A personal photo archive of places, passing light, and the days in between.';

export const metadata: Metadata = {
  title: 'Photography',
  description,
  alternates: { canonical: '/photography' },
  openGraph: { type: 'website', url: 'https://cyanisok.cn/photography', title: 'Photography', description },
  twitter: { card: 'summary_large_image', title: 'Photography · @Cyanisok', description },
};

export default function PhotographyPage() {
  const total = String(photographs.length).padStart(2, '0');
  return (
    <main className="photography-page" id="photo-top">
      <div className="photography-shell">
        <header className="photography-nav">
          <a className="photography-wordmark" href="/" aria-label="@Cyanisok — Home">@Cyanisok</a>
          <nav aria-label="Photography navigation">
            <a href="/photography" aria-current="page">Photography</a>
            <a href="/blog">Blog</a>
            <a href="/#about">About</a>
          </nav>
        </header>
        <header className="photography-heading">
          <h1>Photography<span className="photography-title-echo" aria-hidden="true">Photography</span></h1>
          <p>Selected frames / 01—{total}</p>
        </header>
        <section className="photography-archive" aria-label="Selected photographs">
          <aside className="photography-notes" aria-label="Archive notes">
            <p className="photography-intro">Places, passing light,<br />and the days in between.</p>
            <div className="photography-index">
              <p>Index <span>{total} photographs</span></p>
              <ul>{photographs.map((photo) => <li key={photo.id}>{photo.title}</li>)}</ul>
            </div>
            <pre className="photography-viewfinder" aria-hidden="true">{'+ — — — — — — — +\n|               |\n|       +       |\n|               |\n+ — — — — — — — +'}</pre>
            <p className="photography-afterword">We interact with the world.<br />We look a little longer.</p>
          </aside>
          <PhotographyGallery photos={photographs} />
        </section>
        <footer className="photography-footer">
          <span>© {new Date().getFullYear()} Cyan Liu</span>
          <span>A personal photo archive</span>
          <a href="#photo-top">Back to top ↑</a>
        </footer>
      </div>
    </main>
  );
}
