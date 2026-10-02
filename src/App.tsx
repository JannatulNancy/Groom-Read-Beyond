import React, { useState, useEffect } from 'react';
import { Book, PreOrder, SiteContent } from './types';
import { BOOKS_DATA } from './data/books';
import { getStoredBooks, getStoredSiteContent } from './services/db';
import { isAuthenticated, logoutAdmin } from './services/auth';
import { initLiveSync } from './services/sync';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StoreConcept } from './components/StoreConcept';
import { QRSection } from './components/QRSection';
import { BookCatalogue } from './components/BookCatalogue';
import { HowItWorks } from './components/HowItWorks';
import { BusinessModel } from './components/BusinessModel';
import { StallProducts } from './components/StallProducts';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { BookDetailsModal } from './components/BookDetailsModal';
import { PreOrderModal } from './components/PreOrderModal';
import { OrdersDrawer } from './components/OrdersDrawer';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { Phone, Sparkles } from 'lucide-react';

function checkIsAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    path.endsWith('/admin') ||
    path.includes('/admin') ||
    hash === '#admin' ||
    hash === '#/admin' ||
    hash.startsWith('#admin') ||
    hash.startsWith('#/admin') ||
    search.includes('page=admin') ||
    search.includes('admin=true') ||
    search.includes('view=admin')
  );
}

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => checkIsAdminRoute());
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => isAuthenticated());
  const [content, setContent] = useState<SiteContent>(getStoredSiteContent());
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isPreOrderOpen, setIsPreOrderOpen] = useState(false);
  const [preOrderTargetBook, setPreOrderTargetBook] = useState<Book | null>(null);
  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Initialize real-time multi-client live sync
  useEffect(() => {
    initLiveSync();
  }, []);

  // Keep site content synced with DB / localStorage events
  useEffect(() => {
    const handleContentUpdate = (e?: Event) => {
      const detail = (e as CustomEvent)?.detail;
      setContent(detail || getStoredSiteContent());
    };
    window.addEventListener('bizventure-content-updated', handleContentUpdate);
    return () => window.removeEventListener('bizventure-content-updated', handleContentUpdate);
  }, []);

  // Listen to browser navigation changes e.g. /admin, #admin, back/forward buttons
  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(checkIsAdminRoute());
      setIsAdminLoggedIn(isAuthenticated());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('bizventure-auth-changed', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('bizventure-auth-changed', handleLocationChange);
    };
  }, []);

  // Track active scroll section for navbar indicator
  useEffect(() => {
    if (isAdminRoute) return;

    const handleScroll = () => {
      const sections = ['hero', 'books', 'concept', 'how-it-works', 'business-model', 'stall-products', 'about'];
      const scrollPos = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdminRoute]);

  const scrollToSection = (id: string) => {
    if (isAdminRoute) {
      handleSwitchToStore();
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenPreOrder = (book?: Book) => {
    const currentBooks = getStoredBooks();
    setPreOrderTargetBook(book || currentBooks[0] || BOOKS_DATA[0]);
    setIsPreOrderOpen(true);
  };

  const handleSwitchToStore = () => {
    try {
      if (window.location.pathname.startsWith('/admin')) {
        window.history.pushState({}, '', '/');
      } else if (window.location.hash === '#admin') {
        window.history.pushState({}, '', window.location.pathname);
      }
    } catch (e) {
      console.warn('Could not pushState', e);
    }
    setIsAdminRoute(false);
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setIsAdminLoggedIn(false);
    handleSwitchToStore();
  };

  // ---------------------------------------------------------------------------
  // Admin Route Handling (/admin or #admin) with Authentication Gate
  // ---------------------------------------------------------------------------
  if (isAdminRoute) {
    if (!isAdminLoggedIn) {
      return (
        <AdminLogin
          onSuccess={() => {
            setIsAdminLoggedIn(true);
          }}
          onBackToStore={handleSwitchToStore}
        />
      );
    }

    return (
      <AdminPanel
        onSwitchToStore={handleSwitchToStore}
        onLogout={handleAdminLogout}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Public Customer Storefront (Landing Page)
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 antialiased font-sans">
      
      {/* Festive Customer Announcement Bar */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-rose-500 text-white text-[11px] py-1.5 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            <span className="font-bold">BizVenture 2026</span>
            <span className="text-sky-200">·</span>
            <span className="text-white/95 font-medium">Stall #09 (ISU Library Lawn) • {content.store.storeTagline || 'Where grooming meets wisdom...'}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 text-amber-200 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Campus Stall + Digital Pre-Order Hybrid</span>
            </span>

            {(content.footer?.contactPhone || content.store.stallContactPhone) && (
              <a
                href={`tel:${(content.footer?.contactPhone || content.store.stallContactPhone).replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-1 font-bold text-white bg-white/15 hover:bg-white/25 px-2.5 py-0.5 rounded-md transition-colors"
                title="Call Stall #09 Hotline"
              >
                <Phone className="w-3 h-3 text-amber-300" />
                <span className="font-mono">{content.footer?.contactPhone || content.store.stallContactPhone}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Universal Top Navigation (Clean Store Navigation) */}
      <Navbar
        onOpenOrders={() => setIsOrdersDrawerOpen(true)}
        onBrowseBooks={() => scrollToSection('books')}
        activeSection={activeSection}
      />

      <main className="flex-1">
        {/* Hero Section with Official Store Banner */}
        {content.visibility?.hero !== false && (
          <Hero
            onBrowseBooks={() => scrollToSection('books')}
            onOpenPreOrder={() => handleOpenPreOrder()}
            onViewStallQr={() => scrollToSection('qr-section')}
          />
        )}

        {/* Store Concept: One Stall. Three Experiences */}
        {content.visibility?.concept !== false && (
          <StoreConcept
            onExploreBooks={() => scrollToSection('books')}
            onExploreStallTreats={() => scrollToSection('stall-products')}
          />
        )}

        {/* QR Section & Physical Stall Experience */}
        {content.visibility?.qrSection !== false && (
          <QRSection
            onBrowseBooks={() => scrollToSection('books')}
          />
        )}

        {/* Book Catalogue with instant filters, custom covers & search */}
        {content.visibility?.bookCatalogue !== false && (
          <BookCatalogue
            onSelectBook={(book) => setSelectedBook(book)}
            onQuickPreOrder={(book) => handleOpenPreOrder(book)}
          />
        )}

        {/* How Book Pre-Ordering Works (4 Steps) */}
        {content.visibility?.howItWorks !== false && (
          <HowItWorks />
        )}

        {/* Smart Business Model: Inventory, Selection, Economics */}
        {content.visibility?.businessModel !== false && (
          <BusinessModel />
        )}

        {/* Physical Stall Exclusives: Bangles & Cakes */}
        {content.visibility?.stallProducts !== false && (
          <StallProducts />
        )}

        {/* Meet Our BizVenture Store & Student Team */}
        {content.visibility?.about !== false && (
          <AboutSection />
        )}
      </main>

      {/* Footer */}
      {content.visibility?.footer !== false && (
        <Footer
          onBrowseBooks={() => scrollToSection('books')}
          onOpenOrders={() => setIsOrdersDrawerOpen(true)}
        />
      )}

      {/* Book Detail Modal */}
      <BookDetailsModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onPreOrder={(book) => {
          setSelectedBook(null);
          handleOpenPreOrder(book);
        }}
      />

      {/* Pre-Order Modal & Confirmation Form */}
      <PreOrderModal
        initialBook={preOrderTargetBook}
        isOpen={isPreOrderOpen}
        onClose={() => setIsPreOrderOpen(false)}
      />

      {/* Pre-Orders Tracking Drawer */}
      <OrdersDrawer
        isOpen={isOrdersDrawerOpen}
        onClose={() => setIsOrdersDrawerOpen(false)}
        onNewPreOrder={() => {
          setIsOrdersDrawerOpen(false);
          handleOpenPreOrder();
        }}
        onReOrder={(bookTitle, bookId) => {
          setIsOrdersDrawerOpen(false);
          const currentBooks = getStoredBooks();
          const target = currentBooks.find(
            (b) => b.id === bookId || b.title.toLowerCase() === bookTitle.toLowerCase()
          ) || currentBooks[0] || BOOKS_DATA[0];
          handleOpenPreOrder(target);
        }}
      />

    </div>
  );
}
