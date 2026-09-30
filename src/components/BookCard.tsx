import React, { useState } from 'react';
import { Book } from '../types';
import { STORE_CONFIG } from '../config/storeConfig';
import { CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { normalizeImageUrl } from '../utils/imageUrl';

interface BookCardProps {
  book: Book;
  onSelectBook: (book: Book) => void;
  onQuickPreOrder: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onSelectBook,
  onQuickPreOrder,
}) => {
  const isAvailable = book.status === 'available';
  const [imageError, setImageError] = useState(false);
  const normalizedCover = normalizeImageUrl(book.coverImage);

  return (
    <div
      onClick={() => onSelectBook(book)}
      className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-sky-300 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Upper Book Visual / Cover */}
      <div className="relative p-5 pb-3 bg-slate-50 flex items-center justify-center border-b border-slate-100">
        
        {/* Book Cover Aesthetic Representation */}
        <div
          className={`w-36 h-48 sm:w-40 sm:h-52 rounded-r-lg rounded-l-xs shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br ${book.coverBg || 'from-sky-700 to-indigo-900'} p-3.5 flex flex-col justify-between text-white relative overflow-hidden`}
        >
          {/* Subtle book spine shadow on the left */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/25 border-r border-white/10 z-10" />

          {/* If custom cover image is uploaded or set */}
          {normalizedCover && !imageError ? (
            <div className="absolute inset-0 z-0">
              <img
                src={normalizedCover}
                alt={book.title}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </div>
          ) : null}

          {/* Book Header / Category */}
          <div className="pl-2 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/90 drop-shadow-xs block">
              {book.category}
            </span>
          </div>

          {/* Title & Author on Cover (if no cover image or as small label) */}
          <div className="pl-2 space-y-1 my-auto relative z-10">
            {(!normalizedCover || imageError) && (
              <>
                <h4 className="font-display font-bold text-sm sm:text-base leading-tight text-white drop-shadow-md line-clamp-3">
                  {book.title}
                </h4>
                <p className="text-[11px] text-white/90 line-clamp-1 font-medium drop-shadow-xs">
                  {book.author}
                </p>
              </>
            )}
          </div>

          {/* Bottom ornament */}
          <div className="pl-2 pt-1 border-t border-white/20 flex items-center justify-between text-[10px] text-white/90 font-mono relative z-10">
            <span>ISU 2026</span>
            <span>{STORE_CONFIG.currencySymbol}{book.price}</span>
          </div>
        </div>

        {/* Featured Bookmark Ribbon */}
        {book.featured && (
          <div className="absolute top-3 right-3 text-amber-500">
            <Sparkles className="w-4 h-4 fill-amber-400 text-amber-500" />
          </div>
        )}
      </div>

      {/* Book Metadata & Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Metadata row with zero-pill discipline */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-slate-700">{book.category}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{book.pages ? `${book.pages} pages` : 'Paperback'}</span>
          </div>

          {/* Book Title */}
          <h3 className="font-display font-bold text-slate-900 text-base leading-snug group-hover:text-sky-600 transition-colors line-clamp-1">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-slate-600 font-medium line-clamp-1 mt-0.5">
            By {book.author}
          </p>
        </div>

        {/* Status indicator row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Price</span>
            <span className="text-lg font-bold font-display text-slate-900 tabular-nums">
              {STORE_CONFIG.currencySymbol}{book.price}
            </span>
          </div>

          {/* Availability Status Badge */}
          <div>
            {isAvailable ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Available at Stall</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Pre-Order</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          {isAvailable ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectBook(book);
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <span>🟢 Buy at Stall</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickPreOrder(book);
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <span>🟡 Pre-Order</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
