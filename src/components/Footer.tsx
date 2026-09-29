import React, { useState, useEffect } from 'react';
import { getStoredSiteContent } from '../services/db';
import { MapPin, Calendar, Clock, Phone, MessageSquare, Mail, Sparkles, BookOpen, Heart, ShieldCheck } from 'lucide-react';
import { SiteContent } from '../types';

interface FooterProps {
  onBrowseBooks: () => void;
  onOpenOrders: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onBrowseBooks,
  onOpenOrders,
  onOpenAdmin,
}) => {
  const [content, setContent] = useState<SiteContent>(getStoredSiteContent());

  useEffect(() => {
    const handleUpdate = () => setContent(getStoredSiteContent());
    window.addEventListener('bizventure-content-updated', handleUpdate);
    return () => window.removeEventListener('bizventure-content-updated', handleUpdate);
  }, []);

  const footer = content.footer || {
    brandName: content.store.storeName,
    tagline: content.store.storeTagline,
    description: 'A student-run physical stall and smart book pre-order ecosystem for BizVenture 2026. Combining physical retail delights with an on-demand digital book collection.',
    eventName: `${content.store.eventName} • ${content.store.organizer}`,
    stallLocation: content.store.institution,
    stallNumber: content.store.stallNumber,
    date: content.store.date,
    openingHours: 'Festival Day: 9:00 AM – 6:00 PM',
    offeringsTitle: 'Store Offerings',
    offering1: '📚 Curated Books & Smart Pre-Orders',
    offering2: '💍 Handmade Bangles (Churi) at Stall',
    offering3: '🎂 Fresh Homemade Treats & Celebrations',
    linksTitle: 'Navigation & Stall Desk',
    contactTitle: 'Stall Contacts & Pre-Orders',
    contactPhone: content.store.stallContactPhone,
    contactWhatsApp: content.store.stallWhatsApp,
    contactEmail: 'groomreadbeyond@gmail.com',
    badge1: '🚪 Anywhere Door to Knowledge',
    badge2: '🔔 100% Student Powered',
    badge3: '✨ Good Vibes Only ♡',
    copyrightText: `© 2026 ${content.store.storeName} · ${content.store.institution}`,
    bottomQuote: content.store.bannerBottomQuote,
  };

  const cleanPhone = (footer.contactPhone || '').replace(/[^0-9+]/g, '');
  const cleanWhatsApp = (footer.contactWhatsApp || '').replace(/[^0-9]/g, '');

  return (
    <footer className="relative bg-gradient-to-b from-[#034078] via-[#002855] to-[#001833] text-white pt-16 pb-12 border-t-4 border-sky-400 overflow-hidden shadow-2xl">
      
      {/* Decorative Cloud & Whimsical Sky Glow */}
      <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-sky-400 via-rose-400 via-amber-400 to-sky-400 opacity-90" />
      <div className="absolute top-0 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Top Feature Badges Row (Doraemon & Anywhere Door Theme) */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pb-2">
          {footer.badge1 && (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/40 text-xs font-bold tracking-wide shadow-sm">
              <span>{footer.badge1}</span>
            </span>
          )}
          {footer.badge2 && (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/40 text-xs font-bold tracking-wide shadow-sm">
              <span>{footer.badge2}</span>
            </span>
          )}
          {footer.badge3 && (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/40 text-xs font-bold tracking-wide shadow-sm">
              <span>{footer.badge3}</span>
            </span>
          )}
        </div>

        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Column 1: Brand & Mascot Identity (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-400 to-amber-300 text-white flex items-center justify-center text-lg font-black shadow-md border-2 border-white/20">
                🔔
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
                  <span>{footer.brandName}</span>
                </h3>
                <span className="text-xs text-rose-300 font-semibold italic block">
                  {footer.tagline}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-sky-100/80 leading-relaxed max-w-md">
              {footer.description}
            </p>

            {/* Event & Location Tag Pills */}
            <div className="space-y-2 pt-1 text-xs text-sky-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{footer.date} • {footer.openingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{footer.stallLocation} (<strong className="text-white font-mono">{footer.stallNumber}</strong>)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Offerings Showcase (2 cols) */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>{footer.offeringsTitle}</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-sky-100/90">
              <li className="flex items-start gap-2">
                <span className="shrink-0">📚</span>
                <span>{footer.offering1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0">💍</span>
                <span>{footer.offering2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0">🎂</span>
                <span>{footer.offering3}</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation (2 cols) */}
          <div className="md:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">
              {footer.linksTitle}
            </h4>
            <ul className="space-y-2 text-xs text-sky-100/80">
              <li>
                <button
                  onClick={onBrowseBooks}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                >
                  Browse Books
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-amber-300 transition-colors">
                  How Pre-Orders Work
                </a>
              </li>
              <li>
                <a href="#business-model" className="hover:text-amber-300 transition-colors">
                  Business Model
                </a>
              </li>
              <li>
                <a href="#stall-products" className="hover:text-amber-300 transition-colors">
                  Bangles & Treats
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenOrders}
                  className="text-amber-300 hover:text-amber-200 font-semibold transition-colors cursor-pointer text-left"
                >
                  Check Pre-Orders
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-rose-300 hover:text-rose-200 font-bold transition-colors cursor-pointer text-left"
                >
                  ⚙️ Admin Page (CMS)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & WhatsApp (2 cols) */}
          <div className="md:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
              {footer.contactTitle}
            </h4>
            
            <div className="space-y-2.5 text-xs">
              {footer.contactPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex items-center gap-2 text-sky-200 hover:text-white transition-colors group"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                  <span className="truncate">{footer.contactPhone}</span>
                </a>
              )}

              {footer.contactWhatsApp && (
                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent('Hello Groom, Read & Beyond Stall #07 Team!')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-300 hover:text-emerald-200 transition-colors font-medium group"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>WhatsApp Stall</span>
                </a>
              )}

              {footer.contactEmail && (
                <a
                  href={`mailto:${footer.contactEmail}`}
                  className="flex items-center gap-2 text-sky-200 hover:text-white transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span className="truncate">{footer.contactEmail}</span>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Middle Notice Bar: Festive Celebration Ribbon */}
        <div className="p-4 sm:p-5 rounded-2xl bg-sky-950/60 border border-sky-400/30 flex flex-col sm:flex-row items-center justify-between text-xs text-sky-200 gap-3 text-center sm:text-left backdrop-blur-sm">
          <div className="font-semibold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
            <span>{footer.eventName}</span>
          </div>
          <div className="text-amber-300 font-medium">
            Where grooming meets wisdom: Curated Books • Handcrafted Churi • Homemade Treats
          </div>
          <div className="font-mono text-sky-300 font-bold bg-sky-900/80 px-3 py-1 rounded-lg border border-sky-700/50">
            {footer.stallNumber} Live
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-6 border-t border-sky-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-sky-300/80 gap-3">
          <div>
            {footer.copyrightText}
          </div>
          <div className="italic text-center sm:text-right text-rose-300/90 font-medium">
            "{footer.bottomQuote}"
          </div>
        </div>

      </div>
    </footer>
  );
};
