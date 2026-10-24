import React, { useState } from 'react';
import { Mail, Heart, Sparkles, Edit3, Check } from 'lucide-react';
import { BirthdayLetter } from '../types/birthday';
import { triggerHeartShower } from '../utils/confettiUtils';

interface LoveLetterSectionProps {
  letter: BirthdayLetter;
  recipientName: string;
  senderName: string;
  onUpdateLetter: (updated: BirthdayLetter) => void;
  onOpenPersonalize: () => void;
}

export const LoveLetterSection: React.FC<LoveLetterSectionProps> = ({
  letter,
  recipientName,
  senderName,
  onUpdateLetter,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isQuickEditing, setIsQuickEditing] = useState(false);
  const [editedSalutation, setEditedSalutation] = useState(letter.salutation);
  const [editedParagraphs, setEditedParagraphs] = useState(letter.paragraphs.join('\n\n'));
  const [editedSignoff, setEditedSignoff] = useState(letter.signoff);

  const handleToggleOpen = () => {
    if (!isOpen) {
      triggerHeartShower();
    }
    setIsOpen(!isOpen);
  };

  const handleSaveQuickEdit = () => {
    const splitParagraphs = editedParagraphs
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    onUpdateLetter({
      salutation: editedSalutation.trim() || `Dearest ${recipientName},`,
      paragraphs: splitParagraphs.length > 0 ? splitParagraphs : letter.paragraphs,
      closing: letter.closing,
      signoff: editedSignoff.trim() || senderName,
    });
    setIsQuickEditing(false);
    triggerHeartShower();
  };

  return (
    <section id="letter" className="py-24 px-6 relative overflow-hidden">
      {/* Warm romantic sunlit spot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-rose-300/25 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* Section kicker */}
        <div className="flex items-center justify-center gap-2 text-xs md:text-sm tracking-widest uppercase font-semibold text-rose-600 mb-3">
          <Mail className="w-4 h-4 text-rose-500" />
          <span>A Letter From The Heart</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2d1822] font-display mb-4">
          Words Meant Only for You
        </h2>
        <p className="text-[#5c404c] max-w-lg mx-auto text-sm sm:text-base mb-12 leading-relaxed">
          Some feelings are too precious to leave unsaid. Break the seal below to open your personalized birthday message.
        </p>

        {/* Unboxed Wax Seal & Editorial Letter Experience */}
        <div className="max-w-2xl mx-auto">
          {!isOpen ? (
            /* Open Floating Wax Seal Centerpiece with Warm Hairlines */
            <div
              onClick={handleToggleOpen}
              className="group relative cursor-pointer border-y border-rose-900/15 py-14 transition-all duration-300 hover:border-rose-400 flex flex-col items-center justify-center"
            >
              {/* The Wax Seal Button */}
              <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 via-rose-600 to-pink-700 border-2 border-rose-300 shadow-[0_10px_25px_rgba(225,29,72,0.35)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-9 h-9 text-rose-50 fill-rose-50" />
                <div className="absolute -inset-1 rounded-full border border-rose-400/50 animate-ping opacity-30" />
              </div>

              <div className="mt-6 text-center">
                <span className="text-xs uppercase tracking-widest font-semibold text-rose-600">
                  Click Wax Seal to Open
                </span>
                <p className="text-sm font-display text-[#3b222e] mt-1">
                  Private & Confidential · To {recipientName}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-xs text-[#7a5c68]">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Written with infinite devotion</span>
              </div>
            </div>
          ) : (
            /* Unboxed Editorial Letter Manuscript framed only by top/bottom hairlines */
            <div className="relative border-y border-rose-300 py-10 sm:py-14 text-left transition-all duration-500 animate-fade-in">
              <div className="flex items-center justify-between pb-6 mb-8 border-b border-rose-900/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-rose-600">
                    Handwritten Birthday Note
                  </span>
                </div>

                <div className="flex items-center gap-5">
                  {!isQuickEditing ? (
                    <button
                      onClick={() => setIsQuickEditing(true)}
                      className="text-xs font-medium text-[#5c404c] hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Edit Message</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveQuickEdit}
                      className="pb-1 border-b border-rose-500 text-xs font-semibold text-rose-600 hover:text-[#2d1822] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  )}

                  <button
                    onClick={handleToggleOpen}
                    className="text-[#7a5c68] hover:text-[#2d1822] text-xs cursor-pointer"
                  >
                    Fold Back
                  </button>
                </div>
              </div>

              {!isQuickEditing ? (
                <div className="space-y-6">
                  <div className="text-2xl sm:text-3xl font-bold font-display text-rose-700">
                    {letter.salutation || `Dearest ${recipientName},`}
                  </div>

                  <div className="space-y-5 text-[#3b222e] text-base sm:text-lg leading-relaxed font-sans-clean">
                    {letter.paragraphs.map((para, i) => (
                      <p key={`p-${i}`}>{para}</p>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-rose-900/10 flex flex-col items-start">
                    <span className="text-xs font-medium text-[#7a5c68] italic">
                      {letter.closing || 'With all my love and devotion,'}
                    </span>
                    <span className="text-xl font-bold font-display text-[#2d1822] mt-1">
                      {letter.signoff || senderName}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-rose-600 mb-1">
                      Greeting / Salutation
                    </label>
                    <input
                      type="text"
                      value={editedSalutation}
                      onChange={(e) => setEditedSalutation(e.target.value)}
                      className="w-full text-sm p-2 bg-transparent border-b border-rose-900/25 text-[#2d1822] focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-rose-600 mb-1">
                      Letter Message (separate paragraphs with double enter)
                    </label>
                    <textarea
                      rows={6}
                      value={editedParagraphs}
                      onChange={(e) => setEditedParagraphs(e.target.value)}
                      className="w-full text-sm p-3 bg-transparent border-b border-rose-900/25 text-[#2d1822] focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-rose-600 mb-1">
                      Sign-off / Your Name
                    </label>
                    <input
                      type="text"
                      value={editedSignoff}
                      onChange={(e) => setEditedSignoff(e.target.value)}
                      className="w-full text-sm p-2 bg-transparent border-b border-rose-900/25 text-[#2d1822] focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
