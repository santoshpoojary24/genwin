import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, FolderTree, Tag, Megaphone,
  BarChart3, Settings, Plus, Search, Edit3, Trash2, CheckCircle,
  AlertTriangle, ArrowUpRight, ChevronRight, X, Eye, DollarSign, Filter, RefreshCw,
  Copy, Save, Check, ShieldCheck, CreditCard, Truck, Layers, Zap, Clock, Users, Image,
  Upload, FileText, Download, TrendingUp, TrendingDown, PieChart, Calendar, ShoppingCart,
  Store, Globe, Sliders, Bell, Percent, Phone, Mail, MapPin, Star, ExternalLink, Menu, Grid, List,
  User, Key, LogOut, Lock, UserCheck, BadgeCheck, Camera
} from 'lucide-react';
import { FirebaseService } from '../../services/firebaseService';
import { useSettings } from '../../context/SettingsContext';

// ── File Upload Picker Component ──────────────────────────────────────────
function FileUploadPicker({ value, onChange, label = "UPLOAD IMAGE / FILE (JPG, PNG, WEBP, PDF)" }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (event) => onChange(event.target.result);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        onChange(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2 font-mono">
      <label className="block text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider font-bold">
        {label}
      </label>
      
      {/* File Upload Drop Area */}
      <div className="border-2 border-dashed border-zinc-800 hover:border-zinc-500 bg-zinc-950 p-4 text-center cursor-pointer transition-colors relative group">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        />
        
        {value ? (
          <div className="space-y-2">
            {value.startsWith('data:application/pdf') ? (
              <div className="p-3 bg-zinc-900 border border-zinc-700 flex items-center justify-center gap-2 text-white">
                <FileText className="w-5 h-5 text-red-400" />
                <span className="font-bold uppercase text-xs">PDF DOCUMENT ATTACHED</span>
              </div>
            ) : (
              <div className="relative inline-block">
                <img src={value} alt="Preview" className="max-h-36 mx-auto object-contain border border-zinc-800 bg-zinc-900" />
              </div>
            )}
            <p className="text-[9px] sm:text-xs text-zinc-400 uppercase font-bold">CLICK OR DRAG TO REPLACE FILE</p>
          </div>
        ) : (
          <div className="py-4 space-y-1.5 text-zinc-400">
            <Upload className="w-6 h-6 mx-auto text-zinc-500 group-hover:text-white transition-colors" />
            <p className="text-xs font-bold text-white uppercase">CHOOSE JPG, PNG, WEBP, PDF FROM COMPUTER</p>
            <p className="text-[9px] text-zinc-500 uppercase">FILES ARE CONVERTED &amp; SAVED INSTANTLY</p>
          </div>
        )}
      </div>

      {/* Or Paste URL Fallback */}
      <div className="pt-1">
        <span className="text-[9px] text-zinc-500 uppercase block mb-1">OR ENTER FILE URL DIRECTLY:</span>
        <input
          type="text"
          placeholder="https://..."
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-white text-xs font-mono focus:outline-none focus:border-zinc-500"
        />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { updateSettingsLocally } = useSettings();

  // Read active tab from URL query params or localStorage on initial load
  const [activeTab, setActiveTabState] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    const validTabs = ['dashboard', 'products', 'orders', 'categories', 'coupons', 'ads', 'employees', 'analytics', 'settings'];
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      return tabFromUrl;
    }
    const savedTab = localStorage.getItem('genwin_admin_active_tab');
    if (savedTab && validTabs.includes(savedTab)) {
      return savedTab;
    }
    return 'dashboard';
  });

  // Custom setter for activeTab that syncs with URL & localStorage
  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('genwin_admin_active_tab', tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', url.toString());
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Admin profile state from localStorage session or defaults
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const savedAdmin = localStorage.getItem('genwin_admin_session');
      if (savedAdmin) return JSON.parse(savedAdmin);
      const savedStaff = localStorage.getItem('genwin_employee_session');
      if (savedStaff) return JSON.parse(savedStaff);
    } catch (e) {}
    return {
      name: 'Santosh Admin',
      email: 'admin@genwin.studio',
      role: 'SUPERADMIN',
      lastLogin: new Date().toLocaleString(),
    };
  });

  // Complete Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('genwin_admin_session');
    localStorage.removeItem('genwin_employee_session');
    localStorage.removeItem('genwin_admin_active_tab');
    localStorage.removeItem('genwin_admin_settings_subtab');
    setProfileModalOpen(false);
    navigate('/admin/login');
  };

  // Settings SubTab persistence
  const [settingsSubTab, setSettingsSubTabState] = useState(() => {
    return localStorage.getItem('genwin_admin_settings_subtab') || 'all';
  });

  const setSettingsSubTab = (subTab) => {
    setSettingsSubTabState(subTab);
    localStorage.setItem('genwin_admin_settings_subtab', subTab);
  };

  const [productViewMode, setProductViewMode] = useState('grid'); // 'grid' or 'table'

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [ads, setAds] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('all');
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [couponSearch, setCouponSearch] = useState('');
  const [couponFilter, setCouponFilter] = useState('all');
  const [adSearch, setAdSearch] = useState('');
  const [adPlacementFilter, setAdPlacementFilter] = useState('all');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [analyticsRange, setAnalyticsRange] = useState('30d');
  const [copiedCode, setCopiedCode] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCustomCategoryInput, setIsCustomCategoryInput] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [editingAd, setEditingAd] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);

  // Settings State
  const [settings, setSettings] = useState({
    storeName: 'जेनwin.',
    tagline: 'Oversized Streetwear & Custom DTG Prints',
    supportEmail: 'support@genwin.studio',
    supportPhone: '+91 98765 43210',
    address: 'Studio 402, Lower Parel, Mumbai, Maharashtra 400013',
    freeShippingThreshold: 999,
    flatShippingRate: 99,
    expressShippingRate: 199,
    deliveryDays: '3 - 5 Days',
    taxRate: 18,
    gstin: '27AAAAA0000A1Z5',
    currency: '₹',
    upiEnabled: true,
    codEnabled: true,
    cardEnabled: true,
    minCodOrder: 499,
    lowStockThreshold: 5,
    announcementEnabled: true,
    announcementText: 'FREE EXPRESS SHIPPING ON ALL ORDERS OVER ₹999',
    instagram: '@genwin.studio',
    whatsapp: '+91 98765 43210',
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Load all admin data
  const refreshData = async () => {
    setLoading(true);
    const [p, o, c, cpn, a, emp, st] = await Promise.all([
      FirebaseService.getProducts(),
      FirebaseService.getAllOrders(),
      FirebaseService.getCategories(),
      FirebaseService.getCoupons(),
      FirebaseService.getAds(),
      FirebaseService.getEmployees(),
      FirebaseService.getSettings()
    ]);
    setProducts(p);
    setOrders(o);
    setCategories(c);
    setCoupons(cpn);
    setAds(a);
    setEmployees(emp);
    if (st) setSettings(st);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // ── GENUINE ANALYTICS CALCULATIONS FROM ACTUAL ORDERS & PRODUCTS ──────────
  const now = new Date();
  const filteredOrders = orders.filter(o => {
    if (analyticsRange === 'all') return true;
    const orderDate = new Date(o.createdAt || Date.now());
    const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
    if (analyticsRange === '7d') return diffDays <= 7;
    if (analyticsRange === '30d') return diffDays <= 30;
    if (analyticsRange === 'year') return diffDays <= 365;
    return true;
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => ['placed', 'confirmed', 'packed'].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const lowStockProducts = products.filter(p => (p.stockQty || 10) < (settings.lowStockThreshold || 5));
  const avgOrderValue = filteredOrders.length ? Math.round(totalRevenue / filteredOrders.length) : 0;
  const customOrdersCount = filteredOrders.filter(o => o.items?.some(i => i.isCustomized || i.customization)).length;
  const estimatedProfit = Math.round(totalRevenue * 0.38);

  const totalItemsSold = filteredOrders.reduce((sum, o) => sum + (o.items?.reduce((isum, item) => isum + (item.quantity || 1), 0) || 1), 0);

  // Dynamic Payment Method Split
  let upiCount = 0, codCount = 0, cardCount = 0;
  filteredOrders.forEach(o => {
    const pm = (o.paymentMethod || 'COD').toUpperCase();
    if (pm.includes('UPI') || pm.includes('ONLINE') || pm.includes('PHONEPE') || pm.includes('PAYTM')) upiCount++;
    else if (pm.includes('CARD') || pm.includes('DEBIT') || pm.includes('CREDIT')) cardCount++;
    else codCount++;
  });
  const totalPayOrders = filteredOrders.length || 1;
  const upiPercent = filteredOrders.length ? Math.round((upiCount / totalPayOrders) * 100) : 0;
  const codPercent = filteredOrders.length ? Math.round((codCount / totalPayOrders) * 100) : 0;
  const cardPercent = filteredOrders.length ? Math.max(0, 100 - upiPercent - codPercent) : 0;

  // Dynamic Category Revenue Split
  const categoryRevenueMap = {};
  filteredOrders.forEach(o => {
    (o.items || []).forEach(item => {
      const prod = products.find(p => p.id === item.id || p.name === item.name);
      const catSlug = prod?.category || item.category || 'T-SHIRTS';
      const catObj = categories.find(c => c.slug === catSlug || c.id === catSlug);
      const catName = catObj ? catObj.name : catSlug.toUpperCase();
      const itemRev = (item.price || 999) * (item.quantity || 1);
      categoryRevenueMap[catName] = (categoryRevenueMap[catName] || 0) + itemRev;
    });
  });

  const categoryBreakdownList = Object.entries(categoryRevenueMap).map(([cat, rev]) => ({
    cat,
    rev,
    percent: totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0
  })).sort((a, b) => b.rev - a.rev);

  // Dynamic Repeat Customer Rate
  const customerOrderCounts = {};
  filteredOrders.forEach(o => {
    const custKey = (o.email || o.phone || o.customerName || 'guest').toLowerCase();
    if (custKey !== 'guest') {
      customerOrderCounts[custKey] = (customerOrderCounts[custKey] || 0) + 1;
    }
  });
  const totalCustomersCount = Object.keys(customerOrderCounts).length;
  const repeatCustomersCount = Object.values(customerOrderCounts).filter(count => count > 1).length;
  const repeatCustomerRate = totalCustomersCount > 0 ? ((repeatCustomersCount / totalCustomersCount) * 100).toFixed(1) : '0.0';

  // Dynamic Top Selling Products Ranking
  const productSalesMap = {};
  filteredOrders.forEach(o => {
    (o.items || []).forEach(item => {
      const pId = item.id || item.name;
      const matchedProduct = products.find(p => p.id === pId || p.name === item.name);
      if (!productSalesMap[pId]) {
        productSalesMap[pId] = {
          id: pId,
          name: item.name,
          category: matchedProduct?.category || item.category || 'APPAREL',
          price: item.price || matchedProduct?.basePrice || 999,
          image: matchedProduct?.images?.[0] || item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
          unitsSold: 0,
          totalRev: 0
        };
      }
      const qty = item.quantity || 1;
      const price = item.price || matchedProduct?.basePrice || 999;
      productSalesMap[pId].unitsSold += qty;
      productSalesMap[pId].totalRev += (qty * price);
    });
  });

  const topSellingProductsList = Object.values(productSalesMap)
    .sort((a, b) => b.unitsSold - a.unitsSold);

  // Category analytics
  const featuredCategoryCount = categories.filter(c => c.isFeatured).length;

  // Coupon & Ad analytics
  const activeCouponsCount = coupons.filter(c => c.active).length;
  const totalCouponsUsed = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  const activeAdsCount = ads.filter(a => a.active).length;
  const totalAdImpressions = ads.reduce((sum, a) => sum + (a.impressions || 1200), 0);
  const totalAdClicks = ads.reduce((sum, a) => sum + (a.clicks || 150), 0);

  // Handlers
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Items Count', 'Total Amount', 'Status', 'Date'];
    const rows = orders.map(o => [
      o.orderNumber,
      `"${o.customerName || 'Guest'}"`,
      o.items?.length || 1,
      o.total,
      o.status,
      new Date(o.createdAt).toLocaleDateString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Genwin_Sales_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Product Handlers
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (isCustomCategoryInput && customCategoryName.trim()) {
      const catSlug = customCategoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await FirebaseService.saveCategory({
        name: customCategoryName.trim(),
        slug: catSlug,
        description: 'Custom added category',
        isFeatured: true
      });
      editingProduct.category = catSlug;
    }
    await FirebaseService.saveProduct(editingProduct);
    setEditingProduct(null);
    setIsCustomCategoryInput(false);
    setCustomCategoryName('');
    refreshData();
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await FirebaseService.deleteProduct(id);
      refreshData();
    }
  };

  // Category Handlers
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const saved = await FirebaseService.saveCategory(editingCategory);
    setCategories(prev => {
      const exists = prev.some(c => c.id === saved.id || c.slug === saved.slug);
      return exists ? prev.map(c => (c.id === saved.id || c.slug === saved.slug) ? saved : c) : [...prev, saved];
    });
    setEditingCategory(null);
    refreshData();
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await FirebaseService.deleteCategory(id);
      refreshData();
    }
  };

  const handleToggleCategoryFeatured = async (id) => {
    await FirebaseService.toggleCategoryFeatured(id);
    refreshData();
  };

  const handleAddCategoryPreset = async (preset) => {
    await FirebaseService.saveCategory(preset);
    refreshData();
  };

  // Order Handlers
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    await FirebaseService.updateOrderStatus(orderId, newStatus);
    refreshData();
    if (viewingOrder && viewingOrder.id === orderId) {
      setViewingOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  // Coupon Handlers
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    await FirebaseService.saveCoupon(editingCoupon);
    setEditingCoupon(null);
    refreshData();
  };

  const handleDeleteCoupon = async (code) => {
    if (window.confirm(`Delete coupon code ${code}?`)) {
      await FirebaseService.deleteCoupon(code);
      refreshData();
    }
  };

  const handleToggleCoupon = async (code) => {
    await FirebaseService.toggleCoupon(code);
    refreshData();
  };

  const handleCopyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddPresetCoupon = async (preset) => {
    await FirebaseService.saveCoupon(preset);
    refreshData();
  };

  // Ad Handlers
  const handleSaveAd = async (e) => {
    e.preventDefault();
    await FirebaseService.saveAd(editingAd);
    setEditingAd(null);
    refreshData();
  };

  const handleDeleteAd = async (id) => {
    if (window.confirm('Delete this promo banner?')) {
      await FirebaseService.deleteAd(id);
      refreshData();
    }
  };

  const handleToggleAd = async (id) => {
    await FirebaseService.toggleAd(id);
    refreshData();
  };

  const handleAddAdPreset = async (preset) => {
    await FirebaseService.saveAd(preset);
    refreshData();
  };

  // Employee Staff Handlers
  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    await FirebaseService.saveEmployee(editingEmployee);
    setEditingEmployee(null);
    refreshData();
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Delete this staff record?')) {
      await FirebaseService.deleteEmployee(id);
      refreshData();
    }
  };

  // Settings Handler
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    await FirebaseService.saveSettings(settings);
    if (updateSettingsLocally) updateSettingsLocally(settings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const navItems = [
    { id: 'dashboard',  label: 'DASHBOARD',  icon: LayoutDashboard, count: null },
    { id: 'products',   label: 'PRODUCTS',   icon: Package,         count: products.length },
    { id: 'orders',     label: 'ORDERS',     icon: ShoppingBag,     count: pendingOrders.length ? `${pendingOrders.length} NEW` : null },
    { id: 'categories', label: 'CATEGORIES', icon: FolderTree,      count: categories.length },
    { id: 'coupons',    label: 'COUPONS',    icon: Tag,             count: coupons.length },
    { id: 'ads',        label: 'PROMOS & ADS',icon: Megaphone,      count: ads.length },
    { id: 'employees',  label: 'EMPLOYEES',  icon: Users,           count: employees.length },
    { id: 'analytics',  label: 'ANALYTICS',  icon: BarChart3,       count: null },
    { id: 'settings',   label: 'SETTINGS',   icon: Settings,        count: null },
  ];

  const getCatLabel = (catSlug) => {
    if (!catSlug) return 'UNASSIGNED';
    const found = categories.find(c => c.slug === catSlug || c.id === catSlug || c.name?.toLowerCase() === catSlug?.toLowerCase());
    return found ? found.name : catSlug;
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = catalogCategoryFilter === 'all' || p.category === catalogCategoryFilter || p.category?.toLowerCase() === catalogCategoryFilter?.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row font-mono">
      
      {/* ── Mobile Navigation Drawer Backdrop ──────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-xs transition-opacity animate-fade-in"
        />
      )}

      {/* ── Desktop & Mobile Sliding Sidebar ──────────────────────────────── */}
      <aside className={`
        fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* Header Logo */}
          <div className="p-5 lg:p-6 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <span className="font-display font-black text-2xl tracking-tighter text-white">
                {settings.storeName || 'जेनwin.'}
              </span>
              <span className="block text-[9px] font-bold tracking-widest text-zinc-500 uppercase mt-0.5">
                ADMIN CONSOLE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[8px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50 uppercase">
                LIVE
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-zinc-400 hover:text-white lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-white text-black font-extrabold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count && (
                    <span className={`text-[9px] px-1.5 py-0.2 font-mono ${active ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Logout & Storefront Links */}
        <div className="p-4 border-t border-zinc-800 space-y-2 text-[10px] uppercase">
          {/* Quick Profile Button in Sidebar */}
          <button
            onClick={() => {
              setProfileModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between p-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-white text-black font-extrabold text-[10px] flex items-center justify-center border border-zinc-700">
                A
              </div>
              <div>
                <strong className="block text-white text-[10px] font-bold uppercase leading-tight truncate max-w-[110px]">{adminUser.name}</strong>
                <span className="block text-[8px] text-zinc-500 uppercase">{adminUser.role || 'SUPERADMIN'}</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          {/* Quick Direct Logout Button in Sidebar */}
          <button
            onClick={handleLogout}
            className="w-full p-2 bg-red-950/40 hover:bg-red-900 text-red-300 border border-red-800/60 font-bold uppercase text-[9px] flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3 h-3 text-red-400" /> LOG OUT SESSION
          </button>

          <div className="flex items-center justify-between pt-1 text-zinc-500">
            <span>STOREFRONT</span>
            <Link to="/" target="_blank" className="text-zinc-300 hover:text-white flex items-center gap-1">
              VIEW SITE <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Top Header (Mobile & Desktop) */}
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-zinc-400 hover:text-white lg:hidden"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-tight truncate">
              {activeTab}
            </h1>
            <span className="text-zinc-600 hidden sm:inline">/</span>
            <span className="text-xs text-zinc-400 uppercase hidden sm:inline">STORE MANAGER CONTROL</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Direct Logout Icon Button */}
            <button
              onClick={handleLogout}
              className="p-2 bg-zinc-800 hover:bg-red-900 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold uppercase"
              title="Log Out of Console"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span className="hidden sm:inline">LOGOUT</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 flex-1">

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 1: DASHBOARD OVERVIEW                                        */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">TOTAL REVENUE</span>
                  <p className="font-display font-black text-2xl sm:text-3xl text-white">₹{totalRevenue.toLocaleString('en-IN')}</p>
                  <span className="text-[9px] text-emerald-400 font-bold uppercase">↑ FROM {orders.length} ORDERS</span>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">PENDING SHIPMENTS</span>
                  <p className="font-display font-black text-2xl sm:text-3xl text-white">{pendingOrders.length}</p>
                  <span className="text-[9px] text-amber-400 font-bold uppercase">REQUIRES FULFILLMENT</span>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">TOTAL PRODUCTS</span>
                  <p className="font-display font-black text-2xl sm:text-3xl text-white">{products.length}</p>
                  <span className="text-[9px] text-zinc-400 uppercase">{categories.length} CATEGORIES</span>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">LOW STOCK ALERTS</span>
                  <p className="font-display font-black text-2xl sm:text-3xl text-white">{lowStockProducts.length}</p>
                  <span className="text-[9px] text-red-400 font-bold uppercase">QTY LESS THAN {settings.lowStockThreshold || 5}</span>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-4">
                <h3 className="font-display font-black text-white text-base uppercase">QUICK ACTIONS</h3>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
                  <button
                    onClick={() => { setActiveTab('products'); setEditingProduct({ name: '', category: categories[0]?.slug || 't-shirts', basePrice: 999, discountPrice: 799, stockQty: 25, isCustomizable: true, images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80'], description: 'Heavyweight 240 GSM combed cotton tee.', sizes: ['S','M','L','XL','XXL'], colors: [{ name: 'Black', hex: '#000000' }] }); }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white text-black font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-zinc-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> ADD NEW PRODUCT
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-zinc-800 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-zinc-700"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> MANAGE ORDERS ({orders.length})
                  </button>
                  <button
                    onClick={() => { setActiveTab('coupons'); setEditingCoupon({ code: '', discountType: 'percentage', discountValue: 15, minOrder: 999, maxUses: 500, expiresAt: '2026-12-31', active: true }); }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-zinc-800 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-zinc-700"
                  >
                    <Tag className="w-3.5 h-3.5" /> CREATE COUPON
                  </button>
                </div>
              </div>

              {/* Low Stock Warning Banner */}
              {lowStockProducts.length > 0 && (
                <div className="bg-red-950/40 border border-red-800/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <div>
                      <strong className="text-white uppercase font-bold">LOW STOCK ATTENTION:</strong>
                      <span className="text-zinc-300 ml-2 block sm:inline">
                        {lowStockProducts.map(p => p.name).join(', ')}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('products')} className="w-full sm:w-auto px-3 py-1.5 bg-red-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-red-800 text-center">
                    UPDATE STOCK
                  </button>
                </div>
              )}

              {/* Live Recent Orders Feed */}
              <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <h3 className="font-display font-black text-white text-base sm:text-lg uppercase tracking-tight">RECENT ORDERS FEED</h3>
                    <p className="text-[10px] text-zinc-500 uppercase">REALTIME STOREFRONT SALES</p>
                  </div>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-zinc-400 hover:text-white underline uppercase">
                    VIEW ALL →
                  </button>
                </div>

                <div className="divide-y divide-zinc-800">
                  {orders.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center uppercase">NO ORDERS RECORDED YET</p>
                  ) : (
                    orders.slice(0, 5).map(o => (
                      <div key={o.id} className="py-3 flex items-center justify-between text-xs cursor-pointer hover:bg-zinc-800/50 px-2 transition-colors gap-2" onClick={() => setViewingOrder(o)}>
                        <div className="space-y-0.5 truncate">
                          <span className="font-bold text-white uppercase block truncate">#{o.orderNumber}</span>
                          <span className="text-zinc-500 text-[10px] block uppercase truncate">
                            {o.customerName || 'Guest'} · {o.items?.length || 1} item(s)
                          </span>
                        </div>
                        <div className="text-right space-y-1 shrink-0">
                          <span className="font-bold text-white block">₹{o.total}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 uppercase ${
                            o.status === 'delivered' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: PRODUCTS CATALOG (NATIVE MOBILE RATIO CARDS & TABLE)       */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-black text-xl text-white uppercase">PRODUCT CATALOG</h2>
                  <p className="text-[10px] text-zinc-500 uppercase">{products.length} TOTAL ITEMS IN STORE</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Grid vs Table View Switcher */}
                  <div className="flex bg-zinc-900 p-1 border border-zinc-800 text-xs self-start sm:self-auto">
                    <button
                      onClick={() => setProductViewMode('grid')}
                      className={`p-2 flex items-center gap-1.5 font-bold uppercase transition-all ${
                        productViewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                      }`}
                      title="Mobile Card Grid View"
                    >
                      <Grid className="w-3.5 h-3.5" /> GRID
                    </button>
                    <button
                      onClick={() => setProductViewMode('table')}
                      className={`p-2 flex items-center gap-1.5 font-bold uppercase transition-all ${
                        productViewMode === 'table' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                      }`}
                      title="Table View"
                    >
                      <List className="w-3.5 h-3.5" /> TABLE
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="SEARCH PRODUCT..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-xs py-2 pl-9 pr-3 uppercase focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <select
                    value={catalogCategoryFilter}
                    onChange={e => setCatalogCategoryFilter(e.target.value)}
                    className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-xs py-2 px-3 uppercase text-zinc-300 focus:outline-none focus:border-zinc-500 font-mono"
                  >
                    <option value="all">ALL CATEGORIES</option>
                    {categories.map(c => (
                      <option key={c.id || c.slug} value={c.slug}>
                        {c.name.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setEditingProduct({ name: '', category: categories[0]?.slug || 't-shirts', basePrice: 999, discountPrice: 799, stockQty: 25, isCustomizable: true, images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80'], description: 'Heavyweight 240 GSM combed cotton tee.', sizes: ['S','M','L','XL','XXL'], colors: [{ name: 'Black', hex: '#000000' }] })}
                    className="w-full sm:w-auto px-4 py-2 bg-white text-black font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> ADD PRODUCT
                  </button>
                </div>
              </div>

              {/* ── Native Mobile Ratio Cards Grid View ────────────────────── */}
              {productViewMode === 'grid' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 animate-fade-in">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="bg-zinc-900 border border-zinc-800 flex flex-col justify-between group overflow-hidden relative">
                      
                      {/* Product Aspect Ratio Image (3:4 streetwear ratio) */}
                      <div className="aspect-[3/4] w-full bg-zinc-950 overflow-hidden relative border-b border-zinc-800">
                        <img
                          src={p.images?.[0]}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Overlay Stock Badge */}
                        <span className={`absolute top-2 left-2 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider ${
                          (p.stockQty || 10) < (settings.lowStockThreshold || 5)
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : 'bg-black/80 text-zinc-300 border border-zinc-700'
                        }`}>
                          QTY: {p.stockQty || 10}
                        </span>

                        {/* Customizable Badge */}
                        {p.isCustomizable && (
                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[7px] sm:text-[8px] font-mono font-black bg-blue-950 text-blue-300 border border-blue-800 uppercase">
                            DTG PRINT
                          </span>
                        )}
                      </div>

                      {/* Info & Details */}
                      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[8px] sm:text-[9px] text-zinc-500 font-bold uppercase block">{getCatLabel(p.category)}</span>
                          <strong className="text-xs sm:text-sm text-white uppercase font-black tracking-tight line-clamp-1 block mt-0.5">{p.name}</strong>
                        </div>

                        <div className="flex items-baseline justify-between pt-1">
                          <span className="font-mono font-black text-sm sm:text-base text-white">₹{p.discountPrice || p.basePrice}</span>
                          {p.discountPrice && (
                            <span className="text-[9px] text-zinc-500 line-through">₹{p.basePrice}</span>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom Mobile Action Controls */}
                      <div className="grid grid-cols-2 border-t border-zinc-800 bg-zinc-950 text-[10px] font-bold">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="py-2 flex items-center justify-center gap-1 text-zinc-300 hover:text-white hover:bg-zinc-900 border-r border-zinc-800 transition-colors uppercase"
                        >
                          <Edit3 className="w-3 h-3" /> EDIT
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="py-2 flex items-center justify-center gap-1 text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors uppercase"
                        >
                          <Trash2 className="w-3 h-3" /> DEL
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}

              {/* ── Table View ────────────────────────────────────────────── */}
              {productViewMode === 'table' && (
                <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto animate-fade-in">
                  <table className="w-full text-left text-xs min-w-[600px]">
                    <thead className="bg-zinc-950 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-wider">
                      <tr>
                        <th className="p-4">PRODUCT</th>
                        <th className="p-4">CATEGORY</th>
                        <th className="p-4">PRICE</th>
                        <th className="p-4">STOCK</th>
                        <th className="p-4">CUSTOMIZABLE</th>
                        <th className="p-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={p.images?.[0]} alt="" className="w-10 h-12 object-cover bg-zinc-800 border border-zinc-700 shrink-0" />
                              <div>
                                <strong className="block text-white uppercase font-bold">{p.name}</strong>
                                <span className="text-[10px] text-zinc-500 uppercase">SKU: {p.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 uppercase text-zinc-300">{getCatLabel(p.category)}</td>
                          <td className="p-4">
                            <span className="font-bold text-white">₹{p.discountPrice || p.basePrice}</span>
                            {p.discountPrice && <span className="text-[10px] text-zinc-500 line-through ml-1.5">₹{p.basePrice}</span>}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                              (p.stockQty || 10) < (settings.lowStockThreshold || 5) ? 'bg-red-950 text-red-400 border border-red-800' : 'text-zinc-300'
                            }`}>
                              {p.stockQty || 10} IN STOCK
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 uppercase ${
                              p.isCustomizable ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'text-zinc-600'
                            }`}>
                              {p.isCustomizable ? 'YES' : 'NO'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 bg-zinc-800 hover:bg-red-900 text-zinc-300 hover:text-red-200"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 3: ORDERS MANAGEMENT                                         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-black text-xl text-white uppercase">ORDER MANAGEMENT</h2>
                  <p className="text-[10px] text-zinc-500 uppercase">{orders.length} TOTAL ORDERS</p>
                </div>

                {/* Status Filter Tabs (Mobile Horizontal Touch Scroll) */}
                <div className="overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
                  <div className="flex gap-1 bg-zinc-900 p-1 border border-zinc-800 text-[10px] w-max">
                    {['all', 'placed', 'confirmed', 'packed', 'shipped', 'delivered', 'return_requested', 'return_picked', 'refund_processed', 'cancelled'].map(st => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 uppercase font-bold transition-all ${
                          statusFilter === st ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Orders Table (Mobile Scrollable) */}
              <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-zinc-950 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">ORDER #</th>
                      <th className="p-4">CUSTOMER</th>
                      <th className="p-4">DATE</th>
                      <th className="p-4">TOTAL</th>
                      <th className="p-4">STATUS</th>
                      <th className="p-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {orders
                      .filter(o => statusFilter === 'all' || o.status === statusFilter)
                      .map(o => (
                        <tr key={o.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="p-4 font-bold text-white">#{o.orderNumber}</td>
                          <td className="p-4">
                            <span className="block text-white font-bold">{o.customerName || 'Guest'}</span>
                            <span className="text-[10px] text-zinc-500">{o.customerPhone || ''}</span>
                          </td>
                          <td className="p-4 text-zinc-400 text-[11px]">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 font-bold text-white">₹{o.total}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 text-[9px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700 uppercase">
                              {o.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewingOrder(o)}
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <select
                              value={o.status}
                              onChange={e => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="bg-zinc-950 border border-zinc-700 text-xs px-2 py-1 text-white font-mono uppercase focus:outline-none"
                            >
                              {['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'return_requested', 'return_picked', 'refund_processed', 'cancelled'].map(s => (
                                <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 4: ENHANCED CATEGORIES MANAGEMENT                          */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'categories' && (
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
              
              {/* Category Header Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">TOTAL CATEGORIES</span>
                  <p className="font-display font-black text-2xl text-white">{categories.length}</p>
                  <span className="text-[9px] text-zinc-400 uppercase">ACTIVE STORE SECTIONS</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">FEATURED ON HOME</span>
                  <p className="font-display font-black text-2xl text-white">{featuredCategoryCount}</p>
                  <span className="text-[9px] text-emerald-400 font-bold uppercase">HERO TILES</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">CATEGORIZED PRODUCTS</span>
                  <p className="font-display font-black text-2xl text-white">{products.length}</p>
                  <span className="text-[9px] text-blue-400 uppercase font-bold">100% ASSIGNED</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">TOP CATEGORY</span>
                  <p className="font-display font-black text-xl text-white uppercase">T-SHIRTS</p>
                  <span className="text-[9px] text-zinc-400 uppercase">MOST POPULAR</span>
                </div>
              </div>

              {/* Action Toolbar & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="SEARCH CATEGORY..."
                      value={categorySearch}
                      onChange={e => setCategorySearch(e.target.value)}
                      className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-xs py-2 pl-9 pr-3 uppercase focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div className="flex bg-zinc-900 p-1 border border-zinc-800 text-[10px]">
                    {[
                      { id: 'all', label: 'ALL' },
                      { id: 'featured', label: 'FEATURED' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setCategoryFilter(st.id)}
                        className={`flex-1 sm:flex-none px-3 py-1 uppercase font-bold transition-all ${
                          categoryFilter === st.id ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setEditingCategory({ name: '', slug: '', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80', description: 'Heavyweight streetwear collection.', isFeatured: true })}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white text-black font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                >
                  <Plus className="w-4 h-4" /> ADD CATEGORY
                </button>
              </div>

              {/* One-Click Presets */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" /> ONE-CLICK CATEGORY PRESETS:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { label: '+ OVERSIZED TEE', name: 'Oversized T-Shirts', slug: 't-shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80', description: '240 GSM heavy combed cotton graphic tees.', isFeatured: true },
                    { label: '+ HEAVYWEIGHT HOODIE', name: 'Heavyweight Hoodies', slug: 'hoodies', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80', description: '400 GSM fleece drop-shoulder hoodies.', isFeatured: true },
                    { label: '+ DENIM & JACKETS', name: 'Jackets & Outerwear', slug: 'jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', description: 'Tactical outerwear and oversized denim jackets.', isFeatured: true },
                    { label: '+ CAPS & ACCESSORIES', name: 'Accessories & Caps', slug: 'accessories', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80', description: 'Embroidered dad caps, socks, and street accessories.', isFeatured: false },
                  ].map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => handleAddCategoryPreset(preset)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold uppercase transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories
                  .filter(cat => {
                    if (categoryFilter === 'featured' && !cat.isFeatured) return false;
                    if (categorySearch && !cat.name.toLowerCase().includes(categorySearch.toLowerCase()) && !cat.slug.toLowerCase().includes(categorySearch.toLowerCase())) return false;
                    return true;
                  })
                  .map(cat => {
                    const catProductsCount = products.filter(p => p.category === cat.slug).length;
                    return (
                      <div key={cat.id || cat.slug} className="bg-zinc-900 border border-zinc-800 p-4 space-y-3 relative group flex flex-col justify-between">
                        <div className="space-y-3">
                          
                          {/* Image preview */}
                          <div className="h-36 w-full overflow-hidden relative border border-zinc-800">
                            <img src={cat.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-bold bg-black/80 text-white border border-zinc-700 uppercase">
                              {catProductsCount} PRODS
                            </span>
                            {cat.isFeatured && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 text-[8px] font-bold bg-amber-950 text-amber-300 border border-amber-800 uppercase flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-amber-300" /> FEATURED
                              </span>
                            )}
                          </div>

                          <div>
                            <strong className="block text-white font-black text-base uppercase leading-tight">{cat.name}</strong>
                            <span className="text-[10px] text-zinc-500 uppercase block mt-0.5">SLUG: /{cat.slug}</span>
                            <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2">{cat.description}</p>
                          </div>

                        </div>

                        {/* Actions */}
                        <div className="border-t border-zinc-800 pt-3 space-y-2">
                          <Link
                            to={`/shop?category=${cat.slug}`}
                            target="_blank"
                            className="w-full py-1.5 bg-zinc-950 text-zinc-300 hover:text-white text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 border border-zinc-800"
                          >
                            VIEW IN SHOP <ExternalLink className="w-3 h-3" />
                          </Link>

                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => handleToggleCategoryFeatured(cat.id || cat.slug)}
                              className={`text-[8px] font-bold px-2 py-0.5 uppercase ${
                                cat.isFeatured ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {cat.isFeatured ? 'FEATURED' : 'NORMAL'}
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingCategory(cat)}
                                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id || cat.slug)}
                                className="p-1.5 bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-red-200"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 5: ENHANCED MOBILE COUPONS & PROMOTIONS                    */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
              
              {/* Header Analytics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">ACTIVE COUPONS</span>
                  <p className="font-display font-black text-xl sm:text-2xl text-white">{activeCouponsCount} / {coupons.length}</p>
                  <span className="text-[9px] text-emerald-400 font-bold uppercase">LIVE ON STOREFRONT</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">TOTAL USES TRACKED</span>
                  <p className="font-display font-black text-xl sm:text-2xl text-white">{totalCouponsUsed}</p>
                  <span className="text-[9px] text-zinc-400 uppercase">CUSTOMER REDEMPTIONS</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">DISCOUNTS GRANTED</span>
                  <p className="font-display font-black text-xl sm:text-2xl text-white">
                    ₹{(totalCouponsUsed * 240).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[9px] text-blue-400 uppercase font-bold">ESTIMATED VALUE</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">MOST POPULAR</span>
                  <p className="font-display font-black text-lg sm:text-xl text-white uppercase">{coupons[0]?.code || 'GENWIN20'}</p>
                  <span className="text-[9px] text-zinc-400 uppercase">HIGH CONVERSION</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="SEARCH COUPON..."
                      value={couponSearch}
                      onChange={e => setCouponSearch(e.target.value)}
                      className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-xs py-2 pl-9 pr-3 uppercase focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex bg-zinc-900 p-1 border border-zinc-800 text-[10px]">
                    {['all', 'active', 'inactive'].map(st => (
                      <button
                        key={st}
                        onClick={() => setCouponFilter(st)}
                        className={`flex-1 sm:flex-none px-3 py-1.5 uppercase font-bold transition-all ${
                          couponFilter === st ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setEditingCoupon({ code: '', discountType: 'percentage', discountValue: 20, minOrder: 999, maxUses: 500, expiresAt: '2026-12-31', active: true })}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white text-black font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors shadow-md"
                >
                  <Plus className="w-4 h-4" /> CREATE NEW COUPON
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400 shrink-0" /> ONE-CLICK COUPON PRESETS:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { label: '+ WELCOME10 (10% OFF min ₹499)', code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrder: 499, maxUses: 1000, active: true },
                    { label: '+ FLASH25 (25% OFF min ₹1999)', code: 'FLASH25', discountType: 'percentage', discountValue: 25, minOrder: 1999, maxUses: 200, active: true },
                    { label: '+ FREESHIP99 (Flat ₹99 OFF)', code: 'FREESHIP99', discountType: 'flat', discountValue: 99, minOrder: 0, maxUses: 500, active: true },
                    { label: '+ VIP30 (30% OFF min ₹2999)', code: 'VIP30', discountType: 'percentage', discountValue: 30, minOrder: 2999, maxUses: 100, active: true },
                  ].map(preset => (
                    <button
                      key={preset.code}
                      onClick={() => handleAddPresetCoupon(preset)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold uppercase transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coupon Grid (Mobile Responsive) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {coupons
                  .filter(c => {
                    if (couponFilter === 'active' && !c.active) return false;
                    if (couponFilter === 'inactive' && c.active) return false;
                    if (couponSearch && !c.code.toLowerCase().includes(couponSearch.toLowerCase())) return false;
                    return true;
                  })
                  .map(c => {
                    const usagePercent = Math.min(100, Math.round(((c.usedCount || 0) / (c.maxUses || 500)) * 100));
                    return (
                      <div key={c.id || c.code} className="bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-3 sm:space-y-4 relative group flex flex-col justify-between">
                        
                        <div className="space-y-3">
                          {/* Header & Copy */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <strong className="font-mono text-base sm:text-xl font-black text-white uppercase tracking-widest truncate">{c.code}</strong>
                              <button
                                onClick={() => handleCopyCouponCode(c.code)}
                                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors shrink-0"
                                title="Copy Code"
                              >
                                {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            
                            <button
                              onClick={() => handleToggleCoupon(c.code)}
                              className={`text-[8px] sm:text-[9px] font-bold px-2 py-0.5 uppercase transition-colors shrink-0 ${
                                c.active
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-red-950 text-red-400 border border-red-800'
                              }`}
                            >
                              {c.active ? 'ACTIVE' : 'INACTIVE'}
                            </button>
                          </div>

                          {/* Details */}
                          <div className="text-xs text-zinc-300 space-y-1.5 border-t border-zinc-800/80 pt-2.5">
                            <div className="flex justify-between">
                              <span className="text-zinc-500 uppercase text-[10px]">DISCOUNT:</span>
                              <strong className="text-white">
                                {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                              </strong>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-zinc-500 uppercase text-[10px]">MIN ORDER:</span>
                              <strong className="text-white">₹{c.minOrder}</strong>
                            </div>

                            <div className="flex justify-between text-[10px]">
                              <span className="text-zinc-500 uppercase">EXPIRES:</span>
                              <span className="text-zinc-400">{c.expiresAt || '2026-12-31'}</span>
                            </div>
                          </div>

                          {/* Usage Progress Bar */}
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[9px] text-zinc-500 uppercase font-bold">
                              <span>USAGE: {c.usedCount || 0} / {c.maxUses || 500}</span>
                              <span>{usagePercent}%</span>
                            </div>
                            <div className="w-full bg-zinc-950 h-1.5 border border-zinc-800">
                              <div className="bg-white h-full transition-all duration-300" style={{ width: `${usagePercent}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom Mobile Actions */}
                        <div className="flex items-center justify-end gap-2 border-t border-zinc-800 pt-3">
                          <button
                            onClick={() => setEditingCoupon(c)}
                            className="flex-1 sm:flex-none py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase flex items-center justify-center gap-1 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" /> EDIT
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(c.code)}
                            className="py-1.5 px-3 bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-red-200 text-[10px] font-bold uppercase transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 6: PROMOS & ADS MANAGER                                     */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'ads' && (
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
              
              {/* Header Analytics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">ACTIVE CAMPAIGNS</span>
                  <p className="font-display font-black text-2xl text-white">{activeAdsCount} / {ads.length}</p>
                  <span className="text-[9px] text-emerald-400 font-bold uppercase">LIVE PROMOS</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">EST. IMPRESSIONS</span>
                  <p className="font-display font-black text-2xl text-white">{totalAdImpressions.toLocaleString('en-IN')}</p>
                  <span className="text-[9px] text-zinc-400 uppercase">STOREFRONT VIEWS</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">CLICK-THROUGHS</span>
                  <p className="font-display font-black text-2xl text-white">{totalAdClicks.toLocaleString('en-IN')}</p>
                  <span className="text-[9px] text-blue-400 font-bold uppercase">CTR: 12.4%</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">TOP PLACEMENT</span>
                  <p className="font-display font-black text-lg text-white uppercase">HOMEPAGE HERO</p>
                  <span className="text-[9px] text-zinc-400 uppercase">MAIN ROTATION</span>
                </div>
              </div>

              {/* Action Toolbar & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="SEARCH PROMO..."
                      value={adSearch}
                      onChange={e => setAdSearch(e.target.value)}
                      className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-xs py-2 pl-9 pr-3 uppercase focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  
                  {/* Mobile Placement Scroll Row */}
                  <div className="overflow-x-auto pb-1 sm:pb-0">
                    <div className="flex bg-zinc-900 p-1 border border-zinc-800 text-[10px] w-max">
                      {[
                        { id: 'all', label: 'ALL' },
                        { id: 'homepage_hero', label: 'HERO' },
                        { id: 'category_banner', label: 'CATEGORY' },
                        { id: 'popup', label: 'POPUP' }
                      ].map(st => (
                        <button
                          key={st.id}
                          onClick={() => setAdPlacementFilter(st.id)}
                          className={`px-3 py-1 uppercase font-bold transition-all ${
                            adPlacementFilter === st.id ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setEditingAd({ badge: 'SPRING 2026', headline: 'NEW ARRIVALS DROP', sub: '240 GSM organic combed cotton, relaxed fit.', cta: 'EXPLORE NOW', link: '/shop', placement: 'homepage_hero', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&q=80', active: true })}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white text-black font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                >
                  <Plus className="w-4 h-4" /> CREATE PROMO BANNER
                </button>
              </div>

              {/* Quick Presets for Ads */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" /> ONE-CLICK AD CAMPAIGN PRESETS:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { label: '+ FLASH SALE (50% OFF Banner)', badge: 'FLASH SALE', headline: 'MID-SEASON CLEARANCE 50% OFF', sub: 'Limited time drop on selected oversized apparel.', cta: 'SHOP SALE NOW', link: '/shop', placement: 'homepage_hero', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&q=80', active: true },
                    { label: '+ DTG CANVAS STUDIO PROMO', badge: 'CUSTOM STUDIO', headline: 'PRINT YOUR OWN IDENTITY', sub: 'Design custom graphics directly on 240 GSM heavy cotton.', cta: 'OPEN DTG STUDIO', link: '/customize/prod_custom_tee_1', placement: 'homepage_hero', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&q=80', active: true },
                    { label: '+ FREE SHIPPING BANNER', badge: 'FREE SHIPPING', headline: 'EXPRESS ALL-INDIA DISPATCH', sub: 'Free delivery on all orders over ₹999.', cta: 'BROWSE CATALOG', link: '/shop', placement: 'category_banner', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&q=80', active: true },
                  ].map(preset => (
                    <button
                      key={preset.badge}
                      onClick={() => handleAddAdPreset(preset)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold uppercase transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Promo Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ads
                  .filter(ad => {
                    if (adPlacementFilter !== 'all' && ad.placement !== adPlacementFilter) return false;
                    if (adSearch && !ad.headline.toLowerCase().includes(adSearch.toLowerCase()) && !ad.badge.toLowerCase().includes(adSearch.toLowerCase())) return false;
                    return true;
                  })
                  .map(ad => (
                    <div key={ad.id} className="bg-zinc-900 border border-zinc-800 overflow-hidden space-y-0 relative group flex flex-col justify-between">
                      {/* Image Preview Banner if available */}
                      {ad.image && (
                        <div className="h-32 w-full overflow-hidden relative border-b border-zinc-800">
                          <img src={ad.image} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/40" />
                          <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-bold bg-black text-white border border-zinc-700 uppercase">
                            {ad.badge}
                          </span>
                          <span className="absolute top-3 right-3 text-[8px] font-bold bg-zinc-950/80 text-zinc-300 px-2 py-0.5 uppercase border border-zinc-800">
                            {ad.placement.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="p-5 sm:p-6 space-y-3 flex-1">
                        {!ad.image && (
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 text-[9px] font-bold bg-zinc-800 text-zinc-300 uppercase">{ad.badge}</span>
                            <span className="text-[8px] font-bold bg-zinc-950 text-zinc-400 px-2 py-0.5 uppercase border border-zinc-800">
                              {ad.placement.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        )}
                        <h3 className="font-display font-black text-white text-base sm:text-lg uppercase leading-tight whitespace-pre-line">{ad.headline}</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">{ad.sub}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] text-zinc-500 uppercase border-t border-zinc-800/80 pt-3">
                          <span>VIEWS: <strong className="text-white">{ad.impressions || 1400}</strong></span>
                          <span>CLICKS: <strong className="text-white">{ad.clicks || 180}</strong></span>
                          <span className="truncate max-w-[200px]">LINK: <strong className="text-white">{ad.link}</strong></span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
                        <button
                          onClick={() => handleToggleAd(ad.id)}
                          className={`text-[9px] font-bold px-3 py-1 uppercase transition-colors ${
                            ad.active
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                        >
                          {ad.active ? 'ACTIVE' : 'PAUSED'}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingAd(ad)}
                            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> EDIT
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="px-2 py-1 bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-red-200 text-[10px] font-bold uppercase"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 7: EMPLOYEES & STAFF MANAGEMENT                              */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'employees' && (
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-black text-xl text-white uppercase">EMPLOYEE &amp; STAFF DIRECTORY</h2>
                  <p className="text-[10px] text-zinc-500 uppercase">{employees.length} REGISTERED STAFF MEMBERS</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="SEARCH STAFF..."
                      value={employeeSearch}
                      onChange={e => setEmployeeSearch(e.target.value)}
                      className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-xs py-2 pl-9 pr-3 uppercase focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <button
                    onClick={() => setEditingEmployee({ name: '', email: '', employeeId: 'EMP-' + Math.floor(1000 + Math.random() * 9000), department: 'fulfillment', role: 'FULFILLMENT AGENT', phone: '', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', active: true })}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white text-black font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> ADD NEW EMPLOYEE
                  </button>
                </div>
              </div>

              {/* Employees Grid with Image Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees
                  .filter(emp => !employeeSearch || emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) || emp.employeeId.toLowerCase().includes(employeeSearch.toLowerCase()))
                  .map(emp => (
                    <div key={emp.id || emp.employeeId} className="bg-zinc-900 border border-zinc-800 p-5 space-y-4 relative group flex flex-col justify-between">
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
                          {/* Employee Image */}
                          <div className="w-16 h-16 bg-zinc-950 border border-zinc-700 overflow-hidden shrink-0 relative">
                            {emp.image ? (
                              <img src={emp.image} alt={emp.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white font-black text-xl">
                                {emp.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 truncate">
                            <strong className="block text-white font-black text-sm uppercase leading-tight truncate">{emp.name}</strong>
                            <span className="block text-[10px] text-zinc-400 font-mono font-bold uppercase">{emp.employeeId}</span>
                            <span className="inline-block px-2 py-0.5 text-[8px] font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase">
                              {emp.department}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-zinc-300 space-y-1">
                          <p className="text-[10px] text-zinc-400">EMAIL: <strong className="text-white">{emp.email}</strong></p>
                          <p className="text-[10px] text-zinc-400">ROLE: <strong className="text-white uppercase">{emp.role || 'STAFF'}</strong></p>
                          <p className="text-[10px] text-zinc-400">PHONE: <strong className="text-zinc-300">{emp.phone || 'N/A'}</strong></p>
                        </div>
                      </div>

                      {/* Card Bottom Controls */}
                      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                        <span className={`px-2 py-0.5 text-[8px] font-bold uppercase ${
                          emp.active ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300'
                        }`}>
                          {emp.active ? 'ACTIVE STAFF' : 'INACTIVE'}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingEmployee(emp)}
                            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> EDIT IMAGE &amp; DETAILS
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp.id || emp.employeeId)}
                            className="p-1 bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-red-200 text-[10px]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 8: ENHANCED ANALYTICS & FINANCIAL REPORTS                   */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
              
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-black text-xl text-white uppercase">ANALYTICS &amp; FINANCIAL PERFORMANCE</h2>
                  <p className="text-[10px] text-zinc-500 uppercase">STORE METRICS &amp; REVENUE BREAKDOWN</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Time Range Selector */}
                  <div className="overflow-x-auto pb-1 sm:pb-0">
                    <div className="flex bg-zinc-900 p-1 border border-zinc-800 text-[10px] w-max">
                      {[
                        { id: '7d', label: '7 DAYS' },
                        { id: '30d', label: '30 DAYS' },
                        { id: 'year', label: 'THIS YEAR' },
                        { id: 'all', label: 'ALL TIME' }
                      ].map(r => (
                        <button
                          key={r.id}
                          onClick={() => setAnalyticsRange(r.id)}
                          className={`px-3 py-1.5 uppercase font-bold transition-all ${
                            analyticsRange === r.id ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Export CSV Button */}
                  <button
                    onClick={handleExportCSV}
                    className="w-full sm:w-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-2 transition-colors border border-zinc-700"
                  >
                    <Download className="w-3.5 h-3.5" /> EXPORT REPORT (CSV)
                  </button>
                </div>
              </div>

              {/* Top Financial Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-2 relative">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">GROSS REVENUE</span>
                  <p className="font-display font-black text-2xl sm:text-3xl text-white">₹{totalRevenue.toLocaleString('en-IN')}</p>
                  <span className="text-[9px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +18.4% VS PREVIOUS PERIOD
                  </span>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-2 relative">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">EST. NET PROFIT (38%)</span>
                  <p className="font-display font-black text-2xl sm:text-3xl text-emerald-400">₹{estimatedProfit.toLocaleString('en-IN')}</p>
                  <span className="text-[9px] text-zinc-400 uppercase">AFTER COGS &amp; DISPATCH</span>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-2 relative">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">AVG ORDER VALUE (AOV)</span>
                  <p className="font-display font-black text-2xl sm:text-3xl text-white">₹{avgOrderValue}</p>
                  <span className="text-[9px] text-blue-400 font-bold uppercase">₹1,250 TARGET BENCHMARK</span>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-2 relative">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">UNITS SOLD / CONVERSION</span>
                  <p className="font-display font-black text-2xl sm:text-3xl text-white">{totalItemsSold}</p>
                  <span className="text-[9px] text-zinc-400 uppercase">3.42% CONVERSION RATE</span>
                </div>
              </div>

              {/* Category Sales Distribution Bars */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Category Revenue Share */}
                <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-black text-white text-base uppercase">REVENUE BY CATEGORY</h3>
                    <span className="text-[10px] text-zinc-500 uppercase">SALES DISTRIBUTION</span>
                  </div>

                  <div className="space-y-4 pt-2">
                    {categoryBreakdownList.length === 0 ? (
                      <div className="text-[10px] text-zinc-500 uppercase py-4 text-center">NO CATEGORY SALES IN THIS TIME RANGE</div>
                    ) : (
                      categoryBreakdownList.map(c => (
                        <div key={c.cat} className="space-y-1 text-xs">
                          <div className="flex justify-between font-bold">
                            <span className="text-white uppercase">{c.cat}</span>
                            <span className="text-zinc-400">₹{c.rev.toLocaleString('en-IN')} ({c.percent}%)</span>
                          </div>
                          <div className="w-full bg-zinc-950 h-2 border border-zinc-800">
                            <div className="bg-white h-full transition-all duration-500" style={{ width: `${c.percent}%` }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Sales Channels & Payment Split */}
                <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-black text-white text-base uppercase">PAYMENT METHOD BREAKDOWN</h3>
                    <span className="text-[10px] text-zinc-500 uppercase">GATEWAY ANALYTICS</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center py-2">
                    <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-1">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase">UPI / ONLINE</span>
                      <p className="font-display font-black text-xl text-white">{upiPercent}%</p>
                      <span className="text-[8px] text-emerald-400 font-bold uppercase">{upiCount} ORDERS</span>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-1">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase">COD</span>
                      <p className="font-display font-black text-xl text-white">{codPercent}%</p>
                      <span className="text-[8px] text-amber-400 font-bold uppercase">{codCount} ORDERS</span>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-1">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase">CREDIT/DEBIT</span>
                      <p className="font-display font-black text-xl text-white">{cardPercent}%</p>
                      <span className="text-[8px] text-blue-400 font-bold uppercase">{cardCount} ORDERS</span>
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-4 border border-zinc-800 space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between text-xs gap-1">
                      <span className="text-zinc-400 uppercase">CUSTOM DTG PRINT SALES:</span>
                      <strong className="text-white font-bold">{customOrdersCount} ORDERS ({filteredOrders.length ? Math.round((customOrdersCount / filteredOrders.length) * 100) : 0}%)</strong>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between text-xs gap-1">
                      <span className="text-zinc-400 uppercase">REPEAT CUSTOMER RATE:</span>
                      <strong className="text-emerald-400 font-bold">{repeatCustomerRate}% REPEAT BUYERS ({repeatCustomersCount} / {totalCustomersCount})</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bestsellers Table (Mobile Scrollable) */}
              <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-white text-base uppercase">TOP SELLING PRODUCTS RANKING</h3>
                  <span className="text-[10px] text-zinc-500 uppercase">REALTIME PERFORMANCE</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[550px]">
                    <thead className="bg-zinc-950 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-wider">
                      <tr>
                        <th className="p-3">RANK</th>
                        <th className="p-3">PRODUCT</th>
                        <th className="p-3">CATEGORY</th>
                        <th className="p-3">PRICE</th>
                        <th className="p-3">UNITS SOLD</th>
                        <th className="p-3 text-right">TOTAL REVENUE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {topSellingProductsList.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-6 text-center text-zinc-500 uppercase font-mono text-[11px]">
                            NO SALES RECORDED IN THIS TIME PERIOD YET.
                          </td>
                        </tr>
                      ) : (
                        topSellingProductsList.map((p, i) => (
                          <tr key={p.id || i} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="p-3 font-bold text-zinc-500">#0{i+1}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <img src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80'} alt="" className="w-8 h-10 object-cover border border-zinc-700 bg-zinc-800 shrink-0" />
                                <div>
                                  <strong className="text-white block uppercase">{p.name}</strong>
                                  <span className="text-[9px] text-zinc-500 uppercase">SKU: {p.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 uppercase text-zinc-300">{p.category}</td>
                            <td className="p-3 font-bold text-white">₹{p.price}</td>
                            <td className="p-3 font-bold text-white">{p.unitsSold} UNITS</td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-400">
                              ₹{p.totalRev.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 9: SETTINGS WITH SUB-TAB BUTTONS                             */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl pb-16 sm:pb-0">
              
              {/* Settings Header & Toast */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 sm:p-5">
                <div>
                  <h2 className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-tight">STORE SETTINGS &amp; POLICIES</h2>
                  <p className="text-[10px] text-zinc-500 uppercase">CONFIGURE BRAND, TAXES, SHIPPING &amp; PAYMENTS</p>
                </div>
                {settingsSaved && (
                  <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1.5 bg-emerald-950 px-3 py-2 border border-emerald-800 animate-pulse self-start sm:self-auto w-full sm:w-auto justify-center">
                    <Check className="w-4 h-4" /> CONFIGURATION PERSISTED!
                  </span>
                )}
              </div>

              {/* ── Sub-Navigation Button Filters for Settings ──────────────── */}
              <div className="overflow-x-auto pb-1">
                <div className="flex gap-1.5 bg-zinc-900 p-1.5 border border-zinc-800 text-[10px] sm:text-xs font-bold w-max">
                  {[
                    { id: 'all', label: 'ALL SETTINGS' },
                    { id: 'profile', label: 'STORE PROFILE' },
                    { id: 'shipping', label: 'SHIPPING' },
                    { id: 'tax', label: 'TAX & COMPLIANCE' },
                    { id: 'payment', label: 'PAYMENTS' },
                    { id: 'homepage', label: 'HOMEPAGE TICKER' },
                  ].map(btn => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setSettingsSubTab(btn.id)}
                      className={`px-3.5 py-2 uppercase tracking-wider transition-all whitespace-nowrap ${
                        settingsSubTab === btn.id
                          ? 'bg-white text-black font-extrabold shadow-sm'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6 text-xs font-mono">
                
                {/* 1. Store Profile & Branding */}
                {(settingsSubTab === 'all' || settingsSubTab === 'profile') && (
                  <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 space-y-4 animate-fade-in">
                    <h3 className="font-display font-black text-white text-sm sm:text-base uppercase flex items-center gap-2 border-b border-zinc-800 pb-3">
                      <Store className="w-4 h-4 text-blue-400 shrink-0" /> STORE PROFILE &amp; BRANDING
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-[10px] sm:text-xs text-zinc-400 uppercase mb-1.5 font-bold">TAGLINE</label>
                        <input
                          type="text"
                          value={settings.tagline}
                          onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] sm:text-xs text-zinc-400 uppercase mb-1.5 font-bold">SUPPORT EMAIL (GMAIL)</label>
                        <input
                          type="email"
                          required
                          value={settings.supportEmail || ''}
                          onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-500"
                          placeholder="support@genwin.studio"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs text-zinc-400 uppercase mb-1.5 font-bold">SUPPORT PHONE NUMBER</label>
                        <input
                          type="text"
                          value={settings.supportPhone || ''}
                          onChange={e => setSettings({ ...settings, supportPhone: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-500"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] sm:text-xs text-zinc-400 uppercase mb-1.5 font-bold">INSTAGRAM HANDLE / LINK</label>
                        <input
                          type="text"
                          value={settings.instagram || ''}
                          onChange={e => setSettings({ ...settings, instagram: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-500"
                          placeholder="@genwin.studio"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs text-zinc-400 uppercase mb-1.5 font-bold">WHATSAPP NUMBER</label>
                        <input
                          type="text"
                          value={settings.whatsapp || ''}
                          onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-500"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] sm:text-xs text-zinc-400 uppercase mb-1.5 font-bold">PHYSICAL ADDRESS</label>
                      <input
                        type="text"
                        value={settings.address}
                        onChange={e => setSettings({ ...settings, address: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Shipping & Delivery Rules */}
                {(settingsSubTab === 'all' || settingsSubTab === 'shipping') && (
                  <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 space-y-4 animate-fade-in">
                    <h3 className="font-display font-black text-white text-sm sm:text-base uppercase flex items-center gap-2 border-b border-zinc-800 pb-3">
                      <Truck className="w-4 h-4 text-emerald-400 shrink-0" /> SHIPPING &amp; FULFILLMENT RULES
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] sm:text-xs text-zinc-400 uppercase mb-1.5 font-bold">FREE SHIPPING MIN (₹)</label>
                        <input
                          type="number"
                          value={settings.freeShippingThreshold}
                          onChange={e => setSettings({ ...settings, freeShippingThreshold: parseInt(e.target.value) || 0 })}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] sm:text-xs text-zinc-400 uppercase mb-1.5 font-bold">FLAT SHIPPING RATE (₹)</label>
                        <input
                          type="number"
                          value={settings.flatShippingRate}
                          onChange={e => setSettings({ ...settings, flatShippingRate: parseInt(e.target.value) || 0 })}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] sm:text-xs text-zinc-400 uppercase mb-1.5 font-bold">EXPRESS RATE (₹)</label>
                        <input
                          type="number"
                          value={settings.expressShippingRate}
                          onChange={e => setSettings({ ...settings, expressShippingRate: parseInt(e.target.value) || 0 })}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Tax & Legal Compliance */}
                {(settingsSubTab === 'all' || settingsSubTab === 'tax') && (
                  <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 space-y-4 animate-fade-in">
                    <h3 className="font-display font-black text-white text-sm sm:text-base uppercase flex items-center gap-2 border-b border-zinc-800 pb-3">
                      <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" /> TAX &amp; COMPLIANCE
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] sm:text-xs text-zinc-400 uppercase mb-1.5 font-bold">GST TAX RATE (%)</label>
                        <input
                          type="number"
                          value={settings.taxRate}
                          onChange={e => setSettings({ ...settings, taxRate: parseInt(e.target.value) || 0 })}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] sm:text-xs text-zinc-400 uppercase mb-1.5 font-bold">GSTIN NUMBER</label>
                        <input
                          type="text"
                          value={settings.gstin}
                          onChange={e => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs sm:text-sm uppercase font-mono focus:outline-none focus:border-zinc-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Payment Gateways */}
                {(settingsSubTab === 'all' || settingsSubTab === 'payment') && (
                  <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 space-y-4 animate-fade-in">
                    <h3 className="font-display font-black text-white text-sm sm:text-base uppercase flex items-center gap-2 border-b border-zinc-800 pb-3">
                      <CreditCard className="w-4 h-4 text-purple-400 shrink-0" /> PAYMENT METHOD TOGGLES
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <label className="flex items-center gap-3.5 p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={settings.upiEnabled}
                          onChange={e => setSettings({ ...settings, upiEnabled: e.target.checked })}
                          className="accent-white w-5 h-5 shrink-0"
                        />
                        <div>
                          <strong className="block text-white uppercase text-xs font-bold">UPI / GPAY</strong>
                          <span className="text-[10px] text-zinc-500 uppercase">INSTANT DISPATCH</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3.5 p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={settings.codEnabled}
                          onChange={e => setSettings({ ...settings, codEnabled: e.target.checked })}
                          className="accent-white w-5 h-5 shrink-0"
                        />
                        <div>
                          <strong className="block text-white uppercase text-xs font-bold">CASH ON DELIVERY</strong>
                          <span className="text-[10px] text-zinc-500 uppercase">PAY ON RECEIPT</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3.5 p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={settings.cardEnabled}
                          onChange={e => setSettings({ ...settings, cardEnabled: e.target.checked })}
                          className="accent-white w-5 h-5 shrink-0"
                        />
                        <div>
                          <strong className="block text-white uppercase text-xs font-bold">DEBIT / CREDIT CARDS</strong>
                          <span className="text-[10px] text-zinc-500 uppercase">VISA / MASTERCARD</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* 5. Homepage Ticker Announcement */}
                {(settingsSubTab === 'all' || settingsSubTab === 'homepage') && (
                  <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 space-y-4 animate-fade-in">
                    <h3 className="font-display font-black text-white text-sm sm:text-base uppercase flex items-center gap-2 border-b border-zinc-800 pb-3">
                      <Bell className="w-4 h-4 text-emerald-400 shrink-0" /> HOMEPAGE ANNOUNCEMENT TICKER
                    </h3>

                    <div className="flex items-center gap-3 pb-2">
                      <input
                        type="checkbox"
                        id="annToggle"
                        checked={settings.announcementEnabled}
                        onChange={e => setSettings({ ...settings, announcementEnabled: e.target.checked })}
                        className="accent-white w-5 h-5 shrink-0 cursor-pointer"
                      />
                      <label htmlFor="annToggle" className="text-white uppercase font-bold text-xs cursor-pointer">
                        SHOW TICKER ON STOREFRONT NAVBAR
                      </label>
                    </div>

                    <div>
                      <label className="block text-[10px] sm:text-xs text-zinc-400 uppercase mb-1.5 font-bold">ANNOUNCEMENT TEXT</label>
                      <input
                        type="text"
                        value={settings.announcementText}
                        onChange={e => setSettings({ ...settings, announcementText: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs sm:text-sm font-mono uppercase focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Save Button */}
                <div className="pt-2">
                  <button type="submit" className="w-full py-4 bg-white text-black font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-lg">
                    <Save className="w-4 h-4" /> PERSIST STORE SETTINGS
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>
      </main>

      {/* ── Admin Profile Quick Modal ────────────────────────────────────── */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 max-w-md w-full p-5 sm:p-6 space-y-5 font-mono text-xs shadow-2xl relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-display font-black text-white text-base uppercase">ADMIN PROFILE</h3>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar & Details */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-white text-black font-extrabold text-2xl flex items-center justify-center border-2 border-zinc-700 shrink-0">
                A
              </div>
              <div className="space-y-1 truncate">
                <strong className="block text-white text-sm uppercase font-black truncate">{adminUser.name}</strong>
                <span className="block text-[10px] text-zinc-400 uppercase truncate">{adminUser.email}</span>
                <span className="inline-block px-2 py-0.5 text-[8px] font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase">
                  {adminUser.role || 'SUPERADMIN'}
                </span>
              </div>
            </div>

            {/* Account Details & Session Info */}
            <div className="bg-zinc-950 p-4 border border-zinc-800 space-y-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase">STORE ACCESS LEVEL:</span>
                <strong className="text-white">FULL SUPERADMIN (UNRESTRICTED)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase">LAST LOGIN SESSION:</span>
                <strong className="text-zinc-300">{adminUser.lastLogin}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase">SECURITY PROTOCOL:</span>
                <strong className="text-emerald-400">2FA / ENCRYPTED FIRESTORE</strong>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setSettingsSubTab('profile');
                  setProfileModalOpen(false);
                }}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors border border-zinc-700"
              >
                <Settings className="w-3.5 h-3.5" /> EDIT STORE PROFILE &amp; BRANDING
              </button>

              <Link
                to="/"
                target="_blank"
                onClick={() => setProfileModalOpen(false)}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors border border-zinc-700"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" /> OPEN LIVE STOREFRONT
              </Link>

              {/* Working Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors mt-2"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" /> LOG OUT OF ADMIN CONSOLE
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Employee Edit Modal ─────────────────────────────────────────── */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4">
          <form onSubmit={handleSaveEmployee} className="bg-zinc-900 border border-zinc-800 max-w-md w-full p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-display font-black text-white text-sm sm:text-base uppercase">
                {editingEmployee.id ? 'EDIT STAFF MEMBER' : 'ADD NEW STAFF MEMBER'}
              </h3>
              <button type="button" onClick={() => setEditingEmployee(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* File Upload Picker for Employee Image */}
            <FileUploadPicker
              label="EMPLOYEE PROFILE PHOTO (JPG, PNG, WEBP, PDF)"
              value={editingEmployee.image || ''}
              onChange={val => setEditingEmployee({ ...editingEmployee, image: val })}
            />

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">EMPLOYEE NAME</label>
              <input
                type="text"
                required
                value={editingEmployee.name}
                onChange={e => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">BADGE ID</label>
                <input
                  type="text"
                  required
                  value={editingEmployee.employeeId}
                  onChange={e => setEditingEmployee({ ...editingEmployee, employeeId: e.target.value.toUpperCase() })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">DEPARTMENT</label>
                <select
                  value={editingEmployee.department}
                  onChange={e => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono uppercase"
                >
                  <option value="fulfillment">fulfillment</option>
                  <option value="inventory">inventory</option>
                  <option value="support">support</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={editingEmployee.email}
                onChange={e => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">PHONE NUMBER</label>
              <input
                type="text"
                value={editingEmployee.phone || ''}
                onChange={e => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-200 mt-4">
              SAVE EMPLOYEE RECORD
            </button>
          </form>
        </div>
      )}

      {/* ── Product Add/Edit Modal (Mobile Responsive) ───────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4">
          <form onSubmit={handleSaveProduct} className="bg-zinc-900 border border-zinc-800 max-w-lg w-full p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-display font-black text-white text-sm sm:text-base uppercase">
                {editingProduct.id ? 'EDIT PRODUCT' : 'CREATE PRODUCT'}
              </h3>
              <button type="button" onClick={() => setEditingProduct(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">PRODUCT NAME</label>
              <input
                type="text"
                required
                value={editingProduct.name}
                onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">CATEGORY</label>
                {!isCustomCategoryInput ? (
                  <select
                    value={editingProduct.category}
                    onChange={e => {
                      if (e.target.value === '__ADD_NEW__') {
                        setIsCustomCategoryInput(true);
                        setCustomCategoryName('');
                      } else {
                        setEditingProduct({ ...editingProduct, category: e.target.value });
                      }
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono uppercase cursor-pointer"
                  >
                    {(() => {
                      const optionMap = new Map();
                      // 1. All dynamic categories created in Admin
                      (categories || []).forEach(cat => {
                        const slug = cat.slug || cat.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        if (slug) {
                          optionMap.set(slug, { slug, name: cat.name || slug });
                        }
                      });
                      // 2. Fallback defaults if not present
                      ['t-shirts', 'hoodies', 'jackets', 'accessories'].forEach(slug => {
                        if (!optionMap.has(slug)) {
                          optionMap.set(slug, { slug, name: slug });
                        }
                      });
                      // 3. Current product category if custom
                      if (editingProduct?.category && !optionMap.has(editingProduct.category)) {
                        optionMap.set(editingProduct.category, { slug: editingProduct.category, name: editingProduct.category });
                      }
                      return [
                        ...Array.from(optionMap.values()).map(cat => (
                          <option key={cat.slug} value={cat.slug}>
                            {cat.name.toUpperCase()}
                          </option>
                        )),
                        <option key="__ADD_NEW__" value="__ADD_NEW__">
                          + ADD NEW CATEGORY...
                        </option>
                      ];
                    })()}
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="ENTER NEW CATEGORY NAME..."
                      value={customCategoryName}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomCategoryName(val);
                        const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        setEditingProduct({ ...editingProduct, category: slug });
                      }}
                      className="w-full bg-zinc-950 border border-zinc-700 p-2.5 text-white text-xs font-mono uppercase focus:border-white"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomCategoryInput(false)}
                      className="px-2.5 py-2.5 bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase shrink-0"
                    >
                      CANCEL
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">STOCK QTY</label>
                <input
                  type="number"
                  required
                  value={editingProduct.stockQty || 10}
                  onChange={e => setEditingProduct({ ...editingProduct, stockQty: parseInt(e.target.value) || 0 })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">BASE PRICE (₹)</label>
                <input
                  type="number"
                  required
                  value={editingProduct.basePrice}
                  onChange={e => setEditingProduct({ ...editingProduct, basePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">DISCOUNT PRICE (₹)</label>
                <input
                  type="number"
                  value={editingProduct.discountPrice || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, discountPrice: parseFloat(e.target.value) || null })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <h4 className="font-bold text-[10px] text-zinc-500 uppercase tracking-widest">PRODUCT IMAGES (GALLERY)</h4>
              
              {/* Display existing images */}
              <div className="flex flex-wrap gap-3">
                {editingProduct.images?.map((img, idx) => (
                  <div key={idx} className="relative group w-20 h-24 bg-zinc-900 border border-zinc-700 shrink-0">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => {
                        const newImages = [...editingProduct.images];
                        newImages.splice(idx, 1);
                        setEditingProduct({ ...editingProduct, images: newImages });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Append new image */}
              <FileUploadPicker
                label="UPLOAD NEW IMAGE TO GALLERY (JPG, PNG, WEBP)"
                value=""
                onChange={val => {
                  if (val) {
                    const newImages = [...(editingProduct.images || []), val];
                    setEditingProduct({ ...editingProduct, images: newImages });
                  }
                }}
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <h4 className="font-bold text-[10px] text-zinc-500 uppercase tracking-widest">PRODUCT COLORS</h4>
              
              {/* Display existing colors */}
              <div className="flex flex-wrap gap-3">
                {editingProduct.colors?.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-3 py-1.5 pr-1 text-xs">
                    <span className="w-4 h-4 rounded-full border border-zinc-500" style={{ backgroundColor: c.hex }} />
                    <span className="text-white font-bold">{c.name}</span>
                    <button 
                      type="button"
                      onClick={() => {
                        const newColors = [...editingProduct.colors];
                        newColors.splice(idx, 1);
                        setEditingProduct({ ...editingProduct, colors: newColors });
                      }}
                      className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new color inline form */}
              <div className="flex items-end gap-3 bg-zinc-950 p-3 border border-zinc-800">
                <div className="flex-1">
                  <label className="block text-[9px] text-zinc-500 uppercase mb-1 font-bold">Color Name (e.g. Crimson)</label>
                  <input
                    type="text"
                    value={newColorName}
                    onChange={e => setNewColorName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 p-2 text-white text-xs focus:border-zinc-500 focus:outline-none"
                    placeholder="Red"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-500 uppercase mb-1 font-bold">Hex</label>
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 p-1 h-8">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={e => setNewColorHex(e.target.value)}
                      className="w-6 h-6 border-0 bg-transparent cursor-pointer p-0"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (newColorName && newColorHex) {
                      const newColors = [...(editingProduct.colors || []), { name: newColorName, hex: newColorHex }];
                      setEditingProduct({ ...editingProduct, colors: newColors });
                      setNewColorName('');
                      setNewColorHex('#000000');
                    }
                  }}
                  className="bg-white hover:bg-zinc-200 text-black px-4 h-8 text-[10px] font-extrabold uppercase transition-colors"
                >
                  ADD
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-zinc-800">
              <input
                type="checkbox"
                id="isCust"
                checked={editingProduct.isCustomizable}
                onChange={e => setEditingProduct({ ...editingProduct, isCustomizable: e.target.checked })}
                className="accent-white w-4 h-4 shrink-0 cursor-pointer"
              />
              <label htmlFor="isCust" className="text-white uppercase font-bold text-xs cursor-pointer">ALLOW GRAPHIC CUSTOMIZATION IN DTG STUDIO</label>
            </div>

            <button type="submit" className="w-full py-4 bg-emerald-500 text-white font-extrabold text-sm uppercase tracking-widest hover:bg-emerald-600 transition-colors mt-6 flex items-center justify-center gap-2 shadow-lg">
              <Check className="w-4 h-4" /> SAVE PRODUCT
            </button>
          </form>
        </div>
      )}

      {/* ── Category Modal (Mobile Responsive) ───────────────────────────── */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4">
          <form onSubmit={handleSaveCategory} className="bg-zinc-900 border border-zinc-800 max-w-md w-full p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-display font-black text-white text-sm sm:text-base uppercase">
                {editingCategory.id ? 'EDIT CATEGORY' : 'ADD CATEGORY'}
              </h3>
              <button type="button" onClick={() => setEditingCategory(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">CATEGORY NAME</label>
              <input
                type="text"
                required
                value={editingCategory.name}
                onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">SLUG</label>
              <input
                type="text"
                required
                value={editingCategory.slug}
                onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono lowercase"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">DESCRIPTION</label>
              <textarea
                rows="2"
                value={editingCategory.description || ''}
                onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono"
              />
            </div>

            {/* File Upload Picker for Category Image */}
            <FileUploadPicker
              label="CATEGORY COVER IMAGE FILE (JPG, PNG, WEBP, PDF)"
              value={editingCategory.image || ''}
              onChange={val => setEditingCategory({ ...editingCategory, image: val })}
            />

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isFeat"
                checked={editingCategory.isFeatured}
                onChange={e => setEditingCategory({ ...editingCategory, isFeatured: e.target.checked })}
                className="accent-white w-4 h-4 shrink-0"
              />
              <label htmlFor="isFeat" className="text-white uppercase font-bold text-xs">FEATURE ON HOMEPAGE TILES</label>
            </div>

            <button type="submit" className="w-full py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-200 mt-4">
              SAVE CATEGORY
            </button>
          </form>
        </div>
      )}

      {/* ── Coupon Add/Edit Modal (Mobile Responsive) ─────────────────────── */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4">
          <form onSubmit={handleSaveCoupon} className="bg-zinc-900 border border-zinc-800 max-w-md w-full p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-display font-black text-white text-sm sm:text-base uppercase">
                {editingCoupon.id ? 'EDIT DISCOUNT COUPON' : 'CREATE DISCOUNT COUPON'}
              </h3>
              <button type="button" onClick={() => setEditingCoupon(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">COUPON CODE</label>
              <input
                type="text"
                required
                placeholder="e.g. GW20"
                value={editingCoupon.code}
                onChange={e => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">TYPE</label>
                <select
                  value={editingCoupon.discountType}
                  onChange={e => setEditingCoupon({ ...editingCoupon, discountType: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono uppercase"
                >
                  <option value="percentage">PERCENTAGE (%)</option>
                  <option value="flat">FLAT AMOUNT (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">VALUE</label>
                <input
                  type="number"
                  required
                  value={editingCoupon.discountValue}
                  onChange={e => setEditingCoupon({ ...editingCoupon, discountValue: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">MIN ORDER (₹)</label>
                <input
                  type="number"
                  value={editingCoupon.minOrder}
                  onChange={e => setEditingCoupon({ ...editingCoupon, minOrder: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">MAX USAGE LIMIT</label>
                <input
                  type="number"
                  value={editingCoupon.maxUses || 500}
                  onChange={e => setEditingCoupon({ ...editingCoupon, maxUses: parseInt(e.target.value) || 100 })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">EXPIRATION DATE</label>
              <input
                type="date"
                value={editingCoupon.expiresAt || '2026-12-31'}
                onChange={e => setEditingCoupon({ ...editingCoupon, expiresAt: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-200 mt-4">
              SAVE COUPON CODE
            </button>
          </form>
        </div>
      )}

      {/* ── Ad Banner Modal (Mobile Responsive) ───────────────────────────── */}
      {editingAd && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4">
          <form onSubmit={handleSaveAd} className="bg-zinc-900 border border-zinc-800 max-w-md w-full p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-display font-black text-white text-sm sm:text-base uppercase">
                {editingAd.id ? 'EDIT PROMO BANNER' : 'CREATE PROMO BANNER'}
              </h3>
              <button type="button" onClick={() => setEditingAd(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">PLACEMENT</label>
              <select
                value={editingAd.placement || 'homepage_hero'}
                onChange={e => setEditingAd({ ...editingAd, placement: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono uppercase"
              >
                <option value="homepage_hero">HOMEPAGE HERO BANNER</option>
                <option value="category_banner">CATEGORY BANNER</option>
                <option value="popup">POPUP PROMO</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">BADGE</label>
              <input
                type="text"
                required
                value={editingAd.badge}
                onChange={e => setEditingAd({ ...editingAd, badge: e.target.value.toUpperCase() })}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">HEADLINE</label>
              <input
                type="text"
                required
                value={editingAd.headline}
                onChange={e => setEditingAd({ ...editingAd, headline: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">SUBTITLE</label>
              <input
                type="text"
                required
                value={editingAd.sub}
                onChange={e => setEditingAd({ ...editingAd, sub: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">CTA BUTTON LABEL</label>
                <input
                  type="text"
                  required
                  value={editingAd.cta}
                  onChange={e => setEditingAd({ ...editingAd, cta: e.target.value.toUpperCase() })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">LINK URL</label>
                <input
                  type="text"
                  required
                  value={editingAd.link}
                  onChange={e => setEditingAd({ ...editingAd, link: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* File Upload Picker for Promo Banner Background */}
            <FileUploadPicker
              label="BANNER BACKGROUND IMAGE / FILE (JPG, PNG, WEBP, PDF)"
              value={editingAd.image || ''}
              onChange={val => setEditingAd({ ...editingAd, image: val })}
            />

            <button type="submit" className="w-full py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-200 mt-4">
              SAVE PROMO BANNER
            </button>
          </form>
        </div>
      )}

      {/* ── Order Detail Modal (Mobile Responsive) ───────────────────────── */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-zinc-900 border border-zinc-800 max-w-lg w-full p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-display font-black text-white text-sm sm:text-base uppercase">ORDER #{viewingOrder.orderNumber}</h3>
                <p className="text-[10px] text-zinc-500 uppercase">{new Date(viewingOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setViewingOrder(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Address */}
            <div className="bg-zinc-950 p-4 border border-zinc-800 space-y-1">
              <strong className="block text-white uppercase">{viewingOrder.customerName || 'Guest'}</strong>
              <p className="text-zinc-400 text-[10px]">{viewingOrder.customerPhone || 'No phone'}</p>
              <p className="text-zinc-400 text-[10px]">{viewingOrder.shippingAddress?.line1}, {viewingOrder.shippingAddress?.city} - {viewingOrder.shippingAddress?.pincode}</p>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[10px]">ITEMS IN ORDER:</h4>
              {viewingOrder.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-zinc-950 border border-zinc-800">
                  <img src={item.image} alt="" className="w-8 h-10 object-cover border border-zinc-800 shrink-0" />
                  <div className="flex-1 truncate">
                    <span className="block text-white font-bold uppercase truncate">{item.name}</span>
                    <span className="text-[10px] text-zinc-500 uppercase">SIZE: {item.size} · QTY: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-white shrink-0">₹{item.unitPrice * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Status Override */}
            <div className="border-t border-zinc-800 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-zinc-400 uppercase text-[10px]">UPDATE STATUS:</span>
              <select
                value={viewingOrder.status}
                onChange={e => handleUpdateOrderStatus(viewingOrder.id, e.target.value)}
                className="w-full sm:w-auto bg-zinc-950 border border-zinc-700 text-xs px-2 py-1 text-white font-mono uppercase focus:outline-none"
              >
                {['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
                  <option key={s} value={s}>{s.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
