import React, { useState, useEffect } from 'react';
import { getStoredSiteContent } from '../services/db';
import { TrendingDown, BookCopy, Users2, CheckCircle2, XCircle } from 'lucide-react';
import { SiteContent } from '../types';

export const BusinessModel: React.FC = () => {
  const [content, setContent] = useState<SiteContent>(getStoredSiteContent());

  useEffect(() => {
    const handleUpdate = (e?: Event) => {
      const detail = (e as CustomEvent)?.detail;
      setContent(detail || getStoredSiteContent());
    };
    window.addEventListener('bizventure-content-updated', handleUpdate);
    return () => window.removeEventListener('bizventure-content-updated', handleUpdate);
  }, []);

  const bm = content.businessModel;

  return (
    <section id="business-model" className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            Judges' Strategic Insight
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            {bm.title}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            {bm.subtitle}
          </p>
        </div>

        {/* 3 Core Strategic Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {bm.pillar1Title}
            </h3>
            <p className="text-sm font-semibold text-emerald-600 mt-1 mb-2">
              {bm.pillar1Sub}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              {bm.pillar1Desc}
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5">
              <BookCopy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {bm.pillar2Title}
            </h3>
            <p className="text-sm font-semibold text-sky-600 mt-1 mb-2">
              {bm.pillar2Sub}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              {bm.pillar2Desc}
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <Users2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {bm.pillar3Title}
            </h3>
            <p className="text-sm font-semibold text-indigo-600 mt-1 mb-2">
              {bm.pillar3Sub}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              {bm.pillar3Desc}
            </p>
          </div>

        </div>

        {/* Comparison Module for BizVenture Judges */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider block">
                BizVenture 2026 Competitive Advantage
              </span>
              <h4 className="text-base font-bold font-display">
                Traditional University Stall vs. Our Hybrid Pre-Order Model
              </h4>
            </div>
            <span className="text-xs font-medium text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              Working Capital Saved: +{bm.capitalEfficiency}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            
            {/* Traditional Model */}
            <div className="p-6 space-y-4 bg-rose-50/30">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Traditional Physical-Only Stall</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Must purchase 50+ books upfront without knowing exact demand.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>High risk of dead stock & capital locked after the 1-day event ends.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Physical table clutter restricts room for bangles and bakery items.</span>
                </li>
              </ul>
            </div>

            {/* Our Model */}
            <div className="p-6 space-y-4 bg-emerald-50/30">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Our Hybrid Retail Model ({content.store.storeName})</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Stock only 5–6 display samples; collect pre-orders for the rest.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Zero leftover inventory risk — order fulfillment matched to confirmed buyers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Ample table space preserved for high-margin impulse bangles & fresh cakes!</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
