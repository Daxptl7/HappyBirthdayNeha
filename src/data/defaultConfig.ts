import { BirthdayConfig } from '../types/birthday';

export const DEFAULT_BIRTHDAY_CONFIG: BirthdayConfig = {
  recipientName: 'Sophia',
  senderName: 'Yours Forever',
  birthDate: '2000-10-24',
  headline: 'Happy Birthday, Beautiful Soul',
  subheadline: 'To the person who makes the world infinitely brighter just by existing in it.',
  letter: {
    salutation: 'Dearest Sophia,',
    paragraphs: [
      'Today is a celebration of the day the universe gave us you. From your gentle laugh that makes any heavy day light, to the quiet wisdom and fierce kindness you carry everywhere you go, you have changed my life in ways words can barely reach.',
      'I hope this year brings you all the quiet peace you deserve, all the breathless adventures you dream about, and all the happiness your big heart gives away so freely to everyone else.',
      'Thank you for being my favorite story, my sanctuary, and my greatest blessing.',
    ],
    closing: 'With all my heart and infinite love,',
    signoff: 'Forever & Always',
  },
  reasons: [
    'The way your eyes crinkle with pure joy when you truly laugh.',
    'How you remember the smallest details about the people you love.',
    'Your courage in chasing your dreams, even on uncertain days.',
    'The warmth of your hand and how safe the world feels with you.',
    'Your unconditional empathy that softens everything around you.',
    'Simply being the brightest, most breathtaking part of my life.',
  ],
  song: {
    type: 'celestial-music-box',
    title: 'Happy Birthday (Celestial Chimes)',
    artist: 'Music Box Symphony',
  },
  photos: [
    {
      id: 'photo-1',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      caption: 'The golden hour glow when your smile stopped time',
      date: 'May 14 · Sunset Hills',
      tag: 'Cherished Moment',
    },
    {
      id: 'photo-2',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      caption: 'Sunday cafe mornings with endless conversations and laughter',
      date: 'July 22 · Little Haven',
      tag: 'Morning Light',
    },
    {
      id: 'photo-3',
      url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      caption: 'Dancing under fairy lights without a single worry in the world',
      date: 'September 08 · Starlit Garden',
      tag: 'Pure Magic',
    },
    {
      id: 'photo-4',
      url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
      caption: 'The quiet beauty in the way you look at the stars',
      date: 'October 12 · Coastal Breeze',
      tag: 'Stargazer',
    },
  ],
  giftNote: 'Every candle on your cake is a wish that already came true the day I met you.',
  giftTickets: [
    {
      id: 'ticket-1',
      title: 'A Dream Starlight Dinner Date',
      desc: 'Valid for your favorite cuisine, candlelight, and dessert on me whenever you wish.',
      icon: 'UtensilsCrossed',
    },
    {
      id: 'ticket-2',
      title: 'All-Day Pampering & Relaxation',
      desc: 'Zero chores, favorite movies, breakfast in bed, and all the cozy blankets.',
      icon: 'Heart',
    },
    {
      id: 'ticket-3',
      title: 'Spontaneous Weekend Getaway',
      desc: 'Pack a small bag, pick a direction, and let us go somewhere peaceful and new.',
      icon: 'Compass',
    },
    {
      id: 'ticket-4',
      title: 'One Wish Card (No Expiration)',
      desc: 'Redeemable anytime for anything your heart desires, no questions asked.',
      icon: 'Sparkles',
    },
  ],
};
