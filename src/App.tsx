import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowRight, Check, Gift, Heart, Mail, Music2, Pause, Play, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import { EXPERIENCE_CONFIG as config } from './data/experienceConfig';
import { birthdayAudio } from './utils/audioPlayer';
import { triggerCelebrationConfetti } from './utils/confettiUtils';
import { BirthdayStage, canStartCelebration, getCountdown, nextBirthdayStage, registerSecretTap, toLocalDateTimeInput } from './utils/experienceLogic';
import { MemoryGallery } from './components/MemoryGallery';
import { WishSky } from './components/WishSky';
import { SecretSurprise } from './components/SecretSurprise';
import { LanternFinale } from './components/LanternFinale';
import './birthday.css';
import './surprises.css';

const loadBirthdayCake = () => import('./components/BirthdayCake3D');
const BirthdayCake3D = lazy(loadBirthdayCake);

const chapters: { stage: BirthdayStage; label: string }[] = [
  { stage: 'countdown', label: 'The anticipation' },
  { stage: 'cake', label: 'Make a wish' },
  { stage: 'birthday', label: 'Your moment' },
  { stage: 'letter', label: 'A little letter' },
  { stage: 'memories', label: 'The memories' },
  { stage: 'wishes', label: 'Twenty little wishes' },
  { stage: 'surprise', label: 'One last thing' },
];

function CakeScene({ onComplete, onListeningChange }: { onComplete: () => void; onListeningChange: (active: boolean) => void }) {
  return <>
    <p className="eyebrow">A little wish, a little magic</p>
    <h1>First, make a <em>wish.</em></h1>
    <p className="scene-description">Make a little wish, then blow out your candles.<br />There’s a birthday slice with your name on it.</p>
    <Suspense fallback={<div className="cake-module-loading" role="status">A little birthday magic is getting ready…</div>}>
      <BirthdayCake3D recipientName={config.recipientName} onComplete={onComplete} onListeningChange={onListeningChange} />
    </Suspense>
  </>;
}

function LetterScene({ onNext }: { onNext: () => void }) {
  const [open, setOpen] = useState(false);
  return <>
    <p className="eyebrow">Some things are better written</p>
    <h1>A little something,<br /><em>just for you.</em></h1>
    {!open ? <>
      <p className="scene-description">No grand speech. Just a few words from the heart.</p>
      <button className="envelope" aria-label="Open your birthday letter" onClick={() => setOpen(true)}>
        <span className="envelope-paper">Dear {config.recipientName},<br /><span>this one is for you.</span></span>
        <span className="envelope-back" /><span className="envelope-flap" /><span className="envelope-front" />
        <span className="wax-seal"><Sparkles size={22} /></span>
        <span className="envelope-address">To {config.recipientName}, from your friend</span>
      </button>
      <button className="text-button" onClick={() => setOpen(true)}>Break the seal <ArrowRight size={16} /></button>
    </> : <div className="letter-reveal">
      <article className="letter-paper">
        <Sparkles size={20} className="letter-heart" />
        <h2>{config.letter.salutation}</h2>
        {config.letter.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        <p className="letter-signoff">{config.letter.closing}<br /><em>{config.letter.signoff}</em></p>
      </article>
      <button className="primary-button" onClick={onNext}>A few memories next? <ArrowRight size={17} /></button>
    </div>}
  </>;
}

function SurpriseScene({ onNext }: { onNext: () => void }) {
  const [qr, setQr] = useState('');
  const [failed, setFailed] = useState(false);
  const [prank, setPrank] = useState(false);
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(config.surprise.qrValue, { width: 768, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#35232c', light: '#ffffff' } })
      .then(url => { if (!cancelled) setQr(url); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);
  const isLink = /^https?:\/\//i.test(config.surprise.qrValue);
  if (prank) return <>
    <span className="prank-gift" aria-hidden="true"><Gift size={46} strokeWidth={1} /><Sparkles size={23} /></span>
    <p className="eyebrow">You didn’t think it was that easy, did you?</p>
    <h1>Just kidding!<br /><em>Happy birthday to you.</em></h1>
    <p className="scene-description">You weren’t getting away without another birthday wish, {config.recipientName}.<br />Your gift is a whole sky of good things. There’s one last little moment waiting.</p>
    <button className="primary-button prank-continue" onClick={onNext}>One last wish under the stars <Sparkles size={17} /></button>
  </>;
  return <>
    <p className="eyebrow">Your final birthday mission</p>
    <h1>{config.surprise.title}<br /><em>{config.surprise.titleEmphasis}</em></h1>
    <p className="scene-description">{config.surprise.description}<br />Scan it with another phone’s camera to find out.</p>
    <div className="qr-card"><span className="qr-corner top-left" /><span className="qr-corner bottom-right" />
      {qr ? <img src={qr} width="240" height="240" alt="Scan this QR code to reveal your birthday surprise" /> : <div className="qr-loading" role="status">{failed ? 'Open your surprise with the button below.' : 'A little mystery is getting ready…'}</div>}
      <span className="qr-caption"><Gift size={14} /> for your eyes only</span>
    </div>
    {isLink ? <a className="primary-button" href={config.surprise.qrValue} target="_blank" rel="noopener noreferrer">Open surprise on this phone <ArrowRight size={17} /></a> : <button className="primary-button" onClick={() => setPrank(true)}>Open surprise on this phone <ArrowRight size={17} /></button>}
    <button className="text-button" onClick={() => setPrank(true)}>{isLink ? 'I’ve opened it' : 'I’ve scanned it'} <Check size={16} /></button>
    <button className="skip-button" onClick={() => setPrank(true)}>Skip this part <ArrowRight size={13} /></button>
  </>;
}

function TestClock({ onSet, onQuick, onReset }: { onSet: (time: number) => void; onQuick: () => void; onReset: () => void }) {
  const [value, setValue] = useState(() => toLocalDateTimeInput(Date.now() + 60_000));
  const [error, setError] = useState('');
  return <details className="test-clock"><summary><span className="test-dot" />Development · test the timing</summary>
    <form onSubmit={event => {
      event.preventDefault();
      const time = new Date(value).getTime();
      if (!Number.isFinite(time) || time <= Date.now()) { setError('Choose a future date and time to test the countdown.'); return; }
      setError(''); onSet(time);
    }}>
      <label htmlFor="test-time">Start the celebration at</label>
      <input id="test-time" type="datetime-local" step="1" required value={value} onChange={event => setValue(event.target.value)} />
      <small>Your device’s local timezone. Click “I’m ready” after setting it.</small>
      <button className="test-action" type="submit">Set test time</button>
      {error && <p className="test-error" role="alert">{error}</p>}
    </form>
    <div className="test-shortcuts"><button onClick={onQuick}>Start 10-second test</button><button onClick={onReset}>Use birthday time</button></div>
    <p>Only visible in development. Published pages use the time in experienceConfig.ts.</p>
  </details>;
}

export default function App() {
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState<BirthdayStage>('countdown');
  const [now, setNow] = useState(Date.now);
  const [target, setTarget] = useState(() => Date.parse(config.celebrationAt));
  const [armed, setArmed] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioMessage, setAudioMessage] = useState('');
  const [isTest, setIsTest] = useState(false);
  const [secretOpen, setSecretOpen] = useState(false);
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const secretTaps = useRef({ count: 0, startedAt: 0 });
  const resumeAfterMicrophone = useRef(false);
  const stageRef = useRef(stage); stageRef.current = stage;
  const mainRef = useRef<HTMLElement>(null);
  const countdown = getCountdown(target, now);
  const chapterIndex = stage === 'finale' ? chapters.length - 1 : chapters.findIndex(chapter => chapter.stage === stage);

  useEffect(() => {
    // Fetch the 3D scene while she waits; initialize WebGL only at the cake step.
    void loadBirthdayCake().catch(() => {});
  }, []);

  useEffect(() => {
    birthdayAudio.setSong(config.song.type, config.song.customUrl, config.song.audioData);
    const unsubscribe = birthdayAudio.subscribe(setPlaying);
    return () => { unsubscribe(); birthdayAudio.stop(); };
  }, []);

  useEffect(() => {
    if (stage !== 'countdown') return;
    const update = () => setNow(Date.now());
    const interval = window.setInterval(update, 250);
    document.addEventListener('visibilitychange', update);
    window.addEventListener('focus', update);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', update); window.removeEventListener('focus', update); };
  }, [stage]);

  useEffect(() => {
    if (stage === 'countdown' && canStartCelebration(target, now, armed)) {
      setStage('cake');
      void birthdayAudio.play().then(success => setAudioMessage(success ? '' : 'Tap the music button to start your birthday song.'));
    }
  }, [stage, target, now, armed]);

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
    if ((stage === 'birthday' || stage === 'finale') && !reducedMotion) triggerCelebrationConfetti();
  }, [stage, reducedMotion]);

  const handleListeningChange = useCallback((active: boolean) => {
    setMicrophoneActive(active);
    if (active) {
      resumeAfterMicrophone.current = birthdayAudio.getIsPlaying();
      birthdayAudio.pause();
    } else {
      const resume = resumeAfterMicrophone.current;
      resumeAfterMicrophone.current = false;
      if (resume && stageRef.current === 'cake') void birthdayAudio.play();
    }
  }, []);

  function tapName() {
    const result = registerSecretTap(secretTaps.current, Date.now());
    secretTaps.current = result;
    if (result.unlocked) setSecretOpen(true);
  }

  async function enterExperience() {
    setPreparing(true);
    const ready = await birthdayAudio.prepare();
    setAudioMessage(ready ? '' : 'If the song needs a tap, use the music button when the celebration begins.');
    setNow(Date.now()); setArmed(true); setPreparing(false);
  }

  function reset(time: number, test: boolean) {
    resumeAfterMicrophone.current = false; setSecretOpen(false); secretTaps.current = { count: 0, startedAt: 0 };
    birthdayAudio.stop(); setAudioMessage(''); setArmed(false); setStage('countdown'); setTarget(time); setNow(Date.now()); setIsTest(test);
  }

  async function quickTest() {
    reset(Date.now() + 10_000, true);
    await enterExperience();
  }

  async function toggleMusic() {
    if (playing) { birthdayAudio.pause(); setAudioMessage(''); return; }
    const success = await birthdayAudio.play();
    setAudioMessage(success ? '' : 'The song couldn’t play. Please tap to try again.');
  }

  const targetLabel = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: isTest ? undefined : config.timeZone }).format(target);

  return (
    <div className={`birthday-app ${stage === 'cake' ? 'is-cake' : ''} ${stage === 'wishes' || stage === 'finale' ? 'is-night' : ''}`}>
      <div className="ambient-orb orb-one" aria-hidden="true" /><div className="ambient-orb orb-two" aria-hidden="true" />
      <div className="decorative-stars" aria-hidden="true"><span>✧</span><span>✦</span><span>✧</span><span>✦</span><span>✧</span><span>✧</span></div>
      <header className="journey-header">
        <span className="birthday-wordmark"><span className="wordmark-icon"><Gift size={18} strokeWidth={1.5} /></span>just for <button className="secret-name wordmark-name" aria-label={config.recipientName} onClick={tapName}><em>{config.recipientName.toLowerCase()}.</em></button></span>
        <span className="header-date">27 OCT <span>·</span> A DAY ALL ABOUT YOU</span>
        <button className={`music-toggle ${playing ? 'is-playing' : ''}`} onClick={toggleMusic} disabled={stage === 'countdown' || microphoneActive} aria-label={playing ? 'Pause birthday music' : 'Play birthday music'} aria-pressed={playing}>
          {playing ? <Pause size={14} /> : <Music2 size={16} />}<span>{stage === 'countdown' ? 'sound on at the surprise' : microphoneActive ? 'a quiet birthday wish' : playing ? 'music on' : 'music off'}</span>
          <span className="sound-bars" aria-hidden="true"><i /><i /><i /></span>
        </button>
      </header>

      <nav className="chapter-rail" aria-label="Your birthday journey"><ol>{chapters.map((chapter, i) => <li key={chapter.stage} className={i === chapterIndex ? 'current' : i < chapterIndex ? 'complete' : ''} aria-current={i === chapterIndex ? 'step' : undefined}><span className="chapter-number">{i < chapterIndex ? <Check size={11} /> : String(i + 1).padStart(2, '0')}</span><span className="chapter-label">{chapter.label}</span></li>)}</ol></nav>

      <main className={`journey-main stage-${stage}`} ref={mainRef} tabIndex={-1} aria-label={stage === 'finale' ? `Happy birthday, ${config.recipientName}` : chapters[chapterIndex].label}>
        <AnimatePresence mode="wait">
          <motion.section className="scene" data-stage={stage} key={stage} initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -12 }} transition={{ duration: reducedMotion ? 0 : .4 }}>
            {stage === 'countdown' && <>
              <div className="occasion-tag"><span />{isTest ? 'A little rehearsal for the big day' : 'Something wonderful is on its way'}</div>
              <p className="eyebrow countdown-eyebrow">For the girl who makes life a little brighter</p>
              <h1>Some days are special.<br /><em>This one is yours, {config.recipientName}.</em></h1>
              <p className="scene-description">A little celebration, a few surprises, and a whole lot of love.<br />It all begins when the clock strikes your moment.</p>
              <div className="countdown-dial" role="timer" aria-label={`${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes, ${countdown.seconds} seconds until the celebration`}>
                {([{ value: countdown.days, label: 'days' }, { value: countdown.hours, label: 'hours' }, { value: countdown.minutes, label: 'minutes' }, { value: countdown.seconds, label: 'seconds' }]).map(({ value, label }) => <div className="countdown-unit" key={label}><span>{String(value).padStart(2, '0')}</span><small>{label}</small></div>)}
              </div>
              <p className="countdown-date">{targetLabel} {isTest ? '· local test time' : 'IST'}<span>Born on 26 October 2006. Celebrated, always.</span></p>
              {!armed ? <button className="primary-button" onClick={enterExperience} disabled={preparing}><Play size={15} fill="currentColor" />{preparing ? 'Getting your surprise ready…' : countdown.hasStarted ? 'Begin my birthday surprise' : 'I’m ready for the surprise'}<ArrowRight size={17} /></button> : <div className="ready-message" role="status"><span className="ready-heart"><Heart size={17} /></span>You’re all set. Stay here — the magic starts automatically.</div>}
              <p className="small-note"><Music2 size={12} />{armed ? 'Keep this page open for your song and surprise.' : 'One little tap enables your birthday music. Headphones welcome.'}</p>
              <div className="countdown-bottom" aria-hidden="true"><span>the best things are worth the wait</span><ArrowDown size={16} /></div>
            </>}
            {stage === 'cake' && <CakeScene onComplete={() => setStage(nextBirthdayStage('cake'))} onListeningChange={handleListeningChange} />}
            {stage === 'birthday' && <>
              <div className="birthday-monogram" aria-hidden="true"><Sparkles size={23} /><span>N</span><Heart size={24} /></div>
              <p className="eyebrow">The world got a little luckier on this day</p>
              <h1 className="birthday-title">Happy Birthday,<br /><button className="secret-name birthday-name" onClick={tapName} aria-label={config.recipientName}><em>{config.recipientName}.</em></button><span className="title-sparkle" aria-hidden="true">✧</span></h1>
              <p className="scene-description">Here’s to your biggest dreams, your loudest laughs,<br />and a year that loves you right back.</p>
              <span className="birthday-ribbon">26 October 2006 <Heart size={13} /> a very good day for the universe</span>
              <button className="primary-button" onClick={() => setStage('letter')}>There’s a letter with your name on it <Mail size={17} /></button>
            </>}
            {stage === 'letter' && <LetterScene onNext={() => setStage('memories')} />}
            {stage === 'memories' && <MemoryGallery onNext={() => setStage(nextBirthdayStage('memories'))} />}
            {stage === 'wishes' && <WishSky onNext={() => setStage(nextBirthdayStage('wishes'))} />}
            {stage === 'surprise' && <SurpriseScene onNext={() => setStage('finale')} />}
            {stage === 'finale' && <LanternFinale onReplay={() => { birthdayAudio.stop(); setArmed(false); setAudioMessage(''); setNow(Date.now()); setStage('cake'); void birthdayAudio.play(); }} />}
          </motion.section>
        </AnimatePresence>
      </main>

      {audioMessage && <p className="audio-message" role="status">{audioMessage}{stage !== 'countdown' && <button onClick={toggleMusic}>Play song <Play size={12} /></button>}</p>}
      <footer className="journey-footer"><span>made with a little magic <span className="footer-ampersand">&</span> a lot of love</span><span className="footer-chapter">{stage === 'finale' ? 'A birthday to remember' : `${String(chapterIndex + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}`}<Heart size={12} /></span></footer>
      {secretOpen && <SecretSurprise onClose={() => setSecretOpen(false)} />}
      {import.meta.env.DEV && <TestClock onSet={time => reset(time, true)} onQuick={quickTest} onReset={() => reset(Date.parse(config.celebrationAt), false)} />}
    </div>
  );
}
