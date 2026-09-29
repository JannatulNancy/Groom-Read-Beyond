import React, { useState, useEffect } from 'react';
import { STORE_CONFIG } from '../config/storeConfig';
import { getStoredSiteContent } from '../services/db';
import { SiteContent } from '../types';
import { QrCode, BookOpen, Smartphone, Check, Copy, ExternalLink, Sparkles } from 'lucide-react';

interface QRSectionProps {
  onBrowseBooks: () => void;
}

export const QRSection: React.FC<QRSectionProps> = ({ onBrowseBooks }) => {
  const [copied, setCopied] = useState(false);
  const [simulatedScan, setSimulatedScan] = useState(false);
  const [content, setContent] = useState<SiteContent>(getStoredSiteContent());

  useEffect(() => {
    const handleUpdate = () => setContent(getStoredSiteContent());
    window.addEventListener('bizventure-content-updated', handleUpdate);
    return () => window.removeEventListener('bizventure-content-updated', handleUpdate);
  }, []);

  // Fallback demo URL if window is not ready
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://groom-read-beyond-bizventure-2026.ai.studio/';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = () => {
    setSimulatedScan(true);
    setTimeout(() => {
      setSimulatedScan(false);
      onBrowseBooks();
    }, 900);
  };

  return (
    <section id="qr-section" className="py-16 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/70">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 lg:p-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: QR Code Display Area */}
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
              <div className="relative p-5 bg-white rounded-2xl border-2 border-sky-400 shadow-lg group">
                
                {/* Visual QR Code Container or Uploaded Stand Photo */}
                <div className="w-52 h-52 sm:w-56 sm:h-56 bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden">
                  {content.qrSection?.image ? (
                    <img
                      src={content.qrSection.image}
                      alt="Stall QR Stand"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    /* Clean SVG QR Pattern Representation */
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full text-white fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Top-left corner finder */}
                      <rect x="5" y="5" width="26" height="26" rx="3" fill="#38bdf8" />
                      <rect x="9" y="9" width="18" height="18" rx="2" fill="#0f172a" />
                      <rect x="13" y="13" width="10" height="10" rx="1.5" fill="#38bdf8" />

                      {/* Top-right corner finder */}
                      <rect x="69" y="5" width="26" height="26" rx="3" fill="#38bdf8" />
                      <rect x="73" y="9" width="18" height="18" rx="2" fill="#0f172a" />
                      <rect x="77" y="13" width="10" height="10" rx="1.5" fill="#38bdf8" />

                      {/* Bottom-left corner finder */}
                      <rect x="5" y="69" width="26" height="26" rx="3" fill="#38bdf8" />
                      <rect x="9" y="73" width="18" height="18" rx="2" fill="#0f172a" />
                      <rect x="13" y="77" width="10" height="10" rx="1.5" fill="#38bdf8" />

                      {/* QR data matrix modules */}
                      <rect x="36" y="8" width="5" height="5" />
                      <rect x="46" y="8" width="5" height="5" />
                      <rect x="56" y="8" width="5" height="5" />
                      <rect x="36" y="18" width="5" height="5" />
                      <rect x="56" y="18" width="5" height="5" />
                      <rect x="41" y="26" width="5" height="5" />
                      <rect x="51" y="26" width="5" height="5" />

                      <rect x="8" y="36" width="5" height="5" />
                      <rect x="18" y="36" width="5" height="5" />
                      <rect x="26" y="41" width="5" height="5" />
                      <rect x="8" y="56" width="5" height="5" />
                      <rect x="23" y="56" width="5" height="5" />

                      <rect x="36" y="36" width="28" height="28" rx="4" fill="#0284c7" />
                      <rect x="40" y="40" width="20" height="20" rx="3" fill="#ffffff" />
                      <text x="50" y="54" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#0284c7">GRB</text>

                      <rect x="69" y="36" width="5" height="5" />
                      <rect x="79" y="36" width="5" height="5" />
                      <rect x="89" y="36" width="5" height="5" />
                      <rect x="69" y="46" width="5" height="5" />
                      <rect x="84" y="46" width="5" height="5" />
                      <rect x="74" y="56" width="5" height="5" />
                      <rect x="89" y="56" width="5" height="5" />

                      <rect x="36" y="69" width="5" height="5" />
                      <rect x="46" y="69" width="5" height="5" />
                      <rect x="56" y="69" width="5" height="5" />
                      <rect x="41" y="79" width="5" height="5" />
                      <rect x="51" y="79" width="5" height="5" />
                      <rect x="36" y="89" width="5" height="5" />
                      <rect x="56" y="89" width="5" height="5" />

                      <rect x="69" y="69" width="5" height="5" />
                      <rect x="79" y="74" width="5" height="5" />
                      <rect x="89" y="69" width="5" height="5" />
                      <rect x="74" y="84" width="5" height="5" />
                      <rect x="84" y="84" width="5" height="5" />
                      <rect x="89" y="89" width="5" height="5" />
                    </svg>
                  )}

                  {/* Scanning animation effect */}
                  {simulatedScan && (
                    <div className="absolute inset-0 bg-sky-500/20 backdrop-blur-[1px] flex items-center justify-center animate-pulse">
                      <div className="w-full h-1 bg-sky-400 shadow-[0_0_12px_#38bdf8] animate-bounce" />
                    </div>
                  )}
                </div>

                {/* Badge under QR */}
                <div className="mt-3 text-center">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 block">
                    [{content.store.storeName.toUpperCase()} QR CODE]
                  </span>
                  <span className="text-[10px] text-sky-600 font-medium">
                    Displayed physically at {content.store.stallNumber}
                  </span>
                </div>
              </div>

              {/* Simulate Scan Button for Judges & Testers */}
              <button
                onClick={handleSimulateScan}
                disabled={simulatedScan}
                className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                <span>{simulatedScan ? 'Simulating Scan...' : 'Simulate Stall Phone Scan'}</span>
              </button>
            </div>

            {/* Right Column: Explanatory Content */}
            <div className="md:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5" />
                {content.qrSection?.badge || 'Stall QR Experience'}
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-sky-600">
                  📱 At the Stall?
                </h3>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight mt-1">
                  {content.qrSection?.title || 'Scan. Browse. Pre-Order.'}
                </h2>
              </div>

              <div className="space-y-2 text-slate-600 text-base leading-relaxed">
                <p className="font-medium text-slate-800">
                  {content.qrSection?.subtitle || 'Can\'t find the book you\'re looking for at our physical stall?'}
                </p>
                <p>
                  Scan the QR code and explore our full online catalogue. Place an instant pre-order, and our team will source and prepare it for you.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={onBrowseBooks}
                  className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Browse Book Collection</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Catalogue Link Copied!' : 'Copy Stall Link'}</span>
                </button>
              </div>

              {/* Judge / Stall Note */}
              <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Stall Operations:</strong> Printed QR posters placed at table corners enable simultaneous multi-visitor browsing without crowding physical shelf space.
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
