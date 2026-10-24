import React, { useEffect, useRef } from 'react';
import { createStarfieldParticles, stepStarParticle, StarParticle } from '../utils/birthdayLogic';

interface StarfieldBackgroundProps {
  starCount?: number;
}

export const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({ starCount = 95 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === 'undefined') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = window.innerWidth || 1440;
    let height = window.innerHeight || 900;
    let scrollY = window.scrollY || 0;
    let stars: StarParticle[] = [];

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const configureCanvas = () => {
      width = window.innerWidth || 1440;
      height = window.innerHeight || 900;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      stars = createStarfieldParticles(width, height, starCount);
    };

    configureCanvas();

    const handleResize = () => {
      configureCanvas();
      if (prefersReducedMotion) {
        drawFrame(0);
      }
    };

    const handleScroll = () => {
      scrollY = window.scrollY || 0;
      if (prefersReducedMotion) {
        drawFrame(0);
      }
    };

    const startTime = performance.now();

    const drawFrame = (timestamp: number) => {
      const elapsedSec = (timestamp - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const stepped = stepStarParticle(
          star,
          width,
          height,
          scrollY,
          prefersReducedMotion ? 0 : elapsedSec
        );

        if (!prefersReducedMotion) {
          star.x = stepped.nextX;
          star.y = stepped.nextY;
        }

        ctx.save();
        ctx.globalAlpha = stepped.currentAlpha;
        ctx.fillStyle = star.color;

        // Add a soft halo for closer, brighter stars
        if (star.depth > 0.78) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = star.color;
        }

        ctx.beginPath();
        ctx.arc(stepped.renderX, stepped.renderY, star.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (!prefersReducedMotion) {
        animationFrameId = window.requestAnimationFrame(drawFrame);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    if (prefersReducedMotion) {
      drawFrame(startTime);
    } else {
      animationFrameId = window.requestAnimationFrame(drawFrame);
    }

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [starCount]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="starfield-canvas"
      data-star-count={starCount}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
