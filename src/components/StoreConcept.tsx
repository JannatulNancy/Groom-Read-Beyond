import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, Store, Sparkles } from 'lucide-react';
import { getStoredSiteContent } from '../services/db';
import { SiteContent } from '../types';
import { normalizeImageUrl } from '../utils/imageUrl';

interface StoreConceptProps {
  onExploreBooks: () => void;
  onExploreStallTreats: () => void;
}

export const StoreConcept: React.FC<StoreConceptProps> = ({
  onExploreBooks,
  onExploreStallTreats,
}) => {
  const [content, setContent] = useState<SiteContent>(getStoredSiteContent());

  useEffect(() => {
    const handleUpdate = () => setContent(getStoredSiteContent());
    window.addEventListener('bizventure-content-updated', handleUpdate);
    return () => window.removeEventListener('bizventure-content-updated', handleUpdate);
  }, []);

  return (
    <section id="concept" className="py-16 bg-white border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Store className="w-3.5 h-3.5 text-sky-600" />
            {content.concept.badge}
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            {content.concept.title}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            {content.concept.subtitle}
          </p>
        </div>

        {/* 3 Experience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: Books */}
          <div className="relative rounded-2xl p-6 sm:p-7 bg-sky-50/60 border-2 border-sky-300 hover:border-sky-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden">
            <div className="space-y-4">
              {(content.concept.booksImage || true) && (
                <div className="rounded-xl overflow-hidden aspect-[16/9] mb-3 bg-sky-100 shadow-2xs">
                  <img
                    src={normalizeImageUrl(content.concept.booksImage, '/images/White.jpg')}
                    alt={content.concept.booksHeading}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/White.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center text-xl shadow-xs">
                  📚
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100/90 px-3 py-1 rounded-full">
                  Online + Stall
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">{content.concept.booksHeading}</h3>
                <p className="text-sm font-semibold text-sky-600 mt-0.5">
                  {content.concept.booksSub}
                </p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {content.concept.booksDesc}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-sky-200/70">
              <button
                onClick={onExploreBooks}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Books</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Bangles */}
          <div className="relative rounded-2xl p-6 sm:p-7 bg-slate-50 border border-slate-200/90 hover:border-amber-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden">
            <div className="space-y-4">
              {(content.concept.banglesImage || true) && (
                <div className="rounded-xl overflow-hidden aspect-[16/9] mb-3 bg-amber-100 shadow-2xs">
                  <img
                    src={normalizeImageUrl(content.concept.banglesImage, '/images/Bangles.png')}
                    alt={content.concept.banglesHeading}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/Bangles.png';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs">
                  💍
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-3 py-1 rounded-full">
                  Stall Exclusive
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">{content.concept.banglesHeading}</h3>
                <p className="text-sm font-semibold text-amber-600 mt-0.5">
                  {content.concept.banglesSub}
                </p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {content.concept.banglesDesc}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200">
              <button
                onClick={onExploreStallTreats}
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-center transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Available at Physical Stall
                </span>
              </button>
            </div>
          </div>

          {/* Card 3: Cakes & Treats */}
          <div className="relative rounded-2xl p-6 sm:p-7 bg-slate-50 border border-slate-200/90 hover:border-rose-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden">
            <div className="space-y-4">
              {(content.concept.cakesImage || true) && (
                <div className="rounded-xl overflow-hidden aspect-[16/9] mb-3 bg-rose-100 shadow-2xs">
                  <img
                    src={normalizeImageUrl(content.concept.cakesImage, '/images/Cakes.png')}
                    alt={content.concept.cakesHeading}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/Cakes.png';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center text-xl shadow-xs">
                  🎂
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-100/90 px-3 py-1 rounded-full">
                  Fresh At Stall
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">{content.concept.cakesHeading}</h3>
                <p className="text-sm font-semibold text-rose-600 mt-0.5">
                  {content.concept.cakesSub}
                </p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {content.concept.cakesDesc}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200">
              <button
                onClick={onExploreStallTreats}
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-rose-400 text-center transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Available at Physical Stall
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Small Notice Bar */}
        <div className="mt-8 p-4 rounded-xl bg-sky-50 border border-sky-100 text-center text-xs text-sky-800 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            <strong>Note for BizVenture Visitors:</strong> Bangles & treats are sold directly at {content.store.stallNumber}. Books are open for both stall purchase and online pre-ordering.
          </span>
        </div>

      </div>
    </section>
  );
};
