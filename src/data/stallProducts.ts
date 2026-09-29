import { StallProduct } from '../types';

export const STALL_PRODUCTS: StallProduct[] = [
  {
    id: 'stall-bangles',
    name: 'Artisan Glass & Silk Bangles',
    category: 'Bangles',
    tagline: 'Handcrafted Festive Adornments',
    description: 'Vibrant silk-wrapped and authentic hand-cut glass bangles curated for festival elegance. Available in customizable sets and seasonal university colorways.',
    priceRange: '৳120 – ৳350 / set',
    image: 'src/assets/images/Bangles.png',
    highlights: [
      'Handcrafted silk thread designs',
      'Exclusive festival colourways',
      'Free sizing assistance at stall',
      'Physical stall exclusive'
    ]
  },
  {
    id: 'stall-cakes',
    name: 'Fresh Homemade Cupcakes & Slices',
    category: 'Cakes',
    tagline: 'Baked Fresh for BizVenture Morning',
    description: 'Freshly baked celebratory cupcakes, red velvet slices, and dark chocolate brownies prepared by student culinary creators. Served fresh throughout competition day.',
    priceRange: '৳80 – ৳180 / piece',
    image: 'src/assets/images/Cakes.png',
    highlights: [
      'Baked fresh on 30 Sept morning',
      'Rich chocolate & red velvet options',
      'Individual hygienic festival packaging',
      'Physical stall exclusive'
    ]
  }
];

export const STALL_HERO_IMAGE = '/src/assets/images/hero_bizventure_stall_1790615311084.jpg';
