/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, ArrowUp } from 'lucide-react';
import { BirthdayConfig, BirthdayLetter, PhotoMemory } from './types/birthday';
import { DEFAULT_BIRTHDAY_CONFIG } from './data/defaultConfig';
import { decodeBirthdayConfig } from './utils/birthdayLogic';
import { birthdayAudio } from './utils/audioPlayer';
import { triggerCelebrationConfetti } from './utils/confettiUtils';

import { CelebrationHeader } from './components/CelebrationHeader';
import { StarfieldBackground } from './components/StarfieldBackground';
import { MouseFollower } from './components/MouseFollower';
import { FloatingBalloons } from './components/FloatingBalloons';
import { HeroSection } from './components/HeroSection';
import { PhotoGallerySection } from './components/PhotoGallerySection';
import { CakeCandlesSection } from './components/CakeCandlesSection';
import { LoveLetterSection } from './components/LoveLetterSection';
import { ReasonsWhySection } from './components/ReasonsWhySection';
import { GiftBoxSection } from './components/GiftBoxSection';
import { PersonalizeModal } from './components/PersonalizeModal';
import { ShareModal } from './components/ShareModal';
import { RevealOnScroll } from './components/RevealOnScroll';

const STORAGE_KEY = 'birthday_config_vault_v1';

export default function App() {
  const [config, setConfig] = useState<BirthdayConfig>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('tribute=')) {
        const encoded = hash.split('tribute=')[1];
        const decoded = decodeBirthdayConfig(encoded);
        if (decoded) {
          return {
            ...DEFAULT_BIRTHDAY_CONFIG,
            ...decoded,
            letter: decoded.letter || DEFAULT_BIRTHDAY_CONFIG.letter,
          };
        }
      }

      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.warn('Could not read from localStorage', e);
      }
    }
    return DEFAULT_BIRTHDAY_CONFIG;
  });

  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [personalizeTab, setPersonalizeTab] = useState<'details' | 'letter' | 'photos' | 'song'>('details');

  // Sync audio engine with config song
  useEffect(() => {
    birthdayAudio.setSong(config.song.type, config.song.customUrl, config.song.audioData);
  }, [config.song]);

  // Persist config to localStorage
  const handleSaveConfig = (updated: BirthdayConfig) => {
    setConfig(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_BIRTHDAY_CONFIG);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    birthdayAudio.setSong(
      DEFAULT_BIRTHDAY_CONFIG.song.type,
      DEFAULT_BIRTHDAY_CONFIG.song.customUrl,
      DEFAULT_BIRTHDAY_CONFIG.song.audioData
    );
  };

  const handleAddPhoto = (newPhoto: PhotoMemory) => {
    const updated = {
      ...config,
      photos: [newPhoto, ...config.photos],
    };
    handleSaveConfig(updated);
  };

  const handleDeletePhoto = (id: string) => {
    const updated = {
      ...config,
      photos: config.photos.filter((p) => p.id !== id),
    };
    handleSaveConfig(updated);
  };

  const handleUpdateLetter = (letter: BirthdayLetter) => {
    const updated = {
      ...config,
      letter,
    };
    handleSaveConfig(updated);
  };

  const handleUpdateReasons = (reasons: string[]) => {
    const updated = {
      ...config,
      reasons,
    };
    handleSaveConfig(updated);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffaf5] via-[#fff5ee] to-[#fef2f4] text-[#2d1822] relative selection:bg-rose-400 selection:text-white">
      {/* Subtle Animated Parallax Starfield Canvas Layer */}
      <StarfieldBackground />

      {/* Gentle Multi-Colored Circular Light Effect Around User's Cursor */}
      <MouseFollower />

      {/* Background Floating Balloons & Warm Sunlit Glow */}
      <FloatingBalloons />

      {/* Top Bar Contract Navigation */}
      <CelebrationHeader
        recipientName={config.recipientName}
        onOpenPersonalize={() => {
          setPersonalizeTab('details');
          setIsPersonalizeOpen(true);
        }}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="relative z-10 pb-20">
        {/* 1. Hero Section */}
        <RevealOnScroll sectionId="hero" threshold={0.05}>
          <HeroSection
            config={config}
            onOpenPersonalize={() => {
              setPersonalizeTab('details');
              setIsPersonalizeOpen(true);
            }}
          />
        </RevealOnScroll>

        {/* 2. Interactive Three.js 3D Cake Cutting & 3D Gift Stage */}
        <RevealOnScroll sectionId="cake" delayMs={60}>
          <CakeCandlesSection recipientName={config.recipientName} />
        </RevealOnScroll>

        {/* 3. Photo Gallery / Moments with her */}
        <RevealOnScroll sectionId="memories" delayMs={60}>
          <PhotoGallerySection
            photos={config.photos}
            recipientName={config.recipientName}
            onAddPhoto={handleAddPhoto}
            onDeletePhoto={handleDeletePhoto}
          />
        </RevealOnScroll>

        {/* 4. Personalized Love Letter with Wax Seal opening */}
        <RevealOnScroll sectionId="letter" delayMs={60}>
          <LoveLetterSection
            letter={config.letter}
            recipientName={config.recipientName}
            senderName={config.senderName}
            onUpdateLetter={handleUpdateLetter}
            onOpenPersonalize={() => {
              setPersonalizeTab('letter');
              setIsPersonalizeOpen(true);
            }}
          />
        </RevealOnScroll>

        {/* 5. Reasons Why You're Celebrated */}
        <RevealOnScroll sectionId="reasons" delayMs={60}>
          <ReasonsWhySection
            reasons={config.reasons}
            recipientName={config.recipientName}
            onUpdateReasons={handleUpdateReasons}
          />
        </RevealOnScroll>

        {/* 6. Gift Box with Unwrapping Animation and Love Tickets */}
        <RevealOnScroll sectionId="gift" delayMs={60}>
          <GiftBoxSection
            giftNote={config.giftNote}
            tickets={config.giftTickets}
            recipientName={config.recipientName}
          />
        </RevealOnScroll>

        {/* Unboxed Closing Celebration Tribute */}
        <RevealOnScroll sectionId="closing" delayMs={60}>
          <section className="py-24 px-6 text-center max-w-4xl mx-auto border-t border-rose-900/10">
            <div className="relative z-10">
              <div className="mx-auto flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2d1822] font-display mb-4">
                Happy Birthday, {config.recipientName}!
              </h2>
              <p className="text-[#634853] max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-8">
                May your upcoming year be overflowing with quiet wonder, fierce joy, and endless dreams fulfilled.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8">
                <button
                  onClick={() => triggerCelebrationConfetti()}
                  className="pb-2 border-b-2 border-rose-500 hover:border-amber-500 text-xs sm:text-sm font-semibold text-[#2d1822] hover:text-rose-600 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <span>Shower Birthday Confetti</span>
                </button>

                <button
                  onClick={scrollToTop}
                  className="pb-2 border-b border-rose-900/25 hover:border-rose-500 text-xs sm:text-sm font-medium text-[#634853] hover:text-[#2d1822] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span>Back to Top</span>
                </button>
              </div>
            </div>
          </section>
        </RevealOnScroll>
      </main>

      {/* Personalize Modal (Names, Letter, Photos, Song) */}
      <PersonalizeModal
        config={config}
        isOpen={isPersonalizeOpen}
        initialTab={personalizeTab}
        onClose={() => setIsPersonalizeOpen(false)}
        onSave={handleSaveConfig}
        onReset={handleResetConfig}
      />

      {/* Share Tribute Modal */}
      <ShareModal
        config={config}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Quiet Warm Footer */}
      <footer className="border-t border-rose-900/10 py-8 px-6 text-center text-xs text-[#7a5c68] relative z-10 bg-[#fdf3eb]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            Dedicated with endless affection to {config.recipientName} · {config.senderName}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setPersonalizeTab('details');
                setIsPersonalizeOpen(true);
              }}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              Customize Tribute
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsShareOpen(true)}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              Share Link
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
