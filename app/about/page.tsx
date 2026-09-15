import type { Metadata } from 'next';
import { InnerNavigation } from '@/components/inner-navigation';
import { AboutCard } from '@/components/about-card';
import { profile } from '@/lib/profile';
import './about.css';

const description = 'Meet Qingyang Liu — Cyanisok. A personal introduction, in a different light.';
export const metadata: Metadata = {
  title: 'About', description, alternates: { canonical: '/about' },
  openGraph: { type: 'website', url: 'https://cyanisok.cn/about', title: 'About · Cyanisok', description },
};

export default function AboutPage() {
  return <main className="about-page" id="about-top">
    <div className="inner-shell">
      <InnerNavigation active="about" label="About navigation" />
      <header className="about-page-heading">
        <h1>Introducing MYSELF...</h1>
        <p>ABOUT / Cyanisok’s Virtual ID Card</p>
      </header>
      <AboutCard profile={profile} />
      <section className="about-profile" aria-label="Personal information">
        <div className="about-profile-intro"><p className="about-label">BEHIND THE CARD</p><h2>You may call me Cyan.</h2>
          <div className="about-profile-links">{profile.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div>
        </div>
        <div>
          <dl className="about-profile-facts">
            <div><dt>Name</dt><dd>{profile.name}</dd></div>
            <div><dt>Education</dt><dd>{profile.education}</dd></div>
            <div><dt>Role</dt><dd>{profile.role}</dd></div>
            <div><dt>Date of birth</dt><dd>{profile.birthDate}</dd></div>
            <div><dt>Nationality</dt><dd>{profile.nationality}</dd></div>
            {profile.researchDirections.length > 0 && <div><dt>Research</dt><dd>{profile.researchDirections.join(' / ')}</dd></div>}
          </dl>
          <div className="about-profile-biography">{profile.biography.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </div>
      </section>
      <footer className="about-page-footer"><span>© {new Date().getFullYear()} {profile.name}</span><a href="#about-top">Back to top ↑</a></footer>
    </div>
  </main>;
}
