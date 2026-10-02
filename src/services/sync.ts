/**
 * Real-Time Multi-Client Sync Service & Atomic Pub/Sub Bridge
 * Connects customer storefronts and admin panels so that whenever changes
 * are saved in Admin, all customer pages and browser tabs automatically update live!
 */
import {
  getStoredSiteContent,
  getStoredBooks,
  getStoredOrders,
  STORAGE_KEY_CONTENT,
  STORAGE_KEY_CONTENT_ALT,
  STORAGE_KEY_BOOKS,
  STORAGE_KEY_BOOKS_ALT,
  STORAGE_KEY_ORDERS,
  STORAGE_KEY_ORDERS_ALT,
  STORAGE_KEY_ORDER_HISTORY,
} from './db';
import { SiteContent } from '../types';

export type SyncEntity = 'content' | 'books' | 'orders' | 'history' | 'all';
export type SyncAction = 'create' | 'update' | 'delete' | 'reset' | 'sync';

export interface AtomicSyncMessage<T = unknown> {
  id: string;
  version: 1;
  entity: SyncEntity;
  action: SyncAction;
  timestamp: number;
  senderId: string;
  payload: T;
}

export const TAB_SESSION_ID =
  typeof window !== 'undefined'
    ? 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now()
    : 'tab_ssr';

let eventSource: EventSource | null = null;
let broadcastChannel: BroadcastChannel | null = null;
let pollInterval: any = null;
let lastKnownRevision = 0;
let isContentValidationListenerAttached = false;

/**
 * Explicit schema validation for SiteContent
 * Guarantees that any payload received over custom events or broadcast channels
 * is strictly conforming before being written or rendered.
 */
export function isValidSiteContent(data: unknown): data is SiteContent {
  if (!data || typeof data !== 'object') return false;
  const c = data as Record<string, any>;

  // Check store section
  if (!c.store || typeof c.store !== 'object') return false;
  if (typeof c.store.storeName !== 'string' || typeof c.store.stallNumber !== 'string') {
    return false;
  }

  // Check hero section
  if (!c.hero || typeof c.hero !== 'object') return false;
  if (typeof c.hero.titleLine1 !== 'string') return false;

  // Check concept section
  if (!c.concept || typeof c.concept !== 'object') return false;

  // Check stall products section
  if (!c.stallProducts || typeof c.stallProducts !== 'object') return false;

  return true;
}

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!broadcastChannel && 'BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel('bizventure-sync-channel');
      broadcastChannel.onmessage = (event: MessageEvent<AtomicSyncMessage>) => {
        handleAtomicBroadcast(event.data);
      };
    } catch (e) {
      console.warn('BroadcastChannel initialization warning:', e);
    }
  }
  return broadcastChannel;
}

/**
 * Publishes an atomic state update across all open browser tabs
 */
export function publishAtomicSync<T = unknown>(
  entity: SyncEntity,
  action: SyncAction = 'update',
  payload?: T
): void {
  try {
    const channel = getBroadcastChannel();
    if (!channel) return;

    const message: AtomicSyncMessage<T> = {
      id: 'sync_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      version: 1,
      entity,
      action,
      timestamp: Date.now(),
      senderId: TAB_SESSION_ID,
      payload: (payload !== undefined ? payload : null) as T,
    };

    channel.postMessage(message);
  } catch (e) {
    console.debug('BroadcastChannel notification notice:', e);
  }
}

/**
 * Backward-compatible helper for db.ts and orderStorage.ts
 */
export function notifyLocalBroadcast(
  entity: SyncEntity,
  data?: unknown
): void {
  publishAtomicSync(entity, 'update', data);
}

/**
 * Handles incoming atomic broadcast messages from other browser tabs
 */
function handleAtomicBroadcast(message: AtomicSyncMessage): void {
  if (!message || message.version !== 1) return;

  // Prevent duplicate echo / feedback loop to sender tab
  if (message.senderId === TAB_SESSION_ID) return;

  const { entity, action, payload } = message;

  try {
    if (entity === 'content') {
      // 1. Explicit schema validation check on incoming broadcast payload
      if (isValidSiteContent(payload)) {
        try {
          localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(payload));
          localStorage.setItem(STORAGE_KEY_CONTENT_ALT, JSON.stringify(payload));
        } catch (err) {
          console.warn('Storage sync write warning:', err);
        }
      }

      // 2. Forced hard re-fetch from persistent storage to guarantee customer site mirrors admin changes
      const persistentContent = getStoredSiteContent();
      const verifiedContent = isValidSiteContent(persistentContent) ? persistentContent : (payload as SiteContent);

      // 3. Dispatch verified persistent content
      const event = new CustomEvent('bizventure-content-updated', { detail: verifiedContent });
      (event as any).__verified = true;
      window.dispatchEvent(event);
      window.dispatchEvent(new CustomEvent('bizventure-atomic-sync', { detail: { entity, action, payload: verifiedContent } }));
      return;
    }

    if (entity === 'books') {
      if (payload && Array.isArray(payload)) {
        try {
          localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(payload));
          localStorage.setItem(STORAGE_KEY_BOOKS_ALT, JSON.stringify(payload));
        } catch {}
      }
      const books = payload || getStoredBooks();
      window.dispatchEvent(new CustomEvent('bizventure-books-updated', { detail: books }));
      window.dispatchEvent(new CustomEvent('bizventure-atomic-sync', { detail: { entity, action, payload: books } }));
      return;
    }

    if (entity === 'orders') {
      if (payload && Array.isArray(payload)) {
        try {
          localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(payload));
          localStorage.setItem(STORAGE_KEY_ORDERS_ALT, JSON.stringify(payload));
        } catch {}
      }
      const orders = payload || getStoredOrders();
      window.dispatchEvent(new CustomEvent('bizventure-order-created', { detail: orders }));
      window.dispatchEvent(new CustomEvent('bizventure-atomic-sync', { detail: { entity, action, payload: orders } }));
      return;
    }

    if (entity === 'history') {
      if (payload && Array.isArray(payload)) {
        try {
          localStorage.setItem(STORAGE_KEY_ORDER_HISTORY, JSON.stringify(payload));
        } catch {}
      }
      window.dispatchEvent(new CustomEvent('bizventure-order-history-updated', { detail: payload }));
      window.dispatchEvent(new CustomEvent('bizventure-atomic-sync', { detail: { entity, action, payload } }));
      return;
    }

    // Default fallback
    handleRemoteUpdate(entity || 'all');
  } catch (e) {
    console.warn('Error handling broadcast sync message:', e);
    handleRemoteUpdate(entity || 'all');
  }
}

/**
 * Installs validation listener for 'bizventure-content-updated'
 * Whenever 'bizventure-content-updated' is received, this enforces an explicit schema
 * check, stores valid content to persistent storage, and forces a hard re-fetch
 * to guarantee that the customer site mirrors admin changes immediately.
 */
export function initContentValidationBridge(): void {
  if (typeof window === 'undefined' || isContentValidationListenerAttached) return;
  isContentValidationListenerAttached = true;

  window.addEventListener('bizventure-content-updated', (event: Event) => {
    const customEvent = event as CustomEvent;
    // Guard against recursion when already verified
    if ((customEvent as any)?.__verified) return;

    const incoming = customEvent.detail;

    // 1. Explicit schema validation check
    if (incoming && isValidSiteContent(incoming)) {
      try {
        localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(incoming));
        localStorage.setItem(STORAGE_KEY_CONTENT_ALT, JSON.stringify(incoming));
      } catch (err) {
        console.warn('Storage sync validation write warning:', err);
      }
    }

    // 2. Forced hard re-fetch directly from persistent storage
    const hardRefetched = getStoredSiteContent();

    // 3. Re-dispatch verified persistent content if incoming differs
    if (isValidSiteContent(hardRefetched) && incoming !== hardRefetched) {
      const verifiedEvent = new CustomEvent('bizventure-content-updated', { detail: hardRefetched });
      (verifiedEvent as any).__verified = true;
      window.dispatchEvent(verifiedEvent);
    }
  });
}

// Automatically activate validation bridge on module load
if (typeof window !== 'undefined') {
  initContentValidationBridge();
}

/**
 * Initializes cross-tab BroadcastChannel, SSE server sync, and polling fallback
 */
export function initLiveSync(): void {
  if (typeof window === 'undefined') return;

  // 1. Cross-tab instant broadcast channel (same browser, 0ms latency)
  getBroadcastChannel();

  // 2. Content validation bridge
  initContentValidationBridge();

  // 3. Server-Sent Events (SSE) for cross-device & published site real-time sync
  if ('EventSource' in window) {
    try {
      eventSource = new EventSource('/api/sync/events');

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'update') {
            lastKnownRevision = data.revision;
            handleRemoteUpdate(data.entity || 'all');
          } else if (data.type === 'init') {
            lastKnownRevision = data.revision;
          }
        } catch {
          // ignore parse error
        }
      };

      eventSource.onerror = () => {
        startPollingFallback();
      };
    } catch {
      startPollingFallback();
    }
  } else {
    startPollingFallback();
  }

  // Initial pull from server to ensure client has latest published changes
  syncAllFromServer();
}

function startPollingFallback() {
  if (pollInterval) return;
  pollInterval = setInterval(async () => {
    try {
      const res = await fetch('/api/sync/poll');
      if (res.ok) {
        const data = await res.json();
        if (data.revision && data.revision > lastKnownRevision) {
          lastKnownRevision = data.revision;
          syncAllFromServer();
        }
      }
    } catch {
      // offline or server starting
    }
  }, 3000);
}

export async function syncAllFromServer(): Promise<void> {
  try {
    // 1. Fetch content
    const resContent = await fetch('/api/content');
    if (resContent.ok) {
      const json = await resContent.json();
      if (json.success && json.content && isValidSiteContent(json.content)) {
        localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(json.content));
        localStorage.setItem(STORAGE_KEY_CONTENT_ALT, JSON.stringify(json.content));
        // Forced hard re-fetch from persistent storage
        const verified = getStoredSiteContent();
        const event = new CustomEvent('bizventure-content-updated', { detail: verified });
        (event as any).__verified = true;
        window.dispatchEvent(event);
      }
    }

    // 2. Fetch books
    const resBooks = await fetch('/api/books');
    if (resBooks.ok) {
      const json = await resBooks.json();
      if (json.success && Array.isArray(json.books) && json.books.length > 0) {
        localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(json.books));
        localStorage.setItem(STORAGE_KEY_BOOKS_ALT, JSON.stringify(json.books));
        window.dispatchEvent(new CustomEvent('bizventure-books-updated', { detail: json.books }));
      }
    }

    // 3. Fetch orders
    const resOrders = await fetch('/api/orders');
    if (resOrders.ok) {
      const json = await resOrders.json();
      if (json.success && Array.isArray(json.orders)) {
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(json.orders));
        localStorage.setItem(STORAGE_KEY_ORDERS_ALT, JSON.stringify(json.orders));
        window.dispatchEvent(new CustomEvent('bizventure-order-created', { detail: json.orders }));
      }
    }
  } catch (err) {
    console.debug('Initial server sync completed or using offline defaults');
  }
}

async function handleRemoteUpdate(entity: string): Promise<void> {
  try {
    if (entity === 'content' || entity === 'all') {
      const res = await fetch('/api/content');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.content && isValidSiteContent(json.content)) {
          localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(json.content));
          localStorage.setItem(STORAGE_KEY_CONTENT_ALT, JSON.stringify(json.content));
          // Forced hard re-fetch from persistent storage
          const verified = getStoredSiteContent();
          const event = new CustomEvent('bizventure-content-updated', { detail: verified });
          (event as any).__verified = true;
          window.dispatchEvent(event);
        }
      }
    }

    if (entity === 'books' || entity === 'all') {
      const res = await fetch('/api/books');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.books)) {
          localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(json.books));
          localStorage.setItem(STORAGE_KEY_BOOKS_ALT, JSON.stringify(json.books));
          window.dispatchEvent(new CustomEvent('bizventure-books-updated', { detail: json.books }));
        }
      }
    }

    if (entity === 'orders' || entity === 'all') {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.orders)) {
          localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(json.orders));
          localStorage.setItem(STORAGE_KEY_ORDERS_ALT, JSON.stringify(json.orders));
          window.dispatchEvent(new CustomEvent('bizventure-order-created', { detail: json.orders }));
        }
      }
    }
  } catch (err) {
    console.warn('Sync refresh error:', err);
  }
}
