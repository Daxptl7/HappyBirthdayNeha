import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Disc3, Upload } from 'lucide-react';
import { BirthdaySong } from '../types/birthday';
import { birthdayAudio } from '../utils/audioPlayer';

interface MusicPlayerBarProps {
  song: BirthdaySong;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenSongModal: () => void;
}

export const MusicPlayerBar: React.FC<MusicPlayerBarProps> = ({
  song,
  isPlaying,
  onTogglePlay,
  onOpenSongModal,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleMute = () => {
    const nextMuted = birthdayAudio.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <aside
      aria-label="Birthday Soundtrack Player"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#0b0914]/90 border-t border-white/10 backdrop-blur-md px-6 py-2.5 transition-all"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Vinyl Disc / Music Icon */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-8 h-8 rounded-full bg-black/80 flex items-center justify-center shrink-0 overflow-hidden">
            <Disc3
              className={`w-5 h-5 text-pink-400 ${
                isPlaying ? 'animate-spin-slow' : 'opacity-60'
              }`}
            />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-300" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white truncate block max-w-[160px] sm:max-w-[260px]">
                {song.title || 'Happy Birthday Melodies'}
              </span>
              {isPlaying && (
                <span className="flex items-center gap-0.5 h-2 shrink-0">
                  <span className="w-0.5 h-2 bg-pink-400 animate-pulse" />
                  <span className="w-0.5 h-3 bg-rose-400 animate-bounce" />
                  <span className="w-0.5 h-1.5 bg-amber-300 animate-pulse" />
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 truncate block">
              {song.artist || 'Birthday Soundtrack'}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
            aria-label={isPlaying ? 'Pause song' : 'Play song'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          <button
            onClick={handleToggleMute}
            className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenSongModal}
            className="pb-0.5 border-b border-pink-400/50 hover:border-pink-400 text-pink-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            title="Change or upload her song"
          >
            <Upload className="w-3 h-3 text-pink-400" />
            <span className="hidden sm:inline">Song</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
