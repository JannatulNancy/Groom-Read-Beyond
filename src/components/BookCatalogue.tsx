import React, { useState, useMemo, useEffect } from 'react';
import { Book, SiteContent } from '../types';
import { getStoredBooks, getStoredSiteContent } from '../services/db';
import { BookCard } from './BookCard';
import { Search, BookX, Sparkles } from 'lucide-react';
import { STORE_CONFIG } from '../config/storeConfig';

interface BookCatalogueProps {
  onSelectBook: (book: Book) => void;
  onQuickPreOrder: (book: Book) => void;
}

export const BookCatalogue: React.FC<BookCatalogueProps> = ({
  onSelectBook,
  onQuickPreOrder,
}) => {
  const [books, setBooks] = useState<Book[]>(getStoredBooks());
  const [content, setContent] = useState<SiteContent>(getStoredSiteContent());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const updateData = (e?: Event) => {
    const detail = (e as CustomEvent)?.detail;
    if (detail && Array.isArray(detail)) {
      setBooks(detail as Book[]);
    } else {
      setBooks(getStoredBooks());
    }
    if (detail && typeof detail === 'object' && 'bookCatalogue' in detail) {
      setContent(detail as SiteContent);
    } else {
      setContent(getStoredSiteContent());
    }
  };

  useEffect(() => {
    updateData();
    window.addEventListener('bizventure-books-updated', updateData);
    window.addEventListener('bizventure-content-updated', updateData);
    return () => {
      window.removeEventListener('bizventure-books-updated', updateData);
      window.removeEventListener('bizventure-content-updated', updateData);
    };
  }, []);

  // Compute dynamic category list from existing books
  const dynamicCategories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ['All', 'Available at Stall', 'Pre-Order', ...Array.from(set)];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        book.category.toLowerCase().includes(searchQuery.toLowerCase().trim());

      if (!matchesSearch) return false;

      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Available at Stall') return book.status === 'available';
      if (selectedFilter === 'Pre-Order') return book.status === 'preorder';
      return book.category === selectedFilter;
    });
  }, [books, searchQuery, selectedFilter]);

  const availableCount = books.filter((b) => b.status === 'available').length;
  const preorderCount = books.filter((b) => b.status === 'preorder').length;

  return (
    <section id="books" className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            {content.bookCatalogue?.badge || 'Curated Catalogue'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            {content.bookCatalogue?.title || 'Explore Our Books'}
          </h2>
          <p className="mt-2 text-base text-slate-600">
            {content.bookCatalogue?.subtitle || 'Browse physical stall books or pre-order titles from our extended student-curated collection.'}
          </p>

          {/* Quick counts bar */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
              🟢 {availableCount} Available at Stall #07
            </span>
            <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
              🟡 {preorderCount} Available for Pre-Order
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-4 mb-8">
          
          {/* Instant Search Box */}
          <div className="max-w-xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books by title, author, or genre..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-2 scrollbar-none px-1">
            {dynamicCategories.map((filter) => {
              const isActive = selectedFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

        </div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onSelectBook={onSelectBook}
                onQuickPreOrder={onQuickPreOrder}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 space-y-3">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto">
              <BookX className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No books found</h3>
            <p className="text-sm text-slate-500">
              Try another title, author or category.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('All');
              }}
              className="mt-2 px-4 py-2 text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
