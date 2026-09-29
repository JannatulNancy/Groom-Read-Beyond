import React, { useState, useEffect } from 'react';
import { Book, PreOrder } from '../types';
import { getStoredBooks } from '../services/db';
import { STORE_CONFIG } from '../config/storeConfig';
import { saveNewPreOrder } from '../services/orderStorage';
import {
  X,
  CheckCircle2,
  Phone,
  MessageCircle,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Package,
  BookOpen
} from 'lucide-react';

interface PreOrderModalProps {
  initialBook: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess?: (order: PreOrder) => void;
}

export const PreOrderModal: React.FC<PreOrderModalProps> = ({
  initialBook,
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [contactMethod, setContactMethod] = useState<'WhatsApp' | 'Phone Call'>('WhatsApp');
  const [notes, setNotes] = useState('');

  // Form states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<PreOrder | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  const [booksList, setBooksList] = useState<Book[]>(getStoredBooks());

  useEffect(() => {
    setBooksList(getStoredBooks());
  }, [isOpen]);

  useEffect(() => {
    if (initialBook) {
      setSelectedBookId(initialBook.id);
    } else if (booksList.length > 0 && !selectedBookId) {
      setSelectedBookId(booksList[0].id);
    }
  }, [initialBook, booksList]);

  if (!isOpen) return null;

  const currentBook = booksList.find((b) => b.id === selectedBookId) || booksList[0];

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Customer Name is required';
    } else if (customerName.trim().length < 2) {
      newErrors.customerName = 'Name must be at least 2 characters';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else {
      // Clean digits check (BD phone numbers typically 11 digits, but allow flexible mobile format)
      const digits = phoneNumber.replace(/\D/g, '');
      if (digits.length < 8) {
        newErrors.phoneNumber = 'Please enter a valid phone number';
      }
    }

    if (!currentBook) {
      newErrors.book = 'Please select a book';
    }

    if (quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate brief processing for realistic feedback
    setTimeout(() => {
      const order = saveNewPreOrder({
        customerName,
        phoneNumber,
        bookId: currentBook.id,
        bookTitle: currentBook.title,
        bookPrice: currentBook.price,
        quantity,
        contactMethod,
        notes,
      });

      setIsSubmitting(false);
      setCompletedOrder(order);
      if (onOrderSuccess) {
        onOrderSuccess(order);
      }
    }, 400);
  };

  const handleResetForAnother = () => {
    setCompletedOrder(null);
    setQuantity(1);
    setNotes('');
    setErrors({});
  };

  const handleCopyOrderId = () => {
    if (completedOrder) {
      navigator.clipboard.writeText(completedOrder.orderNumber);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900">
                {completedOrder ? 'Order Confirmation' : 'Pre-Order Your Book'}
              </h2>
              <p className="text-xs text-slate-500">
                {STORE_CONFIG.eventName} • {STORE_CONFIG.stallNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {completedOrder ? (
            /* Post-Submission Screen (Mandated by Section 11 & 12) */
            <div className="space-y-6 text-center animate-in fade-in duration-200">
              
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-display text-slate-900">
                  🎉 Pre-Order Received!
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Thank you for ordering from our BizVenture Book Corner. Your request has been recorded. Our team will contact you to confirm availability and the final order.
                </p>
              </div>

              {/* Order ID Card */}
              <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200/80 max-w-sm mx-auto space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">
                    Order Reference
                  </span>
                  <button
                    onClick={handleCopyOrderId}
                    className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-900 cursor-pointer"
                  >
                    {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedOrderId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="text-2xl font-mono font-bold text-sky-950">
                  Order ID: {completedOrder.orderNumber}
                </div>

                <div className="pt-2 border-t border-sky-200/60 text-xs text-sky-900 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sky-700">Book:</span>
                    <span className="font-semibold">{completedOrder.bookTitle} (x{completedOrder.quantity})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sky-700">Customer:</span>
                    <span className="font-semibold">{completedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sky-700">Estimated Total:</span>
                    <span className="font-bold tabular-nums">
                      {STORE_CONFIG.currencySymbol}{completedOrder.bookPrice * completedOrder.quantity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Confirmation Guidelines */}
              <div className="space-y-1.5 text-xs text-slate-500 max-w-sm mx-auto">
                <p className="font-semibold text-slate-800">
                  📞 Please keep your phone available for confirmation.
                </p>
                <p>
                  Payment will be confirmed after availability is verified by our stall team.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={handleResetForAnother}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors cursor-pointer"
                >
                  Place Another Order
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Back to Store
                </button>
              </div>

            </div>
          ) : (
            /* Pre-Order Input Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Selected Book Quick Banner */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Book Selection
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                >
                  {booksList.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} — {book.author} ({STORE_CONFIG.currencySymbol}{book.price}) {book.status === 'available' ? '· In Stall' : '· Pre-Order'}
                    </option>
                  ))}
                </select>
                {errors.book && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.book}
                  </p>
                )}
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.customerName) setErrors({ ...errors, customerName: '' });
                  }}
                  placeholder="e.g. Ayesha Siddiqua"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-hidden ${
                    errors.customerName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                {errors.customerName && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.customerName}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' });
                  }}
                  placeholder="e.g. 017XXXXXXXX or +8801..."
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-hidden ${
                    errors.phoneNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Quantity & Preferred Contact Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Quantity
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center text-sm font-bold text-slate-900 focus:outline-hidden py-2"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Preferred Contact Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Via
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setContactMethod('WhatsApp')}
                      className={`flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        contactMethod === 'WhatsApp'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactMethod('Phone Call')}
                      className={`flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        contactMethod === 'Phone Call'
                          ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5 text-sky-600" />
                      <span>Phone Call</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Additional Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Additional Note <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific edition or preference?"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              {/* Payment Notice as mandated in Section 12 */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-0.5">
                <span className="font-semibold block">⚠️ No upfront payment required:</span>
                <p className="text-amber-800">
                  Payment will be confirmed after availability is verified by our team.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:bg-sky-300 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Request...</span>
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4" />
                    <span>Submit Pre-Order</span>
                  </>
                )}
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
