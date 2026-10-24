import React, { useState } from 'react';
import { Heart, Plus, Trash2 } from 'lucide-react';
import { triggerHeartShower } from '../utils/confettiUtils';

interface ReasonsWhySectionProps {
  reasons: string[];
  recipientName: string;
  onUpdateReasons: (reasons: string[]) => void;
}

export const ReasonsWhySection: React.FC<ReasonsWhySectionProps> = ({
  reasons,
  recipientName,
  onUpdateReasons,
}) => {
  const [newReason, setNewReason] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReason.trim()) return;
    onUpdateReasons([...reasons, newReason.trim()]);
    setNewReason('');
    setIsAdding(false);
    triggerHeartShower();
  };

  const handleDeleteReason = (index: number) => {
    onUpdateReasons(reasons.filter((_, i) => i !== index));
  };

  return (
    <section id="reasons" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 text-xs md:text-sm tracking-widest uppercase font-semibold text-rose-600 mb-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Treasured Qualities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2d1822] font-display">
            Reasons You're So Adored
          </h2>
          <p className="text-[#5c404c] text-sm sm:text-base mt-2 leading-relaxed">
            A small handful of the countless reasons why having {recipientName} in the world makes everything brighter.
          </p>
        </div>

        {/* Unboxed Editorial Grid separated only by top hairlines */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
          {reasons.map((reason, index) => {
            const formattedIndex = (index + 1).toString().padStart(2, '0');

            return (
              <div
                key={`reason-${index}`}
                className="group relative border-t border-rose-900/15 pt-6 transition-colors duration-300 hover:border-rose-400 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-rose-500 font-mono tracking-wider">
                      {formattedIndex}.
                    </span>
                    <button
                      onClick={() => handleDeleteReason(index)}
                      title="Remove reason"
                      className="opacity-0 group-hover:opacity-100 text-[#8c6d79] hover:text-rose-600 transition-opacity p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-base sm:text-lg font-normal text-[#2d1822] leading-relaxed font-display">
                    {reason}
                  </p>
                </div>

                <div className="mt-4 text-xs text-[#7a5c68]">
                  <span>Loved unconditionally</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Unboxed Add Another Reason Action */}
        <div className="mt-14 flex justify-center">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="pb-1.5 border-b border-rose-900/30 hover:border-rose-500 text-xs sm:text-sm font-semibold text-[#3b222e] hover:text-rose-600 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-rose-500" />
              <span>Add Another Reason</span>
            </button>
          ) : (
            <form
              onSubmit={handleAddReason}
              className="w-full max-w-md border-y border-rose-300 py-5 flex flex-col gap-3"
            >
              <label htmlFor="new-reason-input" className="text-xs font-semibold text-rose-600">
                What else do you adore about {recipientName}?
              </label>
              <input
                id="new-reason-input"
                type="text"
                required
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="e.g. How patient and understanding she always is..."
                className="w-full text-xs p-2.5 bg-transparent border-b border-rose-900/25 text-[#2d1822] placeholder-[#9b7e89] focus:outline-none focus:border-rose-500"
              />
              <div className="flex justify-end gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1 text-xs text-[#7a5c68] hover:text-[#2d1822] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pb-1 border-b border-rose-500 text-xs font-semibold text-rose-600 hover:text-[#2d1822] cursor-pointer"
                >
                  Save Reason
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
