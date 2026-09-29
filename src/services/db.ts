import { Book, PreOrder, SiteContent, OrderStatus } from '../types';
import { BOOKS_DATA } from '../data/books';
import { STORE_CONFIG } from '../config/storeConfig';
import { STALL_PRODUCTS } from '../data/stallProducts';

const STORAGE_KEY_CONTENT = 'groom_read_beyond_content';
const STORAGE_KEY_BOOKS = 'groom_read_beyond_books';
const STORAGE_KEY_BOOKS_VERSION = 'groom_read_beyond_books_version_stall9_v1';
const STORAGE_KEY_ORDERS = 'bizventure_2026_orders';

export const DEFAULT_SITE_CONTENT: SiteContent = {
  visibility: {
    hero: true,
    concept: true,
    qrSection: true,
    bookCatalogue: true,
    howItWorks: true,
    businessModel: true,
    stallProducts: true,
    about: true,
    footer: true,
  },
  store: {
    storeName: STORE_CONFIG.storeName,
    storeTagline: STORE_CONFIG.storeTagline,
    eventName: STORE_CONFIG.eventName,
    organizer: STORE_CONFIG.organizer,
    institution: STORE_CONFIG.institution,
    date: STORE_CONFIG.date,
    stallNumber: STORE_CONFIG.stallNumber,
    bannerImage: STORE_CONFIG.bannerImage,
    bannerBottomQuote: STORE_CONFIG.bannerBottomQuote,
    stallContactPhone: STORE_CONFIG.stallContactPhone,
    stallWhatsApp: STORE_CONFIG.stallWhatsApp,
  },
  hero: {
    badge1: `${STORE_CONFIG.eventName} • ${STORE_CONFIG.organizer}`,
    badge2: 'Physical Stall + Online Book Pre-Order',
    titleLine1: 'Stories You Can Hold.',
    titleHighlight: 'Books You Can Order.',
    subtitle: `Discover your next read at our ${STORE_CONFIG.storeName} book corner. Browse our physical stall selection or pre-order exclusive titles from our broader student-curated catalogue.`,
    primaryCtaText: '📚 Browse Books',
    secondaryCtaText: '📦 Pre-Order a Book',
    stat1Value: '5–6',
    stat1Label: 'Books on Physical Display',
    stat2Value: '12+',
    stat2Label: 'Online Pre-Order Titles',
    stat3Value: '0%',
    stat3Label: 'Unsold Inventory Waste',
  },
  heroCard: {
    image: STORE_CONFIG.bannerImage,
    topTag: `Stall #09 Live • ${STORE_CONFIG.institution}`,
    badgePrimary: 'Hybrid Retail',
    badgeSecondary: 'Physical + Digital',
    footerTitle: 'Today at BizVenture:',
    footerSubtitle: 'Stall #09',
    box1Emoji: '📚',
    box1Title: 'Books',
    box1Sub: 'Pre-Order + Stall',
    box2Emoji: '💍',
    box2Title: 'Churi Bangles',
    box2Sub: 'Stall Exclusive',
    box3Emoji: '🎂',
    box3Title: 'Foods & Treats',
    box3Sub: 'Fresh at Stall',
  },
  concept: {
    badge: 'Hybrid Retail Model',
    title: 'One Stall. Three Experiences.',
    subtitle: 'Where grooming meets wisdom: our booth blends instant physical festival delights with an innovative digital pre-order book catalogue.',
    booksHeading: 'BOOKS & READING',
    booksSub: 'Browse online & pre-order',
    booksDesc: 'Explore our wider book collection and pre-order books that are not currently displayed at the stall. Stories, curated books, and learning for all ages.',
    banglesHeading: 'HANDMADE BANGLES (CHURI)',
    banglesSub: 'Available at our stall',
    banglesDesc: 'Colorful, artisan, traditional handmade bangles. Explore our vibrant festive collection directly at the physical stall.',
    cakesHeading: 'FOODS & TREATS',
    cakesSub: 'Fresh & available at our stall',
    cakesDesc: 'Homemade snacks, sweet & savory treats. Fresh celebration cupcakes, brownies, and cookies baked for festival morning.',
  },
  stallProducts: {
    bangles: {
      name: 'Handmade Bangles (Churi)',
      tagline: 'Colorful • Artisan • Traditional Handmade',
      priceRange: '৳120 – ৳350 / set',
      description: 'Vibrant silk-wrapped and authentic hand-crafted glass churi bangles curated for festival elegance. Available in customizable sets and seasonal university colorways.',
      image: STALL_PRODUCTS[0]?.image || '/src/assets/images/stall_bangles_1790615330269.jpg',
      highlights: [
        'Handcrafted silk thread designs',
        'Exclusive festival colourways',
        'Free sizing assistance at stall',
        'Physical stall exclusive'
      ]
    },
    cakes: {
      name: 'Foods & Treats',
      tagline: 'Homemade • Snacks • Sweet & Savory',
      priceRange: '৳80 – ৳180 / piece',
      description: 'Freshly baked celebratory cupcakes, red velvet slices, savory pastry snacks, and dark chocolate cookies prepared by student culinary creators.',
      image: STALL_PRODUCTS[1]?.image || '/src/assets/images/stall_cakes_1790615343160.jpg',
      highlights: [
        'Baked fresh on 30 Sept morning',
        'Sweet cupcakes & savory festival snacks',
        'Hygienic eco-friendly festival packaging',
        'Physical stall exclusive'
      ]
    }
  },
  howItWorks: {
    title: 'How Book Pre-Ordering Works',
    subtitle: 'Designed for frictionless on-campus ordering during BizVenture 2026. Zero complicated account setups, zero app downloads.',
    steps: [
      {
        step: '01',
        title: 'Scan',
        action: 'Scan the QR code at our stall.',
        description: 'Spot our tabletop QR stand at Stall #09 to open our live digital catalogue directly on your phone.'
      },
      {
        step: '02',
        title: 'Browse',
        action: 'Explore our wider book collection.',
        description: 'Discover bestselling fiction, finance, self development, and productivity books beyond the copies physically on display.'
      },
      {
        step: '03',
        title: 'Order',
        action: 'Submit a quick pre-order request.',
        description: 'Enter your name and WhatsApp/phone number. No payment gateway hassle or upfront charge.'
      },
      {
        step: '04',
        title: 'Confirm',
        action: 'Our team confirms availability with you.',
        description: 'Our team reviews stock, contacts you to verify the book edition, and arranges pickup at our university stall.'
      }
    ]
  },
  businessModel: {
    title: 'Smart Inventory. Wider Selection.',
    subtitle: 'Instead of stocking every book physically, we display selected books at our stall and use pre-orders to offer a wider collection without requiring large upfront inventory.',
    pillar1Title: 'Lower Inventory Cost',
    pillar1Sub: 'Avoid buying large quantities upfront.',
    pillar1Desc: 'We eliminate the financial risk of unsold copies on a 1-day campus exhibition by investing upfront only in high-probability showcase titles.',
    pillar2Title: 'Wider Selection',
    pillar2Sub: 'Browse more than we can physically display.',
    pillar2Desc: 'Our physical stall space is constrained to a 6-foot tabletop shared with bangles and treats. The digital catalog expands our catalog to unlimited titles.',
    pillar3Title: 'Customer-Driven Stock',
    pillar3Sub: 'Orders reveal genuine customer demand.',
    pillar3Desc: 'Pre-orders give our team actionable demand data before dispatching delivery runs, guaranteeing that every arranged book already has a committed buyer.',
    capitalEfficiency: '68.4%'
  },
  about: {
    title: 'Meet Our BizVenture Store',
    subtitle: 'We are a student-run mini business created for BizVenture 2026 by International Standard University students.',
    teamStory: 'Our concept brings together personal grooming and intellectual wisdom: a lively physical retail experience for handmade churi bangles and delicious treats, powered by an agile digital book pre-order system.',
    value1Title: 'Creative Innovation',
    value1Desc: 'Like the magic of endless possibilities, our hybrid QR catalogue turns a small campus table into an expansive bookstore.',
    value2Title: 'Teamwork & Friendship',
    value2Desc: 'Crafted collaboratively by passionate peers who believe that combining diverse talents generates extraordinary results.',
    value3Title: 'Smart Execution',
    value3Desc: 'Disciplined unit economics, minimal inventory holding risk, and real-time demand validation for university judges.',
    closingQuote: 'Powered by creativity, teamwork and smart business decisions.',
    teamPhoto: '/src/assets/images/hero_bizventure_stall_1790615311084.jpg',
  },
  qrSection: {
    badge: 'Scan & Order at Stall #09',
    title: 'At the Stall? Scan. Browse. Pre-Order.',
    subtitle: 'Can\'t find the book you\'re looking for at our physical stall? Scan our tabletop QR stand and browse our wider collection on your phone.',
    notice: 'No app download needed • Instant browser pre-order • Verified by student stall crew',
    image: '',
  },
  bookCatalogue: {
    badge: 'Curated Catalogue',
    title: 'Explore Our Books',
    subtitle: 'Browse physical stall books or pre-order titles from our extended student-curated collection.',
  },
  footer: {
    brandName: 'Groom, Read & Beyond',
    tagline: 'Where grooming meets wisdom...',
    description: 'A student-run physical stall and smart book pre-order ecosystem for BizVenture 2026. Combining physical retail delights with an on-demand digital book collection.',
    eventName: 'BizVenture 2026 • ISU Department of Business Administration',
    stallLocation: 'International Standard University (ISU) Campus Stall Court',
    stallNumber: 'Stall #09',
    date: 'September 30, 2026',
    openingHours: 'Festival Day: 9:00 AM – 6:00 PM',
    offeringsTitle: 'Festive Store Offerings',
    offering1: '📚 Curated Books & Smart Pre-Orders',
    offering2: '💍 Handmade Bangles (Churi) at Stall',
    offering3: '🎂 Fresh Homemade Treats & Celebrations',
    linksTitle: 'Navigation & Stall Desk',
    contactTitle: 'Stall Team Contacts & Pre-Orders',
    contactPhone: '+880 1712-345678',
    contactWhatsApp: '+880 1712-345678',
    contactEmail: 'groomreadbeyond@gmail.com',
    badge1: '🚪 Anywhere Door to Knowledge',
    badge2: '🔔 100% Student Powered',
    badge3: '✨ Good Vibes Only ♡',
    copyrightText: '© 2026 Groom, Read & Beyond · International Standard University',
    bottomQuote: 'Where grooming meets wisdom — Inspiring minds, celebrating friendship & smart entrepreneurship.',
  },
};

// -------------------------------------------------------------
// Site Content Database Functions
// -------------------------------------------------------------
export function getStoredSiteContent(): SiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONTENT);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(DEFAULT_SITE_CONTENT));
      return DEFAULT_SITE_CONTENT;
    }
    // Automatically modernize any legacy Stall #07 to Stall #09
    const normalizedRaw = raw.replace(/Stall #07/g, 'Stall #09').replace(/Stall #7/g, 'Stall #9');
    const parsed = JSON.parse(normalizedRaw);
    return {
      ...DEFAULT_SITE_CONTENT,
      ...parsed,
      visibility: {
        ...DEFAULT_SITE_CONTENT.visibility,
        ...(parsed.visibility || {}),
      },
      heroCard: {
        ...DEFAULT_SITE_CONTENT.heroCard,
        ...(parsed.heroCard || {}),
      },
      concept: {
        ...DEFAULT_SITE_CONTENT.concept,
        ...(parsed.concept || {}),
      },
      stallProducts: {
        bangles: {
          ...DEFAULT_SITE_CONTENT.stallProducts.bangles,
          ...(parsed.stallProducts?.bangles || {}),
        },
        cakes: {
          ...DEFAULT_SITE_CONTENT.stallProducts.cakes,
          ...(parsed.stallProducts?.cakes || {}),
        },
      },
      qrSection: {
        ...DEFAULT_SITE_CONTENT.qrSection,
        ...(parsed.qrSection || {}),
      },
      bookCatalogue: {
        ...DEFAULT_SITE_CONTENT.bookCatalogue,
        ...(parsed.bookCatalogue || {}),
      },
      about: {
        ...DEFAULT_SITE_CONTENT.about,
        ...(parsed.about || {}),
      },
      footer: {
        ...DEFAULT_SITE_CONTENT.footer,
        ...(parsed.footer || {}),
      },
    };
  } catch (e) {
    console.error('Failed reading site content', e);
    return DEFAULT_SITE_CONTENT;
  }
}

export function saveSiteContent(content: SiteContent): void {
  // Always synchronize phone numbers between store and footer so they never diverge
  const unifiedPhone = (content.footer?.contactPhone || content.store?.stallContactPhone || '+880 1712-345678').trim();
  const unifiedWhatsApp = (content.footer?.contactWhatsApp || content.store?.stallWhatsApp || '+880 1712-345678').trim();

  const synchronizedContent: SiteContent = {
    ...content,
    store: {
      ...content.store,
      stallContactPhone: unifiedPhone,
      stallWhatsApp: unifiedWhatsApp,
    },
    footer: content.footer ? {
      ...content.footer,
      contactPhone: unifiedPhone,
      contactWhatsApp: unifiedWhatsApp,
    } : {
      ...DEFAULT_SITE_CONTENT.footer!,
      contactPhone: unifiedPhone,
      contactWhatsApp: unifiedWhatsApp,
    },
  };

  try {
    localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(synchronizedContent));
  } catch (e) {
    console.warn('Storage warning: could not write full site content to localStorage, dispatching memory event anyway', e);
  } finally {
    // ALWAYS dispatch the event so all live components immediately re-render with fresh content
    window.dispatchEvent(new CustomEvent('bizventure-content-updated', { detail: synchronizedContent }));
  }
}

export function resetSiteContent(): SiteContent {
  localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(DEFAULT_SITE_CONTENT));
  window.dispatchEvent(new CustomEvent('bizventure-content-updated', { detail: DEFAULT_SITE_CONTENT }));
  return DEFAULT_SITE_CONTENT;
}

// -------------------------------------------------------------
// Books Database Functions
// -------------------------------------------------------------
export function getStoredBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKS);
    const version = localStorage.getItem(STORAGE_KEY_BOOKS_VERSION);
    if (!raw || version !== 'v2_stall9_official_pricing') {
      localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(BOOKS_DATA));
      localStorage.setItem(STORAGE_KEY_BOOKS_VERSION, 'v2_stall9_official_pricing');
      return BOOKS_DATA;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure all books have both costPrice and updated selling price by cross-referencing BOOKS_DATA
      let updated = false;
      const enriched = parsed.map((book: Book) => {
        const matchingDefault = BOOKS_DATA.find((d) => d.title.toLowerCase() === book.title.toLowerCase());
        if (matchingDefault) {
          if (book.costPrice === undefined || book.costPrice === 0) {
            book.costPrice = matchingDefault.costPrice;
            updated = true;
          }
          if (book.price === undefined || book.price === 0) {
            book.price = matchingDefault.price;
            updated = true;
          }
        }
        return book;
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(enriched));
      }
      return enriched;
    }
    return BOOKS_DATA;
  } catch (e) {
    console.error('Failed reading books', e);
    return BOOKS_DATA;
  }
}

export function saveBook(book: Book): Book[] {
  const books = getStoredBooks();
  const index = books.findIndex((b) => b.id === book.id);
  let updated: Book[];

  if (index >= 0) {
    updated = [...books];
    updated[index] = { ...book };
  } else {
    updated = [book, ...books];
  }

  try {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bizventure-books-updated', { detail: updated }));
  } catch (e) {
    console.error('Failed saving book', e);
  }
  return updated;
}

export function deleteBook(bookId: string): Book[] {
  const books = getStoredBooks();
  const updated = books.filter((b) => b.id !== bookId);
  try {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bizventure-books-updated', { detail: updated }));
  } catch (e) {
    console.error('Failed deleting book', e);
  }
  return updated;
}

export function resetBooks(): Book[] {
  localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(BOOKS_DATA));
  localStorage.setItem(STORAGE_KEY_BOOKS_VERSION, 'v1_stall9');
  window.dispatchEvent(new CustomEvent('bizventure-books-updated', { detail: BOOKS_DATA }));
  return BOOKS_DATA;
}

// -------------------------------------------------------------
// Orders Database Functions
// -------------------------------------------------------------
const DEFAULT_ORDERS: PreOrder[] = [
  {
    id: 'ord-demo-1',
    orderNumber: 'BV-2026-001',
    customerName: 'Tanvir Ahmed',
    phoneNumber: '01711234567',
    bookId: 'book-7',
    bookTitle: 'The Psychology of Money',
    bookPrice: 450,
    quantity: 1,
    contactMethod: 'WhatsApp',
    notes: 'Please let me know if paperback edition is in stock!',
    adminNotes: 'Customer contacted via WhatsApp. Confirmed paperback.',
    createdAt: '2026-09-28T09:15:00.000Z',
    status: 'Confirmed',
    paymentStatus: 'Cash at Stall',
  },
  {
    id: 'ord-demo-2',
    orderNumber: 'BV-2026-002',
    customerName: 'Samira Rahman',
    phoneNumber: '01819876543',
    bookId: 'book-6',
    bookTitle: 'Ikigai',
    bookPrice: 350,
    quantity: 1,
    contactMethod: 'Phone Call',
    notes: 'Can pick up around 2 PM near ISU library stall area.',
    adminNotes: 'Awaiting phone verification call.',
    createdAt: '2026-09-28T09:40:00.000Z',
    status: 'Pending Verification',
    paymentStatus: 'Unpaid',
  },
  {
    id: 'ord-demo-3',
    orderNumber: 'BV-2026-003',
    customerName: 'Mahmudul Hasan',
    phoneNumber: '01912349876',
    bookId: 'book-8',
    bookTitle: 'Deep Work',
    bookPrice: 400,
    quantity: 2,
    contactMethod: 'WhatsApp',
    notes: 'One for my friend too.',
    adminNotes: 'Stock packaged at Stall #07 shelf.',
    createdAt: '2026-09-28T10:05:00.000Z',
    status: 'Ready for Pickup',
    paymentStatus: 'Cash at Stall',
  }
];

export function getStoredOrders(): PreOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(DEFAULT_ORDERS));
      return DEFAULT_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_ORDERS;
  } catch {
    return DEFAULT_ORDERS;
  }
}

export function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  adminNotes?: string,
  paymentStatus?: 'Unpaid' | 'Cash at Stall' | 'Paid'
): PreOrder[] {
  const orders = getStoredOrders();
  const updated = orders.map((ord) => {
    if (ord.id === orderId) {
      return {
        ...ord,
        status: newStatus,
        adminNotes: adminNotes !== undefined ? adminNotes : ord.adminNotes,
        paymentStatus: paymentStatus !== undefined ? paymentStatus : ord.paymentStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return ord;
  });

  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bizventure-order-created', { detail: updated }));
  } catch (e) {
    console.error('Failed updating order status', e);
  }
  return updated;
}

export function deleteOrder(orderId: string): PreOrder[] {
  const orders = getStoredOrders();
  const updated = orders.filter((o) => o.id !== orderId);
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bizventure-order-created', { detail: updated }));

    // Also remove from completed order history if present
    const historyRaw = localStorage.getItem('bizventure_completed_order_history');
    if (historyRaw) {
      try {
        const historyList = JSON.parse(historyRaw);
        if (Array.isArray(historyList)) {
          const filteredHistory = historyList.filter((item: any) => item.id !== orderId);
          localStorage.setItem('bizventure_completed_order_history', JSON.stringify(filteredHistory));
          window.dispatchEvent(new CustomEvent('bizventure-order-history-updated', { detail: filteredHistory }));
        }
      } catch {
        // ignore parse error
      }
    }
  } catch (e) {
    console.error('Failed deleting order', e);
  }
  return updated;
}

export function resetOrders(): PreOrder[] {
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(DEFAULT_ORDERS));
  window.dispatchEvent(new CustomEvent('bizventure-order-created', { detail: DEFAULT_ORDERS }));
  return DEFAULT_ORDERS;
}

export function exportDatabaseBackup(): string {
  const data = {
    exportDate: new Date().toISOString(),
    store: getStoredSiteContent(),
    books: getStoredBooks(),
    orders: getStoredOrders(),
  };
  return JSON.stringify(data, null, 2);
}

export function exportOrdersToCSV(ordersToExport?: PreOrder[]): { success: boolean; count: number; filename: string } {
  const list = ordersToExport || getStoredOrders();
  if (!list || list.length === 0) {
    return { success: false, count: 0, filename: '' };
  }

  const headers = [
    'Order ID',
    'Order Date & Time',
    'Customer Name',
    'Phone Number',
    'Preferred Contact',
    'Book Title',
    'Unit Price (BDT)',
    'Quantity',
    'Total Amount (BDT)',
    'Order Status',
    'Payment Status',
    'Customer Notes',
    'Staff Admin Notes'
  ];

  const escapeCSV = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = list.map((o) => [
    escapeCSV(o.orderNumber),
    escapeCSV(new Date(o.createdAt).toLocaleString()),
    escapeCSV(o.customerName),
    escapeCSV(o.phoneNumber),
    escapeCSV(o.contactMethod),
    escapeCSV(o.bookTitle),
    o.bookPrice,
    o.quantity,
    o.quantity * o.bookPrice,
    escapeCSV(o.status),
    escapeCSV(o.paymentStatus || 'Unpaid'),
    escapeCSV(o.notes || ''),
    escapeCSV(o.adminNotes || ''),
  ]);

  // Prepend UTF-8 BOM so Excel on Windows & Mac opens Bangladeshi Taka & names without encoding issues
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `Groom_Read_Beyond_Orders_${new Date().toISOString().slice(0, 10)}.csv`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, count: list.length, filename };
}

export function importDatabaseBackup(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.store) {
      localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(parsed.store));
    }
    if (Array.isArray(parsed.books)) {
      localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(parsed.books));
    }
    if (Array.isArray(parsed.orders)) {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(parsed.orders));
    }
    window.dispatchEvent(new CustomEvent('bizventure-content-updated'));
    window.dispatchEvent(new CustomEvent('bizventure-books-updated'));
    window.dispatchEvent(new CustomEvent('bizventure-order-created'));
    return true;
  } catch (err) {
    console.error('Import failed', err);
    return false;
  }
}
