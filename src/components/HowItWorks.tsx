import React, { useState, useEffect } from 'react';
import { QrCode, Search, ClipboardCheck, PhoneCall, ArrowRight } from 'lucide-react';
import { getStoredSiteContent } from '../services/db';
import { SiteContent } from '../types';

export const HowItWorks: React.FC = () => {
  const [content, setContent] = useState<SiteContent>(getStoredSiteContent());

  useEffect(() => {
    const handleUpdate = () => setContent(getStoredSiteContent());
    window.addEventListener('bizventure-content-updated', handleUpdate);
    return () => window.removeEventListener('bizventure-content-updated', handleUpdate);
  }, []);

  const icons = [QrCode, Search, ClipboardCheck, PhoneCall];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-white border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider mb-2">
            Seamless Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            {content.howItWorks.title}
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            {content.howItWorks.subtitle}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {content.howItWorks.steps.map((item, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div
                key={item.step}
                className="relative bg-slate-50/80 hover:bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black font-display text-sky-600/80 group-hover:text-sky-600 transition-colors">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 group-hover:bg-sky-50 group-hover:text-sky-600 group-hover:border-sky-200 transition-all shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold font-display text-slate-900 group-hover:text-sky-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm font-semibold text-slate-800 mt-1 mb-2">
                    {item.action}
                  </p>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Step {index + 1} of 4</span>
                  {index < 3 && <ArrowRight className="w-3.5 h-3.5 text-slate-300 hidden lg:block" />}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
