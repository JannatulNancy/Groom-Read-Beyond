export type BookStatus = 'available' | 'preorder';

export type BookCategory = 
  | 'All'
  | 'Fiction'
  | 'Self Development'
  | 'Finance'
  | 'Productivity'
  | 'Personal Development'
  | 'Children & Comics'
  | 'Academics & General';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number; // Selling price in BDT (৳) on customer site
  costPrice?: number; // Actual acquisition / cost price in BDT (৳)
  coverImage?: string; // Custom uploaded image (data URL or external URL)
  coverBg: string;
  accentColor: string;
  description: string;
  status: BookStatus;
  stallStock?: number; // Copies physically at stall
  pages?: number;
  featured?: boolean;
  createdAt?: string;
}

export type OrderStatus = 
  | 'Pending Verification'
  | 'Confirmed'
  | 'Ready for Pickup'
  | 'Fulfilled'
  | 'Cancelled';

export interface PreOrder {
  id: string;
  orderNumber: string; // e.g. BV-2026-001
  customerName: string;
  phoneNumber: string;
  bookId: string;
  bookTitle: string;
  bookPrice: number;
  quantity: number;
  contactMethod: 'Phone Call' | 'WhatsApp';
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
  status: OrderStatus;
  paymentStatus?: 'Unpaid' | 'Cash at Stall' | 'Paid';
}

export interface StallProduct {
  id: string;
  name: string;
  category: 'Bangles' | 'Cakes';
  tagline: string;
  description: string;
  priceRange: string;
  image: string;
  highlights: string[];
}

export interface SectionsVisibility {
  hero: boolean;
  concept: boolean;
  qrSection: boolean;
  bookCatalogue: boolean;
  howItWorks: boolean;
  businessModel: boolean;
  stallProducts: boolean;
  about: boolean;
  footer?: boolean;
}

export interface FooterContent {
  brandName: string;
  tagline: string;
  description: string;
  eventName: string;
  stallLocation: string;
  stallNumber: string;
  date: string;
  openingHours: string;
  offeringsTitle: string;
  offering1: string;
  offering2: string;
  offering3: string;
  linksTitle: string;
  contactTitle: string;
  contactPhone: string;
  contactWhatsApp: string;
  contactEmail: string;
  badge1: string;
  badge2: string;
  badge3: string;
  copyrightText: string;
  bottomQuote: string;
}

export interface SiteContent {
  visibility?: SectionsVisibility;
  footer?: FooterContent;
  store: {
    storeName: string;
    storeTagline: string;
    eventName: string;
    organizer: string;
    institution: string;
    date: string;
    stallNumber: string;
    bannerImage: string;
    bannerBottomQuote: string;
    stallContactPhone: string;
    stallWhatsApp: string;
  };
  hero: {
    badge1: string;
    badge2: string;
    titleLine1: string;
    titleHighlight: string;
    subtitle: string;
    primaryCtaText: string;
    secondaryCtaText: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
  };
  heroCard: {
    image: string;
    topTag: string;
    badgePrimary: string;
    badgeSecondary: string;
    footerTitle: string;
    footerSubtitle: string;
    box1Emoji: string;
    box1Title: string;
    box1Sub: string;
    box2Emoji: string;
    box2Title: string;
    box2Sub: string;
    box3Emoji: string;
    box3Title: string;
    box3Sub: string;
  };
  concept: {
    badge: string;
    title: string;
    subtitle: string;
    booksHeading: string;
    booksSub: string;
    booksDesc: string;
    booksImage?: string;
    banglesHeading: string;
    banglesSub: string;
    banglesDesc: string;
    banglesImage?: string;
    cakesHeading: string;
    cakesSub: string;
    cakesDesc: string;
    cakesImage?: string;
  };
  stallProducts: {
    bangles: {
      name: string;
      tagline: string;
      priceRange: string;
      description: string;
      image: string;
      highlights: string[];
    };
    cakes: {
      name: string;
      tagline: string;
      priceRange: string;
      description: string;
      image: string;
      highlights: string[];
    };
  };
  qrSection?: {
    badge: string;
    title: string;
    subtitle: string;
    notice: string;
    image?: string;
  };
  bookCatalogue?: {
    badge: string;
    title: string;
    subtitle: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    steps: Array<{
      step: string;
      title: string;
      action: string;
      description: string;
    }>;
  };
  businessModel: {
    title: string;
    subtitle: string;
    pillar1Title: string;
    pillar1Sub: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Sub: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Sub: string;
    pillar3Desc: string;
    capitalEfficiency: string;
  };
  about: {
    title: string;
    subtitle: string;
    teamStory: string;
    teamPhoto?: string;
    value1Title: string;
    value1Desc: string;
    value2Title: string;
    value2Desc: string;
    value3Title: string;
    value3Desc: string;
    closingQuote: string;
  };
}
