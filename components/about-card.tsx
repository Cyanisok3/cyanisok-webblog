'use client';

/* oxlint-disable nextjs/no-img-element -- This preview is generated from the same local canvas as the 3D texture. */
import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import { drawProfileCard } from '@/lib/draw-profile-card';
import type { Profile } from '@/lib/profile';

const Scene = lazy(() => import('./about-card-scene'));

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function AboutCard({ profile }: { profile: Profile }) {
  const [card, setCard] = useState<HTMLCanvasElement | null>(null);
  const [preview, setPreview] = useState('');
  const [sceneReady, setSceneReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const ready = useCallback(() => setSceneReady(true), []);
  const fail = useCallback(() => { setFailed(true); setSceneReady(false); }, []);

  useEffect(() => {
    let cancelled = false;
    drawProfileCard(profile).then((canvas) => {
      if (cancelled) return;
      setPreview(canvas.toDataURL());
      setCard(canvas);
    }).catch(() => { if (!cancelled) fail(); });
    return () => { cancelled = true; };
  }, [profile, fail]);

  return <figure className="about-card-figure">
    <div className="about-card-stage" aria-label={`ID card for ${profile.name}, ${profile.education}. Full text follows below.`}>
      <div className={`about-card-flat${sceneReady ? ' is-hidden' : ''}`} aria-hidden="true">
        <div className="about-card-slot" />
        <div className="about-card-print">
          {preview ? <img src={preview} alt="" /> : <div className="about-card-placeholder"><strong>{profile.handle}</strong><span>{profile.name}</span><span>{profile.education}</span></div>}
        </div>
      </div>
      {card && !failed && <div className={`about-card-webgl${sceneReady ? ' is-ready' : ''}`} aria-hidden="true">
        <SceneBoundary onFailure={fail}><Suspense fallback={null}><Scene card={card} onReady={ready} onFailure={fail} /></Suspense></SceneBoundary>
      </div>}
    </div>
    <figcaption><span>01 / PERSONAL IDENTIFICATION</span><span>{failed ? 'Flat view' : 'A little perspective changes everything.'}</span></figcaption>
  </figure>;
}
