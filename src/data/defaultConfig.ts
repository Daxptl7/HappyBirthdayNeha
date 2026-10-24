import { BirthdayConfig } from '../types/birthday';

export const DEFAULT_BIRTHDAY_CONFIG: BirthdayConfig = {
  recipientName: 'Neha',
  senderName: 'Yours Forever',
  birthDate: '2006-10-27',
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
      // Public files are served at the site root, without a /public/ prefix.
      url: '/IMG_4028.jpg',
      caption: 'Your smile deserves a whole page.',
      tag: 'A little sunshine',
      alt: 'A collage of Neha in a brown top outdoors, including a close-up of her smile.',
      width: 1168,
      height: 2127,
    },
    {
      id: 'photo-2',
      url: '/IMG_4026%202.PNG',
      caption: 'Just you, being beautifully you.',
      tag: 'A favorite smile',
      alt: 'A collage of Neha in a crochet top and blue jeans, with color portraits over a black-and-white background.',
      width: 1170,
      height: 2532,
    },
    {
      id: 'photo-3',
      url: '/IMG_4036.jpg',
      caption: 'The little moments are the ones worth keeping.',
      tag: 'Everyday magic',
      alt: 'A collage of Neha wearing a black top and cream trousers beside a stone wall and plants.',
      width: 1169,
      height: 2072,
    },
    {
      id: 'photo-4',
      url: '/IMG_4037.jpg',
      caption: 'A little red. A lot of radiance.',
      tag: 'A little more color',
      alt: 'A collage of Neha in a red top and white trousers in a green garden.',
      width: 1170,
      height: 2108,
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
