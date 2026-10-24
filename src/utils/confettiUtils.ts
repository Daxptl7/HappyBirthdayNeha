import confetti from 'canvas-confetti';

/**
 * Spectacular double-cannon celebration confetti
 */
export function triggerCelebrationConfetti() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const colors = ['#f472b6', '#ec4899', '#fb7185', '#fbbf24', '#f59e0b', '#c084fc', '#ffffff'];

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      shapes: ['circle', 'square'],
      zIndex: 9999,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      shapes: ['circle', 'square'],
      zIndex: 9999,
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}

/**
 * Starry wish burst when candles are blown
 */
export function triggerCandleWishConfetti() {
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#fde047', '#f472b6', '#ffffff', '#e879f9'],
    shapes: ['star', 'circle'],
    ticks: 200,
    gravity: 0.8,
    scalar: 1.2,
    zIndex: 9999,
  });
}

/**
 * Gentle shower of love hearts and sparkles
 */
export function triggerHeartShower() {
  confetti({
    particleCount: 40,
    angle: 90,
    spread: 80,
    origin: { y: 0.8 },
    colors: ['#fda4af', '#f43f5e', '#ec4899', '#fbcfe8'],
    scalar: 1.3,
    ticks: 180,
    zIndex: 9999,
  });
}
