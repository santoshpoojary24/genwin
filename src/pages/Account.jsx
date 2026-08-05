import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Package, Heart, MapPin, LogOut, ArrowRight, ShoppingBag, User, Plus, Edit2, Trash2,
  CheckCircle, Home, Briefcase, X, Crown, Sparkles, Zap, ExternalLink, ChevronRight, Eye,
  Radio, RotateCcw, Truck, Navigation, ShieldCheck, Filter, Phone, ShoppingCart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FirebaseService } from '../services/firebaseService';
import ProductCard from '../components/shop/ProductCard';

const STATUS = {
  placed: 'PLACED', confirmed: 'CONFIRMED', packed: 'PACKED', shipped: 'SHIPPED',
  out_for_delivery: 'OUT FOR DELIVERY', delivered: 'DELIVERED', cancelled: 'CANCELLED', return_requested: 'RETURN REQUESTED',
};

const STATUS_STYLE = {
  placed: 'border-zinc-300 text-zinc-500', confirmed: 'border-zinc-500 text-zinc-700',
  packed: 'border-zinc-700 text-zinc-800', shipped: 'border-black text-black',
  out_for_delivery: 'bg-black text-white border-black', delivered: 'bg-black text-white border-black',
  cancelled: 'border-red-400 text-red-600 bg-red-50', return_requested: 'border-amber-400 text-amber-600 bg-amber-50',
};

export default function Account() {
  const { user, logout, wishlist, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [userOrders, setUserOrders] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderedId, setReorderedId] = useState(null);
  const navigate = useNavigate();

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', type: 'HOME'
  });

  useEffect(() => {
    Promise.all([
      user ? FirebaseService.getUserOrders(user.uid) : Promise.resolve([]),
      FirebaseService.getProducts(),
    ]).then(([orders, prods]) => {
      setUserOrders(orders);
      setAllProducts(prods);
      setWishlistProducts(prods.filter(p => wishlist.includes(p.id)));
    }).finally(() => setLoading(false));
  }, [user, wishlist]);

  if (!user) return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 page-enter font-mono">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-20 h-20 border-2 border-black flex items-center justify-center mx-auto shadow-lg">
          <User className="w-8 h-8 text-black" />
        </div>
        <div>
          <h2 className="font-display font-black text-3xl uppercase tracking-tighter">SIGN IN TO STUDIO</h2>
          <p className="text-[11px] text-zinc-400 uppercase mt-2 tracking-widest leading-relaxed">
            Access orders, wishlist &amp; saved addresses.
          </p>
        </div>
        <Link to="/login"
          className="btn-magnetic press block w-full py-4 bg-black text-white font-mono font-black text-xs uppercase tracking-widest text-center hover:bg-zinc-900 transition-colors">
          SIGN IN TO ACCOUNT
        </Link>
        <Link to="/shop" className="underline-wipe text-[11px] text-zinc-400 hover:text-black font-mono uppercase tracking-widest block pt-2">
          ← Continue browsing catalog
        </Link>
      </div>
    </div>
  );

  // Compute Customer Loyalty Stats (ONLY count delivered orders after 7-day refund window ends)
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  const eligibleDeliveredOrders = userOrders.filter(o => {
    if (o.status !== 'delivered') return false;
    const orderTime = new Date(o.createdAt || o.date || Date.now()).getTime();
    return (Date.now() - orderTime) >= SEVEN_DAYS_MS && (Date.now() - orderTime) <= ONE_YEAR_MS;
  });

  const annualSpend = eligibleDeliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const vipTier = annualSpend >= 4000 ? 'VIP MEMBER' : 'CLUB MEMBER';
  const nextTierTarget = 4000;
  const tierProgressPercent = Math.min(100, Math.round((annualSpend / nextTierTarget) * 100));

  // Find active in-transit order
  const activeShipment = userOrders.find(o => ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery'].includes(o.status));

  // Filtered orders
  const filteredUserOrders = userOrders.filter(o => {
    if (orderFilter === 'ALL') return true;
    if (orderFilter === 'ACTIVE') return ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery'].includes(o.status);
    if (orderFilter === 'DELIVERED') return o.status === 'delivered';
    if (orderFilter === 'CANCELLED') return ['cancelled', 'return_requested'].includes(o.status);
    return true;
  });

  const tabs = [
    { id: 'orders',    label: `MY ORDERS`,    count: userOrders.length,       icon: Package },
    { id: 'addresses', label: `ADDRESSES`,  count: user?.addresses?.length || 0, icon: MapPin },
  ];

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach(item => {
      const productObj = {
        id: item.productId || item.id || `prod_${Date.now()}`,
        name: item.name || 'Streetwear Garment',
        basePrice: item.basePrice || item.unitPrice || item.price || 999,
        discountPrice: item.discountPrice || null,
        images: [item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'],
      };
      const size = item.size || 'M';
      const color = item.color || 'Black';
      const qty = parseInt(item.quantity) || 1;
      const custom = item.customization || null;

      addToCart(productObj, size, color, qty, custom);
    });
    setReorderedId(order.id);
    setIsCartOpen(true);
    setTimeout(() => setReorderedId(null), 2500);
  };

  const handleOpenAddressModal = (addr = null) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddressForm({
        name: addr.name || '',
        phone: addr.phone || user.phone || '',
        line1: addr.line1 || '',
        line2: addr.line2 || '',
        city: addr.city || '',
        state: addr.state || '',
        pincode: addr.pincode || '',
        type: addr.type || 'HOME'
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        name: user.name || '',
        phone: user.phone || '',
        line1: '', line2: '', city: '', state: '', pincode: '', type: 'HOME'
      });
    }
    setShowAddressModal(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addressForm.line1 || !addressForm.city || !addressForm.pincode) return;

    if (editingAddressId) {
      updateAddress(editingAddressId, addressForm);
    } else {
      addAddress(addressForm);
    }
    setShowAddressModal(false);
  };

  return (
    <div className="page-enter font-mono">

      {/* ── Premium Editorial Profile Banner & Loyalty Stats ─────────────── */}
      <div className="bg-black text-white border-b border-zinc-900 shadow-2xl relative overflow-hidden">
        
        {/* Subtle Radar Background Pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8 relative z-10">
          
          {/* Top User Info Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              
              {/* User Gmail Avatar or Initial */}
              <div className="relative group">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400 shrink-0 shadow-xl"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white text-black font-display font-black text-2xl flex items-center justify-center uppercase shrink-0 border-2 border-white">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-black rounded-full" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="font-display font-black text-white text-2xl sm:text-3xl uppercase tracking-tighter">{user.name}</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-amber-400 uppercase tracking-widest">
                    <Crown className="w-3 h-3 text-amber-400" /> {vipTier}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 uppercase">{user.email}</p>
                {user.phone && <p className="text-[10px] text-zinc-500 uppercase">{user.phone}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/customizer"
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all press"
              >
                <Sparkles className="w-3.5 h-3.5" /> CUSTOM T-SHIRT PRINTER
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white font-mono text-[10px] uppercase tracking-widest transition-all press"
              >
                <LogOut className="w-3.5 h-3.5" /> SIGN OUT
              </button>
            </div>
          </div>

          {/* Key Loyalty Metrics Cards & VIP Progress */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-zinc-900 pt-6">
              <div className="bg-zinc-950/80 border border-zinc-800 p-4 space-y-1">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">ANNUAL SPEND</span>
                <p className="font-display font-black text-xl text-emerald-400">₹{annualSpend.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-zinc-950/80 border border-zinc-800 p-4 space-y-1">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">TOTAL ORDERS</span>
                <p className="font-display font-black text-xl text-white">{userOrders.length} PLACED</p>
              </div>
              <div className="bg-zinc-950/80 border border-zinc-800 p-4 space-y-1">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">SAVED ADDRESSES</span>
                <p className="font-display font-black text-xl text-white">{user?.addresses?.length || 0} SAVED</p>
              </div>
              <div className="bg-zinc-950/80 border border-zinc-800 p-4 space-y-1">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">WISHLIST ITEMS</span>
                <p className="font-display font-black text-xl text-white">{wishlistProducts.length} ITEMS</p>
              </div>
            </div>

            {/* VIP Tier Progress Bar */}
            <div className="bg-zinc-950/90 border border-zinc-800 p-4 space-y-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] font-bold uppercase gap-2">
                <span className={`${annualSpend >= nextTierTarget ? 'text-amber-400' : 'text-zinc-400'} flex items-center gap-1.5`}>
                  <Crown className={`w-3.5 h-3.5 ${annualSpend >= nextTierTarget ? 'text-amber-400' : 'text-zinc-500'}`} /> 
                  {annualSpend >= nextTierTarget ? 'VIP MEMBER UNLOCKED' : 'VIP MEMBER PROGRESS'} ({tierProgressPercent}%)
                </span>
                <span className={annualSpend >= nextTierTarget ? 'text-amber-400' : 'text-emerald-400'}>
                  {annualSpend >= nextTierTarget 
                    ? '★ 1-YEAR VIP BENEFITS ACTIVE ★' 
                    : `SPEND ₹${(nextTierTarget - annualSpend).toLocaleString('en-IN')} MORE FOR VIP MEMBER STATUS`}
                </span>
              </div>
              <div className="w-full bg-zinc-900 h-2 border border-zinc-800">
                <div
                  className={`h-full transition-all duration-1000 ${annualSpend >= nextTierTarget ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]' : 'bg-emerald-500'}`}
                  style={{ width: `${tierProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 🚀 Active Shipment High-Impact Radar Banner */}
      {activeShipment && (
        <div className="bg-emerald-950 border-b border-emerald-800 text-emerald-100 px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div>
                <strong className="block text-white font-bold text-xs uppercase">
                  ACTIVE SHIPMENT IN TRANSIT — ORDER #{activeShipment.orderNumber}
                </strong>
                <p className="text-[10px] text-emerald-300 uppercase">
                  STATUS: {STATUS[activeShipment.status] || activeShipment.status?.toUpperCase()}
                </p>
              </div>
            </div>

            <Link
              to={`/order-success/${activeShipment.id}`}
              className="px-5 py-2.5 bg-white text-black font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-100 transition-colors shrink-0 press"
            >
              <Navigation className="w-3.5 h-3.5 text-black animate-pulse" /> LIVE SATELLITE RADAR TRACK →
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-10">



        {/* ── Tabs Navigation ─────────────────────────────────────────────── */}
        <div className="flex border-b border-zinc-200 gap-0 overflow-x-auto">
          {tabs.map(({ id, label, count, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
                activeTab === id ? 'border-black text-black bg-zinc-50' : 'border-transparent text-zinc-400 hover:text-black'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== null && (
                <span className={`inline-flex items-center justify-center min-w-[20px] h-[20px] text-[9px] font-black px-1.5 ${
                  activeTab === id ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Orders Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-6">

            {/* Quick Order Status Filters */}
            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase border-b border-zinc-100 pb-3">
              {[
                { id: 'ALL', label: `ALL ORDERS (${userOrders.length})` },
                { id: 'ACTIVE', label: `IN TRANSIT (${userOrders.filter(o => ['placed','confirmed','packed','shipped','out_for_delivery'].includes(o.status)).length})` },
                { id: 'DELIVERED', label: `DELIVERED (${userOrders.filter(o => o.status === 'delivered').length})` },
                { id: 'CANCELLED', label: `CANCELLED / RETURN (${userOrders.filter(o => ['cancelled','return_requested'].includes(o.status)).length})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id)}
                  className={`px-3 py-1.5 border transition-all ${
                    orderFilter === f.id ? 'bg-black text-white border-black font-extrabold' : 'bg-white text-zinc-500 border-zinc-200 hover:border-black'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredUserOrders.length === 0 ? (
              <div className="border border-zinc-200 bg-zinc-50 p-16 text-center space-y-4">
                <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto" />
                <h3 className="font-black text-sm uppercase text-black">NO ORDERS MATCHING FILTER</h3>
                <p className="text-[10px] text-zinc-400 uppercase">TRY SWITCHING YOUR ORDER STATUS FILTER TO 'ALL ORDERS'.</p>
                <button
                  onClick={() => setOrderFilter('ALL')}
                  className="px-6 py-2.5 bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-zinc-800"
                >
                  RESET FILTER
                </button>
              </div>
            ) : (
              filteredUserOrders.map(order => (
                <div
                  key={order.id}
                  className="border border-zinc-200 hover:border-black bg-white transition-all p-6 space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <strong className="text-sm font-black text-black uppercase">ORDER #{order.orderNumber}</strong>
                        <span className={`tag text-[9px] font-bold px-2 py-0.5 ${STATUS_STYLE[order.status] || 'border-zinc-300 text-zinc-500'}`}>
                          {STATUS[order.status] || order.status?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 uppercase">
                        PLACED ON {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}{order.items?.length || 1} ITEM(S)
                      </p>
                    </div>

                    {/* Action Buttons: Track Radar + Re-Order */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        onClick={() => handleReorder(order)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-100 border border-zinc-300 hover:border-black text-black font-bold text-[10px] uppercase tracking-wider transition-colors press"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> {reorderedId === order.id ? 'ADDED TO CART!' : 'BUY AGAIN'}
                      </button>

                      <Link
                        to={`/order-success/${order.id}`}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-colors press"
                      >
                        LIVE RADAR TRACK <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Thumbnails preview */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <div className="flex items-center gap-3 overflow-x-auto">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-zinc-50 p-2 border border-zinc-200 shrink-0">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'}
                            alt=""
                            className="w-10 h-12 object-cover border border-zinc-300 shrink-0"
                          />
                          <div className="text-[10px]">
                            <strong className="block text-black uppercase truncate max-w-[140px]">{item.name}</strong>
                            <span className="text-zinc-500 text-[9px] block">QTY: {item.quantity || 1} × ₹{item.unitPrice || item.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-100">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block">TOTAL AMOUNT</span>
                      <strong className="text-base text-black font-black">₹{order.total}</strong>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        )}


        {/* ── Addresses Tab ───────────────────────────────────────────────── */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            
            {/* Header with Add Button */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <h3 className="font-display font-black text-black text-lg uppercase tracking-tight">SAVED ADDRESSES</h3>
                <p className="text-[10px] text-zinc-400 uppercase">Manage your shipping and delivery destinations</p>
              </div>
              <button
                onClick={() => handleOpenAddressModal()}
                className="btn-magnetic press flex items-center gap-2 bg-black text-white px-5 py-3 text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all"
              >
                <Plus className="w-4 h-4" /> ADD NEW ADDRESS
              </button>
            </div>

            {/* Address Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.addresses?.map((addr) => (
                <div
                  key={addr.id}
                  className={`border bg-white p-5 space-y-3 transition-all relative ${
                    addr.isDefault ? 'border-black ring-1 ring-black shadow-md' : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {addr.type === 'WORK' ? <Briefcase className="w-4 h-4 text-zinc-600" /> : <Home className="w-4 h-4 text-zinc-600" />}
                      <span className="font-bold text-black uppercase text-xs">{addr.name || user.name}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-zinc-100 border border-zinc-300 text-zinc-600 uppercase">
                        {addr.type || 'HOME'}
                      </span>
                    </div>
                    {addr.isDefault ? (
                      <span className="tag bg-black text-white border-black text-[8px] font-bold">PRIMARY DEFAULT</span>
                    ) : (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-[9px] font-bold text-zinc-400 hover:text-black uppercase underline transition-colors"
                      >
                        SET DEFAULT
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-zinc-600 space-y-1">
                    <p className="font-bold text-black">{addr.line1}</p>
                    {addr.line2 && <p>{addr.line2}</p>}
                    <p>{addr.city}, {addr.state} — <strong>{addr.pincode}</strong></p>
                    {addr.phone && <p className="text-[10px] text-zinc-400">PHONE: {addr.phone}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-3 border-t border-zinc-100 text-[10px] font-bold uppercase">
                    <button
                      onClick={() => handleOpenAddressModal(addr)}
                      className="flex items-center gap-1 text-zinc-600 hover:text-black transition-colors"
                    >
                      <Edit2 className="w-3 h-3" /> EDIT
                    </button>
                    <span className="text-zinc-200">|</span>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {(!user.addresses || user.addresses.length === 0) && (
              <div className="border border-zinc-200 bg-zinc-50 p-12 text-center space-y-4">
                <MapPin className="w-10 h-10 text-zinc-300 mx-auto" />
                <h4 className="font-black text-xs uppercase text-black">NO ADDRESSES SAVED YET</h4>
                <p className="text-[10px] text-zinc-400 uppercase">SAVE YOUR HOME OR OFFICE ADDRESS FOR 1-CLICK CHECKOUT.</p>
                <button
                  onClick={() => handleOpenAddressModal()}
                  className="px-6 py-3 bg-black text-white font-mono font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                >
                  ADD FIRST ADDRESS
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ── Interactive Add / Edit Address Modal ────────────────────────── */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" onClick={() => setShowAddressModal(false)}>
          <div className="bg-white border border-zinc-200 max-w-lg w-full p-6 space-y-4 font-mono shadow-2xl" onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-display font-black text-black text-base uppercase">
                {editingAddressId ? 'EDIT ADDRESS' : 'ADD NEW DELIVERY ADDRESS'}
              </h3>
              <button onClick={() => setShowAddressModal(false)} className="p-1 text-zinc-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">RECIPIENT NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="FULL NAME"
                    value={addressForm.name}
                    onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 p-3 font-mono focus:outline-none focus:border-black uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">CONTACT PHONE</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={addressForm.phone}
                    onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 p-3 font-mono focus:outline-none focus:border-black uppercase font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">FLAT / HOUSE NO. / BUILDING</label>
                <input
                  type="text"
                  required
                  placeholder="FLAT 402, SKYLINE RESIDENCY"
                  value={addressForm.line1}
                  onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 p-3 font-mono focus:outline-none focus:border-black uppercase font-bold"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">STREET / AREA / LANDMARK (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="MG ROAD, NEAR METRO STATION"
                  value={addressForm.line2}
                  onChange={e => setAddressForm({ ...addressForm, line2: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 p-3 font-mono focus:outline-none focus:border-black uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">CITY</label>
                  <input
                    type="text"
                    required
                    placeholder="BENGALURU"
                    value={addressForm.city}
                    onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 p-3 font-mono focus:outline-none focus:border-black uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">STATE</label>
                  <input
                    type="text"
                    required
                    placeholder="KARNATAKA"
                    value={addressForm.state}
                    onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 p-3 font-mono focus:outline-none focus:border-black uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">PINCODE</label>
                  <input
                    type="text"
                    required
                    placeholder="560038"
                    value={addressForm.pincode}
                    onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 p-3 font-mono focus:outline-none focus:border-black uppercase font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">ADDRESS TYPE</label>
                <div className="flex gap-3">
                  {['HOME', 'WORK'].map(type => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setAddressForm({ ...addressForm, type })}
                      className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider border transition-all ${
                        addressForm.type === type ? 'bg-black text-white border-black' : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors mt-2"
              >
                {editingAddressId ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
