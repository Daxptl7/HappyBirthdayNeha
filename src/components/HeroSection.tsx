import React from 'react';
import { Sparkles, Heart, Utensils } from 'lucide-react';
import { BirthdayConfig } from '../types/birthday';
import { calculateBirthdayStats } from '../utils/birthdayLogic';

interface HeroSectionProps {
  config: BirthdayConfig;
  onOpenPersonalize: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  config,
  onOpenPersonalize,
}) => {
  const stats = calculateBirthdayStats(config.birthDate);

  return (
    <section className="relative pt-14 pb-20 md:pt-20 md:pb-28 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
            {/* Editorial kicker */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm tracking-wider uppercase font-semibold text-rose-600 mb-5">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Dedicated to You</span>
              </span>
              <span aria-hidden="true" className="text-rose-900/30 hidden sm:inline">·</span>
              <span className="text-[#634853] capitalize text-xs tracking-normal font-medium">From {config.senderName}</span>
            </div>

            {/* Display headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#2d1822] font-display mb-6 leading-[1.08] text-balance">
              Happy Birthday,{' '}
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                {config.recipientName}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#5c404c] max-w-xl font-normal leading-relaxed mb-10">
              {config.subheadline || 'To the one who brings sunshine to ordinary days and fills hearts with wonder.'}
            </p>

            {/* Clean Editorial Navigation to 3D Cake Cutting & Memories */}
            <div className="flex flex-wrap items-center gap-8 w-full sm:w-auto">
              <a
                href="#cake"
                className="pb-2 border-b-2 border-rose-500 hover:border-amber-500 text-sm md:text-base font-semibold text-[#2d1822] hover:text-rose-600 transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <Utensils className="w-4 h-4 text-rose-500" />
                <span>Cut the 3D Birthday Cake</span>
              </a>

              <a
                href="#memories"
                className="pb-2 border-b border-rose-900/25 hover:border-rose-500 text-sm md:text-base font-medium text-[#5c404c] hover:text-[#2d1822] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Explore Her Memories</span>
              </a>
            </div>
          </div>

          {/* Right Column: Frameless Open Editorial Portrait */}
          <div className="lg:col-span-5 relative flex flex-col items-center lg:items-end">
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-300/35 via-amber-200/35 to-pink-200/30 blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-md group">
              <div className="relative overflow-hidden aspect-[4/5] bg-rose-100/60">
                {config.photos.length > 0 ? (
                  <img
                    src={config.photos[0].url}
                    alt={`Photo of ${config.recipientName}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                    }}
                  />
                ) : null}

                <div className="absolute inset-0 bg-gradient-to-t from-[#2d1822]/75 via-[#2d1822]/15 to-transparent flex flex-col justify-end p-6">
                  <div className="text-xs font-semibold tracking-wider uppercase text-amber-200 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Cherished Moments · Special Day</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white font-display">
                    {config.recipientName}'s Golden Chapter
                  </h3>
                  <p className="text-xs text-rose-100 mt-1 line-clamp-2">
                    {config.photos[0]?.caption || 'Celebrating the most beautiful soul.'}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-rose-900/15 flex items-center justify-between text-xs text-[#7a5c68]">
                <span>Tailored with love</span>
                <button
                  onClick={onOpenPersonalize}
                  className="text-rose-600 hover:text-rose-500 transition-colors font-medium cursor-pointer"
                >
                  Edit Her Pictures & Info →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Unboxed Milestone Editorial Strip separated only by delicate hairlines */}
        <div className="mt-20 pt-10 pb-10 border-y border-rose-900/15 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-[#7a5c68] uppercase tracking-wider">Days of Wonder</span>
            <span className="text-3xl md:text-4xl font-bold text-[#2d1822] font-mono tabular-nums mt-1.5">
              {stats.totalDaysLived.toLocaleString()}
            </span>
            <span className="text-xs text-[#7a5c68] mt-1">Days bringing joy to the world</span>
          </div>

          <div className="flex flex-col md:border-l md:border-rose-900/15 md:pl-8">
            <span className="text-xs font-medium text-[#7a5c68] uppercase tracking-wider">Milestone Year</span>
            <span className="text-3xl md:text-4xl font-bold text-rose-600 font-mono tabular-nums mt-1.5">
              Chapter {stats.age > 0 ? stats.age : 24}
            </span>
            <span className="text-xs text-[#7a5c68] mt-1">Radiating more beauty than ever</span>
          </div>

          <div className="flex flex-col md:border-l md:border-rose-900/15 md:pl-8">
            <span className="text-xs font-medium text-[#7a5c68] uppercase tracking-wider">Celebration Mode</span>
            <span className="text-3xl md:text-4xl font-bold text-amber-600 font-mono tabular-nums mt-1.5">
              100%
            </span>
            <span className="text-xs text-[#7a5c68] mt-1">Love, smiles, and laughter</span>
          </div>

          <div className="flex flex-col md:border-l md:border-rose-900/15 md:pl-8">
            <span className="text-xs font-medium text-[#7a5c68] uppercase tracking-wider">Wishes In Flight</span>
            <span className="text-3xl md:text-4xl font-bold text-pink-600 font-mono tabular-nums mt-1.5">
              Infinity
            </span>
            <span className="text-xs text-[#7a5c68] mt-1">May every single one come true</span>
          </div>
        </div>
      </div>
    </section>
  );
};
