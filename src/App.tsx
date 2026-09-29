import React, { useState, useEffect } from 'react';
import { Book, PreOrder, SiteContent } from './types';
import { BOOKS_DATA } from './data/books';
import { getStoredBooks, getStoredSiteContent } from './services/db';
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
import { Settings, ShieldCheck } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'store' | 'admin'>('store');
  const [content, setContent] = useState<SiteContent>(getStoredSiteContent());
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isPreOrderOpen, setIsPreOrderOpen] = useState(false);
  const [preOrderTargetBook, setPreOrderTargetBook] = useState<Book | null>(null);
  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Keep site content synced with DB / localStorage events
  useEffect(() => {
    const handleContentUpdate = () => setContent(getStoredSiteContent());
    window.addEventListener('bizventure-content-updated', handleContentUpdate);
    return () => window.removeEventListener('bizventure-content-updated', handleContentUpdate);
  }, []);

  // Listen to hash changes e.g. #admin to toggle admin view directly
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setViewMode('admin');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Track active scroll section for navbar indicator
  useEffect(() => {
    if (viewMode !== 'store') return;

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
  }, [viewMode]);

  const scrollToSection = (id: string) => {
    if (viewMode !== 'store') {
      setViewMode('store');
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

  // If in Admin Mode, render the complete Admin Panel
  if (viewMode === 'admin') {
    return (
      <AdminPanel
        onSwitchToStore={() => {
          setViewMode('store');
          window.location.hash = '';
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 antialiased font-sans">
      
      {/* Top Admin Quick Bar for Stall Team with Doraemon Festive Theme */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-rose-500 text-white text-[11px] py-1.5 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            <span className="font-bold">BizVenture 2026 Live Mode</span>
            <span className="text-sky-200">·</span>
            <span className="text-white/90 font-medium">Stall #07 • Where grooming meets wisdom...</span>
          </div>

          <button
            onClick={() => setViewMode('admin')}
            className="flex items-center gap-1.5 text-amber-200 hover:text-white font-bold transition-colors cursor-pointer bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Admin Page (Edit Books, Footer & CMS)</span>
          </button>
        </div>
      </div>

      {/* Sticky Universal Top Navigation */}
      <Navbar
        onOpenOrders={() => setIsOrdersDrawerOpen(true)}
        onBrowseBooks={() => scrollToSection('books')}
        onOpenAdmin={() => setViewMode('admin')}
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
          onOpenAdmin={() => setViewMode('admin')}
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
