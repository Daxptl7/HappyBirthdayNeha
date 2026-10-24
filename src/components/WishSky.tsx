import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, Sparkles, Star } from 'lucide-react';
import { EXPERIENCE_CONFIG as config } from '../data/experienceConfig';

const positions = config.wishes.map((_, i) => ({ x: 10 + i % 5 * 20, y: 14 + Math.floor(i / 5) * 24 + (i % 2 ? -5 : 2) }));

export function WishSky({ onNext }: { onNext: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [opened, setOpened] = useState<Set<number>>(() => new Set());
  const reducedMotion = useReducedMotion();
  const select = (index: number) => { setSelected(index); setOpened(previous => new Set([...previous, index])); };
  return <>
    <p className="eyebrow">A new decade. A whole sky of possibilities.</p>
    <h1>{config.wishes.length} little wishes<br /><em>for your {config.milestoneAge}th.</em></h1>
    <p className="scene-description">Every star holds a wish for you. Pick one. Pick them all.<br />There’s no hurry under this sky.</p>
    <div className="wish-constellation" role="group" aria-label="Twenty birthday wishes">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={positions.map(({ x, y }) => `${x},${y}`).join(' ')} /><path d="M10 16L30 33L50 16L70 33L90 16M10 64L30 81L50 64L70 81L90 64" /></svg>
      {positions.map(({ x, y }, i) => <button className={`wish-star ${opened.has(i) ? 'is-opened' : ''} ${selected === i ? 'is-selected' : ''}`} key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * .19}s` }} aria-label={`Open birthday wish ${i + 1}`} aria-pressed={selected === i} onClick={() => select(i)}><Star size={i % 3 === 0 ? 24 : 19} fill={opened.has(i) ? 'currentColor' : 'none'} strokeWidth={1} /><span>{String(i + 1).padStart(2, '0')}</span>{opened.has(i) && <Check className="star-check" size={9} />}</button>)}
    </div>
    <div className="wish-message" aria-live="polite" aria-atomic="true"><AnimatePresence mode="wait" initial={false}><motion.div key={selected ?? 'intro'} initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .2 }}>{selected === null ? <><Sparkles size={20} /><h2>A sky full of good things.</h2><p>Tap a little light to unwrap your first wish.</p></> : <><span className="wish-number">WISH {String(selected + 1).padStart(2, '0')} / {config.wishes.length}</span><h2>{config.wishes[selected].title}</h2><p>{config.wishes[selected].message}</p></>}</motion.div></AnimatePresence></div>
    <p className="wish-count">{opened.size === config.wishes.length ? 'Every little star is yours now. Carry them with you.' : `${opened.size} of ${config.wishes.length} wishes discovered · all of them are already yours`}</p>
    <button className="primary-button" onClick={onNext}>One final surprise <ArrowRight size={17} /></button>
  </>;
}
