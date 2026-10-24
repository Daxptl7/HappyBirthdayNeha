import React from 'react';
import { Sparkles, Sliders, Share2 } from 'lucide-react';

interface CelebrationHeaderProps {
  onOpenPersonalize: () => void;
  onOpenShare: () => void;
  recipientName: string;
}

export const CelebrationHeader: React.FC<CelebrationHeaderProps> = ({
  onOpenPersonalize,
  onOpenShare,
  recipientName,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#fffaf5]/95 border-b border-rose-900/10 px-6 py-4 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          className="text-lg md:text-xl font-bold tracking-tight text-[#2d1822] font-display hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-rose-500" />
          <span>Celebration of You</span>
        </a>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5c404c]">
          <a
            href="#memories"
            className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
          >
            Memories
          </a>
          <a
            href="#cake"
            className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
          >
            3D Cake Cutting
          </a>
          <a
            href="#letter"
            className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
          >
            Birthday Letter
          </a>
          <a
            href="#reasons"
            className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
          >
            Why You're Adored
          </a>
          <a
            href="#gift"
            className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
          >
            Birthday Gift
          </a>
        </nav>

        {/* Zone 3: Unboxed typographic actions */}
        <div className="flex items-center gap-5 shrink-0">
          <button
            onClick={onOpenShare}
            aria-label="Share Tribute Link"
            className="pb-1 border-b border-transparent hover:border-rose-500 text-xs font-medium text-[#5c404c] hover:text-[#2d1822] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={onOpenPersonalize}
            aria-label={`Personalize Page for ${recipientName}`}
            className="pb-1 border-b-2 border-rose-500 hover:border-amber-500 text-xs font-semibold text-[#2d1822] hover:text-rose-600 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-rose-500" />
            <span>Personalize</span>
          </button>
        </div>
      </div>
    </header>
  );
};
