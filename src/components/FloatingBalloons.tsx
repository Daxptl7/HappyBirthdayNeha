import React, { useId } from 'react';

interface FloatingBalloonsProps {
  intensity?: 'gentle' | 'vibrant';
}

export const FloatingBalloons: React.FC<FloatingBalloonsProps> = () => {
  const baseId = useId();

  // Warm sunlit celebration balloon colors (peach, coral, rose, honey gold)
  const balloons = [
    { color: 'from-rose-400/55 to-pink-500/55', size: 64, left: '8%', delay: '0s', duration: '9s' },
    { color: 'from-amber-300/60 to-orange-400/55', size: 76, left: '22%', delay: '2s', duration: '11s' },
    { color: 'from-pink-300/60 to-rose-400/55', size: 58, left: '42%', delay: '4s', duration: '10s' },
    { color: 'from-orange-300/55 to-rose-400/55', size: 82, left: '74%', delay: '1s', duration: '12s' },
    { color: 'from-amber-200/65 to-pink-400/55', size: 60, left: '90%', delay: '3s', duration: '8.5s' },
  ];

  // Warm golden sun-sparkles
  const stars = [
    { top: '12%', left: '15%', size: 4, delay: '0.5s' },
    { top: '25%', left: '82%', size: 4.5, delay: '1.2s' },
    { top: '38%', left: '30%', size: 3.5, delay: '2.1s' },
    { top: '55%', left: '70%', size: 4, delay: '0.8s' },
    { top: '68%', left: '10%', size: 4.5, delay: '1.8s' },
    { top: '80%', left: '88%', size: 3.5, delay: '2.5s' },
    { top: '88%', left: '48%', size: 5, delay: '1.5s' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Warm sunlit radial atmosphere washes */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[950px] h-[540px] bg-gradient-to-b from-amber-200/45 via-rose-200/35 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[550px] h-[550px] bg-pink-200/35 rounded-full blur-3xl pointer-events-none" />

      {/* Floating balloons */}
      {balloons.map((b, i) => (
        <div
          key={`${baseId}-balloon-${i}`}
          className="absolute -bottom-24"
          style={{
            left: b.left,
            animation: `floatUp ${b.duration} ease-in-out infinite`,
            animationDelay: b.delay,
          }}
        >
          {/* Balloon Oval */}
          <div
            className={`rounded-full bg-gradient-to-br ${b.color} shadow-md shadow-rose-300/40 relative`}
            style={{
              width: `${b.size}px`,
              height: `${b.size * 1.25}px`,
            }}
          >
            {/* Gloss highlight */}
            <div className="absolute top-2 left-3 w-3 h-5 bg-white/65 rounded-full rotate-[-25deg]" />
            {/* Knot */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2 bg-rose-500/70 rounded-b-sm" />
            {/* String */}
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-[1px] h-12 bg-rose-400/40" />
          </div>
        </div>
      ))}

      {/* Twinkling warm golden sparkles */}
      {stars.map((s, i) => (
        <div
          key={`${baseId}-star-${i}`}
          className="absolute rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.65)] animate-sparkle"
          style={{
            top: s.top,
            left: s.left,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: s.delay,
          }}
        />
      ))}

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-110vh) rotate(8deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
