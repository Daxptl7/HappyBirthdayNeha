import React, { useState } from 'react';
import { X, Share2, Copy, Check, Send, Sparkles } from 'lucide-react';
import { BirthdayConfig } from '../types/birthday';
import { encodeBirthdayConfig } from '../utils/birthdayLogic';
import { triggerCelebrationConfetti } from '../utils/confettiUtils';

interface ShareModalProps {
  config: BirthdayConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ config, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const encodedState = encodeBirthdayConfig(config);
  const currentBaseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const shareableUrl = `${currentBaseUrl}#tribute=${encodedState}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      triggerCelebrationConfetti();
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Happy Birthday, ${config.recipientName}! 🎂✨ Here is a personalized birthday surprise made with all my love just for you: ${shareableUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1822]/45 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fffaf5] border-y border-rose-900/20 w-full max-w-md p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#7a5c68] hover:text-[#2d1822] p-1 cursor-pointer"
          aria-label="Close share dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Share2 className="w-5 h-5 text-rose-500" />
          <h3 className="text-lg font-bold text-[#2d1822] font-display">Share Her Tribute</h3>
        </div>

        <p className="text-xs text-[#5c404c] mb-5 leading-relaxed">
          Send this surprise link directly to {config.recipientName} on WhatsApp, iMessage, or email so she can experience the 3D cake cutting, photos, and your love letter!
        </p>

        {/* Shareable Link Box */}
        <div className="space-y-3">
          <div className="p-3 bg-rose-50/80 border-b border-rose-900/20 flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-rose-700 truncate select-all">
              {shareableUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Social / WhatsApp Share Action */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Send to {config.recipientName} on WhatsApp</span>
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-rose-900/10 flex items-center gap-2 text-[11px] text-[#7a5c68]">
          <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>Her customized messages and photos are saved in the link and on your device.</span>
        </div>
      </div>
    </div>
  );
};
