import { useState, type CSSProperties } from 'react';
import { Heart, RotateCcw, Sparkles } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { EXPERIENCE_CONFIG as config } from '../data/experienceConfig';
import { triggerHeartShower } from '../utils/confettiUtils';
import { MemoryPhoto } from './MemoryPhoto';

export function LanternFinale({ onReplay }: { onReplay: () => void }) {
  const [released, setReleased] = useState(0);
  const reducedMotion = useReducedMotion();
  const photo = config.photos.find(photo => photo.id === config.finale.favoritePhotoId) || config.photos[0];
  return <>
    <div className="lantern-sky" aria-hidden="true">{Array.from({ length: 12 + released }, (_, i) => <span className={`sky-lantern ${i >= 12 ? 'just-released' : ''}`} key={i} style={{ '--lantern-x': `${4 + (i * 31.7) % 90}%`, '--lantern-delay': i >= 12 ? '0s' : `${-(i * 3.3) % 28}s`, '--lantern-duration': `${23 + i % 5 * 3}s`, '--lantern-scale': .5 + i % 4 * .19, '--lantern-sway': `${i % 2 ? '-' : ''}${22 + i % 4 * 10}px`, '--lantern-rest': `${12 + (i * 11) % 70}%` } as CSSProperties}><i /><span /></span>)}</div>
    <p className="eyebrow">One last wish, sent up to the stars</p>
    <h1>Happy birthday,<br /><em>{config.recipientName}.</em></h1>
    <figure className="finale-keepsake"><div><MemoryPhoto url={photo?.url || ''} alt={photo?.alt || photo?.caption || `A birthday keepsake for ${config.recipientName}`} width={photo?.width} height={photo?.height} keepsake /></div><figcaption>Here’s to all the memories still to come. <Heart size={12} /></figcaption></figure>
    <p className="finale-message">{config.finale.message}</p>
    <p className="scene-description">Stay happy. Keep smiling. Never forget how loved you are.</p>
    <p className="finale-signature">{config.finale.signature} <Heart size={14} /></p>
    <button className="primary-button" onClick={() => { setReleased(count => Math.min(count + 1, 18)); if (!reducedMotion) triggerHeartShower(); }}><Sparkles size={17} />Send a wish into the sky</button>
    <p className="lantern-announcement" role="status">{released > 0 ? 'A little wish, sent into the sky. May it find its way to you.' : 'A little light for a beautiful year ahead.'}</p>
    <button className="text-button" onClick={onReplay}>Relive the celebration <RotateCcw size={14} /></button>
  </>;
}
