import React, { useState, useRef } from 'react';
import { X, Sparkles, User, Heart, Camera, Music, Upload, Check, RotateCcw, Trash2 } from 'lucide-react';
import { BirthdayConfig, BirthdaySong, PhotoMemory } from '../types/birthday';
import { birthdayAudio } from '../utils/audioPlayer';
import { triggerCelebrationConfetti } from '../utils/confettiUtils';

interface PersonalizeModalProps {
  config: BirthdayConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: BirthdayConfig) => void;
  onReset: () => void;
  initialTab?: 'details' | 'letter' | 'photos' | 'song';
}

export const PersonalizeModal: React.FC<PersonalizeModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
  onReset,
  initialTab = 'details',
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'letter' | 'photos' | 'song'>(initialTab);

  // Form State
  const [recipientName, setRecipientName] = useState(config.recipientName);
  const [senderName, setSenderName] = useState(config.senderName);
  const [birthDate, setBirthDate] = useState(config.birthDate);
  const [headline, setHeadline] = useState(config.headline);
  const [subheadline, setSubheadline] = useState(config.subheadline);

  // Letter State
  const [letterSalutation, setLetterSalutation] = useState(config.letter.salutation);
  const [letterParagraphs, setLetterParagraphs] = useState(config.letter.paragraphs.join('\n\n'));
  const [letterClosing, setLetterClosing] = useState(config.letter.closing);
  const [letterSignoff, setLetterSignoff] = useState(config.letter.signoff);

  // Song State
  const [songType, setSongType] = useState<BirthdaySong['type']>(config.song.type);
  const [songTitle, setSongTitle] = useState(config.song.title);
  const [songArtist, setSongArtist] = useState(config.song.artist);
  const [customAudioUrl, setCustomAudioUrl] = useState(config.song.customUrl || '');
  const [uploadedAudioData, setUploadedAudioData] = useState(config.song.audioData || '');

  // Photos State
  const [photos, setPhotos] = useState<PhotoMemory[]>(config.photos);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const data = loadEvt.target?.result as string;
        if (data) {
          setUploadedAudioData(data);
          setSongType('custom-file');
          setSongTitle(file.name.replace(/\.[^/.]+$/, ''));
          setSongArtist('Uploaded Custom Song');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const data = loadEvt.target?.result as string;
        if (data) {
          setNewPhotoUrl(data);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhotoToList = () => {
    if (!newPhotoUrl.trim()) return;
    const newEntry: PhotoMemory = {
      id: `photo-${Date.now()}`,
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || `Cherished moment with ${recipientName}`,
      date: 'Special Memory',
      tag: 'Love',
    };
    setPhotos([newEntry, ...photos]);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const handleSaveAll = () => {
    const splitParas = letterParagraphs
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const updatedConfig: BirthdayConfig = {
      ...config,
      recipientName: recipientName.trim() || 'Beautiful Soul',
      senderName: senderName.trim() || 'Yours Forever',
      birthDate,
      headline: headline.trim() || `Happy Birthday, ${recipientName}`,
      subheadline: subheadline.trim() || 'A tribute of endless love and joy.',
      letter: {
        salutation: letterSalutation.trim() || `Dearest ${recipientName},`,
        paragraphs: splitParas.length > 0 ? splitParas : config.letter.paragraphs,
        closing: letterClosing.trim() || 'With all my heart,',
        signoff: letterSignoff.trim() || senderName,
      },
      photos,
      song: {
        type: songType,
        title: songTitle.trim() || 'Birthday Soundtrack',
        artist: songArtist.trim() || 'Celebration',
        customUrl: customAudioUrl.trim(),
        audioData: uploadedAudioData,
      },
    };

    birthdayAudio.setSong(songType, customAudioUrl.trim(), uploadedAudioData);

    onSave(updatedConfig);
    onClose();
    triggerCelebrationConfetti();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1822]/45 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fffaf5] border-y border-rose-900/20 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-6 border-b border-rose-900/10 flex items-center justify-between bg-[#fdf3eb]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold text-[#2d1822] font-display">Personalize Her Celebration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#7a5c68] hover:text-[#2d1822] p-1 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-rose-900/10 gap-2 overflow-x-auto bg-[#fef7f1]">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-[#7a5c68] hover:text-[#2d1822]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Names & Milestone</span>
          </button>

          <button
            onClick={() => setActiveTab('letter')}
            className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'letter'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-[#7a5c68] hover:text-[#2d1822]'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Personal Message</span>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'photos'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-[#7a5c68] hover:text-[#2d1822]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Her Pictures ({photos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('song')}
            className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'song'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-[#7a5c68] hover:text-[#2d1822]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Birthday Song</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: DETAILS & NAMES */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5c404c] mb-1">
                    Her Name (Recipient)
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Sophia"
                    className="w-full text-xs p-2.5 bg-transparent border-b border-rose-900/25 text-[#2d1822] focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5c404c] mb-1">
                    Your Name or Sign-off
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. With all my love"
                    className="w-full text-xs p-2.5 bg-transparent border-b border-rose-900/25 text-[#2d1822] focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5c404c] mb-1">
                  Her Birth Date (for age and days calculation)
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-transparent border-b border-rose-900/25 text-[#2d1822] focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5c404c] mb-1">
                  Hero Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Happy Birthday, Beautiful Soul"
                  className="w-full text-xs p-2.5 bg-transparent border-b border-rose-900/25 text-[#2d1822] focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5c404c] mb-1">
                  Hero Subtitle
                </label>
                <textarea
                  rows={2}
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  placeholder="To the person who makes the world infinitely brighter just by existing..."
                  className="w-full text-xs p-2.5 bg-transparent border-b border-rose-900/25 text-[#2d1822] focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: LOVE LETTER */}
          {activeTab === 'letter' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5c404c] mb-1">
                  Letter Salutation / Greeting
                </label>
                <input
                  type="text"
                  value={letterSalutation}
                  onChange={(e) => setLetterSalutation(e.target.value)}
                  placeholder={`Dearest ${recipientName},`}
                  className="w-full text-xs p-2.5 bg-transparent border-b border-rose-900/25 text-[#2d1822] focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5c404c] mb-1">
                  Personal Message Body (separate paragraphs with blank line)
                </label>
                <textarea
                  rows={7}
                  value={letterParagraphs}
                  onChange={(e) => setLetterParagraphs(e.target.value)}
                  placeholder="Write your heartfelt message here..."
                  className="w-full text-xs p-3 bg-transparent border-b border-rose-900/25 text-[#2d1822] leading-relaxed focus:outline-none focus:border-rose-500 font-sans-clean"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5c404c] mb-1">
                    Closing Line
                  </label>
                  <input
                    type="text"
                    value={letterClosing}
                    onChange={(e) => setLetterClosing(e.target.value)}
                    placeholder="With all my heart and infinite love,"
                    className="w-full text-xs p-2.5 bg-transparent border-b border-rose-900/25 text-[#2d1822] focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5c404c] mb-1">
                    Signature
                  </label>
                  <input
                    type="text"
                    value={letterSignoff}
                    onChange={(e) => setLetterSignoff(e.target.value)}
                    placeholder="Forever & Always"
                    className="w-full text-xs p-2.5 bg-transparent border-b border-rose-900/25 text-[#2d1822] focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PHOTOS */}
          {activeTab === 'photos' && (
            <div className="space-y-5">
              {/* Quick Add photo section */}
              <div className="py-4 border-y border-rose-900/15 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-600">
                  Upload or Add a New Picture
                </h4>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="file"
                    ref={photoFileInputRef}
                    accept="image/*"
                    onChange={handlePhotoFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoFileInputRef.current?.click()}
                    className="px-4 py-2 text-xs font-medium bg-rose-100 hover:bg-rose-200/80 text-[#2d1822] transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-rose-600" />
                    <span>Choose File from Device</span>
                  </button>

                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Or paste an image URL"
                    className="w-full text-xs p-2.5 bg-transparent border-b border-rose-900/25 text-[#2d1822] focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="Caption for this photo"
                    className="w-full text-xs p-2.5 bg-transparent border-b border-rose-900/25 text-[#2d1822] focus:outline-none focus:border-rose-500"
                  />

                  <button
                    type="button"
                    onClick={handleAddPhotoToList}
                    disabled={!newPhotoUrl.trim()}
                    className="px-4 py-2 text-xs font-semibold bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white transition-colors shrink-0 cursor-pointer"
                  >
                    Add Photo
                  </button>
                </div>
              </div>

              {/* Photo list */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto divide-y divide-rose-900/10">
                <span className="text-xs text-[#7a5c68] block pb-1">Current Photo Gallery:</span>
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.url}
                        alt="Thumbnail"
                        className="w-10 h-10 object-cover bg-rose-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#2d1822] truncate">{p.caption}</p>
                        <span className="text-[10px] text-[#7a5c68]">{p.date || 'Memory'}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(p.id)}
                      className="text-[#8c6d79] hover:text-rose-600 p-1.5 cursor-pointer transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BIRTHDAY SONG */}
          {activeTab === 'song' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-[#5c404c]">
                Choose Birthday Soundtrack Mode:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => {
                    setSongType('celestial-music-box');
                    setSongTitle('Happy Birthday (Celestial Chimes)');
                    setSongArtist('Music Box Symphony');
                  }}
                  className={`p-3.5 border-t cursor-pointer transition-all ${
                    songType === 'celestial-music-box'
                      ? 'bg-rose-50 border-rose-500 text-[#2d1822]'
                      : 'bg-transparent border-rose-900/15 text-[#5c404c] hover:border-rose-300'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>Celestial Music Box</span>
                    {songType === 'celestial-music-box' && <Check className="w-3.5 h-3.5 text-rose-500" />}
                  </div>
                  <p className="text-[11px] text-[#7a5c68] mt-1 leading-snug">
                    Crystal chimes playing the authentic "Happy Birthday" melody.
                  </p>
                </div>

                <div
                  onClick={() => {
                    setSongType('acoustic-chime');
                    setSongTitle('Acoustic Birthday Lullaby');
                    setSongArtist('Starlight Ensemble');
                  }}
                  className={`p-3.5 border-t cursor-pointer transition-all ${
                    songType === 'acoustic-chime'
                      ? 'bg-rose-50 border-rose-500 text-[#2d1822]'
                      : 'bg-transparent border-rose-900/15 text-[#5c404c] hover:border-rose-300'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>Acoustic Chime Lullaby</span>
                    {songType === 'acoustic-chime' && <Check className="w-3.5 h-3.5 text-rose-500" />}
                  </div>
                  <p className="text-[11px] text-[#7a5c68] mt-1 leading-snug">
                    Gentle, warm, and romantic ambient chimes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 px-6 border-t border-rose-900/10 flex items-center justify-between bg-[#fdf3eb]">
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset celebration to sample defaults?')) {
                onReset();
                onClose();
              }
            }}
            className="text-xs text-[#7a5c68] hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#634853] hover:text-[#2d1822] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="pb-1.5 border-b-2 border-rose-500 text-xs font-semibold text-[#2d1822] hover:text-rose-600 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-rose-500" />
              <span>Apply & Celebrate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
