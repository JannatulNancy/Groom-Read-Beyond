import React, { useState, useEffect } from 'react';
import { STORE_CONFIG } from '../config/storeConfig';
import { getStoredSiteContent } from '../services/db';
import { SiteContent } from '../types';
import { normalizeImageUrl } from '../utils/imageUrl';
import { QrCode, BookOpen, Smartphone, Check, Copy, ExternalLink, Sparkles, Download, Phone, MessageCircle } from 'lucide-react';

interface QRSectionProps {
  onBrowseBooks: () => void;
}

export const QRSection: React.FC<QRSectionProps> = ({ onBrowseBooks }) => {
  const [copied, setCopied] = useState(false);
  const [simulatedScan, setSimulatedScan] = useState(false);
  const [content, setContent] = useState<SiteContent>(getStoredSiteContent());

  useEffect(() => {
    const handleUpdate = (e?: Event) => {
      const detail = (e as CustomEvent)?.detail;
      setContent(detail || getStoredSiteContent());
    };
    window.addEventListener('bizventure-content-updated', handleUpdate);
    return () => window.removeEventListener('bizventure-content-updated', handleUpdate);
  }, []);

  // Canonical customer storefront URL to encode into QR code
  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}/`
    : 'https://groom-read-beyond-bizventure-2026.ai.studio/';

  // High-res scannable QR code API (100% readable by any phone camera)
  const scannableQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=0284c7&bgcolor=ffffff&data=${encodeURIComponent(currentUrl)}`;

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

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = content.qrSection?.image || scannableQrUrl;
    link.target = '_blank';
    link.download = `Groom_Read_Beyond_Stall09_QR_Poster.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const contactPhone = content.footer?.contactPhone || content.store.stallContactPhone || '+880 1617870432';
  const cleanPhone = contactPhone.replace(/[^0-9+]/g, '');

  return (
    <section id="qr-section" className="py-16 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/70">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 lg:p-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: QR Code Display Area */}
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
              <div className="relative p-5 bg-white rounded-2xl border-2 border-sky-400 shadow-lg group">
                
                {/* Visual QR Code Container or Uploaded Stand Photo */}
                <div className="w-56 h-56 sm:w-60 sm:h-60 bg-white rounded-2xl p-2.5 flex flex-col items-center justify-center relative overflow-hidden border border-slate-200 shadow-inner">
                  {content.qrSection?.image ? (
                    <img
                      src={normalizeImageUrl(content.qrSection.image)}
                      alt="Stall QR Stand"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    /* Real Scannable High-Res QR Code */
                    <div className="relative w-full h-full flex flex-col items-center justify-center bg-white p-1">
                      <img
                        src={scannableQrUrl}
                        alt="Scan to open Groom, Read & Beyond online catalogue"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      {/* Center Badge */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-md border-2 border-sky-500 flex items-center justify-center text-xs font-black text-sky-600">
                          🔔
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scanning animation effect */}
                  {simulatedScan && (
                    <div className="absolute inset-0 bg-sky-500/20 backdrop-blur-[1px] flex items-center justify-center animate-pulse">
                      <div className="w-full h-1 bg-sky-400 shadow-[0_0_12px_#38bdf8] animate-bounce" />
                    </div>
                  )}
                </div>

                {/* Badge under QR */}
                <div className="mt-3 text-center space-y-1">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-slate-800 block">
                    [{content.store.storeName.toUpperCase()} OFFICIAL QR]
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold block flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Point phone camera to scan live</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons under QR */}
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-2 w-full max-w-xs">
                <button
                  onClick={handleSimulateScan}
                  disabled={simulatedScan}
                  className="flex-1 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl border border-sky-200 transition-colors cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                  <span>{simulatedScan ? 'Simulating Scan...' : 'Test QR Scan'}</span>
                </button>

                <button
                  onClick={handleDownloadQr}
                  className="flex-1 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                  title="Download printable high-res QR for physical tabletop display"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Save QR Poster</span>
                </button>
              </div>
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
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                  <span>{copied ? 'Catalogue Link Copied!' : 'Copy Stall Link'}</span>
                </button>

                {contactPhone && (
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors cursor-pointer"
                    title="Call Stall #09 Desk"
                  >
                    <Phone className="w-4 h-4 text-sky-600" />
                    <span>Call Stall Desk: {contactPhone}</span>
                  </a>
                )}
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
