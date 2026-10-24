import React, { useEffect, useRef, useState } from 'react';
import { getScrollRevealState } from '../utils/birthdayLogic';

interface RevealOnScrollProps {
  children: React.ReactNode;
  sectionId?: string;
  delayMs?: number;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  sectionId,
  delayMs = 0,
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setPrefersReducedMotion(true);
      setIsVisible(true);
      return;
    }

    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  const reveal = getScrollRevealState({
    isVisible,
    delayMs,
    prefersReducedMotion,
  });

  return (
    <div
      ref={containerRef}
      data-reveal-section={sectionId}
      data-revealed={reveal.dataRevealed}
      className={`${reveal.className} ${className}`.trim()}
      style={{ transitionDelay: reveal.transitionDelay }}
    >
      {children}
    </div>
  );
};
