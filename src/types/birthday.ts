export interface PhotoMemory {
  id: string;
  url: string;
  caption: string;
  date?: string;
  tag?: string;
}

export interface BirthdaySong {
  type: 'celestial-music-box' | 'acoustic-chime' | 'custom-url' | 'custom-file';
  title: string;
  artist: string;
  customUrl?: string;
  audioData?: string; // base64 or blob URL if uploaded
}

export interface BirthdayLetter {
  salutation: string;
  paragraphs: string[];
  closing: string;
  signoff: string;
}

export interface BirthdayConfig {
  recipientName: string;
  senderName: string;
  birthDate: string; // YYYY-MM-DD
  headline: string;
  subheadline: string;
  letter: BirthdayLetter;
  reasons: string[];
  song: BirthdaySong;
  photos: PhotoMemory[];
  giftNote: string;
  giftTickets: Array<{ id: string; title: string; desc: string; icon: string }>;
}
