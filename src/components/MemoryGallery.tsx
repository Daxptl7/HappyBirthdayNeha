import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Expand, Heart, Stars } from 'lucide-react';
import { EXPERIENCE_CONFIG as config } from '../data/experienceConfig';
import { MemoryPhoto } from './MemoryPhoto';
import { BirthdayDialog } from './BirthdayDialog';

export function MemoryGallery({ onNext }: { onNext: () => void }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const lastSwipe = useRef(0);
  const reducedMotion = useReducedMotion();
  const photo = config.photos[index];
  const last = index >= config.photos.length - 1;
  const go = (next: number) => { if (next < 0 || next >= config.photos.length) return; setDirection(next > index ? 1 : -1); setIndex(next); };
  if (!photo) return <><p className="eyebrow">So many memories still to make</p><h1>The best is<br /><em>still ahead.</em></h1><button className="primary-button" onClick={onNext}>Twenty wishes are waiting <Stars size={17} /></button></>;
  return <>
    <p className="eyebrow">The moments worth keeping</p>
    <h1>A little walk down<br /><em>memory lane.</em></h1>
    <p className="scene-description">Little moments. Big feelings. Always worth keeping.</p>
    <div className="memory-album" role="group" aria-label="Photo memories. Use the left and right arrow keys to turn pages." tabIndex={0} onKeyDown={event => { if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1); } if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); } }}>
      <div className="memory-stack stack-back" aria-hidden="true" /><div className="memory-stack stack-middle" aria-hidden="true" />
      <span className="memory-tape" aria-hidden="true" />
      <span className="memory-sidenote">little moments, forever memories</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.figure className="memory-polaroid album-polaroid" key={photo.id} initial={{ opacity: 0, x: reducedMotion ? 0 : direction * 35, rotate: reducedMotion ? 0 : direction * 6 }} animate={{ opacity: 1, x: 0, rotate: reducedMotion ? 0 : -2 }} exit={{ opacity: 0, x: reducedMotion ? 0 : -direction * 35, rotate: reducedMotion ? 0 : -direction * 5 }} transition={{ duration: reducedMotion ? 0 : .35 }}>
          <button className={`memory-image memory-color-${index % 4} memory-zoom-button`} aria-label={`View memory ${index + 1} in full: ${photo.caption}`} onTouchStart={event => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={event => { const dx = event.changedTouches[0].clientX - touchStart.current.x; const dy = event.changedTouches[0].clientY - touchStart.current.y; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) { lastSwipe.current = Date.now(); go(index + (dx < 0 ? 1 : -1)); } }} onClick={() => { if (Date.now() - lastSwipe.current > 450) setZoomed(true); }}>
            <MemoryPhoto url={photo.url} alt={photo.alt || photo.caption} width={photo.width} height={photo.height} /><span className="photo-expand"><Expand size={14} /></span>
          </button>
          <figcaption><span>{photo.tag || 'A favorite memory'}</span><p>{photo.caption}</p>{photo.date && <small>{photo.date}</small>}</figcaption>
        </motion.figure>
      </AnimatePresence>
      <Heart className="memory-doodle" size={50} strokeWidth={.8} />
    </div>
    <div className="album-thumbnails" aria-label="Choose a memory">{config.photos.map((item, i) => <button key={item.id} className={index === i ? 'selected' : ''} aria-label={`See memory ${i + 1}`} aria-pressed={index === i} onClick={() => go(i)}><MemoryPhoto url={item.url} alt="" keepsake /><span>{String(i + 1).padStart(2, '0')}</span></button>)}</div>
    <div className="memory-navigation"><button className="round-button" aria-label="Previous memory" disabled={index === 0} onClick={() => go(index - 1)}><ArrowLeft size={18} /></button><span className="memory-counter" aria-live="polite">{String(index + 1).padStart(2, '0')} <span>/ {String(config.photos.length).padStart(2, '0')}</span></span><button className="round-button" aria-label="Next memory" disabled={last} onClick={() => go(index + 1)}><ArrowRight size={18} /></button></div>
    {last ? <button className="primary-button" onClick={onNext}>Twenty wishes, just for you <Stars size={17} /></button> : <button className="text-button" onClick={() => go(index + 1)}>Turn the page <ArrowRight size={16} /></button>}
    {zoomed && <BirthdayDialog title={photo.tag || 'A favorite memory'} className="photo-dialog" onClose={() => setZoomed(false)}><div className="full-memory-photo"><MemoryPhoto url={photo.url} alt={photo.alt || photo.caption} width={photo.width} height={photo.height} /></div><p>{photo.caption}</p><div className="memory-navigation"><button className="round-button" aria-label="Previous enlarged memory" disabled={index === 0} onClick={() => go(index - 1)}><ArrowLeft size={18} /></button><span>{index + 1} / {config.photos.length}</span><button className="round-button" aria-label="Next enlarged memory" disabled={last} onClick={() => go(index + 1)}><ArrowRight size={18} /></button></div></BirthdayDialog>}
  </>;
}
