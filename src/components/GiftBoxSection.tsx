import React, { useState } from 'react';
import { Gift, Sparkles, Check, Heart, Compass, UtensilsCrossed } from 'lucide-react';
import { triggerCelebrationConfetti } from '../utils/confettiUtils';

interface GiftTicket {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

interface GiftBoxSectionProps {
  giftNote: string;
  tickets: GiftTicket[];
  recipientName: string;
}

export const GiftBoxSection: React.FC<GiftBoxSectionProps> = ({
  giftNote,
  tickets,
  recipientName,
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [redeemedTickets, setRedeemedTickets] = useState<Set<string>>(new Set());

  const handleOpenGift = () => {
    if (!isOpened) {
      setIsOpened(true);
      triggerCelebrationConfetti();
    }
  };

  const handleToggleRedeem = (id: string) => {
    setRedeemedTickets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        triggerCelebrationConfetti();
      }
      return next;
    });
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-5 h-5 text-rose-500" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-amber-500" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <section id="gift" className="py-24 px-6 relative">
      <div className="max-w-4xl mx-auto text-center">
        {/* Section kicker */}
        <div className="flex items-center justify-center gap-2 text-xs md:text-sm tracking-widest uppercase font-semibold text-rose-600 mb-3">
          <Gift className="w-4 h-4 text-rose-500" />
          <span>Birthday Surprise</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2d1822] font-display mb-4">
          Unwrap Your Birthday Gift
        </h2>
        <p className="text-[#5c404c] max-w-lg mx-auto text-sm sm:text-base mb-12 leading-relaxed">
          A physical gift may come in a box, but the best moments are memories we make together.
        </p>

        {/* Unboxed Gift Ribbon & Passports Experience */}
        <div className="max-w-2xl mx-auto">
          {!isOpened ? (
            /* Open Satin Ribbon Cross & Glowing Bow Centerpiece */
            <div
              onClick={handleOpenGift}
              className="group cursor-pointer relative py-16 border-y border-rose-300 transition-all duration-300 hover:border-rose-500 flex flex-col items-center justify-center"
            >
              {/* Satin Horizontal Ribbon Line */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-transparent via-rose-400 to-transparent opacity-80" />

              {/* Bow at center */}
              <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-rose-400 to-pink-500 shadow-[0_10px_28px_rgba(244,63,94,0.35)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="w-10 h-10 text-white" />
              </div>

              <div className="relative z-10 mt-8 text-center">
                <span className="text-xs font-semibold uppercase tracking-widest text-rose-600 border-b border-rose-400 pb-1">
                  Click to Untie Ribbon & Open
                </span>
              </div>
            </div>
          ) : (
            /* Unboxed Editorial Love Passports List separated by hairlines */
            <div className="border-y border-rose-900/15 py-10 text-left animate-fade-in">
              <div className="flex items-center justify-between pb-6 border-b border-rose-900/10 mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#2d1822] font-display flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>Birthday Love Passports</span>
                  </h3>
                  <p className="text-xs text-[#7a5c68] mt-1">
                    For {recipientName} · No expiration dates · Redeem anytime
                  </p>
                </div>

                <button
                  onClick={() => setIsOpened(false)}
                  className="text-xs text-[#7a5c68] hover:text-[#2d1822] cursor-pointer"
                >
                  Tie Back
                </button>
              </div>

              {giftNote && (
                <p className="mb-8 text-sm sm:text-base text-rose-700 italic font-display leading-relaxed">
                  "{giftNote}"
                </p>
              )}

              {/* Open Hairline-Divided Rows (No Card Boxes) */}
              <div className="divide-y divide-rose-900/10">
                {tickets.map((ticket) => {
                  const isRedeemed = redeemedTickets.has(ticket.id);

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => handleToggleRedeem(ticket.id)}
                      className={`cursor-pointer py-5 transition-colors flex items-start justify-between gap-4 ${
                        isRedeemed ? 'opacity-60' : 'hover:text-rose-700'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="pt-0.5 shrink-0">
                          {renderIcon(ticket.icon)}
                        </div>
                        <div>
                          <h4 className={`text-base font-semibold text-[#2d1822] font-display ${isRedeemed ? 'line-through text-[#8c6d79]' : ''}`}>
                            {ticket.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-[#5c404c] mt-1 leading-relaxed">
                            {ticket.desc}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        <span
                          className={`text-xs font-semibold pb-0.5 border-b flex items-center gap-1 ${
                            isRedeemed
                              ? 'border-rose-400 text-rose-600'
                              : 'border-rose-500 text-rose-600'
                          }`}
                        >
                          {isRedeemed ? (
                            <>
                              <Check className="w-3 h-3 text-rose-500" />
                              <span>Redeemed</span>
                            </>
                          ) : (
                            <span>Claim</span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
