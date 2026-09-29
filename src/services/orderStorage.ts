import { PreOrder } from '../types';
import { getStoredOrders as getDBOrders } from './db';

const STORAGE_KEY = 'bizventure_2026_orders';
const STORAGE_KEY_HISTORY = 'bizventure_completed_order_history';

export const SAMPLE_COMPLETED_ORDERS: PreOrder[] = [
  {
    id: 'ord-hist-1',
    orderNumber: 'BV-2026-H01',
    customerName: 'Nusrat Jahan',
    phoneNumber: '01719876543',
    bookId: 'book-1',
    bookTitle: 'Atomic Habits',
    bookPrice: 400,
    quantity: 1,
    contactMethod: 'WhatsApp',
    notes: 'Collected during lunch break at the BizVenture booth.',
    adminNotes: 'Handed over by stall crew. Cash received at Stall #09.',
    createdAt: '2026-09-27T10:30:00.000Z',
    updatedAt: '2026-09-27T14:15:00.000Z',
    status: 'Fulfilled',
    paymentStatus: 'Paid',
  },
  {
    id: 'ord-hist-2',
    orderNumber: 'BV-2026-H02',
    customerName: 'Farhan Kabir',
    phoneNumber: '01811223344',
    bookId: 'book-4',
    bookTitle: 'Start with Why',
    bookPrice: 380,
    quantity: 1,
    contactMethod: 'Phone Call',
    notes: 'Student ID presented for collection.',
    adminNotes: 'Verified and delivered at Stall #09 counter.',
    createdAt: '2026-09-28T11:00:00.000Z',
    updatedAt: '2026-09-28T16:20:00.000Z',
    status: 'Fulfilled',
    paymentStatus: 'Paid',
  },
];

export function getStoredOrders(): PreOrder[] {
  return getDBOrders();
}

export function getStoredCompletedOrders(): PreOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    let history: PreOrder[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        history = parsed;
      }
    } else {
      history = [...SAMPLE_COMPLETED_ORDERS];
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    }

    // Also include any orders from primary storage marked 'Fulfilled' that aren't yet in history
    const activeOrders = getDBOrders();
    const fulfilledFromActive = activeOrders.filter((o) => o.status === 'Fulfilled');
    const existingIds = new Set(history.map((h) => h.id));
    let hasAdditions = false;

    fulfilledFromActive.forEach((fo) => {
      if (!existingIds.has(fo.id)) {
        history.unshift(fo);
        existingIds.add(fo.id);
        hasAdditions = true;
      }
    });

    if (hasAdditions) {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    }

    return history;
  } catch (err) {
    console.error('Failed reading completed order history', err);
    return SAMPLE_COMPLETED_ORDERS;
  }
}

export function saveCompletedOrder(order: PreOrder): PreOrder[] {
  try {
    const existing = getStoredCompletedOrders();
    const completedOrder: PreOrder = {
      ...order,
      status: 'Fulfilled',
      paymentStatus: 'Paid',
      updatedAt: new Date().toISOString(),
    };
    const filtered = existing.filter((o) => o.id !== order.id);
    const updated = [completedOrder, ...filtered];
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bizventure-order-history-updated', { detail: updated }));
    return updated;
  } catch (err) {
    console.error('Failed saving completed order', err);
    return [];
  }
}

export function removeCompletedOrder(orderId: string): PreOrder[] {
  try {
    const existing = getStoredCompletedOrders();
    const updated = existing.filter((o) => o.id !== orderId);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bizventure-order-history-updated', { detail: updated }));
    return updated;
  } catch (err) {
    console.error('Failed removing completed order', err);
    return [];
  }
}

export function clearCompletedOrderHistory(): void {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('bizventure-order-history-updated', { detail: [] }));
  } catch (err) {
    console.error('Failed clearing order history', err);
  }
}

export function resetDemoCompletedHistory(): PreOrder[] {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(SAMPLE_COMPLETED_ORDERS));
    window.dispatchEvent(new CustomEvent('bizventure-order-history-updated', { detail: SAMPLE_COMPLETED_ORDERS }));
    return SAMPLE_COMPLETED_ORDERS;
  } catch (err) {
    console.error('Failed resetting order history', err);
    return SAMPLE_COMPLETED_ORDERS;
  }
}

export function saveNewPreOrder(data: {
  customerName: string;
  phoneNumber: string;
  bookId: string;
  bookTitle: string;
  bookPrice: number;
  quantity: number;
  contactMethod: 'Phone Call' | 'WhatsApp';
  notes?: string;
}): PreOrder {
  const existing = getStoredOrders();
  
  // Calculate next sequential order number
  const nextSeq = existing.length + 1;
  const seqStr = String(nextSeq).padStart(3, '0');
  const orderNumber = `BV-2026-${seqStr}`;

  const newOrder: PreOrder = {
    id: 'ord-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    orderNumber,
    customerName: data.customerName.trim(),
    phoneNumber: data.phoneNumber.trim(),
    bookId: data.bookId,
    bookTitle: data.bookTitle,
    bookPrice: data.bookPrice,
    quantity: data.quantity,
    contactMethod: data.contactMethod,
    notes: data.notes?.trim() || '',
    adminNotes: '',
    createdAt: new Date().toISOString(),
    status: 'Pending Verification',
    paymentStatus: 'Unpaid',
  };

  const updated = [newOrder, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save order to localStorage', err);
  }

  // Dispatch custom storage event for live UI reactivity
  window.dispatchEvent(new CustomEvent('bizventure-order-created', { detail: newOrder }));

  return newOrder;
}

export function resetDemoOrders(): PreOrder[] {
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
      adminNotes: 'Customer confirmed via WhatsApp.',
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
      adminNotes: 'Awaiting callback.',
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
      adminNotes: 'Reserved at stall shelf.',
      createdAt: '2026-09-28T10:05:00.000Z',
      status: 'Ready for Pickup',
      paymentStatus: 'Cash at Stall',
    }
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ORDERS));
  window.dispatchEvent(new CustomEvent('bizventure-order-created', { detail: DEFAULT_ORDERS }));
  return DEFAULT_ORDERS;
}

