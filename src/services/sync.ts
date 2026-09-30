/**
 * Real-Time Multi-Client Sync Service
 * Connects customer storefronts and admin panels so that whenever changes
 * are saved in Admin, all customer pages automatically update live!
 */
import { getStoredSiteContent, getStoredBooks, getStoredOrders } from './db';

let eventSource: EventSource | null = null;
let broadcastChannel: BroadcastChannel | null = null;
let pollInterval: any = null;
let lastKnownRevision = 0;

export function initLiveSync(): void {
  if (typeof window === 'undefined') return;

  // 1. Cross-tab instant broadcast channel (same browser)
  try {
    if ('BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('bizventure-live-sync');
      broadcastChannel.onmessage = (event) => {
        handleRemoteUpdate(event.data?.entity || 'all');
      };
    }
  } catch (e) {
    console.warn('BroadcastChannel not supported', e);
  }

  // 2. Server-Sent Events (SSE) for cross-device & published site real-time sync
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
        // Fall back to polling if SSE connection drops
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
      if (json.success && json.content) {
        localStorage.setItem('bizventure_site_content', JSON.stringify(json.content));
        window.dispatchEvent(new CustomEvent('bizventure-content-updated', { detail: json.content }));
      }
    }

    // 2. Fetch books
    const resBooks = await fetch('/api/books');
    if (resBooks.ok) {
      const json = await resBooks.json();
      if (json.success && Array.isArray(json.books) && json.books.length > 0) {
        localStorage.setItem('bizventure_books_catalog', JSON.stringify(json.books));
        window.dispatchEvent(new CustomEvent('bizventure-books-updated', { detail: json.books }));
      }
    }

    // 3. Fetch orders
    const resOrders = await fetch('/api/orders');
    if (resOrders.ok) {
      const json = await resOrders.json();
      if (json.success && Array.isArray(json.orders)) {
        localStorage.setItem('bizventure_preorders', JSON.stringify(json.orders));
        window.dispatchEvent(new CustomEvent('bizventure-order-created', { detail: json.orders }));
      }
    }
  } catch (err) {
    console.debug('Initial server sync completed or using offline defaults');
  }
}

export function notifyLocalBroadcast(entity: 'content' | 'books' | 'orders'): void {
  try {
    broadcastChannel?.postMessage({ entity, timestamp: Date.now() });
  } catch {
    // ignore
  }
}

async function handleRemoteUpdate(entity: string): Promise<void> {
  try {
    if (entity === 'content' || entity === 'all') {
      const res = await fetch('/api/content');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.content) {
          localStorage.setItem('bizventure_site_content', JSON.stringify(json.content));
          window.dispatchEvent(new CustomEvent('bizventure-content-updated', { detail: json.content }));
        }
      }
    }

    if (entity === 'books' || entity === 'all') {
      const res = await fetch('/api/books');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.books)) {
          localStorage.setItem('bizventure_books_catalog', JSON.stringify(json.books));
          window.dispatchEvent(new CustomEvent('bizventure-books-updated', { detail: json.books }));
        }
      }
    }

    if (entity === 'orders' || entity === 'all') {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.orders)) {
          localStorage.setItem('bizventure_preorders', JSON.stringify(json.orders));
          window.dispatchEvent(new CustomEvent('bizventure-order-created', { detail: json.orders }));
        }
      }
    }
  } catch (err) {
    console.warn('Sync refresh error:', err);
  }
}
