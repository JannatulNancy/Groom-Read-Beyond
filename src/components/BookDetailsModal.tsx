import React from 'react';
import { Book } from '../types';
import { STORE_CONFIG } from '../config/storeConfig';
import { X, CheckCircle2, Clock, MapPin, BookOpen } from 'lucide-react';

interface BookDetailsModalProps {
  book: Book | null;
  onClose: () => void;
  onPreOrder: (book: Book) => void;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  book,
  onClose,
  onPreOrder,
}) => {
  if (!book) return null;

  const isAvailable = book.status === 'available';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 z-10 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 bg-white/80 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-12">
          
          {/* Left Column: Visual Cover */}
          <div className="sm:col-span-5 bg-slate-50 p-6 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-100">
            <div
              className={`w-44 h-64 rounded-r-xl rounded-l-xs shadow-xl bg-gradient-to-br ${book.coverBg || 'from-sky-700 to-indigo-900'} p-4 flex flex-col justify-between text-white relative overflow-hidden`}
            >
              {/* Spine line */}
              <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-black/25 border-r border-white/10 z-10" />

              {/* Custom Cover Image */}
              {book.coverImage && (
                <div className="absolute inset-0 z-0">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
                </div>
              )}

              <div className="pl-3 relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/90 drop-shadow-xs">
                  {book.category}
                </span>
              </div>

              <div className="pl-3 space-y-1 my-auto relative z-10">
                <h3 className="font-display font-bold text-lg leading-tight text-white drop-shadow-md">
                  {book.title}
                </h3>
                <p className="text-xs text-white/90 font-medium drop-shadow-xs">
                  {book.author}
                </p>
              </div>

              <div className="pl-3 pt-2 border-t border-white/20 flex items-center justify-between text-xs text-white/90 font-mono relative z-10">
                <span>ISU 2026</span>
                <span>{STORE_CONFIG.currencySymbol}{book.price}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Book Details & Actions */}
          <div className="sm:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md">
                  {book.category}
                </span>

                {isAvailable ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Available at Stall
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                    <Clock className="w-3.5 h-3.5" />
                    Pre-Order
                  </span>
                )}
              </div>

              {/* Title & Author */}
              <h2 className="text-2xl font-display font-extrabold text-slate-900 leading-tight">
                {book.title}
              </h2>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Author: {book.author}
              </p>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tabular-nums">
                  {STORE_CONFIG.currencySymbol}{book.price}
                </span>
                <span className="text-xs text-slate-400">
                  BizVenture 2026 Student Price
                </span>
              </div>

              {/* Description */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
                <p>{book.description}</p>
              </div>

              {/* Pre-Order Specific Explanation */}
              {!isAvailable ? (
                <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <span>📦 Pre-Order Item</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-normal">
                    “Currently not available at our physical stall. Submit your order and our team will confirm availability.”
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In Stock at Stall #09</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-normal">
                    {book.stallStock || 3} physical copies displayed at our stall. Visit us directly or reserve a copy!
                  </p>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  onClose();
                  onPreOrder(book);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Pre-Order This Book</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Back to Catalogue
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
