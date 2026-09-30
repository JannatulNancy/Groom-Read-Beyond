import React, { useState, useEffect } from 'react';
import { getStoredSiteContent } from '../services/db';
import { MapPin, Store, CheckCircle2 } from 'lucide-react';
import { SiteContent } from '../types';
import { normalizeImageUrl } from '../utils/imageUrl';

export const StallProducts: React.FC = () => {
  const [content, setContent] = useState<SiteContent>(getStoredSiteContent());

  useEffect(() => {
    const handleUpdate = () => setContent(getStoredSiteContent());
    window.addEventListener('bizventure-content-updated', handleUpdate);
    return () => window.removeEventListener('bizventure-content-updated', handleUpdate);
  }, []);

  const bangles = content.stallProducts.bangles;
  const cakes = content.stallProducts.cakes;

  return (
    <section id="stall-products" className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Store className="w-3.5 h-3.5 text-amber-600" />
            Physical Stall Exclusives
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Also Available at Our Stall
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            In addition to our book collection, drop by <strong className="font-semibold text-slate-900">{content.store.stallNumber}</strong> to discover our freshly baked delicacies and artisan bangles.
          </p>
        </div>

        {/* 2 Showcase Cards for Bangles & Treats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Card 1: Bangles */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                <img
                  src={normalizeImageUrl(bangles.image, '/images/Bangles.png')}
                  alt={bangles.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/Bangles.png';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                  <span>💍</span>
                  <span>Physical Stall Only</span>
                </div>

                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md font-mono tabular-nums">
                  {bangles.priceRange}
                </div>
              </div>

              <div className="p-6 sm:p-7 space-y-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    {bangles.tagline}
                  </div>
                  <h3 className="text-2xl font-bold font-display text-slate-900">
                    {bangles.name}
                  </h3>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {bangles.description}
                </p>

                <ul className="space-y-2 pt-2 border-t border-slate-100">
                  {bangles.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 pt-0">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span>Visit our stall to explore them!</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Sold directly at {content.store.stallNumber} • No online ordering
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Cakes & Treats */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                <img
                  src={normalizeImageUrl(cakes.image, '/images/Cakes.png')}
                  alt={cakes.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/Cakes.png';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                  <span>🎂</span>
                  <span>Physical Stall Only</span>
                </div>

                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md font-mono tabular-nums">
                  {cakes.priceRange}
                </div>
              </div>

              <div className="p-6 sm:p-7 space-y-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    {cakes.tagline}
                  </div>
                  <h3 className="text-2xl font-bold font-display text-slate-900">
                    {cakes.name}
                  </h3>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {cakes.description}
                </p>

                <ul className="space-y-2 pt-2 border-t border-slate-100">
                  {cakes.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 pt-0">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span>Visit our stall to explore them!</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Sold directly at {content.store.stallNumber} • No online ordering
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
