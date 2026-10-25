import { DEFAULT_BIRTHDAY_CONFIG } from './defaultConfig';
import type { BirthdaySong } from '../types/birthday';
import { BIRTHDAY_WISHES } from './birthdayWishes';

const birthdaySong: BirthdaySong = {
  type: 'custom-url',
  title: 'Baar Baar Din Yeh Aaye',
  artist: 'Birthday soundtrack',
  customUrl: `${import.meta.env.BASE_URL}audio/baar-baar-din-yeh-aaye.wav`,
};

// All birthday content is managed here. No visitor edits or saved overrides.
export const EXPERIENCE_CONFIG = {
  ...DEFAULT_BIRTHDAY_CONFIG,
  // A fixed instant: 12 AM on October 26 in India, regardless of her timezone.
  // Change this timestamp to set the real release time in any build.
  celebrationAt: '2026-10-26T00:00:00+05:30',
  timeZone: 'Asia/Kolkata',
  // The supplied recording is served locally and starts at the countdown deadline.
  // Replace the file or update birthdaySong above to change the soundtrack.
  song: birthdaySong,
  // Use the four supplied collages directly from public/, including the PNG's space.
  photos: DEFAULT_BIRTHDAY_CONFIG.photos.map(photo => ({
    ...photo,
    url: /^(https?:|data:|blob:)/i.test(photo.url) ? photo.url : `${import.meta.env.BASE_URL}${photo.url.replace(/^\//, '')}`,
  })),
  wishes: BIRTHDAY_WISHES,
  milestoneAge: 20,
  secret: {
    title: 'Caught you being curious.',
    message: 'Yes, I hid an entire extra birthday wish just to make you smile. If you found this, you’ve officially earned the title of Birthday VIP.',
    closing: 'Your only job today: be happy. No arguments accepted. ♥',
    photoUrl: `${import.meta.env.BASE_URL}IMG_4037.jpg`,
  },
  finale: {
    favoritePhotoId: 'photo-1',
    message: 'The website ends here. The memories don’t.',
    signature: 'Today, tomorrow, and all the days after.',
  },
  surprise: {
    // A message or an https:// link. Generated locally; no QR service needed.
    qrValue: 'Just kidding, Neha! No more tasks. Happy birthday to you! You deserve all the happiness in the world. ♥',
    title: 'Your birthday gift',
    titleEmphasis: 'is hiding here.',
    description: 'One tiny square. One suspiciously mysterious birthday gift. Curious yet?',
  },
};
