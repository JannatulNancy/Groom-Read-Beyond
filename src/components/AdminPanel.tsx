import React, { useState, useEffect } from 'react';
import { Book, PreOrder, SiteContent, OrderStatus } from '../types';
import {
  getStoredSiteContent,
  saveSiteContent,
  resetSiteContent,
  getStoredBooks,
  saveBook,
  deleteBook,
  resetBooks,
  getStoredOrders,
  updateOrderStatus,
  deleteOrder,
  resetOrders,
  exportOrdersToCSV,
  exportDatabaseBackup,
  importDatabaseBackup,
} from '../services/db';
import { saveNewPreOrder } from '../services/orderStorage';
import { compressImageFile } from '../utils/imageCompressor';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileEdit,
  Settings,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Download,
  Upload,
  Search,
  ExternalLink,
  Store,
  Phone,
  MessageCircle,
  TrendingUp,
  PackageCheck,
  RefreshCw,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  Layers,
  Sliders,
  Check,
  QrCode,
  TrendingDown,
  Users,
  AlertCircle,
  X
} from 'lucide-react';

interface AdminPanelProps {
  onSwitchToStore: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onSwitchToStore }) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'analytics' | 'books' | 'profit' | 'orders' | 'content' | 'settings'>('analytics');

  // Database state
  const [content, setContent] = useState<SiteContent>(getStoredSiteContent());
  const [books, setBooks] = useState<Book[]>(getStoredBooks());
  const [orders, setOrders] = useState<PreOrder[]>(getStoredOrders());

  // Search & Filter states
  const [bookSearch, setBookSearch] = useState('');
  const [bookFilterStatus, setBookFilterStatus] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('All');

  // Profit Analyzer State
  const [profitSearch, setProfitSearch] = useState('');
  const [profitCategoryFilter, setProfitCategoryFilter] = useState<string>('All');
  const [profitSort, setProfitSort] = useState<'profit-desc' | 'margin-desc' | 'price-desc' | 'cost-asc' | 'alpha'>('profit-desc');
  const [editingPriceBookId, setEditingPriceBookId] = useState<string | null>(null);
  const [tempCostPrice, setTempCostPrice] = useState<number>(0);
  const [tempSellingPrice, setTempSellingPrice] = useState<number>(0);

  // Book Edit Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Partial<Book> | null>(null);
  const [bookModalErrors, setBookModalErrors] = useState<{ [k: string]: string }>({});

  // Deletion and Reset Confirmation Dialog States
  const [orderToDelete, setOrderToDelete] = useState<PreOrder | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isResetBooksModalOpen, setIsResetBooksModalOpen] = useState(false);
  const [isResetContentModalOpen, setIsResetContentModalOpen] = useState(false);

  // Manual Order Modal State
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [manualOrderData, setManualOrderData] = useState({
    customerName: '',
    phoneNumber: '',
    bookId: '',
    quantity: 1,
    contactMethod: 'Phone Call' as 'Phone Call' | 'WhatsApp',
    notes: '',
  });

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshAllData = () => {
    setContent(getStoredSiteContent());
    setBooks(getStoredBooks());
    setOrders(getStoredOrders());
  };

  useEffect(() => {
    refreshAllData();
    window.addEventListener('bizventure-order-created', refreshAllData);
    window.addEventListener('bizventure-books-updated', refreshAllData);
    window.addEventListener('bizventure-content-updated', refreshAllData);
    return () => {
      window.removeEventListener('bizventure-order-created', refreshAllData);
      window.removeEventListener('bizventure-books-updated', refreshAllData);
      window.removeEventListener('bizventure-content-updated', refreshAllData);
    };
  }, []);

  // --------------------------------------------------------------------------
  // Analytics Computations
  // --------------------------------------------------------------------------
  const totalOrders = orders.length;
  const totalVolume = orders.reduce((acc, o) => acc + o.quantity, 0);
  const totalRevenue = orders.reduce((acc, o) => acc + o.bookPrice * o.quantity, 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending Verification').length;
  const confirmedOrders = orders.filter((o) => o.status === 'Confirmed').length;
  const readyOrders = orders.filter((o) => o.status === 'Ready for Pickup').length;
  const fulfilledOrders = orders.filter((o) => o.status === 'Fulfilled').length;

  const categoryBreakdown: { [cat: string]: number } = {};
  orders.forEach((o) => {
    const matchedBook = books.find((b) => b.id === o.bookId);
    const cat = matchedBook?.category || 'General';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + o.quantity;
  });

  // --------------------------------------------------------------------------
  // Book Handlers
  // --------------------------------------------------------------------------
  const handleOpenAddBook = () => {
    setEditingBook({
      id: 'book-' + Date.now(),
      title: '',
      author: '',
      category: 'Self Development',
      price: 350,
      costPrice: 200,
      coverBg: 'from-sky-700 via-blue-800 to-indigo-900',
      accentColor: '#0284c7',
      description: '',
      status: 'available',
      stallStock: 3,
      pages: 250,
      featured: false,
      coverImage: '',
    });
    setBookModalErrors({});
    setIsBookModalOpen(true);
  };

  const handleOpenEditBook = (book: Book) => {
    setEditingBook({ ...book });
    setBookModalErrors({});
    setIsBookModalOpen(true);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    const errors: { [k: string]: string } = {};
    if (!editingBook.title?.trim()) errors.title = 'Title is required';
    if (!editingBook.author?.trim()) errors.author = 'Author is required';
    if (!editingBook.price || editingBook.price <= 0) errors.price = 'Valid price is required';

    if (Object.keys(errors).length > 0) {
      setBookModalErrors(errors);
      return;
    }

    const completeBook: Book = {
      id: editingBook.id || 'book-' + Date.now(),
      title: editingBook.title!.trim(),
      author: editingBook.author!.trim(),
      category: editingBook.category || 'General',
      price: Number(editingBook.price),
      costPrice: editingBook.costPrice !== undefined ? Number(editingBook.costPrice) : undefined,
      coverBg: editingBook.coverBg || 'from-sky-600 to-blue-900',
      accentColor: editingBook.accentColor || '#0ea5e9',
      description: editingBook.description?.trim() || 'Curated book selection for BizVenture 2026.',
      status: editingBook.status || 'preorder',
      stallStock: editingBook.status === 'available' ? Number(editingBook.stallStock || 3) : undefined,
      pages: Number(editingBook.pages || 200),
      featured: Boolean(editingBook.featured),
      coverImage: editingBook.coverImage?.trim() || '',
    };

    saveBook(completeBook);
    setIsBookModalOpen(false);
    showToast(`Book "${completeBook.title}" saved successfully!`);
  };

  // Quick price editor handlers for Price & Profit Section
  const handleStartEditPrice = (book: Book) => {
    setEditingPriceBookId(book.id);
    setTempCostPrice(book.costPrice || 0);
    setTempSellingPrice(book.price);
  };

  const handleCancelEditPrice = () => {
    setEditingPriceBookId(null);
  };

  const handleSaveQuickPrice = (bookId: string) => {
    const target = books.find((b) => b.id === bookId);
    if (!target) return;
    if (tempSellingPrice <= 0) {
      showToast('Selling price must be greater than 0.');
      return;
    }
    const updatedBook: Book = {
      ...target,
      costPrice: Math.max(0, tempCostPrice),
      price: tempSellingPrice,
    };
    const updatedList = saveBook(updatedBook);
    setBooks(updatedList);
    setEditingPriceBookId(null);
    showToast(`Updated "${target.title}": Selling Price ৳${tempSellingPrice} is now live on customer site!`);
  };

  const handleExportProfitReport = () => {
    const headers = [
      'Book Title',
      'Author',
      'Category',
      'Stall Status',
      'Actual Cost Price (BDT)',
      'Selling Price (BDT)',
      'Unit Profit (BDT)',
      'Margin %',
      'ROI %',
      'Stall Stock'
    ];
    const rows = books.map((b) => {
      const cost = b.costPrice || 0;
      const profit = b.price - cost;
      const margin = b.price > 0 ? ((profit / b.price) * 100).toFixed(1) + '%' : '0%';
      const roi = cost > 0 ? ((profit / cost) * 100).toFixed(1) + '%' : 'N/A';
      return [
        `"${b.title.replace(/"/g, '""')}"`,
        `"${b.author.replace(/"/g, '""')}"`,
        `"${b.category}"`,
        `"${b.status === 'available' ? 'Stall #09 Physical' : 'Pre-Order Only'}"`,
        cost,
        b.price,
        profit,
        `"${margin}"`,
        `"${roi}"`,
        b.stallStock || 0
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Groom_Read_Beyond_Price_Profit_Report_Stall09_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Profit & Pricing report exported to CSV!');
  };

  const handleRestoreAllDefaultPrices = () => {
    const def = resetBooks();
    setBooks(def);
    showToast('Applied all 14 official BizVenture Stall #09 book prices to database and customer storefront!');
  };

  const handleDeleteBook = (book: Book) => {
    setBookToDelete(book);
  };

  const confirmDeleteBook = (bookId: string, title: string) => {
    const remaining = deleteBook(bookId);
    setBooks(remaining);
    setBookToDelete(null);
    showToast(`Removed "${title}" from catalogue.`);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingBook) {
      try {
        showToast('Compressing book cover...');
        const result = await compressImageFile(file, 800, 1100, 0.82);
        setEditingBook((prev) => (prev ? { ...prev, coverImage: result.dataUrl } : prev));
        showToast(`Book cover optimized (${result.compressedSizeKb} KB)!`);
      } catch (err) {
        console.error('Book image error', err);
        showToast('Could not process book photo. Please try a standard JPEG or PNG.');
      }
    }
  };

  const PRESET_IMAGES = [
    { label: 'Official Store Banner', url: '/src/assets/images/groom_read_beyond_banner_1790616666530.jpg' },
    { label: 'Campus Stall Booth', url: '/src/assets/images/hero_bizventure_stall_1790615311084.jpg' },
    { label: 'Artisan Bangles', url: '/src/assets/images/stall_bangles_1790615330269.jpg' },
    { label: 'Fresh Cakes & Treats', url: '/src/assets/images/stall_cakes_1790615343160.jpg' },
  ];

  const updateLiveContent = (updater: (prev: SiteContent) => SiteContent) => {
    setContent((prev) => {
      const next = updater(prev);
      saveSiteContent(next);
      return next;
    });
  };

  const handleUploadImageFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        showToast('Optimizing & compressing photo for live storefront...');
        const result = await compressImageFile(file, 1280, 960, 0.8);
        onComplete(result.dataUrl);
        showToast(`Image uploaded & optimized (${result.compressedSizeKb} KB)! Saved live.`);
      } catch (err) {
        console.error('Image upload compression error', err);
        showToast('Failed to process image. Please try another image file.');
      }
    }
  };

  const toggleSectionVisibility = (sectionKey: keyof NonNullable<SiteContent['visibility']>) => {
    updateLiveContent((prev) => {
      const currentVis = prev.visibility || {
        hero: true,
        concept: true,
        qrSection: true,
        bookCatalogue: true,
        howItWorks: true,
        businessModel: true,
        stallProducts: true,
        about: true,
        footer: true,
      };
      return {
        ...prev,
        visibility: {
          ...currentVis,
          [sectionKey]: !currentVis[sectionKey],
        },
      };
    });
    showToast(`Toggled ${String(sectionKey)} visibility live.`);
  };

  const handleBanglesHighlightChange = (index: number, val: string) => {
    updateLiveContent((prev) => {
      const list = [...(prev.stallProducts.bangles.highlights || [])];
      list[index] = val;
      return {
        ...prev,
        stallProducts: {
          ...prev.stallProducts,
          bangles: { ...prev.stallProducts.bangles, highlights: list },
        },
      };
    });
  };

  const handleAddBanglesHighlight = () => {
    updateLiveContent((prev) => ({
      ...prev,
      stallProducts: {
        ...prev.stallProducts,
        bangles: {
          ...prev.stallProducts.bangles,
          highlights: [...(prev.stallProducts.bangles.highlights || []), 'New feature / highlight point'],
        },
      },
    }));
    showToast('Added feature bullet live.');
  };

  const handleRemoveBanglesHighlight = (index: number) => {
    updateLiveContent((prev) => ({
      ...prev,
      stallProducts: {
        ...prev.stallProducts,
        bangles: {
          ...prev.stallProducts.bangles,
          highlights: (prev.stallProducts.bangles.highlights || []).filter((_, i) => i !== index),
        },
      },
    }));
    showToast('Removed feature bullet.');
  };

  const handleCakesHighlightChange = (index: number, val: string) => {
    updateLiveContent((prev) => {
      const list = [...(prev.stallProducts.cakes.highlights || [])];
      list[index] = val;
      return {
        ...prev,
        stallProducts: {
          ...prev.stallProducts,
          cakes: { ...prev.stallProducts.cakes, highlights: list },
        },
      };
    });
  };

  const handleAddCakesHighlight = () => {
    updateLiveContent((prev) => ({
      ...prev,
      stallProducts: {
        ...prev.stallProducts,
        cakes: {
          ...prev.stallProducts.cakes,
          highlights: [...(prev.stallProducts.cakes.highlights || []), 'Fresh & delicious item'],
        },
      },
    }));
    showToast('Added treat highlight live.');
  };

  const handleRemoveCakesHighlight = (index: number) => {
    updateLiveContent((prev) => ({
      ...prev,
      stallProducts: {
        ...prev.stallProducts,
        cakes: {
          ...prev.stallProducts.cakes,
          highlights: (prev.stallProducts.cakes.highlights || []).filter((_, i) => i !== index),
        },
      },
    }));
  };

  const handleHeroCardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUploadImageFile(e, (dataUrl) => {
      updateLiveContent((prev) => ({
        ...prev,
        heroCard: {
          ...(prev.heroCard || {
            image: '',
            topTag: 'Stall #09 Spotlight',
            badgePrimary: 'Student-Run',
            badgeSecondary: 'ISU Fest',
            footerTitle: 'Today at BizVenture:',
            footerSubtitle: 'Stall #09',
            box1Emoji: '📚',
            box1Title: 'Books',
            box1Sub: 'Pre-Order + Stall',
            box2Emoji: '💍',
            box2Title: 'Churi Bangles',
            box2Sub: 'Stall Exclusive',
            box3Emoji: '🎂',
            box3Title: 'Foods & Treats',
            box3Sub: 'Fresh at Stall',
          }),
          image: dataUrl,
        },
      }));
    });
  };

  // --------------------------------------------------------------------------
  // Order Handlers
  // --------------------------------------------------------------------------
  const handleOrderStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    showToast(`Order status updated to "${status}".`);
  };

  const handleOrderPaymentChange = (orderId: string, payment: 'Unpaid' | 'Cash at Stall' | 'Paid') => {
    updateOrderStatus(orderId, orders.find((o) => o.id === orderId)?.status || 'Pending Verification', undefined, payment);
    showToast(`Payment updated to "${payment}".`);
  };

  const handleAdminNotesUpdate = (orderId: string, notes: string) => {
    updateOrderStatus(orderId, orders.find((o) => o.id === orderId)?.status || 'Pending Verification', notes);
    showToast('Admin note saved.');
  };

  const handleDeleteOrder = (order: PreOrder) => {
    setOrderToDelete(order);
  };

  const confirmDeleteOrder = (orderId: string, orderNumber: string) => {
    const remaining = deleteOrder(orderId);
    setOrders(remaining);
    setOrderToDelete(null);
    showToast(`Order ${orderNumber} permanently deleted.`);
  };

  const handleExportCSV = () => {
    // Read freshest order history stored in localStorage for maximum reliability
    const currentOrders = getStoredOrders();
    if (!currentOrders || currentOrders.length === 0) {
      showToast('No customer order history found in localStorage to export.');
      return;
    }
    const result = exportOrdersToCSV(currentOrders);
    if (result.success) {
      showToast(`Successfully exported ${result.count} orders to CSV file!`);
    } else {
      showToast('Failed to export orders to CSV. Please try again.');
    }
  };

  const handleExportJSON = () => {
    const dataStr = exportDatabaseBackup();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Groom_Read_Beyond_Database_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Full database exported.');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text && importDatabaseBackup(text)) {
          refreshAllData();
          showToast('Database imported successfully!');
        } else {
          showToast('Failed to import database. Please verify JSON file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleManualOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBook = books.find((b) => b.id === manualOrderData.bookId) || books[0];
    if (!targetBook) return;

    if (!manualOrderData.customerName || !manualOrderData.phoneNumber) {
      showToast('Please fill in Customer Name and Phone Number.');
      return;
    }

    saveNewPreOrder({
      customerName: manualOrderData.customerName,
      phoneNumber: manualOrderData.phoneNumber,
      bookId: targetBook.id,
      bookTitle: targetBook.title,
      bookPrice: targetBook.price,
      quantity: manualOrderData.quantity,
      contactMethod: manualOrderData.contactMethod,
      notes: manualOrderData.notes ? `[Stall Manual Entry] ${manualOrderData.notes}` : '[Stall Manual Entry]',
    });

    setIsManualOrderOpen(false);
    setManualOrderData({
      customerName: '',
      phoneNumber: '',
      bookId: books[0]?.id || '',
      quantity: 1,
      contactMethod: 'Phone Call',
      notes: '',
    });
    showToast('Manual stall order registered!');
  };

  // --------------------------------------------------------------------------
  // Content CMS Save Handlers
  // --------------------------------------------------------------------------
  const handlePhoneChange = (newPhone: string) => {
    setContent((prev) => ({
      ...prev,
      store: {
        ...prev.store,
        stallContactPhone: newPhone,
      },
      footer: {
        ...(prev.footer || {
          brandName: prev.store.storeName,
          tagline: prev.store.storeTagline,
          description: 'A student-run physical stall and smart book pre-order ecosystem for BizVenture 2026.',
          eventName: `${prev.store.eventName} • ${prev.store.organizer}`,
          stallLocation: prev.store.institution,
          stallNumber: prev.store.stallNumber,
          date: prev.store.date,
          openingHours: 'Festival Day: 9:00 AM – 6:00 PM',
          offeringsTitle: 'Store Offerings',
          offering1: '📚 Curated Books & Smart Pre-Orders',
          offering2: '💍 Handmade Bangles (Churi) at Stall',
          offering3: '🎂 Fresh Homemade Treats & Celebrations',
          linksTitle: 'Navigation & Stall Desk',
          contactTitle: 'Stall Contacts & Pre-Orders',
          contactPhone: newPhone,
          contactWhatsApp: prev.store.stallWhatsApp,
          contactEmail: 'groomreadbeyond@gmail.com',
          badge1: '🚪 Anywhere Door to Knowledge',
          badge2: '🔔 100% Student Powered',
          badge3: '✨ Good Vibes Only ♡',
          copyrightText: `© 2026 ${prev.store.storeName} · ${prev.store.institution}`,
          bottomQuote: prev.store.bannerBottomQuote,
        }),
        contactPhone: newPhone,
      },
    }));
  };

  const handleWhatsAppChange = (newWhatsApp: string) => {
    setContent((prev) => ({
      ...prev,
      store: {
        ...prev.store,
        stallWhatsApp: newWhatsApp,
      },
      footer: {
        ...(prev.footer || {
          brandName: prev.store.storeName,
          tagline: prev.store.storeTagline,
          description: 'A student-run physical stall and smart book pre-order ecosystem for BizVenture 2026.',
          eventName: `${prev.store.eventName} • ${prev.store.organizer}`,
          stallLocation: prev.store.institution,
          stallNumber: prev.store.stallNumber,
          date: prev.store.date,
          openingHours: 'Festival Day: 9:00 AM – 6:00 PM',
          offeringsTitle: 'Store Offerings',
          offering1: '📚 Curated Books & Smart Pre-Orders',
          offering2: '💍 Handmade Bangles (Churi) at Stall',
          offering3: '🎂 Fresh Homemade Treats & Celebrations',
          linksTitle: 'Navigation & Stall Desk',
          contactTitle: 'Stall Contacts & Pre-Orders',
          contactPhone: prev.store.stallContactPhone,
          contactWhatsApp: newWhatsApp,
          contactEmail: 'groomreadbeyond@gmail.com',
          badge1: '🚪 Anywhere Door to Knowledge',
          badge2: '🔔 100% Student Powered',
          badge3: '✨ Good Vibes Only ♡',
          copyrightText: `© 2026 ${prev.store.storeName} · ${prev.store.institution}`,
          bottomQuote: prev.store.bannerBottomQuote,
        }),
        contactWhatsApp: newWhatsApp,
      },
    }));
  };

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    const activePhone = (content.footer?.contactPhone || content.store.stallContactPhone || '').trim();
    saveSiteContent(content);
    showToast(`✅ Saved live! Phone (${activePhone || 'Updated'}) & all landing page edits are live!`);
  };

  const handleResetContent = () => {
    setIsResetContentModalOpen(true);
  };

  const confirmResetContent = () => {
    const def = resetSiteContent();
    setContent(def);
    setIsResetContentModalOpen(false);
    showToast('Page content reset to default Groom, Read & Beyond content.');
  };

  const confirmResetBooks = () => {
    const def = resetBooks();
    setBooks(def);
    setIsResetBooksModalOpen(false);
    showToast('Books reset to original catalog.');
  };

  // --------------------------------------------------------------------------
  // Filtered views
  // --------------------------------------------------------------------------
  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.category.toLowerCase().includes(bookSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (bookFilterStatus === 'All') return true;
    if (bookFilterStatus === 'Available') return b.status === 'available';
    if (bookFilterStatus === 'Pre-Order') return b.status === 'preorder';
    return true;
  });

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phoneNumber.includes(orderSearch) ||
      o.bookTitle.toLowerCase().includes(orderSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (orderFilterStatus === 'All') return true;
    return o.status === orderFilterStatus;
  });

  // Price & Profit computations
  const filteredProfitBooks = books
    .filter((b) => {
      const q = profitSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (profitCategoryFilter === 'All') return true;
      return b.category === profitCategoryFilter;
    })
    .sort((a, b) => {
      const profitA = a.price - (a.costPrice || 0);
      const profitB = b.price - (b.costPrice || 0);
      const marginA = a.price > 0 ? profitA / a.price : 0;
      const marginB = b.price > 0 ? profitB / b.price : 0;
      if (profitSort === 'profit-desc') return profitB - profitA;
      if (profitSort === 'margin-desc') return marginB - marginA;
      if (profitSort === 'price-desc') return b.price - a.price;
      if (profitSort === 'cost-asc') return (a.costPrice || 0) - (b.costPrice || 0);
      if (profitSort === 'alpha') return a.title.localeCompare(b.title);
      return 0;
    });

  const stallAvailableBooks = books.filter((b) => b.status === 'available');
  const totalStallStockCopies = stallAvailableBooks.reduce((acc, b) => acc + (b.stallStock || 3), 0);
  const totalStallCost = stallAvailableBooks.reduce((acc, b) => acc + (b.costPrice || 0) * (b.stallStock || 3), 0);
  const totalStallSellingValue = stallAvailableBooks.reduce((acc, b) => acc + b.price * (b.stallStock || 3), 0);
  const totalStallProjectedProfit = totalStallSellingValue - totalStallCost;
  const avgBookProfit = books.length > 0 ? Math.round(books.reduce((acc, b) => acc + (b.price - (b.costPrice || 0)), 0) / books.length) : 0;
  const avgBookMargin = books.length > 0 ? ((books.reduce((acc, b) => acc + ((b.price - (b.costPrice || 0)) / b.price), 0) / books.length) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-3 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center text-sm font-black shadow-xs">
              G
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-base tracking-tight text-white">
                  {content.store.storeName}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Admin Panel
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                {content.store.storeTagline}
              </p>
            </div>
          </div>

          {/* Actions: Export CSV + switch back to customer store */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Export order history stored in localStorage to CSV file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Orders (CSV)</span>
              <span className="sm:hidden">CSV</span>
            </button>

            <button
              onClick={onSwitchToStore}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-sky-600" />
              <span>Customer Storefront</span>
            </button>
          </div>

        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto scrollbar-none border-t border-slate-800/80 py-1.5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Live Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'books' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Manage Books ({books.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profit')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'profit' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : 'text-emerald-400 hover:text-white hover:bg-emerald-950/40'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Price & Profit Analysis</span>
            <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded-full border border-emerald-400/30 font-mono">
              Stall #09
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Orders Database ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'content' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Edit Landing Page (CMS)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Store Settings & Backup</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ----------------------------------------------------------------- */}
        {/* TAB 1: LIVE ANALYTICS                                              */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold font-display text-slate-900">
                  Live Operations & Demand Analytics
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time metrics for BizVenture 2026 stall judges and inventory managers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsManualOrderOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Manual Stall Order</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
                  title="Export all orders stored in localStorage to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV ({orders.length})</span>
                </button>
              </div>
            </div>

            {/* Metric Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
                <div className="text-xs font-semibold text-slate-400">Total Pre-Orders</div>
                <div className="text-3xl font-extrabold font-display text-slate-900 mt-1 tabular-nums">
                  {totalOrders}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{totalVolume} books ordered</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
                <div className="text-xs font-semibold text-slate-400">Demand Pipeline Value</div>
                <div className="text-3xl font-extrabold font-display text-emerald-600 mt-1 tabular-nums">
                  ৳{totalRevenue.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-700 mt-1">Zero dead stock risk</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
                <div className="text-xs font-semibold text-slate-400">Pending Verification</div>
                <div className="text-3xl font-extrabold font-display text-amber-600 mt-1 tabular-nums">
                  {pendingOrders}
                </div>
                <div className="text-[11px] text-amber-700 mt-1">Requires call or WhatsApp</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
                <div className="text-xs font-semibold text-slate-400">Fulfillment Progress</div>
                <div className="text-3xl font-extrabold font-display text-sky-600 mt-1 tabular-nums">
                  {totalOrders > 0 ? Math.round(((readyOrders + fulfilledOrders) / totalOrders) * 100) : 0}%
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {readyOrders + fulfilledOrders} of {totalOrders} prepared
                </div>
              </div>
            </div>

            {/* Visual Demand Chart & Pipeline status */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Category Breakdown */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm font-display">
                    Category Demand Visualizer
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">By Book Quantity</span>
                </div>

                <div className="space-y-3 pt-2">
                  {Object.entries(categoryBreakdown).map(([cat, count]) => {
                    const percentage = Math.round((count / (totalVolume || 1)) * 100);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{cat}</span>
                          <span className="font-mono text-sky-700">{count} copies ({percentage}%)</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.max(8, percentage)}%` }}
                            className="h-full bg-sky-500 rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status pipeline */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm font-display">
                  Order Status Pipeline
                </h3>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                    <span className="font-semibold text-amber-900">Pending Verification</span>
                    <span className="font-bold font-mono text-amber-900">{pendingOrders} orders</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs">
                    <span className="font-semibold text-sky-900">Confirmed with Customer</span>
                    <span className="font-bold font-mono text-sky-900">{confirmedOrders} orders</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <span className="font-semibold text-emerald-900">Ready at Stall #09</span>
                    <span className="font-bold font-mono text-emerald-900">{readyOrders} orders</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700">Picked Up / Fulfilled</span>
                    <span className="font-bold font-mono text-slate-900">{fulfilledOrders} orders</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Recent Orders */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm font-display">
                  Recent Orders Stream
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                >
                  View All Orders →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-mono font-bold text-sky-700 mr-2">{order.orderNumber}</span>
                      <strong className="text-slate-800">{order.customerName}</strong>
                      <span className="text-slate-400 mx-1">·</span>
                      <span className="text-slate-600">{order.bookTitle} (x{order.quantity})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900">৳{order.bookPrice * order.quantity}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 2: MANAGE BOOKS                                               */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'books' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold font-display text-slate-900">
                  Book Catalogue Manager
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add, edit, or remove books, change covers, prices, categories, and stall availability.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddBook}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Book</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsResetBooksModalOpen(true)}
                  className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl cursor-pointer transition-colors hover:bg-slate-50"
                  title="Reset to default books"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search & Filter Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search books by title, author, or genre..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                {['All', 'Available', 'Pre-Order'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setBookFilterStatus(filter)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                      bookFilterStatus === filter
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Books Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Book</th>
                      <th className="py-3 px-4">Genre</th>
                      <th className="py-3 px-4">Actual Cost</th>
                      <th className="py-3 px-4">Selling Price</th>
                      <th className="py-3 px-4">Profit / Margin</th>
                      <th className="py-3 px-4">Status & Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBooks.map((book) => {
                      const cost = book.costPrice || 0;
                      const profit = book.price - cost;
                      const margin = book.price > 0 ? Math.round((profit / book.price) * 100) : 0;
                      return (
                        <tr key={book.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {/* Book cover visual */}
                              <div className="w-10 h-14 rounded bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                                {book.coverImage ? (
                                  <img
                                    src={book.coverImage}
                                    alt={book.title}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className={`w-full h-full bg-gradient-to-br ${book.coverBg} flex items-center justify-center text-[9px] font-bold text-white text-center p-1 leading-tight`}>
                                    {book.title.slice(0, 10)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                  <span>{book.title}</span>
                                  {book.featured && (
                                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                                      Featured
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-500 text-xs">By {book.author}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {book.category}
                          </td>

                          <td className="py-3 px-4 font-mono font-semibold text-slate-600 tabular-nums">
                            ৳{cost}
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-sky-800 tabular-nums">
                            ৳{book.price}
                          </td>

                          <td className="py-3 px-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-mono font-bold text-xs border border-emerald-200">
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                              <span>+৳{profit}</span>
                              <span className="text-[10px] text-emerald-700 font-normal">({margin}%)</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {book.status === 'available' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Stall Stock ({book.stallStock || 3})</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pre-Order</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditBook(book)}
                                className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit book"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBook(book)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete book"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB: PRICE, ACTUAL COST & PROFIT ANALYSIS                         */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'profit' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header & Main Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <TrendingUp className="w-5 h-5" />
                  </span>
                  <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
                      Actual Price, Selling Price & Profit Analyzer
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        BizVenture Stall #09 Official Pricing
                      </span>
                      <span>•</span>
                      <span>Updates to Selling Price reflect live on the Customer Storefront immediately.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRestoreAllDefaultPrices}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-colors cursor-pointer shadow-xs"
                  title="Apply and verify all 14 official prices specified for Stall #09"
                >
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Sync All 14 Official Prices</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportProfitReport}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                  title="Download full price, cost, and margin report as CSV"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Export Report (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddBook}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Book</span>
                </button>
              </div>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Curated Titles</span>
                  <span className="p-1 rounded bg-sky-50 text-sky-600">
                    <BookOpen className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-3xl font-extrabold font-display text-slate-900 mt-1 tabular-nums">
                  {books.length} Books
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {stallAvailableBooks.length} at Stall #09 • {books.length - stallAvailableBooks.length} pre-order only
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Avg Profit per Book</span>
                  <span className="p-1 rounded bg-emerald-50 text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-3xl font-extrabold font-display text-emerald-600 mt-1 tabular-nums">
                  +৳{avgBookProfit}
                </div>
                <div className="text-[11px] text-emerald-700 mt-1">
                  Average gross margin: <strong className="font-mono">{avgBookMargin}%</strong>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Stall #09 Inventory Cost</span>
                  <span className="p-1 rounded bg-amber-50 text-amber-600">
                    <Store className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-3xl font-extrabold font-display text-amber-700 mt-1 tabular-nums">
                  ৳{totalStallCost.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {totalStallStockCopies} copies physically stocked at stall
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Stall Projected Profit</span>
                  <span className="p-1 rounded bg-emerald-50 text-emerald-600">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-3xl font-extrabold font-display text-emerald-600 mt-1 tabular-nums">
                  ৳{totalStallProjectedProfit.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-700 mt-1">
                  Revenue potential: ৳{totalStallSellingValue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Official Stall #09 Price & Profit Reference Sheet */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                    #9
                  </span>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                      <span>Official Price, Cost & Profit Reference</span>
                      <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                        Stall #09 Approved
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Standard wholesale acquisition price vs customer selling price for all 14 official BizVenture books.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-emerald-300">
                    14/14 Books Active & Synchronized
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                {[
                  { title: 'White Nights', cost: 130, selling: 230, profit: 100, margin: '43.5%' },
                  { title: 'Kaizen', cost: 200, selling: 350, profit: 150, margin: '42.9%' },
                  { title: 'The Psychology of Money', cost: 150, selling: 350, profit: 200, margin: '57.1%' },
                  { title: 'IKIGAI', cost: 150, selling: 300, profit: 150, margin: '50.0%' },
                  { title: 'The IKIGAI Journey', cost: 150, selling: 300, profit: 150, margin: '50.0%' },
                  { title: 'The Four Agreements', cost: 150, selling: 300, profit: 150, margin: '50.0%' },
                  { title: 'The Prophet', cost: 120, selling: 250, profit: 130, margin: '52.0%' },
                  { title: 'A Thousand Splendid Suns', cost: 220, selling: 360, profit: 140, margin: '38.9%' },
                  { title: 'The Kite Runner', cost: 220, selling: 360, profit: 140, margin: '38.9%' },
                  { title: 'Letters to Milena', cost: 250, selling: 380, profit: 130, margin: '34.2%' },
                  { title: 'As Long As the Lemon Trees Grow', cost: 250, selling: 380, profit: 130, margin: '34.2%' },
                  { title: '1984', cost: 250, selling: 380, profit: 130, margin: '34.2%' },
                  { title: 'The Silent Patient', cost: 200, selling: 350, profit: 150, margin: '42.9%' },
                  { title: 'The Ocean Would Paint Me Blue', cost: 280, selling: 400, profit: 120, margin: '30.0%' },
                ].map((item, i) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="truncate mr-2">
                      <span className="font-semibold text-slate-100 block truncate">
                        {i + 1}. {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Actual Cost: <strong className="text-slate-200">৳{item.cost}</strong>
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-sky-300 text-xs block">
                        Selling: ৳{item.selling}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        +৳{item.profit} ({item.margin})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter, Search & Sort Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search books by title, author, or category to adjust pricing..."
                  value={profitSearch}
                  onChange={(e) => setProfitSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={profitCategoryFilter}
                  onChange={(e) => setProfitCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="All">All Categories</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Self Development">Self Development</option>
                  <option value="Finance">Finance</option>
                  <option value="Productivity">Productivity</option>
                </select>

                <select
                  value={profitSort}
                  onChange={(e) => setProfitSort(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="profit-desc">Highest Profit (৳)</option>
                  <option value="margin-desc">Highest Margin (%)</option>
                  <option value="price-desc">Highest Selling Price</option>
                  <option value="cost-asc">Lowest Cost Price</option>
                  <option value="alpha">Book Title (A–Z)</option>
                </select>
              </div>
            </div>

            {/* Interactive Pricing, Actual Cost & Profit Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Book Title & Details</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Actual Cost (৳)</th>
                      <th className="py-3 px-4">Selling Price (৳)</th>
                      <th className="py-3 px-4">Unit Profit (৳)</th>
                      <th className="py-3 px-4">Gross Margin %</th>
                      <th className="py-3 px-4">Markup ROI %</th>
                      <th className="py-3 px-4">Stall Status & Profit</th>
                      <th className="py-3 px-4 text-right">Quick Price Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProfitBooks.map((book) => {
                      const cost = book.costPrice || 0;
                      const profit = book.price - cost;
                      const marginPercent = book.price > 0 ? ((profit / book.price) * 100).toFixed(1) : '0';
                      const markupRoi = cost > 0 ? ((profit / cost) * 100).toFixed(1) : 'N/A';
                      const isEditing = editingPriceBookId === book.id;
                      const stallCopies = book.status === 'available' ? (book.stallStock || 3) : 0;
                      const stallProjected = stallCopies * profit;

                      return (
                        <tr
                          key={book.id}
                          className={`transition-colors ${
                            isEditing ? 'bg-amber-50/60' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          {/* Book Details */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-14 rounded bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                                {book.coverImage ? (
                                  <img
                                    src={book.coverImage}
                                    alt={book.title}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className={`w-full h-full bg-gradient-to-br ${book.coverBg} flex items-center justify-center text-[9px] font-bold text-white text-center p-1 leading-tight`}>
                                    {book.title.slice(0, 10)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                  <span>{book.title}</span>
                                  {book.featured && (
                                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                                      Featured
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-500 text-xs">By {book.author}</div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                            {book.category}
                          </td>

                          {/* Actual Cost Price */}
                          <td className="py-3 px-4 font-mono">
                            {isEditing ? (
                              <div>
                                <input
                                  type="number"
                                  min={0}
                                  value={tempCostPrice}
                                  onChange={(e) => setTempCostPrice(Number(e.target.value))}
                                  className="w-20 px-2 py-1 bg-white border border-amber-300 rounded-lg font-mono font-bold text-xs focus:ring-1 focus:ring-amber-500"
                                />
                                <span className="text-[10px] text-slate-400 block mt-0.5">Wholesale</span>
                              </div>
                            ) : (
                              <div>
                                <span className="font-bold text-slate-700 text-sm">৳{cost}</span>
                                <span className="text-[10px] text-slate-400 block">Acquisition</span>
                              </div>
                            )}
                          </td>

                          {/* Selling Price */}
                          <td className="py-3 px-4 font-mono">
                            {isEditing ? (
                              <div>
                                <input
                                  type="number"
                                  min={1}
                                  value={tempSellingPrice}
                                  onChange={(e) => setTempSellingPrice(Number(e.target.value))}
                                  className="w-20 px-2 py-1 bg-white border border-sky-400 rounded-lg font-mono font-bold text-xs text-sky-800 focus:ring-1 focus:ring-sky-500"
                                />
                                <span className="text-[10px] text-sky-600 block mt-0.5">Customer site</span>
                              </div>
                            ) : (
                              <div>
                                <span className="font-extrabold text-sky-800 text-sm">৳{book.price}</span>
                                <span className="text-[10px] text-slate-400 block">Customer Site</span>
                              </div>
                            )}
                          </td>

                          {/* Unit Profit */}
                          <td className="py-3 px-4 font-mono">
                            {isEditing ? (
                              <div className="font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md inline-block">
                                +৳{tempSellingPrice - tempCostPrice}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg text-sm border border-emerald-200">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                <span>+৳{profit}</span>
                              </span>
                            )}
                          </td>

                          {/* Margin % */}
                          <td className="py-3 px-4 font-mono">
                            {isEditing ? (
                              <span className="font-bold text-slate-800">
                                {tempSellingPrice > 0 ? (((tempSellingPrice - tempCostPrice) / tempSellingPrice) * 100).toFixed(1) + '%' : '0%'}
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{marginPercent}%</span>
                                <div className="w-12 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${Math.min(100, Math.max(10, Number(marginPercent)))}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Markup ROI % */}
                          <td className="py-3 px-4 font-mono text-slate-700 font-semibold">
                            {isEditing ? (
                              <span>
                                {tempCostPrice > 0 ? (((tempSellingPrice - tempCostPrice) / tempCostPrice) * 100).toFixed(1) + '%' : 'N/A'}
                              </span>
                            ) : (
                              <span>{markupRoi}%</span>
                            )}
                          </td>

                          {/* Stall Status & Profit */}
                          <td className="py-3 px-4">
                            {book.status === 'available' ? (
                              <div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <Store className="w-3 h-3 text-emerald-600" />
                                  <span>Stall #09 ({stallCopies} pcs)</span>
                                </span>
                                <span className="text-[10px] font-mono text-emerald-700 block mt-0.5">
                                  Total profit: <strong>৳{stallProjected}</strong>
                                </span>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Pre-Order Only</span>
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  Demand-driven
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Actions: Inline Price Edit */}
                          <td className="py-3 px-4 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSaveQuickPrice(book.id)}
                                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer"
                                  title="Save price and update customer site immediately"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Save Live</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEditPrice}
                                  className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditPrice(book)}
                                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors cursor-pointer"
                                  title="Quick edit price & cost for this book"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                                  <span>Edit Price</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditBook(book)}
                                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                                  title="Open full book editor"
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Explanatory Banner for BizVenture Stall #09 */}
            <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-sky-900">
              <div className="space-y-0.5">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>How Dynamic Pricing & Profit Works at BizVenture 2026:</span>
                </span>
                <p className="text-sky-700 text-[11px]">
                  When you update the <strong>Selling Price</strong> of any book here, it immediately syncs to the <strong>Customer Storefront</strong>, the interactive <strong>Book Pre-Order Modal</strong>, and the <strong>Orders Drawer</strong>. Actual Cost Price remains internal to this Admin Panel for calculating student venture profit.
                </p>
              </div>

              <button
                type="button"
                onClick={onSwitchToStore}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-sky-300 text-sky-800 font-semibold hover:bg-sky-100 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-sky-600" />
                <span>Verify on Storefront</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 3: ORDERS DATABASE                                            */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold font-display text-slate-900">
                  Customer Orders Database
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track, confirm, and update pre-orders. Synchronized with customer receipt submissions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsManualOrderOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Manual Order</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
                  title="Export full order history stored in localStorage to CSV spreadsheet"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Order History (CSV)</span>
                </button>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search orders by customer name, phone, order number, or book..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <select
                value={orderFilterStatus}
                onChange={(e) => setOrderFilterStatus(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="All">All Statuses ({orders.length})</option>
                <option value="Pending Verification">Pending Verification ({pendingOrders})</option>
                <option value="Confirmed">Confirmed ({confirmedOrders})</option>
                <option value="Ready for Pickup">Ready for Pickup ({readyOrders})</option>
                <option value="Fulfilled">Fulfilled ({fulfilledOrders})</option>
              </select>
            </div>

            {/* Orders List / Cards */}
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
                  No orders match your filter.
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg">
                          {order.orderNumber}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {order.customerName}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            Ordered: {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Direct Status Selector */}
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border cursor-pointer ${
                            order.status === 'Pending Verification'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : order.status === 'Confirmed'
                              ? 'bg-sky-50 text-sky-900 border-sky-300'
                              : order.status === 'Ready for Pickup'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : order.status === 'Fulfilled'
                              ? 'bg-slate-100 text-slate-800 border-slate-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="Pending Verification">🟡 Pending Verification</option>
                          <option value="Confirmed">🔵 Confirmed with Customer</option>
                          <option value="Ready for Pickup">🟢 Ready at Stall #07</option>
                          <option value="Fulfilled">⚪ Picked Up / Fulfilled</option>
                          <option value="Cancelled">🔴 Cancelled</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                          title={`Delete order ${order.orderNumber}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Order Details Body */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      
                      {/* Book & Qty */}
                      <div className="space-y-1">
                        <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                          Book Ordered
                        </span>
                        <div className="font-bold text-slate-900 text-sm">{order.bookTitle}</div>
                        <div className="text-slate-600">
                          Quantity: <strong className="text-slate-900">{order.quantity} copy</strong> @ ৳{order.bookPrice}
                        </div>
                        <div className="text-sky-700 font-mono font-bold text-sm pt-0.5">
                          Total: ৳{order.bookPrice * order.quantity}
                        </div>
                      </div>

                      {/* Contact Info & Direct Links */}
                      <div className="space-y-1.5">
                        <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                          Customer Contact
                        </span>
                        <div className="font-mono text-slate-800 text-sm">{order.phoneNumber}</div>
                        
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={`https://wa.me/${order.phoneNumber.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(order.customerName)},%20this%20is%20Groom,%20Read%20%26%20Beyond%20stall%20at%20BizVenture%202026%20regarding%20your%20pre-order%20(${order.orderNumber})%20for%20${encodeURIComponent(order.bookTitle)}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] border border-emerald-200 transition-colors"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={`tel:${order.phoneNumber}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold text-[11px] border border-sky-200 transition-colors"
                          >
                            <Phone className="w-3 h-3 text-sky-600" />
                            <span>Call</span>
                          </a>
                        </div>
                      </div>

                      {/* Payment & Notes */}
                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                            Payment Status
                          </span>
                          <select
                            value={order.paymentStatus || 'Unpaid'}
                            onChange={(e) => handleOrderPaymentChange(order.id, e.target.value as any)}
                            className="mt-0.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800"
                          >
                            <option value="Unpaid">Unpaid (Verify at Stall)</option>
                            <option value="Cash at Stall">Cash at Stall</option>
                            <option value="Paid">Paid in Advance</option>
                          </select>
                        </div>

                        {order.notes && (
                          <div className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                            "{order.notes}"
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Admin Internal Note Input */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                        Internal Note:
                      </span>
                      <input
                        type="text"
                        defaultValue={order.adminNotes || ''}
                        onBlur={(e) => handleAdminNotesUpdate(order.id, e.target.value)}
                        placeholder="Add internal note (e.g. Sourced from Nilkhet, will arrive by 1 PM)..."
                        className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 4: EDIT LANDING PAGE (CMS)                                    */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'content' && (
          <form onSubmit={handleSaveContent} className="space-y-8 animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold font-display text-slate-900">
                  Landing Page CMS Editor
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every section and photo on your website is fully editable. Edits and image uploads update live across the entire store immediately.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Changes Live</span>
                </button>

                <button
                  type="button"
                  onClick={onSwitchToStore}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors cursor-pointer"
                  title="Switch to customer storefront to see your live changes"
                >
                  <Eye className="w-4 h-4 text-sky-600" />
                  <span>View Live Landing Page</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetContent}
                  className="px-3 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            {/* Live Auto-Sync Banner */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Auto-Sync Active: All text changes, phone number edits, and photo uploads reflect immediately across the entire website.</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
                Auto-Persisted
              </span>
            </div>

            {/* ============================================================== */}
            {/* QUICK CONTACTS & PHONE NUMBER MANAGER (SYNCED LIVE EVERYWHERE) */}
            {/* ============================================================== */}
            <div className="bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-emerald-500/10 rounded-2xl border-2 border-amber-300 p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm font-display flex items-center gap-2">
                      <span>Stall Phone Number & WhatsApp Hotline</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        Live Sync
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      Changes here update the phone and WhatsApp links immediately in the top bar, footer, and stall info.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                    Stall #09 (ISU Lawn)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-sky-600" />
                    <span>Contact Phone Number (Call Hotline)</span>
                  </label>
                  <input
                    type="text"
                    value={content.footer?.contactPhone || content.store.stallContactPhone || ''}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    placeholder="+880 1712-345678"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Displayed in top announcement bar, footer contacts, and direct dial buttons.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Pre-Order Hotline</span>
                  </label>
                  <input
                    type="text"
                    value={content.footer?.contactWhatsApp || content.store.stallWhatsApp || ''}
                    onChange={(e) => handleWhatsAppChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="+880 1712-345678"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Direct WhatsApp chat link for customers to confirm orders or chat with stall crew.
                  </span>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* MASTER SECTION VISIBILITY / REMOVE ANY SECTION CONTROLS        */}
            {/* ============================================================== */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-sky-400" />
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider font-display text-white">
                      Page Layout & Section Visibility
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Show, hide, or remove any section from the customer landing page with 1 click.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                  Live Landing Page Controls
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { key: 'hero', label: 'Hero Banner' },
                  { key: 'concept', label: 'Store Concept (3 Experiences)' },
                  { key: 'qrSection', label: 'QR Stand & Stall Info' },
                  { key: 'bookCatalogue', label: 'Books Catalogue' },
                  { key: 'howItWorks', label: 'How Pre-Order Works' },
                  { key: 'businessModel', label: 'Smart Business Model' },
                  { key: 'stallProducts', label: 'Stall Exclusives (Bangles/Cakes)' },
                  { key: 'about', label: 'About Store & Team' },
                  { key: 'footer', label: 'Footer Section & Links' },
                ].map(({ key, label }) => {
                  const isVisible = content.visibility?.[key as keyof NonNullable<SiteContent['visibility']>] !== false;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleSectionVisibility(key as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isVisible
                          ? 'bg-slate-800/90 border-sky-500/60 text-white shadow-xs'
                          : 'bg-slate-950/60 border-slate-700/60 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                          {key}
                        </span>
                        {isVisible ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <Eye className="w-2.5 h-2.5" /> Visible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/30">
                            <EyeOff className="w-2.5 h-2.5" /> Hidden
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-xs leading-snug line-clamp-1 text-slate-200">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ============================================================== */}
            {/* MASTER LANDING PAGE IMAGE STUDIO (ALL 9 IMAGES)                */}
            {/* ============================================================== */}
            <div className="bg-gradient-to-br from-sky-500/10 via-rose-500/5 to-amber-500/10 rounded-2xl border-2 border-sky-300 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider font-display flex items-center gap-2">
                      <span>All Landing Page Images Studio</span>
                      <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300">
                        9 Live Images
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      Upload pictures directly from your mobile/computer, paste image URLs, or choose presets. Changes reflect immediately on your live website.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Live Sync Enabled</span>
                </div>
              </div>

              {/* Grid of All 9 Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {[
                  {
                    id: 'bannerImage',
                    label: 'Official Store Banner',
                    section: 'Top Banner & Identity',
                    currentImage: content.store.bannerImage,
                    onUpdate: (url: string) => updateLiveContent((prev) => ({ ...prev, store: { ...prev.store, bannerImage: url } })),
                  },
                  {
                    id: 'heroCardImage',
                    label: 'Hero Main Booth Card',
                    section: 'Hero Section (Right Column)',
                    currentImage: content.heroCard?.image || content.store.bannerImage,
                    onUpdate: (url: string) => updateLiveContent((prev) => ({ ...prev, heroCard: { ...(prev.heroCard || { image: '', topTag: '', badgePrimary: '', badgeSecondary: '', footerTitle: '', footerSubtitle: '', box1Emoji: '', box1Title: '', box1Sub: '', box2Emoji: '', box2Title: '', box2Sub: '', box3Emoji: '', box3Title: '', box3Sub: '' }), image: url } })),
                  },
                  {
                    id: 'conceptBooks',
                    label: 'Concept: Books & Reading',
                    section: 'Store Concept Card 1',
                    currentImage: content.concept.booksImage || '',
                    onUpdate: (url: string) => updateLiveContent((prev) => ({ ...prev, concept: { ...prev.concept, booksImage: url } })),
                  },
                  {
                    id: 'conceptBangles',
                    label: 'Concept: Bangles (Churi)',
                    section: 'Store Concept Card 2',
                    currentImage: content.concept.banglesImage || '',
                    onUpdate: (url: string) => updateLiveContent((prev) => ({ ...prev, concept: { ...prev.concept, banglesImage: url } })),
                  },
                  {
                    id: 'conceptCakes',
                    label: 'Concept: Foods & Treats',
                    section: 'Store Concept Card 3',
                    currentImage: content.concept.cakesImage || '',
                    onUpdate: (url: string) => updateLiveContent((prev) => ({ ...prev, concept: { ...prev.concept, cakesImage: url } })),
                  },
                  {
                    id: 'qrPoster',
                    label: 'QR Stand / Tabletop Poster',
                    section: 'QR Section & Stall Stand',
                    currentImage: content.qrSection?.image || '',
                    onUpdate: (url: string) => updateLiveContent((prev) => ({ ...prev, qrSection: { ...(prev.qrSection || { badge: '', title: '', subtitle: '', notice: '' }), image: url } })),
                  },
                  {
                    id: 'stallBangles',
                    label: 'Stall Product: Artisan Bangles',
                    section: 'Physical Stall Exclusives',
                    currentImage: content.stallProducts.bangles.image,
                    onUpdate: (url: string) => updateLiveContent((prev) => ({ ...prev, stallProducts: { ...prev.stallProducts, bangles: { ...prev.stallProducts.bangles, image: url } } })),
                  },
                  {
                    id: 'stallCakes',
                    label: 'Stall Product: Foods & Treats',
                    section: 'Physical Stall Exclusives',
                    currentImage: content.stallProducts.cakes.image,
                    onUpdate: (url: string) => updateLiveContent((prev) => ({ ...prev, stallProducts: { ...prev.stallProducts, cakes: { ...prev.stallProducts.cakes, image: url } } })),
                  },
                  {
                    id: 'teamPhoto',
                    label: 'Store Team & Stall Photo',
                    section: 'About Store & Founders',
                    currentImage: content.about.teamPhoto || '',
                    onUpdate: (url: string) => updateLiveContent((prev) => ({ ...prev, about: { ...prev.about, teamPhoto: url } })),
                  },
                ].map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs truncate" title={item.label}>
                          {item.label}
                        </span>
                        <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded font-mono truncate max-w-[120px]">
                          {item.section}
                        </span>
                      </div>

                      {/* Thumbnail preview */}
                      <div className="aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative group">
                        {item.currentImage ? (
                          <img
                            src={item.currentImage}
                            alt={item.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[11px] p-2 text-center">
                            <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                            <span>No photo uploaded</span>
                          </div>
                        )}
                        {item.currentImage && (
                          <button
                            type="button"
                            onClick={() => item.onUpdate('')}
                            className="absolute top-1.5 right-1.5 p-1 bg-slate-900/70 hover:bg-rose-600 text-white rounded-md text-[10px] transition-colors"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* URL text input */}
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={item.currentImage}
                          onChange={(e) => item.onUpdate(e.target.value)}
                          placeholder="Paste image URL (https://...)..."
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px]"
                        />
                      </div>

                      {/* Upload Button */}
                      <label className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-sky-600" />
                        <span>Upload from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadImageFile(e, (dataUrl) => item.onUpdate(dataUrl))}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Preset quick pills */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => item.onUpdate(preset.url)}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                          title={`Use ${preset.label}`}
                        >
                          {preset.label.replace('Official ', '').replace('Store ', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ============================================================== */}
            {/* SECTION 1: HERO & MAIN CARD PHOTO                              */}
            {/* ============================================================== */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider font-display">
                    1. Hero Section & Main Booth Photo
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">Section #hero</span>
              </div>

              {/* Hero Photo Manager */}
              <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-sky-950 text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                    <span>Hero Display Photo (Main Stall / Booth Picture)</span>
                  </label>
                  <span className="text-[10px] text-sky-700 font-semibold">Displayed in Right Column</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Photo Preview */}
                  <div className="w-28 h-20 rounded-xl overflow-hidden bg-slate-200 border-2 border-white shadow-xs shrink-0 relative group">
                    <img
                      src={content.heroCard?.image || content.store.bannerImage}
                      alt="Hero Display"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Image URL (e.g. https://... or /src/assets/...)"
                        value={content.heroCard?.image || ''}
                        onChange={(e) => setContent({
                          ...content,
                          heroCard: { ...content.heroCard, image: e.target.value }
                        })}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />

                      <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5 text-sky-600" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroCardImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500 font-semibold">Presets:</span>
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setContent({
                            ...content,
                            heroCard: { ...content.heroCard, image: preset.url }
                          })}
                          className="px-2 py-0.5 bg-white hover:bg-sky-100 text-slate-700 hover:text-sky-800 rounded border border-slate-200 text-[10px] cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge 1 (Event tag)</label>
                  <input
                    type="text"
                    value={content.hero.badge1}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, badge1: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge 2 (Concept tag)</label>
                  <input
                    type="text"
                    value={content.hero.badge2}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, badge2: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hero Title Line 1</label>
                  <input
                    type="text"
                    value={content.hero.titleLine1}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, titleLine1: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hero Title Highlight (Blue Gradient)</label>
                  <input
                    type="text"
                    value={content.hero.titleHighlight}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, titleHighlight: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sky-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Supporting Subtitle</label>
                  <textarea
                    rows={2}
                    value={content.hero.subtitle}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary CTA Button</label>
                  <input
                    type="text"
                    value={content.hero.primaryCtaText}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, primaryCtaText: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Secondary CTA Button</label>
                  <input
                    type="text"
                    value={content.hero.secondaryCtaText}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, secondaryCtaText: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* SECTION 2: STORE CONCEPT ("ONE STALL. THREE EXPERIENCES")       */}
            {/* ============================================================== */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-sky-600" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider font-display">
                    2. Store Concept ("One Stall. Three Experiences")
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">Section #concept</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={content.concept.badge}
                    onChange={(e) => setContent({ ...content, concept: { ...content.concept, badge: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Section Title</label>
                  <input
                    type="text"
                    value={content.concept.title}
                    onChange={(e) => setContent({ ...content, concept: { ...content.concept, title: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Section Subtitle</label>
                  <input
                    type="text"
                    value={content.concept.subtitle}
                    onChange={(e) => setContent({ ...content, concept: { ...content.concept, subtitle: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* 3 Experience Cards Detail + Photos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Books Experience Card */}
                <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200 space-y-3">
                  <div className="font-bold text-sky-900 flex items-center justify-between">
                    <span>📚 Card 1: Books</span>
                    <span className="text-[10px] text-sky-700">Digital Pre-Order</span>
                  </div>

                  <div>
                    <label className="font-semibold block mb-0.5 text-slate-600">Heading</label>
                    <input
                      type="text"
                      value={content.concept.booksHeading}
                      onChange={(e) => setContent({ ...content, concept: { ...content.concept, booksHeading: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-0.5 text-slate-600">Subtitle</label>
                    <input
                      type="text"
                      value={content.concept.booksSub}
                      onChange={(e) => setContent({ ...content, concept: { ...content.concept, booksSub: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sky-600 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-0.5 text-slate-600">Description</label>
                    <textarea
                      rows={2}
                      value={content.concept.booksDesc}
                      onChange={(e) => setContent({ ...content, concept: { ...content.concept, booksDesc: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  {/* Photo */}
                  <div>
                    <label className="font-semibold block mb-0.5 text-slate-600">Optional Card Photo</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Image URL or upload..."
                        value={content.concept.booksImage || ''}
                        onChange={(e) => setContent({ ...content, concept: { ...content.concept, booksImage: e.target.value } })}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px]"
                      />
                      <label className="p-1.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 shrink-0" title="Upload file">
                        <Upload className="w-3.5 h-3.5 text-sky-600" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadImageFile(e, (url) => updateLiveContent((prev) => ({ ...prev, concept: { ...prev.concept, booksImage: url } })))}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bangles Experience Card */}
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
                  <div className="font-bold text-amber-900 flex items-center justify-between">
                    <span>💍 Card 2: Bangles</span>
                    <span className="text-[10px] text-amber-700">Stall Exclusive</span>
                  </div>

                  <div>
                    <label className="font-semibold block mb-0.5 text-slate-600">Heading</label>
                    <input
                      type="text"
                      value={content.concept.banglesHeading}
                      onChange={(e) => setContent({ ...content, concept: { ...content.concept, banglesHeading: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-0.5 text-slate-600">Subtitle</label>
                    <input
                      type="text"
                      value={content.concept.banglesSub}
                      onChange={(e) => setContent({ ...content, concept: { ...content.concept, banglesSub: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-amber-600 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-0.5 text-slate-600">Description</label>
                    <textarea
                      rows={2}
                      value={content.concept.banglesDesc}
                      onChange={(e) => setContent({ ...content, concept: { ...content.concept, banglesDesc: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  {/* Photo */}
                  <div>
                    <label className="font-semibold block mb-0.5 text-slate-600">Optional Card Photo</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Image URL or upload..."
                        value={content.concept.banglesImage || ''}
                        onChange={(e) => updateLiveContent((prev) => ({ ...prev, concept: { ...prev.concept, banglesImage: e.target.value } }))}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px]"
                      />
                      <label className="p-1.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 shrink-0" title="Upload file">
                        <Upload className="w-3.5 h-3.5 text-amber-600" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadImageFile(e, (url) => updateLiveContent((prev) => ({ ...prev, concept: { ...prev.concept, banglesImage: url } })))}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Foods Experience Card */}
                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-3">
                  <div className="font-bold text-rose-900 flex items-center justify-between">
                    <span>🎂 Card 3: Foods</span>
                    <span className="text-[10px] text-rose-700">Fresh At Stall</span>
                  </div>

                  <div>
                    <label className="font-semibold block mb-0.5 text-slate-600">Heading</label>
                    <input
                      type="text"
                      value={content.concept.cakesHeading}
                      onChange={(e) => setContent({ ...content, concept: { ...content.concept, cakesHeading: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-0.5 text-slate-600">Subtitle</label>
                    <input
                      type="text"
                      value={content.concept.cakesSub}
                      onChange={(e) => setContent({ ...content, concept: { ...content.concept, cakesSub: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-rose-600 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-0.5 text-slate-600">Description</label>
                    <textarea
                      rows={2}
                      value={content.concept.cakesDesc}
                      onChange={(e) => setContent({ ...content, concept: { ...content.concept, cakesDesc: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  {/* Photo */}
                  <div>
                    <label className="font-semibold block mb-0.5 text-slate-600">Optional Card Photo</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Image URL or upload..."
                        value={content.concept.cakesImage || ''}
                        onChange={(e) => updateLiveContent((prev) => ({ ...prev, concept: { ...prev.concept, cakesImage: e.target.value } }))}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px]"
                      />
                      <label className="p-1.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 shrink-0" title="Upload file">
                        <Upload className="w-3.5 h-3.5 text-rose-600" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadImageFile(e, (url) => updateLiveContent((prev) => ({ ...prev, concept: { ...prev.concept, cakesImage: url } })))}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ============================================================== */}
            {/* SECTION 3: STALL EXCLUSIVES (BANGLES & TREATS) WITH FULL PHOTO */}
            {/* ============================================================== */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider font-display">
                    3. Physical Stall Exclusives (Bangles & Foods/Treats Showcase)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">Section #stall-products</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
                
                {/* 💍 Bangles Product Editor */}
                <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                    <span className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                      <span>💍</span> Handmade Bangles (Churi)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/60 text-amber-900">
                      Physical Stall Only
                    </span>
                  </div>

                  {/* Photo Uploader */}
                  <div className="space-y-2 p-3 bg-white rounded-xl border border-amber-200">
                    <label className="font-bold text-slate-700 block text-xs">
                      Bangles Display Photo
                    </label>

                    <div className="flex items-center gap-3">
                      <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img
                          src={content.stallProducts.bangles.image}
                          alt="Bangles preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          value={content.stallProducts.bangles.image}
                          onChange={(e) => setContent({
                            ...content,
                            stallProducts: {
                              ...content.stallProducts,
                              bangles: { ...content.stallProducts.bangles, image: e.target.value }
                            }
                          })}
                          placeholder="Image URL..."
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />

                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-semibold text-[11px] cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>Upload from Computer / Phone</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUploadImageFile(e, (dataUrl) => {
                                setContent({
                                  ...content,
                                  stallProducts: {
                                    ...content.stallProducts,
                                    bangles: { ...content.stallProducts.bangles, image: dataUrl }
                                  }
                                });
                              })}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => setContent({
                              ...content,
                              stallProducts: {
                                ...content.stallProducts,
                                bangles: { ...content.stallProducts.bangles, image: '/src/assets/images/stall_bangles_1790615330269.jpg' }
                              }
                            })}
                            className="text-[10px] text-slate-500 hover:underline cursor-pointer"
                          >
                            Reset Image
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Title & Price */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold block mb-0.5 text-slate-700">Name / Title</label>
                      <input
                        type="text"
                        value={content.stallProducts.bangles.name}
                        onChange={(e) => setContent({
                          ...content,
                          stallProducts: {
                            ...content.stallProducts,
                            bangles: { ...content.stallProducts.bangles, name: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-semibold block mb-0.5 text-slate-700">Price Range</label>
                      <input
                        type="text"
                        value={content.stallProducts.bangles.priceRange}
                        onChange={(e) => setContent({
                          ...content,
                          stallProducts: {
                            ...content.stallProducts,
                            bangles: { ...content.stallProducts.bangles, priceRange: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-amber-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold block mb-0.5 text-slate-700">Tagline</label>
                    <input
                      type="text"
                      value={content.stallProducts.bangles.tagline}
                      onChange={(e) => setContent({
                        ...content,
                        stallProducts: {
                          ...content.stallProducts,
                          bangles: { ...content.stallProducts.bangles, tagline: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-0.5 text-slate-700">Description</label>
                    <textarea
                      rows={2}
                      value={content.stallProducts.bangles.description}
                      onChange={(e) => setContent({
                        ...content,
                        stallProducts: {
                          ...content.stallProducts,
                          bangles: { ...content.stallProducts.bangles, description: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  {/* Highlights Bullet Points */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">Bullet Points / Features</label>
                      <button
                        type="button"
                        onClick={handleAddBanglesHighlight}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-900 cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Feature
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {(content.stallProducts.bangles.highlights || []).map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={highlight}
                            onChange={(e) => handleBanglesHighlightChange(idx, e.target.value)}
                            className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveBanglesHighlight(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Remove bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 🎂 Foods & Treats Product Editor */}
                <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-rose-200/80 pb-2">
                    <span className="font-bold text-rose-950 text-sm flex items-center gap-1.5">
                      <span>🎂</span> Foods & Treats (Cakes & Snacks)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200/60 text-rose-900">
                      Physical Stall Only
                    </span>
                  </div>

                  {/* Photo Uploader */}
                  <div className="space-y-2 p-3 bg-white rounded-xl border border-rose-200">
                    <label className="font-bold text-slate-700 block text-xs">
                      Foods & Treats Display Photo
                    </label>

                    <div className="flex items-center gap-3">
                      <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img
                          src={content.stallProducts.cakes.image}
                          alt="Cakes preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          value={content.stallProducts.cakes.image}
                          onChange={(e) => setContent({
                            ...content,
                            stallProducts: {
                              ...content.stallProducts,
                              cakes: { ...content.stallProducts.cakes, image: e.target.value }
                            }
                          })}
                          placeholder="Image URL..."
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />

                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg font-semibold text-[11px] cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>Upload from Computer / Phone</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUploadImageFile(e, (dataUrl) => {
                                setContent({
                                  ...content,
                                  stallProducts: {
                                    ...content.stallProducts,
                                    cakes: { ...content.stallProducts.cakes, image: dataUrl }
                                  }
                                });
                              })}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => setContent({
                              ...content,
                              stallProducts: {
                                ...content.stallProducts,
                                cakes: { ...content.stallProducts.cakes, image: '/src/assets/images/stall_cakes_1790615343160.jpg' }
                              }
                            })}
                            className="text-[10px] text-slate-500 hover:underline cursor-pointer"
                          >
                            Reset Image
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Title & Price */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold block mb-0.5 text-slate-700">Name / Title</label>
                      <input
                        type="text"
                        value={content.stallProducts.cakes.name}
                        onChange={(e) => setContent({
                          ...content,
                          stallProducts: {
                            ...content.stallProducts,
                            cakes: { ...content.stallProducts.cakes, name: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-semibold block mb-0.5 text-slate-700">Price Range</label>
                      <input
                        type="text"
                        value={content.stallProducts.cakes.priceRange}
                        onChange={(e) => setContent({
                          ...content,
                          stallProducts: {
                            ...content.stallProducts,
                            cakes: { ...content.stallProducts.cakes, priceRange: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-rose-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold block mb-0.5 text-slate-700">Tagline</label>
                    <input
                      type="text"
                      value={content.stallProducts.cakes.tagline}
                      onChange={(e) => setContent({
                        ...content,
                        stallProducts: {
                          ...content.stallProducts,
                          cakes: { ...content.stallProducts.cakes, tagline: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-0.5 text-slate-700">Description</label>
                    <textarea
                      rows={2}
                      value={content.stallProducts.cakes.description}
                      onChange={(e) => setContent({
                        ...content,
                        stallProducts: {
                          ...content.stallProducts,
                          cakes: { ...content.stallProducts.cakes, description: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  {/* Highlights Bullet Points */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">Bullet Points / Features</label>
                      <button
                        type="button"
                        onClick={handleAddCakesHighlight}
                        className="text-[11px] font-bold text-rose-700 hover:text-rose-900 cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Feature
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {(content.stallProducts.cakes.highlights || []).map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={highlight}
                            onChange={(e) => handleCakesHighlightChange(idx, e.target.value)}
                            className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCakesHighlight(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Remove bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ============================================================== */}
            {/* SECTION 4: HOW BOOK PRE-ORDERING WORKS (4 STEPS)               */}
            {/* ============================================================== */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider font-display">
                    4. How Book Pre-Ordering Works (4 Steps)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">Section #how-it-works</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Section Title</label>
                  <input
                    type="text"
                    value={content.howItWorks.title}
                    onChange={(e) => setContent({
                      ...content,
                      howItWorks: { ...content.howItWorks, title: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Section Subtitle</label>
                  <input
                    type="text"
                    value={content.howItWorks.subtitle}
                    onChange={(e) => setContent({
                      ...content,
                      howItWorks: { ...content.howItWorks, subtitle: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* 4 Steps Editor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2">
                {content.howItWorks.steps.map((stepItem, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded text-[11px]">
                        Step {stepItem.step}
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">Title</label>
                      <input
                        type="text"
                        value={stepItem.title}
                        onChange={(e) => {
                          const updated = [...content.howItWorks.steps];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          setContent({ ...content, howItWorks: { ...content.howItWorks, steps: updated } });
                        }}
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">Action Headline</label>
                      <input
                        type="text"
                        value={stepItem.action}
                        onChange={(e) => {
                          const updated = [...content.howItWorks.steps];
                          updated[idx] = { ...updated[idx], action: e.target.value };
                          setContent({ ...content, howItWorks: { ...content.howItWorks, steps: updated } });
                        }}
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sky-700"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">Description</label>
                      <textarea
                        rows={3}
                        value={stepItem.description}
                        onChange={(e) => {
                          const updated = [...content.howItWorks.steps];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          setContent({ ...content, howItWorks: { ...content.howItWorks, steps: updated } });
                        }}
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ============================================================== */}
            {/* SECTION 5: SMART BUSINESS MODEL (INVENTORY & SELECTION)        */}
            {/* ============================================================== */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider font-display">
                    5. Smart Business Model (Strategic Unit Economics)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">Section #business-model</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Section Title</label>
                  <input
                    type="text"
                    value={content.businessModel.title}
                    onChange={(e) => setContent({
                      ...content,
                      businessModel: { ...content.businessModel, title: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Capital Efficiency Metric</label>
                  <input
                    type="text"
                    value={content.businessModel.capitalEfficiency}
                    onChange={(e) => setContent({
                      ...content,
                      businessModel: { ...content.businessModel, capitalEfficiency: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Section Subtitle</label>
                  <textarea
                    rows={2}
                    value={content.businessModel.subtitle}
                    onChange={(e) => setContent({
                      ...content,
                      businessModel: { ...content.businessModel, subtitle: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* 3 Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                  <div className="font-bold text-emerald-900 text-xs">Pillar 1: Inventory Cost</div>
                  <input
                    type="text"
                    value={content.businessModel.pillar1Title}
                    onChange={(e) => setContent({
                      ...content,
                      businessModel: { ...content.businessModel, pillar1Title: e.target.value }
                    })}
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold"
                  />
                  <input
                    type="text"
                    value={content.businessModel.pillar1Sub}
                    onChange={(e) => setContent({
                      ...content,
                      businessModel: { ...content.businessModel, pillar1Sub: e.target.value }
                    })}
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-emerald-700"
                  />
                  <textarea
                    rows={3}
                    value={content.businessModel.pillar1Desc}
                    onChange={(e) => setContent({
                      ...content,
                      businessModel: { ...content.businessModel, pillar1Desc: e.target.value }
                    })}
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-200 space-y-2">
                  <div className="font-bold text-sky-900 text-xs">Pillar 2: Wider Selection</div>
                  <input
                    type="text"
                    value={content.businessModel.pillar2Title}
                    onChange={(e) => setContent({
                      ...content,
                      businessModel: { ...content.businessModel, pillar2Title: e.target.value }
                    })}
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold"
                  />
                  <input
                    type="text"
                    value={content.businessModel.pillar2Sub}
                    onChange={(e) => setContent({
                      ...content,
                      businessModel: { ...content.businessModel, pillar2Sub: e.target.value }
                    })}
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sky-700"
                  />
                  <textarea
                    rows={3}
                    value={content.businessModel.pillar2Desc}
                    onChange={(e) => setContent({
                      ...content,
                      businessModel: { ...content.businessModel, pillar2Desc: e.target.value }
                    })}
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 space-y-2">
                  <div className="font-bold text-purple-900 text-xs">Pillar 3: Customer-Driven</div>
                  <input
                    type="text"
                    value={content.businessModel.pillar3Title}
                    onChange={(e) => setContent({
                      ...content,
                      businessModel: { ...content.businessModel, pillar3Title: e.target.value }
                    })}
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold"
                  />
                  <input
                    type="text"
                    value={content.businessModel.pillar3Sub}
                    onChange={(e) => setContent({
                      ...content,
                      businessModel: { ...content.businessModel, pillar3Sub: e.target.value }
                    })}
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-purple-700"
                  />
                  <textarea
                    rows={3}
                    value={content.businessModel.pillar3Desc}
                    onChange={(e) => setContent({
                      ...content,
                      businessModel: { ...content.businessModel, pillar3Desc: e.target.value }
                    })}
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* SECTION 6: QR CODE STAND & PHYSICAL STALL GUIDE                */}
            {/* ============================================================== */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-sky-600" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider font-display">
                    6. Stall QR Stand & Physical Stall Guide
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">Section #qr-section</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={content.qrSection?.badge || 'Scan & Order at Stall #07'}
                    onChange={(e) => setContent({
                      ...content,
                      qrSection: {
                        ...content.qrSection,
                        badge: e.target.value,
                        title: content.qrSection?.title || 'At the Stall? Scan. Browse. Pre-Order.',
                        subtitle: content.qrSection?.subtitle || '',
                        notice: content.qrSection?.notice || '',
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Title</label>
                  <input
                    type="text"
                    value={content.qrSection?.title || 'At the Stall? Scan. Browse. Pre-Order.'}
                    onChange={(e) => setContent({
                      ...content,
                      qrSection: {
                        ...content.qrSection,
                        badge: content.qrSection?.badge || '',
                        title: e.target.value,
                        subtitle: content.qrSection?.subtitle || '',
                        notice: content.qrSection?.notice || '',
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={content.qrSection?.subtitle || 'Can\'t find the book you\'re looking for at our physical stall? Scan our tabletop QR stand and browse our wider collection on your phone.'}
                    onChange={(e) => setContent({
                      ...content,
                      qrSection: {
                        ...content.qrSection,
                        badge: content.qrSection?.badge || '',
                        title: content.qrSection?.title || '',
                        subtitle: e.target.value,
                        notice: content.qrSection?.notice || '',
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* SECTION 7: ABOUT & TEAM WITH PHOTO                            */}
            {/* ============================================================== */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider font-display">
                    7. About Store, Student Team & Story
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">Section #about</span>
              </div>

              {/* Team Photo Uploader */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="font-bold text-slate-800 block text-xs">
                  Team / Stall Photo
                </label>

                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                    <img
                      src={content.about.teamPhoto || '/src/assets/images/hero_bizventure_stall_1790615311084.jpg'}
                      alt="Team preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5 text-xs">
                    <input
                      type="text"
                      value={content.about.teamPhoto || ''}
                      onChange={(e) => setContent({ ...content, about: { ...content.about, teamPhoto: e.target.value } })}
                      placeholder="Paste Image URL or upload..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />

                    <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-sky-600" />
                      <span>Upload Picture from Computer / Mobile</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadImageFile(e, (dataUrl) => {
                          setContent({ ...content, about: { ...content.about, teamPhoto: dataUrl } });
                        })}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">About Title</label>
                  <input
                    type="text"
                    value={content.about.title}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, title: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Team Entrepreneurship Story</label>
                  <textarea
                    rows={3}
                    value={content.about.teamStory}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, teamStory: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                {/* 3 Values */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 space-y-1.5">
                    <span className="font-bold text-sky-900 block text-xs">Value 1</span>
                    <input
                      type="text"
                      value={content.about.value1Title}
                      onChange={(e) => setContent({ ...content, about: { ...content.about, value1Title: e.target.value } })}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                    <textarea
                      rows={2}
                      value={content.about.value1Desc}
                      onChange={(e) => setContent({ ...content, about: { ...content.about, value1Desc: e.target.value } })}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px]"
                    />
                  </div>

                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 space-y-1.5">
                    <span className="font-bold text-amber-900 block text-xs">Value 2</span>
                    <input
                      type="text"
                      value={content.about.value2Title}
                      onChange={(e) => setContent({ ...content, about: { ...content.about, value2Title: e.target.value } })}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                    <textarea
                      rows={2}
                      value={content.about.value2Desc}
                      onChange={(e) => setContent({ ...content, about: { ...content.about, value2Desc: e.target.value } })}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px]"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1.5">
                    <span className="font-bold text-emerald-900 block text-xs">Value 3</span>
                    <input
                      type="text"
                      value={content.about.value3Title}
                      onChange={(e) => setContent({ ...content, about: { ...content.about, value3Title: e.target.value } })}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                    <textarea
                      rows={2}
                      value={content.about.value3Desc}
                      onChange={(e) => setContent({ ...content, about: { ...content.about, value3Desc: e.target.value } })}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Team Motto / Closing Quote</label>
                  <input
                    type="text"
                    value={content.about.closingQuote}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, closingQuote: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-sky-800"
                  />
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* SECTION 8: EDITABLE FOOTER SECTION & STALL CONTACTS            */}
            {/* ============================================================== */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔔</span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider font-display">
                      8. Footer Section & Stall Links (Editable)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Edit brand identity, WhatsApp & phone contacts, festival opening hours, and Doraemon theme badges.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">Section #footer</span>
              </div>

              {/* Live Preview Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 text-white space-y-3">
                <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Live Footer Preview (Theme Matched)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-sm shadow-xs">
                    🔔
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">
                      {content.footer?.brandName || content.store.storeName}
                    </div>
                    <div className="text-[11px] text-rose-300 italic">
                      {content.footer?.tagline || content.store.storeTagline}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/40">
                    {content.footer?.badge1 || '🚪 Anywhere Door to Knowledge'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/40">
                    {content.footer?.badge2 || '🔔 100% Student Powered'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/40">
                    {content.footer?.badge3 || '✨ Good Vibes Only ♡'}
                  </span>
                </div>
              </div>

              {/* Brand & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Footer Brand Name</label>
                  <input
                    type="text"
                    value={content.footer?.brandName ?? content.store.storeName}
                    onChange={(e) => setContent({
                      ...content,
                      footer: {
                        ...(content.footer || {
                          brandName: content.store.storeName,
                          tagline: content.store.storeTagline,
                          description: 'A student-run physical stall and smart book pre-order ecosystem for BizVenture 2026.',
                          eventName: `${content.store.eventName} • ${content.store.organizer}`,
                          stallLocation: content.store.institution,
                          stallNumber: content.store.stallNumber,
                          date: content.store.date,
                          openingHours: 'Festival Day: 9:00 AM – 6:00 PM',
                          offeringsTitle: 'Store Offerings',
                          offering1: '📚 Curated Books & Smart Pre-Orders',
                          offering2: '💍 Handmade Bangles (Churi) at Stall',
                          offering3: '🎂 Fresh Homemade Treats & Celebrations',
                          linksTitle: 'Navigation & Stall Desk',
                          contactTitle: 'Stall Contacts & Pre-Orders',
                          contactPhone: content.store.stallContactPhone,
                          contactWhatsApp: content.store.stallWhatsApp,
                          contactEmail: 'groomreadbeyond@gmail.com',
                          badge1: '🚪 Anywhere Door to Knowledge',
                          badge2: '🔔 100% Student Powered',
                          badge3: '✨ Good Vibes Only ♡',
                          copyrightText: `© 2026 ${content.store.storeName} · ${content.store.institution}`,
                          bottomQuote: content.store.bannerBottomQuote,
                        }),
                        brandName: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Footer Tagline</label>
                  <input
                    type="text"
                    value={content.footer?.tagline ?? content.store.storeTagline}
                    onChange={(e) => setContent({
                      ...content,
                      footer: {
                        ...(content.footer || {} as any),
                        tagline: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl italic font-semibold text-rose-600"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="text-xs">
                <label className="font-bold text-slate-700 block mb-1">Footer Brand & Mission Description</label>
                <textarea
                  rows={2}
                  value={content.footer?.description ?? 'A student-run physical stall and smart book pre-order ecosystem for BizVenture 2026. Combining physical retail delights with an on-demand digital book collection.'}
                  onChange={(e) => setContent({
                    ...content,
                    footer: {
                      ...(content.footer || {} as any),
                      description: e.target.value,
                    }
                  })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Stall Location & Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Event Name</label>
                  <input
                    type="text"
                    value={content.footer?.eventName ?? `${content.store.eventName} • ${content.store.organizer}`}
                    onChange={(e) => setContent({
                      ...content,
                      footer: {
                        ...(content.footer || {} as any),
                        eventName: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stall Location</label>
                  <input
                    type="text"
                    value={content.footer?.stallLocation ?? content.store.institution}
                    onChange={(e) => setContent({
                      ...content,
                      footer: {
                        ...(content.footer || {} as any),
                        stallLocation: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stall Number</label>
                  <input
                    type="text"
                    value={content.footer?.stallNumber ?? content.store.stallNumber}
                    onChange={(e) => setContent({
                      ...content,
                      footer: {
                        ...(content.footer || {} as any),
                        stallNumber: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={content.footer?.openingHours ?? 'Festival Day: 9:00 AM – 6:00 PM'}
                    onChange={(e) => setContent({
                      ...content,
                      footer: {
                        ...(content.footer || {} as any),
                        openingHours: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Offerings Section */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3 text-xs">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span>Store Offerings Column in Footer</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Column Title</label>
                    <input
                      type="text"
                      value={content.footer?.offeringsTitle ?? 'Store Offerings'}
                      onChange={(e) => setContent({
                        ...content,
                        footer: {
                          ...(content.footer || {} as any),
                          offeringsTitle: e.target.value,
                        }
                      })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Offering 1 (Books)</label>
                    <input
                      type="text"
                      value={content.footer?.offering1 ?? '📚 Curated Books & Smart Pre-Orders'}
                      onChange={(e) => setContent({
                        ...content,
                        footer: {
                          ...(content.footer || {} as any),
                          offering1: e.target.value,
                        }
                      })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Offering 2 (Bangles)</label>
                    <input
                      type="text"
                      value={content.footer?.offering2 ?? '💍 Handmade Bangles (Churi) at Stall'}
                      onChange={(e) => setContent({
                        ...content,
                        footer: {
                          ...(content.footer || {} as any),
                          offering2: e.target.value,
                        }
                      })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Offering 3 (Treats)</label>
                    <input
                      type="text"
                      value={content.footer?.offering3 ?? '🎂 Fresh Homemade Treats & Celebrations'}
                      onChange={(e) => setContent({
                        ...content,
                        footer: {
                          ...(content.footer || {} as any),
                          offering3: e.target.value,
                        }
                      })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Contacts & Direct Pre-Orders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={content.footer?.contactPhone ?? content.store.stallContactPhone}
                    onChange={(e) => setContent({
                      ...content,
                      footer: {
                        ...(content.footer || {} as any),
                        contactPhone: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    placeholder="+880 1712-345678"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">WhatsApp Pre-Order Number</label>
                  <input
                    type="text"
                    value={content.footer?.contactWhatsApp ?? content.store.stallWhatsApp}
                    onChange={(e) => setContent({
                      ...content,
                      footer: {
                        ...(content.footer || {} as any),
                        contactWhatsApp: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-emerald-700 font-bold"
                    placeholder="+880 1712-345678"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stall Contact Email</label>
                  <input
                    type="text"
                    value={content.footer?.contactEmail ?? 'groomreadbeyond@gmail.com'}
                    onChange={(e) => setContent({
                      ...content,
                      footer: {
                        ...(content.footer || {} as any),
                        contactEmail: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="groomreadbeyond@gmail.com"
                  />
                </div>
              </div>

              {/* Badges (Doraemon & Anywhere Door Theme) */}
              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-3 text-xs">
                <div className="font-bold text-sky-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Doraemon Banner Theme Badges (Top of Footer)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Badge 1 (Door Portal)</label>
                    <input
                      type="text"
                      value={content.footer?.badge1 ?? '🚪 Anywhere Door to Knowledge'}
                      onChange={(e) => setContent({
                        ...content,
                        footer: {
                          ...(content.footer || {} as any),
                          badge1: e.target.value,
                        }
                      })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-rose-700"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Badge 2 (Student Powered)</label>
                    <input
                      type="text"
                      value={content.footer?.badge2 ?? '🔔 100% Student Powered'}
                      onChange={(e) => setContent({
                        ...content,
                        footer: {
                          ...(content.footer || {} as any),
                          badge2: e.target.value,
                        }
                      })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-amber-700"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Badge 3 (Good Vibes)</label>
                    <input
                      type="text"
                      value={content.footer?.badge3 ?? '✨ Good Vibes Only ♡'}
                      onChange={(e) => setContent({
                        ...content,
                        footer: {
                          ...(content.footer || {} as any),
                          badge3: e.target.value,
                        }
                      })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-sky-700"
                    />
                  </div>
                </div>
              </div>

              {/* Copyright & Quote */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Copyright Line</label>
                  <input
                    type="text"
                    value={content.footer?.copyrightText ?? `© 2026 ${content.store.storeName} · ${content.store.institution}`}
                    onChange={(e) => setContent({
                      ...content,
                      footer: {
                        ...(content.footer || {} as any),
                        copyrightText: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Footer Bottom Quote</label>
                  <input
                    type="text"
                    value={content.footer?.bottomQuote ?? content.store.bannerBottomQuote}
                    onChange={(e) => setContent({
                      ...content,
                      footer: {
                        ...(content.footer || {} as any),
                        bottomQuote: e.target.value,
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-rose-700"
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="sticky bottom-4 z-20 bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between">
              <div className="text-xs text-slate-300">
                Ready to save your CMS edits to the live site?
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save All Changes Live
              </button>
            </div>
          </form>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 5: STORE SETTINGS & BACKUP                                    */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold font-display text-slate-900">
                Store Settings & Database Backup
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure brand name, event info, stall contacts, and download/restore full database backups.
              </p>
            </div>

            {/* Store Identity */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm font-display border-b border-slate-100 pb-3">
                Store & Stall Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Store Name</label>
                  <input
                    type="text"
                    value={content.store.storeName}
                    onChange={(e) => setContent({ ...content, store: { ...content.store, storeName: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Store Tagline</label>
                  <input
                    type="text"
                    value={content.store.storeTagline}
                    onChange={(e) => setContent({ ...content, store: { ...content.store, storeTagline: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Event Name</label>
                  <input
                    type="text"
                    value={content.store.eventName}
                    onChange={(e) => setContent({ ...content, store: { ...content.store, eventName: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Organizer & Club</label>
                  <input
                    type="text"
                    value={content.store.organizer}
                    onChange={(e) => setContent({ ...content, store: { ...content.store, organizer: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Institution</label>
                  <input
                    type="text"
                    value={content.store.institution}
                    onChange={(e) => setContent({ ...content, store: { ...content.store, institution: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stall Number & Location</label>
                  <input
                    type="text"
                    value={content.store.stallNumber}
                    onChange={(e) => setContent({ ...content, store: { ...content.store, stallNumber: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stall Phone Contact</label>
                  <input
                    type="text"
                    value={content.store.stallContactPhone}
                    onChange={(e) => setContent({ ...content, store: { ...content.store, stallContactPhone: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stall WhatsApp Number</label>
                  <input
                    type="text"
                    value={content.store.stallWhatsApp}
                    onChange={(e) => setContent({ ...content, store: { ...content.store, stallWhatsApp: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Banner Bottom Quote</label>
                  <input
                    type="text"
                    value={content.store.bannerBottomQuote}
                    onChange={(e) => setContent({ ...content, store: { ...content.store, bannerBottomQuote: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                {/* Banner Photo Upload */}
                <div className="sm:col-span-2 space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="font-bold text-slate-700 block text-xs">
                    Official Stall Banner Picture
                  </label>

                  <div className="flex items-center gap-3">
                    <div className="w-28 h-16 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                      <img
                        src={content.store.bannerImage}
                        alt="Store Banner"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={content.store.bannerImage}
                        onChange={(e) => setContent({ ...content, store: { ...content.store, bannerImage: e.target.value } })}
                        placeholder="Banner Image URL..."
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />

                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg font-semibold text-[11px] border border-sky-200 cursor-pointer">
                          <Upload className="w-3 h-3 text-sky-600" />
                          <span>Upload Banner File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadImageFile(e, (dataUrl) => {
                              setContent({ ...content, store: { ...content.store, bannerImage: dataUrl } });
                            })}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setContent({ ...content, store: { ...content.store, bannerImage: '/src/assets/images/groom_read_beyond_banner_1790616666530.jpg' } })}
                          className="text-[10px] text-slate-500 hover:underline cursor-pointer"
                        >
                          Reset Default Banner
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      saveSiteContent(content);
                      showToast('Store settings saved successfully!');
                    }}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Save Store Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Database Backup & Export */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm font-display border-b border-slate-100 pb-3">
                Database Backup & Import
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-emerald-600" />
                      <span>Export Orders (CSV)</span>
                    </div>
                    <p className="text-emerald-800 leading-relaxed text-[11px]">
                      Export all order history stored in localStorage into a CSV file compatible with Microsoft Excel and Google Sheets.
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={handleExportCSV}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CSV ({orders.length} orders)</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-800 text-sm">Download JSON Backup</div>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      Export your books catalog, order history database, and site settings into a standalone JSON file.
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={handleExportJSON}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download JSON Backup</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-800 text-sm">Restore from Backup</div>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      Upload a previously downloaded JSON backup file to restore all books, orders, and content.
                    </p>
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Select JSON File</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportJSON}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>

      {/* ------------------------------------------------------------------- */}
      {/* EDIT / ADD BOOK MODAL                                               */}
      {/* ------------------------------------------------------------------- */}
      {isBookModalOpen && editingBook && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setIsBookModalOpen(false)} />

          <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 z-10 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold font-display text-slate-900 text-base">
                  {editingBook.id?.startsWith('book-') && !books.some((b) => b.id === editingBook.id)
                    ? 'Add New Book'
                    : `Edit Book: ${editingBook.title || 'Untitled'}`}
                </h3>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* Title & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Book Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingBook.title || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                    placeholder="e.g. The Alchemist"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                  {bookModalErrors.title && (
                    <p className="text-rose-500 text-[11px] mt-0.5">{bookModalErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Author <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingBook.author || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                    placeholder="e.g. Paulo Coelho"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                  {bookModalErrors.author && (
                    <p className="text-rose-500 text-[11px] mt-0.5">{bookModalErrors.author}</p>
                  )}
                </div>
              </div>

              {/* Genre, Cost Price & Selling Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Genre / Category</label>
                  <input
                    type="text"
                    value={editingBook.category || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                    placeholder="e.g. Fiction, Self Development, Finance..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Actual Cost Price (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingBook.costPrice !== undefined ? editingBook.costPrice : ''}
                    onChange={(e) => setEditingBook({ ...editingBook, costPrice: Number(e.target.value) })}
                    placeholder="e.g. 150 (Wholesale)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Wholesale acquisition</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Selling Price (৳) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingBook.price || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, price: Number(e.target.value) })}
                    placeholder="e.g. 300"
                    className="w-full px-3 py-2 bg-white border border-sky-400 rounded-xl font-mono font-bold text-sky-900"
                  />
                  <span className="text-[10px] text-sky-600 block mt-0.5">Shown to customers live</span>
                  {bookModalErrors.price && (
                    <p className="text-rose-500 text-[11px] mt-0.5">{bookModalErrors.price}</p>
                  )}
                </div>
              </div>

              {/* Live Unit Profit & Margin Preview Banner in Modal */}
              {editingBook.price !== undefined && editingBook.price > 0 && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Calculated Profit per Copy:</span>
                    <strong className="text-emerald-800 font-mono text-sm">
                      +৳{editingBook.price - (Number(editingBook.costPrice) || 0)}
                    </strong>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                    Gross Margin: {(((editingBook.price - (Number(editingBook.costPrice) || 0)) / editingBook.price) * 100).toFixed(1)}%
                  </div>
                </div>
              )}

              {/* Availability Status & Stall Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Availability Status</label>
                  <select
                    value={editingBook.status || 'available'}
                    onChange={(e) => setEditingBook({ ...editingBook, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="available">🟢 Available at Physical Stall</option>
                    <option value="preorder">🟡 Pre-Order Only</option>
                  </select>
                </div>

                {editingBook.status === 'available' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Physical Stall Copies</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={editingBook.stallStock || 3}
                      onChange={(e) => setEditingBook({ ...editingBook, stallStock: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Book Cover Picture (Image URL or Upload) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-700 block">
                  Book Cover Picture
                </label>
                
                <div className="flex items-center gap-3">
                  {/* Preview */}
                  <div className="w-12 h-16 rounded bg-slate-200 overflow-hidden shrink-0 border flex items-center justify-center">
                    {editingBook.coverImage ? (
                      <img
                        src={editingBook.coverImage}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${editingBook.coverBg || 'from-sky-600 to-indigo-900'} flex items-center justify-center text-[9px] text-white font-bold p-1 text-center`}>
                        Cover
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      placeholder="Paste Image URL (or upload below)..."
                      value={editingBook.coverImage || ''}
                      onChange={(e) => setEditingBook({ ...editingBook, coverImage: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />

                    <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                      <span>Upload Picture from Computer / Mobile</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Book Description</label>
                <textarea
                  rows={3}
                  value={editingBook.description || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                  placeholder="Summary of the book and why readers love it..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={Boolean(editingBook.featured)}
                  onChange={(e) => setEditingBook({ ...editingBook, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-600"
                />
                <label htmlFor="featuredToggle" className="font-semibold text-slate-700">
                  Highlight as Featured Book in stall presentation
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Save Book
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MANUAL ORDER MODAL                                                  */}
      {/* ------------------------------------------------------------------- */}
      {isManualOrderOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setIsManualOrderOpen(false)} />

          <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 z-10 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold font-display text-slate-900 text-base">
                Log Manual Stall Order
              </h3>
              <button
                onClick={() => setIsManualOrderOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualOrderSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Book</label>
                <select
                  value={manualOrderData.bookId}
                  onChange={(e) => setManualOrderData({ ...manualOrderData, bookId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} — ৳{b.price} ({b.status === 'available' ? 'In Stall' : 'Pre-Order'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="Customer name"
                  value={manualOrderData.customerName}
                  onChange={(e) => setManualOrderData({ ...manualOrderData, customerName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={manualOrderData.phoneNumber}
                  onChange={(e) => setManualOrderData({ ...manualOrderData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={manualOrderData.quantity}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Method</label>
                  <select
                    value={manualOrderData.contactMethod}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, contactMethod: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  >
                    <option value="Phone Call">Phone Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Internal Stall Note</label>
                <input
                  type="text"
                  placeholder="e.g. Paid in advance, will pick up at 4 PM"
                  value={manualOrderData.notes}
                  onChange={(e) => setManualOrderData({ ...manualOrderData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl mt-2 cursor-pointer shadow-xs transition-colors"
              >
                Register Order in Database
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* DELETE ORDER IN-APP CONFIRMATION MODAL                             */}
      {/* ------------------------------------------------------------------- */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setOrderToDelete(null)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 z-10 overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold font-display text-slate-900 text-base">
                Delete Order Permanently?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete this customer pre-order? This record will be permanently purged from the database and local storage.
              </p>
            </div>

            {/* Order Summary Details */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Order Number:</span>
                <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                  {orderToDelete.orderNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Customer:</span>
                <span className="font-semibold text-slate-900">
                  {orderToDelete.customerName} ({orderToDelete.phoneNumber})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Book Item:</span>
                <span className="font-semibold text-slate-800">
                  {orderToDelete.bookTitle} (x{orderToDelete.quantity})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Total Amount:</span>
                <span className="font-mono font-bold text-slate-900">
                  ৳{orderToDelete.bookPrice * orderToDelete.quantity}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Current Status:</span>
                <span className="font-bold text-amber-700">{orderToDelete.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteOrder(orderToDelete.id, orderToDelete.orderNumber)}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* DELETE BOOK IN-APP CONFIRMATION MODAL                               */}
      {/* ------------------------------------------------------------------- */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setBookToDelete(null)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 z-10 overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold font-display text-slate-900 text-base">
                Remove Book From Catalogue?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <strong className="text-slate-800">"{bookToDelete.title}"</strong> by {bookToDelete.author} from your stall catalogue?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBookToDelete(null)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteBook(bookToDelete.id, bookToDelete.title)}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Book</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* RESET BOOKS CONFIRMATION MODAL                                      */}
      {/* ------------------------------------------------------------------- */}
      {isResetBooksModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setIsResetBooksModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 z-10 overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold font-display text-slate-900 text-base">
                Reset Book Catalogue?
              </h3>
              <p className="text-xs text-slate-500">
                This will restore all original default books for Groom, Read & Beyond. Any custom added books will be replaced.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetBooksModalOpen(false)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmResetBooks}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Yes, Reset Books</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* RESET SITE CONTENT CONFIRMATION MODAL                               */}
      {/* ------------------------------------------------------------------- */}
      {isResetContentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setIsResetContentModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 z-10 overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold font-display text-slate-900 text-base">
                Reset Landing Page Content?
              </h3>
              <p className="text-xs text-slate-500">
                This will reset all landing page texts, hero headings, and section copy back to the default Groom, Read & Beyond BizVenture 2026 configuration.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetContentModalOpen(false)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmResetContent}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Yes, Reset Content</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
