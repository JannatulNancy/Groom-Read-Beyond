import React, { useState, useEffect, useMemo } from 'react';
import { PreOrder } from '../types';
import {
  getStoredCompletedOrders,
  removeCompletedOrder,
  clearCompletedOrderHistory,
  resetDemoCompletedHistory,
} from '../services/orderStorage';
import { STORE_CONFIG } from '../config/storeConfig';
import { maskCustomerName, maskPhoneNumber } from '../utils/privacy';
import {
  CheckCheck,
  Copy,
  Check,
  Search,
  RotateCcw,
  Trash2,
  Calendar,
  Store,
  Receipt,
  Sparkles,
  Phone,
  MessageCircle,
  BookOpen,
  ArrowRight,
  Printer,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface OrderHistorySectionProps {
  onReOrder?: (bookTitle: string, bookId?: string) => void;
  onNavigateToActive?: () => void;
}

export const OrderHistorySection: React.FC<OrderHistorySectionProps> = ({
  onReOrder,
  onNavigateToActive,
}) => {
  const [historyOrders, setHistoryOrders] = useState<PreOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'recent' | 'cash'>('all');

  const loadHistory = () => {
    setHistoryOrders(getStoredCompletedOrders());
  };

  useEffect(() => {
    loadHistory();
    const handleUpdate = () => loadHistory();
    window.addEventListener('bizventure-order-history-updated', handleUpdate);
    window.addEventListener('bizventure-order-created', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('bizventure-order-history-updated', handleUpdate);
      window.removeEventListener('bizventure-order-created', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Remove this completed order record from your local history?')) {
      const updated = removeCompletedOrder(id);
      setHistoryOrders(updated);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all completed order history records from this device?')) {
      clearCompletedOrderHistory();
      setHistoryOrders([]);
    }
  };

  // Filtered orders computation
  const filteredOrders = useMemo(() => {
    return historyOrders.filter((order) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.bookTitle.toLowerCase().includes(q) ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        (order.notes && order.notes.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filterPeriod === 'cash') {
        return order.paymentStatus === 'Cash at Stall' || order.paymentStatus === 'Paid';
      }

      return true;
    });
  }, [historyOrders, searchQuery, filterPeriod]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalOrders = historyOrders.length;
    const totalSpent = historyOrders.reduce(
      (sum, ord) => sum + (ord.bookPrice || 0) * (ord.quantity || 1),
      0
    );
    const totalBooks = historyOrders.reduce(
      (sum, ord) => sum + (ord.quantity || 1),
      0
    );
    return { totalOrders, totalSpent, totalBooks };
  }, [historyOrders]);

  return (
    <div className="space-y-4">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-emerald-50 border border-emerald-200/80 p-2.5 rounded-xl text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
            Completed
          </span>
          <span className="text-lg font-mono font-bold text-emerald-900 block mt-0.5">
            {stats.totalOrders}
          </span>
          <span className="text-[10px] text-emerald-600">orders collected</span>
        </div>

        <div className="bg-sky-50 border border-sky-200/80 p-2.5 rounded-xl text-center">
          <span className="text-[10px] uppercase font-bold text-sky-700 tracking-wider block">
            Books
          </span>
          <span className="text-lg font-mono font-bold text-sky-900 block mt-0.5">
            {stats.totalBooks}
          </span>
          <span className="text-[10px] text-sky-600">copies received</span>
        </div>

        <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl text-center">
          <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block">
            Total Paid
          </span>
          <span className="text-lg font-mono font-bold text-amber-900 block mt-0.5">
            {STORE_CONFIG.currencySymbol}{stats.totalSpent}
          </span>
          <span className="text-[10px] text-amber-600">cash at stall</span>
        </div>
      </div>

      {/* Controls & Search Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past orders by title or #BV-..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] px-0.5">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Filter:</span>
            <button
              onClick={() => setFilterPeriod('all')}
              className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                filterPeriod === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({historyOrders.length})
            </button>
            <button
              onClick={() => setFilterPeriod('cash')}
              className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                filterPeriod === 'cash'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Paid Cash
            </button>
          </div>

          {historyOrders.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-slate-400 hover:text-rose-600 transition-colors text-[10px] flex items-center gap-1 cursor-pointer"
              title="Clear order history"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-display">
              {searchQuery ? 'No Matching Past Orders' : 'No Completed Orders Yet'}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              {searchQuery
                ? `No past records matched "${searchQuery}".`
                : 'Orders marked as Fulfilled/Collected at Stall #09 automatically appear in this persistent archive.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <button
              onClick={() => {
                const sample = resetDemoCompletedHistory();
                setHistoryOrders(sample);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Sample History</span>
            </button>

            {onNavigateToActive && (
              <button
                onClick={onNavigateToActive}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>View Active Pre-Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedReceiptId === order.id;
            const total = (order.bookPrice || 0) * (order.quantity || 1);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-2xs hover:shadow-xs transition-shadow space-y-3 text-xs"
              >
                {/* Header: Order ID + Completed Badge */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <button
                    onClick={() => handleCopy(order.id, order.orderNumber)}
                    className="flex items-center gap-1.5 font-mono font-bold text-slate-700 hover:text-sky-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                    title="Click to copy Order ID"
                  >
                    <span>{order.orderNumber}</span>
                    {copiedId === order.id ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Fulfilled & Collected</span>
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, order.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors cursor-pointer"
                      title="Remove from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Book & Payment Line */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-sm leading-snug flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-600 shrink-0 inline" />
                      <span>{order.bookTitle}</span>
                    </h4>
                    <span className="font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                      {STORE_CONFIG.currencySymbol}{total}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>
                      {order.quantity} copy @ {STORE_CONFIG.currencySymbol}{order.bookPrice} each
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                      Paid: Cash at Stall
                    </span>
                  </div>
                </div>

                {/* Pickup & Verification Details */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Store className="w-3 h-3 text-slate-400" />
                      <span>Collection Stall:</span>
                    </span>
                    <span className="font-semibold text-slate-800">
                      Stall #09 (ISU Library Lawn)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Collected At:</span>
                    </span>
                    <span className="font-medium text-slate-700">
                      {order.updatedAt
                        ? new Date(order.updatedAt).toLocaleString()
                        : new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {order.adminNotes && (
                    <div className="pt-1 border-t border-slate-200/60 text-slate-600 italic">
                      <span className="font-semibold text-slate-700 not-italic">Stall Note: </span>
                      "{order.adminNotes}"
                    </div>
                  )}
                </div>

                {/* Expanded Receipt Details View */}
                {isExpanded && (
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-[11px] animate-in fade-in duration-150">
                    <div className="flex items-center justify-between font-bold text-amber-900 border-b border-amber-200/80 pb-1.5">
                      <span className="flex items-center gap-1">
                        <Receipt className="w-3.5 h-3.5 text-amber-700" />
                        <span>Digital Purchase Receipt</span>
                      </span>
                      <span className="font-mono text-[10px]">BizVenture 2026</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Recipient:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <span>{maskCustomerName(order.customerName)}</span>
                          <span className="text-[9px] text-emerald-700 bg-emerald-100/80 px-1 rounded font-normal">
                            Protected
                          </span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Contact:</span>
                        <span className="font-mono text-slate-600 flex items-center gap-1">
                          <span>{maskPhoneNumber(order.phoneNumber)}</span>
                          <Lock className="w-2.5 h-2.5 text-slate-400" />
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Order Date:</span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Payment Mode:</span>
                        <span className="text-emerald-700 font-semibold">Cash On Counter</span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-amber-200/80 flex items-center justify-between text-[10px] text-amber-800">
                      <span>Verified by Groom, Read & Beyond crew</span>
                      <button
                        onClick={() => {
                          const receiptText = `BizVenture 2026 - Stall #09 Receipt\nOrder: ${order.orderNumber}\nBook: ${order.bookTitle} (x${order.quantity})\nTotal Paid: BDT ${total}\nCustomer: ${maskCustomerName(order.customerName)} (${maskPhoneNumber(order.phoneNumber)})\nCollected: ${new Date(order.updatedAt || order.createdAt).toLocaleString()}\nStatus: Fulfilled & Paid in Cash`;
                          navigator.clipboard.writeText(receiptText);
                          alert('Receipt text copied to clipboard!');
                        }}
                        className="font-bold underline hover:text-amber-950 cursor-pointer flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Copy Receipt Text</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Actions: Re-order button & Toggle Details */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setExpandedReceiptId(isExpanded ? null : order.id)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isExpanded ? 'Hide Receipt' : 'View Receipt'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    )}
                  </button>

                  {onReOrder && (
                    <button
                      onClick={() => onReOrder(order.bookTitle, order.bookId)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold rounded-lg border border-sky-200 transition-colors cursor-pointer text-[11px]"
                    >
                      <RotateCcw className="w-3 h-3 text-sky-600" />
                      <span>Re-Order This Book</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
