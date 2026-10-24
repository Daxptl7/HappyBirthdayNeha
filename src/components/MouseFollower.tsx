import React, { useEffect, useRef } from 'react';
import { lerpCursorPosition } from '../utils/birthdayLogic';

export const MouseFollower: React.FC = () => {
  const orbRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb || typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let rafId = 0;
    const target = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 3,
    };
    let current = { ...target };

    const applyPosition = (x: number, y: number) => {
      orb.style.transform = `translate3d(${x - 190}px, ${y - 190}px, 0)`;
      orb.setAttribute('data-x', String(Math.round(x)));
      orb.setAttribute('data-y', String(Math.round(y)));
    };

    applyPosition(current.x, current.y);

    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };

    const tick = () => {
      current = lerpCursorPosition(current, target, 0.16);
      applyPosition(current.x, current.y);
      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', handlePointerMove);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden"
    >
      <div
        ref={orbRef}
        data-testid="mouse-follower"
        data-x="720"
        data-y="300"
        className="w-[380px] h-[380px] rounded-full pointer-events-none will-change-transform transition-opacity duration-300 opacity-90"
        style={{
          background:
            'radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, rgba(251, 113, 133, 0.22) 36%, rgba(244, 114, 182, 0.16) 64%, rgba(253, 186, 116, 0.10) 80%, rgba(255, 250, 245, 0) 100%)',
          filter: 'blur(24px)',
        }}
      />
    </div>
  );
};
