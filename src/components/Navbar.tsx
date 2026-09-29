import React, { useState, useEffect } from 'react';
import { STORE_CONFIG } from '../config/storeConfig';
import { getStoredOrders, getStoredSiteContent } from '../services/db';
import { Menu, X, BookOpen, ClipboardList, Settings, Sparkles } from 'lucide-react';
import { SiteContent } from '../types';

interface NavbarProps {
  onOpenOrders: () => void;
  onBrowseBooks: () => void;
  onOpenAdmin: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenOrders,
  onBrowseBooks,
  onOpenAdmin,
  activeSection
}) => {
  const [orderCount, setOrderCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [content, setContent] = useState<SiteContent>(getStoredSiteContent());

  const updateData = () => {
    setOrderCount(getStoredOrders().length);
    setContent(getStoredSiteContent());
  };

  useEffect(() => {
    updateData();
    window.addEventListener('bizventure-order-created', updateData);
    window.addEventListener('bizventure-content-updated', updateData);
    return () => {
      window.removeEventListener('bizventure-order-created', updateData);
      window.removeEventListener('bizventure-content-updated', updateData);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Books', href: '#books' },
    { name: 'Concept', href: '#concept' },
    { name: 'Stall Treats', href: '#stall-products' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'About', href: '#about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-2.5'
          : 'bg-white/90 backdrop-blur-xs border-b border-slate-100 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#hero"
          className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2 group shrink-0"
        >
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-sky-400 to-amber-300 text-white flex items-center justify-center text-sm font-black shadow-xs group-hover:scale-105 transition-transform border border-sky-200">
            🔔
          </span>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-sky-600 transition-colors flex items-center gap-1.5">
              {content.store.storeName}
              <span className="hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold font-sans">
                Stall #09
              </span>
            </span>
            <span className="text-[10px] text-rose-500 font-semibold tracking-normal mt-0.5 hidden sm:block italic">
              {content.store.storeTagline}
            </span>
          </div>
        </a>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
          {navLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`transition-colors hover:text-sky-600 relative py-1 ${
                activeSection === item.href.replace('#', '')
                  ? 'text-sky-600 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-sky-500'
                  : ''
              }`}
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Zone 3: Primary Actions + Admin Panel switch */}
        <div className="flex items-center gap-2">
          
          {/* Admin Panel Trigger */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 rounded-lg transition-colors cursor-pointer"
            title="Open Admin Page to edit books, landing page sections, and view order database"
          >
            <Settings className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">Admin Panel</span>
          </button>

          {/* Orders Drawer Trigger */}
          <button
            onClick={onOpenOrders}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
            title="View submitted pre-orders"
          >
            <ClipboardList className="w-3.5 h-3.5 text-slate-600" />
            <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-mono font-bold text-sky-700 bg-sky-100 rounded-full">
              {orderCount}
            </span>
          </button>

          {/* Primary CTA */}
          <button
            onClick={onBrowseBooks}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Browse Books</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 shadow-lg">
          <div className="text-xs font-medium text-slate-400 px-3 py-1 uppercase tracking-wider">
            {content.store.eventName} • {content.store.stallNumber}
          </div>
          {navLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            >
              {item.name}
            </a>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 rounded-lg cursor-pointer"
            >
              <Settings className="w-4 h-4 text-sky-600" />
              <span>Go to Admin Panel (Edit Books & Content)</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBrowseBooks();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 rounded-lg shadow-xs cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Books Catalogue</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
