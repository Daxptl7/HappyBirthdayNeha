import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Wind } from 'lucide-react';
import { createBlowDetector, measureBreath } from '../utils/blowDetection';

export function CandleBlowing({ onBlown, onListeningChange }: { onBlown: () => void; onListeningChange: (active: boolean) => void }) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'calibrating' | 'listening' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [level, setLevel] = useState(0);
  const mounted = useRef(true);
  const request = useRef(0);
  const resources = useRef<{ stream?: MediaStream; context?: AudioContext; source?: MediaStreamAudioSourceNode; frame?: number; timeout?: number; listening: boolean }>({ listening: false });
  const callbacks = useRef({ onBlown, onListeningChange }); callbacks.current = { onBlown, onListeningChange };

  function stop() {
    request.current++;
    const current = resources.current;
    resources.current = { listening: false };
    if (current.frame) cancelAnimationFrame(current.frame);
    if (current.timeout) clearTimeout(current.timeout);
    current.source?.disconnect();
    current.stream?.getTracks().forEach(track => track.stop());
    if (current.context && current.context.state !== 'closed') void current.context.close().catch(() => {});
    if (current.listening) callbacks.current.onListeningChange(false);
  }

  useEffect(() => {
    mounted.current = true;
    const onVisibilityChange = () => {
      if (document.hidden) { stop(); setStatus('idle'); setLevel(0); }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => { mounted.current = false; document.removeEventListener('visibilitychange', onVisibilityChange); stop(); };
  }, []);

  async function start() {
    stop();
    const currentRequest = request.current;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!navigator.mediaDevices?.getUserMedia || !AudioContextClass) {
      setStatus('error'); setMessage('The microphone isn’t available here. Your wish works with a tap too.'); return;
    }
    setStatus('requesting'); setMessage(''); setLevel(0);
    try {
      const context = new AudioContextClass();
      resources.current.context = context;
      void context.resume().catch(() => {});
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false });
      if (!mounted.current || currentRequest !== request.current) { stream.getTracks().forEach(track => track.stop()); return; }
      resources.current.stream = stream;
      await context.resume();
      if (!mounted.current || currentRequest !== request.current) return;
      const analyser = context.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = .2;
      const source = context.createMediaStreamSource(stream); source.connect(analyser);
      resources.current.source = source;
      resources.current.listening = true;
      callbacks.current.onListeningChange(true);
      setStatus('calibrating');
      const waveform = new Float32Array(analyser.fftSize);
      const spectrum = new Uint8Array(analyser.frequencyBinCount);
      const detect = createBlowDetector(performance.now());
      let previous = 0;
      function listen(now: number) {
        if (!mounted.current || currentRequest !== request.current) return;
        resources.current.frame = requestAnimationFrame(listen);
        if (now - previous < 75) return;
        previous = now;
        analyser.getFloatTimeDomainData(waveform); analyser.getByteFrequencyData(spectrum);
        const result = detect(measureBreath(waveform, spectrum, context.sampleRate), now);
        setLevel(result.level);
        setStatus(result.calibrating ? 'calibrating' : 'listening');
        if (result.detected) { stop(); callbacks.current.onBlown(); }
      }
      resources.current.frame = requestAnimationFrame(listen);
      resources.current.timeout = window.setTimeout(() => {
        if (!mounted.current || currentRequest !== request.current) return;
        stop(); setLevel(0); setStatus('error'); setMessage('No puff detected yet. Try again, or send your wish with a tap.');
      }, 14000);
    } catch (error) {
      if (!mounted.current || currentRequest !== request.current) return;
      stop(); setStatus('error');
      const denied = error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError');
      setMessage(denied ? 'No microphone permission? No problem. Blow the candles out with a tap.' : 'Your microphone couldn’t start. Try again, or use a little tap magic.');
    }
  }

  const active = status === 'requesting' || status === 'calibrating' || status === 'listening';
  return <div className="candle-blowing">
    <div className="breath-introduction"><Wind size={18} /><span>A wish first. Then the candles.</span></div>
    {active ? <>
      <p className="breath-status" role="status">{status === 'requesting' ? 'Allow the microphone to make your wish.' : status === 'calibrating' ? 'One quiet second…' : 'Make your wish. Blow gently near your microphone.'}</p>
      <div className="breath-meter" role="meter" aria-label="Your breath" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level * 100)}><span style={{ transform: `scaleX(${level})` }} /></div>
      <button className="text-button" onClick={() => { stop(); setStatus('idle'); setLevel(0); }}><MicOff size={14} />Stop listening</button>
    </> : <button className="primary-button" onClick={start}><Mic size={16} />{status === 'error' ? 'Try the microphone again' : 'Blow out my candles'}</button>}
    {message && <p className="breath-status" role="status">{message}</p>}
    <button className="text-button candle-tap" onClick={() => { stop(); callbacks.current.onBlown(); }}><Wind size={14} />Blow them out with a tap</button>
    <p className="small-note">{active && status !== 'requesting' ? 'A quiet moment for your wish. Music resumes afterwards.' : 'Microphone is optional. Nothing is recorded.'}</p>
  </div>;
}
