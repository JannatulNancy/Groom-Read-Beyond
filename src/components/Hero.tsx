import React, { useState, useEffect } from 'react';
import { STORE_CONFIG } from '../config/storeConfig';
import { getStoredSiteContent } from '../services/db';
import { BookOpen, Package, QrCode, Sparkles, MapPin, Calendar, Heart, ShieldAlert } from 'lucide-react';
import { SiteContent } from '../types';
import { normalizeImageUrl } from '../utils/imageUrl';

interface HeroProps {
  onBrowseBooks: () => void;
  onOpenPreOrder: () => void;
  onViewStallQr: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onBrowseBooks,
  onOpenPreOrder,
  onViewStallQr,
}) => {
  const [content, setContent] = useState<SiteContent>(getStoredSiteContent());

  useEffect(() => {
    const handleUpdate = () => setContent(getStoredSiteContent());
    window.addEventListener('bizventure-content-updated', handleUpdate);
    return () => window.removeEventListener('bizventure-content-updated', handleUpdate);
  }, []);

  return (
    <section id="hero" className="relative pt-24 pb-14 lg:pt-28 lg:pb-20 overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-sky-50/30">
      {/* Playful background ambient glow matching Doraemon & Anywhere Door Palette */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-sky-200/50 via-rose-100/40 to-amber-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                {content.hero.badge1}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                {content.hero.badge2}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                <span>Good Vibes Only ♡</span>
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-900 leading-[1.1] text-balance">
              {content.hero.titleLine1}{' '}
              <span className="bg-gradient-to-r from-sky-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                {content.hero.titleHighlight}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              {content.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onBrowseBooks}
                className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>{content.hero.primaryCtaText}</span>
              </button>

              <button
                onClick={onOpenPreOrder}
                className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Package className="w-4 h-4 text-amber-500" />
                <span>{content.hero.secondaryCtaText}</span>
              </button>

              <button
                onClick={onViewStallQr}
                className="flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Stall QR Code</span>
              </button>
            </div>

            {/* Metrics */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-display text-slate-900 tabular-nums">
                  {content.hero.stat1Value}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{content.hero.stat1Label}</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-display text-sky-600 tabular-nums">
                  {content.hero.stat2Value}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{content.hero.stat2Label}</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-display text-emerald-600 tabular-nums">
                  {content.hero.stat3Value}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{content.hero.stat3Label}</div>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Card (Configurable in Admin) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-white p-3 border border-slate-200 shadow-xl overflow-hidden group">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100">
                <img
                  src={normalizeImageUrl(content.heroCard?.image || content.store.bannerImage, '/images/Main_Pic.png')}
                  alt={`${content.store.storeName} Stall Banner`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.endsWith('/images/Main_Pic.png')) {
                      target.src = '/images/Main_Pic.png';
                    }
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {content.heroCard?.topTag && (
                  <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{content.heroCard.topTag}</span>
                  </div>
                )}

                {(content.heroCard?.badgePrimary || content.heroCard?.badgeSecondary) && (
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md border border-slate-100 flex items-center gap-1.5">
                    {content.heroCard.badgePrimary && (
                      <span className="text-sky-600 font-bold">{content.heroCard.badgePrimary}</span>
                    )}
                    {content.heroCard.badgePrimary && content.heroCard.badgeSecondary && (
                      <span className="text-slate-400">·</span>
                    )}
                    {content.heroCard.badgeSecondary && (
                      <span>{content.heroCard.badgeSecondary}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Lower summary box */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">
                    {content.heroCard?.footerTitle || 'Today at BizVenture:'}
                  </span>
                  <span className="text-sky-600 font-medium font-mono">
                    {content.heroCard?.footerSubtitle || content.store.stallNumber}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-sky-50 rounded-xl p-2.5 border border-sky-100">
                    <div className="text-base mb-0.5">{content.heroCard?.box1Emoji || '📚'}</div>
                    <div className="font-semibold text-sky-950">{content.heroCard?.box1Title || 'Books'}</div>
                    <div className="text-[10px] text-sky-600 mt-0.5">{content.heroCard?.box1Sub || 'Pre-Order + Stall'}</div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-100">
                    <div className="text-base mb-0.5">{content.heroCard?.box2Emoji || '💍'}</div>
                    <div className="font-semibold text-amber-950">{content.heroCard?.box2Title || 'Churi Bangles'}</div>
                    <div className="text-[10px] text-amber-700 mt-0.5">{content.heroCard?.box2Sub || 'Stall Exclusive'}</div>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-2.5 border border-rose-100">
                    <div className="text-base mb-0.5">{content.heroCard?.box3Emoji || '🎂'}</div>
                    <div className="font-semibold text-rose-950">{content.heroCard?.box3Title || 'Foods & Treats'}</div>
                    <div className="text-[10px] text-rose-700 mt-0.5">{content.heroCard?.box3Sub || 'Fresh at Stall'}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
