import React, { useState, useEffect } from 'react';
import { getStoredSiteContent } from '../services/db';
import { Lightbulb, Users, Compass, Sparkles } from 'lucide-react';
import { SiteContent } from '../types';
import { normalizeImageUrl } from '../utils/imageUrl';

export const AboutSection: React.FC = () => {
  const [content, setContent] = useState<SiteContent>(getStoredSiteContent());

  useEffect(() => {
    const handleUpdate = () => setContent(getStoredSiteContent());
    window.addEventListener('bizventure-content-updated', handleUpdate);
    return () => window.removeEventListener('bizventure-content-updated', handleUpdate);
  }, []);

  const ab = content.about;

  return (
    <section id="about" className="py-16 sm:py-20 bg-white border-b border-slate-200/70">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Card Container */}
        <div className="bg-gradient-to-br from-sky-50 via-white to-amber-50/40 rounded-3xl border border-sky-100 p-8 sm:p-12 shadow-sm text-center space-y-8">
          
          {/* Header */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Student Entrepreneurship
            </div>

            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
              {ab.title}
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              {ab.teamStory}
            </p>

            {ab.teamPhoto && (
              <div className="max-w-xl mx-auto rounded-2xl overflow-hidden aspect-[16/9] shadow-md border border-slate-200 mt-4">
                <img
                  src={normalizeImageUrl(ab.teamPhoto, '/images/hero_bizventure_stall_1790615311084.jpg')}
                  alt={ab.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/hero_bizventure_stall_1790615311084.jpg';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Three Categories Pill Banner */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-2 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200 shadow-2xs text-xs sm:text-sm font-bold text-slate-800">
            <span className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-900">
              📚 Books & Reading
            </span>
            <span className="text-slate-300">•</span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900">
              💍 Handmade Bangles (Churi)
            </span>
            <span className="text-slate-300">•</span>
            <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-900">
              🎂 Foods & Treats
            </span>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left">
            
            <div className="bg-white/80 rounded-2xl p-5 border border-slate-100 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm font-display">
                {ab.value1Title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {ab.value1Desc}
              </p>
            </div>

            <div className="bg-white/80 rounded-2xl p-5 border border-slate-100 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm font-display">
                {ab.value2Title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {ab.value2Desc}
              </p>
            </div>

            <div className="bg-white/80 rounded-2xl p-5 border border-slate-100 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm font-display">
                {ab.value3Title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {ab.value3Desc}
              </p>
            </div>

          </div>

          {/* Closing Team Signature */}
          <div className="pt-4 border-t border-sky-100/80 text-xs font-semibold text-sky-900">
            {ab.closingQuote}
          </div>

        </div>

      </div>
    </section>
  );
};
