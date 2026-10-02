import React, { useState, useEffect, useMemo } from 'react';
import { PreOrder, OrderStatus } from '../types';
import {
  getStoredOrders,
  resetDemoOrders,
  getStoredCompletedOrders,
  saveCompletedOrder,
} from '../services/orderStorage';
import { updateOrderStatus } from '../services/db';
import { OrderHistorySection } from './OrderHistorySection';
import { STORE_CONFIG } from '../config/storeConfig';
import { maskCustomerName, maskPhoneNumber } from '../utils/privacy';
import {
  X,
  ClipboardList,
  Copy,
  Check,
  Phone,
  MessageCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  PackageCheck,
  Info,
  Store,
  CheckCheck,
  XCircle,
  Sparkles,
  Calendar,
  History,
  ArrowRight,
  ShieldCheck,
  Lock,
  Search,
} from 'lucide-react';

interface OrdersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNewPreOrder: () => void;
  onReOrder?: (bookTitle: string, bookId?: string) => void;
}

interface StatusMeta {
  label: string;
  shortLabel: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
  pulseDot?: boolean;
  stepIndex: number; // 1: Pending, 2: Confirmed, 3: Ready, 4: Fulfilled, -1: Cancelled
  icon: React.FC<{ className?: string }>;
  tagline: string;
  instruction: string;
}

const STATUS_CONFIG: Record<string, StatusMeta> = {
  'Pending Verification': {
    label: 'Pending Verification',
    shortLabel: 'Pending',
    badgeBg: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300',
    dotColor: 'bg-amber-500',
    pulseDot: true,
    stepIndex: 1,
    icon: Clock,
    tagline: 'Awaiting Crew Verification',
    instruction: 'Our student crew is checking availability and will contact you via your preferred method shortly.',
  },
  'Pending': {
    label: 'Pending Verification',
    shortLabel: 'Pending',
    badgeBg: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300',
    dotColor: 'bg-amber-500',
    pulseDot: true,
    stepIndex: 1,
    icon: Clock,
    tagline: 'Awaiting Crew Verification',
    instruction: 'Our student crew is checking availability and will contact you via your preferred method shortly.',
  },
  'Confirmed': {
    label: 'Confirmed',
    shortLabel: 'Confirmed',
    badgeBg: 'bg-sky-50',
    textColor: 'text-sky-800',
    borderColor: 'border-sky-300',
    dotColor: 'bg-sky-500',
    pulseDot: false,
    stepIndex: 2,
    icon: CheckCircle2,
    tagline: 'Verified & Sourcing Copy',
    instruction: 'Order verified! We are reserving and preparing your copy to be stationed at Stall #09.',
  },
  'Ready for Pickup': {
    label: 'Ready for Pickup',
    shortLabel: 'Ready for Pickup',
    badgeBg: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-300',
    dotColor: 'bg-emerald-500',
    pulseDot: true,
    stepIndex: 3,
    icon: PackageCheck,
    tagline: 'Waiting at Stall #09 Shelf',
    instruction: 'Your book is waiting at Stall #09! Visit our physical booth to collect and pay cash.',
  },
  'Fulfilled': {
    label: 'Fulfilled',
    shortLabel: 'Fulfilled',
    badgeBg: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300',
    dotColor: 'bg-slate-500',
    pulseDot: false,
    stepIndex: 4,
    icon: CheckCheck,
    tagline: 'Collected & Completed',
    instruction: 'Book collected from Stall #09. Thank you for supporting student enterprise!',
  },
  'Cancelled': {
    label: 'Cancelled',
    shortLabel: 'Cancelled',
    badgeBg: 'bg-rose-50',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-300',
    dotColor: 'bg-rose-500',
    pulseDot: false,
    stepIndex: -1,
    icon: XCircle,
    tagline: 'Order Cancelled',
    instruction: 'This pre-order request has been cancelled.',
  },
};

const getStatusMeta = (status: string): StatusMeta => {
  return STATUS_CONFIG[status] || STATUS_CONFIG['Pending Verification'];
};

export const OrdersDrawer: React.FC<OrdersDrawerProps> = ({
  isOpen,
  onClose,
  onNewPreOrder,
  onReOrder,
}) => {
  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [historyOrders, setHistoryOrders] = useState<PreOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const refreshOrders = () => {
    setOrders(getStoredOrders());
    setHistoryOrders(getStoredCompletedOrders());
  };

  useEffect(() => {
    refreshOrders();
    window.addEventListener('bizventure-order-created', refreshOrders);
    window.addEventListener('bizventure-order-history-updated', refreshOrders);
    window.addEventListener('storage', refreshOrders);
    return () => {
      window.removeEventListener('bizventure-order-created', refreshOrders);
      window.removeEventListener('bizventure-order-history-updated', refreshOrders);
      window.removeEventListener('storage', refreshOrders);
    };
  }, [isOpen]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Active orders are pending or confirmed or ready (excluding Fulfilled which belong in history)
  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'Fulfilled');
  }, [orders]);

  // Filter active orders based on selected status filter and search query
  const filteredOrders = useMemo(() => {
    let list = activeOrders;
    if (activeFilter !== 'All') {
      list = list.filter((o) => {
        if (activeFilter === 'Pending') {
          return o.status === 'Pending Verification' || o.status === ('Pending' as OrderStatus);
        }
        return o.status === activeFilter;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.bookTitle.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeOrders, activeFilter, searchQuery]);

  // Status counts for badge pills
  const counts = useMemo(() => {
    const c = {
      all: activeOrders.length,
      pending: activeOrders.filter((o) => o.status === 'Pending Verification' || o.status === ('Pending' as OrderStatus)).length,
      confirmed: activeOrders.filter((o) => o.status === 'Confirmed').length,
      ready: activeOrders.filter((o) => o.status === 'Ready for Pickup').length,
    };
    return c;
  }, [activeOrders]);

  const handleMarkCollected = (order: PreOrder) => {
    if (
      window.confirm(
        `Mark "${order.bookTitle}" (Order ${order.orderNumber}) as collected at Stall #09? This will move it to your completed Order History.`
      )
    ) {
      updateOrderStatus(order.id, 'Fulfilled', 'Collected in person at Stall #09.', 'Paid');
      saveCompletedOrder({
        ...order,
        status: 'Fulfilled',
        paymentStatus: 'Paid',
        adminNotes: 'Collected in person at Stall #09.',
        updatedAt: new Date().toISOString(),
      });
      refreshOrders();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-2xs">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-display text-slate-900">
                  Pre-Order Tracker
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800">
                  Stall #09
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {activeOrders.length} active pre-order{activeOrders.length === 1 ? '' : 's'} • {historyOrders.length} in history
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                resetDemoOrders();
                refreshOrders();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Reset sample orders for testing"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">Reset Demo</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs: Active Pre-Orders vs Completed Order History */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 pt-2.5 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 py-2 px-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-xl shadow-2xs font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Active Pre-Orders</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'active'
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {activeOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 py-2 px-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-xl shadow-2xs font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Order History</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'history'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {historyOrders.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'history' ? (
            <OrderHistorySection
              onReOrder={(bookTitle, bookId) => {
                if (onReOrder) {
                  onReOrder(bookTitle, bookId);
                } else {
                  onNewPreOrder();
                }
              }}
              onNavigateToActive={() => setActiveTab('active')}
            />
          ) : (
            <>

          {/* Customer Privacy & Data Protection Banner */}
          <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-950 shadow-2xs">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <span>Customer Privacy Protected</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Public Safe</span>
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Customer phone numbers and private details are strictly protected and hidden on this public page. Only authorized Stall #09 administrators can view full customer contact info.
              </p>
            </div>
          </div>

          {/* Quick Search for Customer's own Order ID or Book */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID (e.g. BV-2026-001) or Book title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-12 py-2 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-bold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          
          {/* ============================================================== */}
          {/* COLOR-CODED STATUS LEGEND                                      */}
          {/* ============================================================== */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 font-display">
                <Info className="w-3.5 h-3.5 text-sky-600" />
                <span>Order Status Legend</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Live Lifecycle
              </span>
            </div>

            {/* 3 Core Lifecycle Stages Legend Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              
              {/* 1. Pending */}
              <div
                onClick={() => setActiveFilter(activeFilter === 'Pending' ? 'All' : 'Pending')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  activeFilter === 'Pending'
                    ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-300'
                    : 'bg-white hover:bg-amber-50/50 border-amber-200/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-bold text-amber-900 text-xs">1. Pending</span>
                  </div>
                  {counts.pending > 0 && (
                    <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-1.5 rounded-full">
                      {counts.pending}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-amber-700 leading-snug">
                  Order placed; crew verifying stock & reaching out.
                </p>
              </div>

              {/* 2. Confirmed */}
              <div
                onClick={() => setActiveFilter(activeFilter === 'Confirmed' ? 'All' : 'Confirmed')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  activeFilter === 'Confirmed'
                    ? 'bg-sky-100/80 border-sky-400 ring-2 ring-sky-300'
                    : 'bg-white hover:bg-sky-50/50 border-sky-200/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span className="font-bold text-sky-900 text-xs">2. Confirmed</span>
                  </div>
                  {counts.confirmed > 0 && (
                    <span className="text-[10px] font-mono font-bold bg-sky-200 text-sky-900 px-1.5 rounded-full">
                      {counts.confirmed}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-sky-700 leading-snug">
                  Customer approved; book assigned for Stall #09.
                </p>
              </div>

              {/* 3. Ready for Pickup */}
              <div
                onClick={() => setActiveFilter(activeFilter === 'Ready for Pickup' ? 'All' : 'Ready for Pickup')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  activeFilter === 'Ready for Pickup'
                    ? 'bg-emerald-100/80 border-emerald-400 ring-2 ring-emerald-300'
                    : 'bg-white hover:bg-emerald-50/50 border-emerald-200/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-emerald-900 text-xs">3. Ready</span>
                  </div>
                  {counts.ready > 0 && (
                    <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-1.5 rounded-full">
                      {counts.ready}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-emerald-700 leading-snug">
                  At physical Stall #09; pay cash on pickup.
                </p>
              </div>

            </div>

            {/* Quick Filter Switcher if multiple orders */}
            {orders.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Filter view:</span>
                <div className="flex items-center gap-1">
                  {(['All', 'Pending', 'Confirmed', 'Ready for Pickup'] as const).map((filter) => {
                    const isActive = activeFilter === filter;
                    return (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-2 py-0.5 rounded-lg font-semibold transition-colors cursor-pointer text-[10px] ${
                          isActive
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                        }`}
                      >
                        {filter === 'Ready for Pickup' ? 'Ready' : filter}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* ORDERS LIST                                                    */}
          {/* ============================================================== */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10 space-y-3 bg-slate-50 rounded-2xl border border-slate-200/80 p-6">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {orders.length === 0 ? 'No Pre-Orders Yet' : `No ${activeFilter} Orders Found`}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {orders.length === 0
                  ? 'Browse our book catalogue and submit a pre-order request to track status live here.'
                  : `You do not have any orders currently in "${activeFilter}" status.`}
              </p>
              {orders.length === 0 ? (
                <button
                  onClick={() => {
                    onClose();
                    onNewPreOrder();
                  }}
                  className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors cursor-pointer"
                >
                  Start Pre-Order
                </button>
              ) : (
                <button
                  onClick={() => setActiveFilter('All')}
                  className="mt-1 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Show All Orders ({orders.length})
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => {
              const meta = getStatusMeta(order.status);
              const StatusIcon = meta.icon;
              const isReady = order.status === 'Ready for Pickup';
              const isConfirmed = order.status === 'Confirmed';
              const isPending = order.status === 'Pending Verification' || order.status === ('Pending' as OrderStatus);

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all space-y-3.5 text-xs shadow-xs ${
                    isReady
                      ? 'border-emerald-300 ring-2 ring-emerald-100'
                      : isConfirmed
                      ? 'border-sky-300 ring-2 ring-sky-50'
                      : isPending
                      ? 'border-amber-300 ring-2 ring-amber-50'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Order Top Bar: Order ID + Status Indicator Badge */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <button
                      onClick={() => handleCopy(order.id, order.orderNumber)}
                      className="flex items-center gap-1.5 font-mono font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      title="Click to copy Order ID"
                    >
                      <span>{order.orderNumber}</span>
                      {copiedId === order.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {/* Status Indicator Badge */}
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-2xs ${meta.badgeBg} ${meta.textColor} ${meta.borderColor}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${meta.dotColor} ${
                          meta.pulseDot ? 'animate-pulse' : ''
                        }`}
                      />
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{meta.label}</span>
                    </div>
                  </div>

                  {/* 3-Step Lifecycle Visual Progress Stepper */}
                  {meta.stepIndex > 0 && (
                    <div className="pt-1 pb-1">
                      <div className="flex items-center justify-between relative px-2">
                        {/* Connecting background line */}
                        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-100 -z-0 rounded-full" />
                        
                        {/* Active colored line fill */}
                        <div
                          className={`absolute top-1/2 left-6 -translate-y-1/2 h-1 rounded-full -z-0 transition-all duration-300 ${
                            meta.stepIndex >= 3
                              ? 'w-[calc(100%-3rem)] bg-emerald-500'
                              : meta.stepIndex >= 2
                              ? 'w-1/2 bg-sky-500'
                              : 'w-4 bg-amber-500'
                          }`}
                        />

                        {/* Step 1: Pending */}
                        <div className="flex flex-col items-center gap-1 z-10">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                              meta.stepIndex >= 1
                                ? 'bg-amber-500 text-white border-white shadow-xs'
                                : 'bg-white text-slate-400 border-slate-300'
                            }`}
                          >
                            {meta.stepIndex > 1 ? <Check className="w-3 h-3" /> : '1'}
                          </div>
                          <span
                            className={`text-[9px] font-bold ${
                              meta.stepIndex === 1 ? 'text-amber-800' : 'text-slate-400'
                            }`}
                          >
                            Pending
                          </span>
                        </div>

                        {/* Step 2: Confirmed */}
                        <div className="flex flex-col items-center gap-1 z-10">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                              meta.stepIndex >= 2
                                ? 'bg-sky-500 text-white border-white shadow-xs'
                                : 'bg-white text-slate-400 border-slate-300'
                            }`}
                          >
                            {meta.stepIndex > 2 ? <Check className="w-3 h-3" /> : '2'}
                          </div>
                          <span
                            className={`text-[9px] font-bold ${
                              meta.stepIndex === 2 ? 'text-sky-800' : 'text-slate-400'
                            }`}
                          >
                            Confirmed
                          </span>
                        </div>

                        {/* Step 3: Ready for Pickup */}
                        <div className="flex flex-col items-center gap-1 z-10">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                              meta.stepIndex >= 3
                                ? 'bg-emerald-500 text-white border-white shadow-xs animate-pulse'
                                : 'bg-white text-slate-400 border-slate-300'
                            }`}
                          >
                            {meta.stepIndex >= 4 ? <Check className="w-3 h-3" /> : '3'}
                          </div>
                          <span
                            className={`text-[9px] font-bold ${
                              meta.stepIndex >= 3 ? 'text-emerald-800' : 'text-slate-400'
                            }`}
                          >
                            Ready
                          </span>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Contextual Status Banner / Instruction */}
                  <div
                    className={`p-2.5 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
                      isReady
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                        : isConfirmed
                        ? 'bg-sky-50/80 border-sky-200 text-sky-900'
                        : isPending
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isReady ? (
                        <Store className="w-4 h-4 text-emerald-600" />
                      ) : isConfirmed ? (
                        <Sparkles className="w-4 h-4 text-sky-600" />
                      ) : isPending ? (
                        <Clock className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Info className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold block">
                        {isReady
                          ? '🎉 Ready for Collection at Stall #09!'
                          : isConfirmed
                          ? '👍 Pre-Order Confirmed!'
                          : isPending
                          ? '⏳ Awaiting Phone/WhatsApp Verification'
                          : meta.tagline}
                      </span>
                      <p className="mt-0.5">
                        {isReady ? (
                          <>
                            Visit our stall near the ISU Library Lawn. Present Order{' '}
                            <span className="font-mono font-bold">{order.orderNumber}</span> to our student team to collect and pay{' '}
                            <span className="font-bold">{STORE_CONFIG.currencySymbol}{order.bookPrice * order.quantity} cash</span>.
                          </>
                        ) : (
                          meta.instruction
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Book & Pricing Info */}
                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">
                      {order.bookTitle}
                    </h4>
                    <div className="flex items-center justify-between text-slate-600 text-xs pt-1">
                      <span>
                        Quantity: <span className="font-semibold text-slate-900">{order.quantity} copy</span>
                      </span>
                      <span className="font-bold font-mono text-sm text-slate-900">
                        {STORE_CONFIG.currencySymbol}{order.bookPrice * order.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Customer, Contact & Timestamp (Privacy Protected) */}
                  <div className="pt-1 text-slate-600 space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Customer:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span>{maskCustomerName(order.customerName)}</span>
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full font-medium" title="Name masked on public website for privacy">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Protected</span>
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Contact Method:</span>
                      <span className="font-mono text-slate-700 flex items-center gap-1.5 font-medium">
                        {order.contactMethod === 'WhatsApp' ? (
                          <MessageCircle className="w-3 h-3 text-emerald-600 inline" />
                        ) : (
                          <Phone className="w-3 h-3 text-sky-600 inline" />
                        )}
                        <span>{maskPhoneNumber(order.phoneNumber)}</span>
                        <span className="text-[9px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-sans" title="Full phone number only accessible by Stall #09 Admin">
                          Admin Only
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Payment:</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                        {order.paymentStatus || 'Cash at Stall'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-400 text-[10px] pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Submitted</span>
                      </span>
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>

                    {order.notes && (
                      <div className="pt-1.5 border-t border-slate-100 text-slate-500 text-[10px] flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="italic">Customer note recorded securely (Visible to Stall #09 Admin only)</span>
                      </div>
                    )}

                    {order.adminNotes && (
                      <div className="p-2 rounded-lg bg-sky-50/70 border border-sky-100 text-sky-800 text-[11px]">
                        <span className="font-bold block text-[10px] text-sky-900 uppercase tracking-wide">
                          Stall Crew Note:
                        </span>
                        <span>{order.adminNotes}</span>
                      </div>
                    )}

                    {/* Active Order Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[10px] text-slate-400">
                        {isReady ? 'Ready for collection at Stall #09' : 'Pre-order active'}
                      </div>
                      <button
                        onClick={() => handleMarkCollected(order)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                        title="Mark book as picked up & archive to completed history"
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mark Collected</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Quick link banner to completed order history */}
          {historyOrders.length > 0 && (
            <div
              onClick={() => setActiveTab('history')}
              className="p-3 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  Looking for past books? <strong>{historyOrders.length} completed purchase{historyOrders.length === 1 ? '' : 's'}</strong> in archive.
                </span>
              </div>
              <span className="font-bold flex items-center gap-0.5 text-emerald-900 shrink-0">
                <span>View History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}
        </>
      )}
    </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-[11px] text-slate-500 text-center sm:text-left">
            <span className="font-semibold text-slate-700">Need immediate help?</span> Visit physical{' '}
            <span className="font-bold text-sky-700">Stall #09</span> at BizVenture.
          </div>
          <button
            onClick={() => {
              onClose();
              onNewPreOrder();
            }}
            className="w-full sm:w-auto py-2.5 px-4 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors cursor-pointer text-center whitespace-nowrap shadow-xs"
          >
            + Place Another Pre-Order
          </button>
        </div>

      </div>
    </div>
  );
};

