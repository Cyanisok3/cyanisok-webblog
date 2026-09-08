import type { Metadata } from 'next';
import { InnerNavigation } from '@/components/inner-navigation';
import { PhotographyArchive } from '@/components/photography-archive';
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
      <div className="inner-shell photography-shell">
        <InnerNavigation active="photography" className="photography-nav" label="Photography navigation" />
        <header className="photography-heading">
          <h1>Photography<span className="photography-title-echo" aria-hidden="true">Photography</span></h1>
          <p>Selected frames / 01—{total}</p>
        </header>
        <PhotographyArchive photos={photographs} />
        <footer className="photography-footer">
          <span>© {new Date().getFullYear()} Cyan Liu</span>
          <span>A personal photo archive</span>
          <a href="#photo-top">Back to top ↑</a>
        </footer>
      </div>
    </main>
  );
}
