import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Package, MapPin, LogOut, ArrowRight, ShoppingBag, User, Plus, Edit2, Trash2,
  Home, Briefcase, X, Crown, Sparkles, Navigation, RotateCcw, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FirebaseService } from '../services/firebaseService';
import { CustomTshirtPreview } from '../components/shop/CustomTshirtPreview';

const STATUS = {
  placed: 'Placed', confirmed: 'Confirmed', packed: 'Packed', shipped: 'Shipped',
  out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled', return_requested: 'Return requested',
};

const STATUS_STYLE = {
  placed: 'bg-zinc-100 text-zinc-600', confirmed: 'bg-blue-50 text-blue-600',
  packed: 'bg-indigo-50 text-indigo-600', shipped: 'bg-purple-50 text-purple-600',
  out_for_delivery: 'bg-amber-50 text-amber-600', delivered: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600', return_requested: 'bg-orange-50 text-orange-600',
};

export default function Account() {
  const { user, logout, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
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
    if (user) {
      FirebaseService.getUserOrders(user.uid).then(orders => {
        setUserOrders(orders);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 font-sans">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-black">Sign in to your account</h2>
          <p className="text-sm text-zinc-500 mt-2">
            Access your orders and saved addresses.
          </p>
        </div>
        <Link to="/login"
          className="block w-full py-3.5 bg-black text-white font-medium text-sm rounded-lg hover:bg-zinc-800 transition-colors">
          Sign In
        </Link>
        <Link to="/shop" className="text-sm text-zinc-500 hover:text-black transition-colors block pt-2">
          ← Continue browsing
        </Link>
      </div>
    </div>
  );

  // Compute VIP Tier (simplified)
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  const eligibleDeliveredOrders = userOrders.filter(o => {
    if (o.status !== 'delivered') return false;
    const orderTime = new Date(o.createdAt || o.date || Date.now()).getTime();
    return (Date.now() - orderTime) >= SEVEN_DAYS_MS && (Date.now() - orderTime) <= ONE_YEAR_MS;
  });

  const annualSpend = eligibleDeliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const isVip = annualSpend >= 4000;
  const vipTierName = isVip ? 'VIP Member' : 'Club Member';

  // Filtered orders
  const filteredUserOrders = userOrders.filter(o => {
    if (orderFilter === 'ALL') return true;
    if (orderFilter === 'ACTIVE') return ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery'].includes(o.status);
    if (orderFilter === 'DELIVERED') return o.status === 'delivered';
    if (orderFilter === 'CANCELLED') return ['cancelled', 'return_requested'].includes(o.status);
    return true;
  });

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
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
      addToCart(productObj, item.size || 'M', item.color || 'Black', parseInt(item.quantity) || 1, item.customization || null);
    });
    setReorderedId(order.id);
    setIsCartOpen(true);
    setTimeout(() => setReorderedId(null), 2500);
  };

  const handleOpenAddressModal = (addr = null) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddressForm({
        name: addr.name || '', phone: addr.phone || user.phone || '',
        line1: addr.line1 || '', line2: addr.line2 || '',
        city: addr.city || '', state: addr.state || '', pincode: addr.pincode || '', type: addr.type || 'HOME'
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        name: user.name || '', phone: user.phone || '',
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
    <div className="min-h-screen bg-zinc-50 font-sans pb-20 pt-16">
      
      {/* ── Clean Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-5">
              {/* Avatar */}
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 bg-zinc-100 text-zinc-600 rounded-full flex items-center justify-center text-xl font-medium">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
              
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-black tracking-tight">{user.name}</h1>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${isVip ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-600'}`}>
                    <Crown className="w-3 h-3" /> {vipTierName}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 mt-1">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/customizer" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-100 text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors">
                <Sparkles className="w-4 h-4" /> Customizer
              </Link>
              <button onClick={logout} className="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-black text-sm font-medium rounded-lg hover:bg-zinc-50 transition-colors">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        
        {/* ── Tabs Navigation ─────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === id ? 'bg-black text-white shadow-md' : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Orders Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Quick Filters */}
            <div className="flex gap-2 text-sm overflow-x-auto pb-2">
              {['ALL', 'ACTIVE', 'DELIVERED', 'CANCELLED'].map(f => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                    orderFilter === f ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  {f === 'ALL' ? 'All Orders' : f === 'ACTIVE' ? 'In Transit' : f === 'DELIVERED' ? 'Delivered' : 'Cancelled / Return'}
                </button>
              ))}
            </div>

            {filteredUserOrders.length === 0 ? (
              <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <h3 className="font-medium text-lg text-black">No orders found</h3>
                <p className="text-zinc-500 mt-2 mb-6 text-sm">You haven't placed any orders matching this status yet.</p>
                <button onClick={() => setOrderFilter('ALL')} className="px-6 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-zinc-800">
                  View All Orders
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUserOrders.map(order => {
                  return (
                    <div key={order.id} className="bg-white rounded-lg border border-zinc-200 shadow-xs p-3.5 sm:p-4 flex flex-row items-center justify-between gap-3 transition-all hover:border-zinc-300">
                      
                      {/* Left Side: Order Info & Actions */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-black">Order #{order.orderNumber}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[order.status] || 'bg-zinc-100 text-zinc-600'}`}>
                            {STATUS[order.status] || order.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-500">
                          Placed {new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                          {' • '}Total: <strong className="text-black">₹{order.total}</strong>
                        </p>

                        {/* Compact Item Summary */}
                        <div className="text-[11px] text-zinc-600 truncate">
                          {order.items?.map((item, idx) => (
                            <span key={idx} className="mr-2 inline-block">
                              <strong className="text-black font-semibold">{item.name}</strong> 
                              {item.size && <span className="text-zinc-500"> ({item.size})</span>}
                            </span>
                          ))}
                        </div>

                        {/* Compact Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <button 
                            onClick={() => handleReorder(order)} 
                            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-black text-[10px] font-bold rounded transition-colors uppercase tracking-wider"
                          >
                            <RotateCcw className="w-3 h-3" /> {reorderedId === order.id ? 'Added!' : 'Buy Again'}
                          </button>
                          <Link 
                            to={`/order-success/${order.id}`} 
                            className="flex items-center gap-1 px-3 py-1 bg-black hover:bg-zinc-800 text-white text-[10px] font-bold rounded transition-colors uppercase tracking-wider"
                          >
                            Track Order <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {/* Right Side: Product Picture Thumbnail (Strictly on the right side on both mobile & PC) */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {order.items?.map((item, idx) => {
                          const itemSlug = item.slug || item.productId || item.id;
                          const itemLink = itemSlug ? `/product/${itemSlug}` : '/shop';

                          return (
                            <Link 
                              key={idx} 
                              to={itemLink} 
                              title={`View ${item.name || 'garment'} on website`}
                              className="group relative overflow-hidden rounded-md border border-zinc-200 hover:border-black transition-all shadow-2xs block bg-zinc-100 shrink-0 w-14 h-16 sm:w-16 sm:h-20"
                            >
                              {item.customization ? (
                                <CustomTshirtPreview customization={item.customization} className="w-full h-full" />
                              ) : (
                                <img 
                                  src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'} 
                                  alt={item.name || 'Order Item'} 
                                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" 
                                />
                              )}
                              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                <Eye className="w-3.5 h-3.5 text-white drop-shadow-sm" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Addresses Tab ───────────────────────────────────────────────── */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-black">Saved Addresses</h3>
              <button onClick={() => handleOpenAddressModal()} className="flex items-center gap-1.5 bg-black hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>

            {(!user.addresses || user.addresses.length === 0) ? (
              <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
                <MapPin className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <h4 className="font-medium text-lg text-black">No addresses saved</h4>
                <p className="text-zinc-500 mt-2 mb-6 text-sm">Save your address for faster checkout next time.</p>
                <button onClick={() => handleOpenAddressModal()} className="px-6 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-zinc-800">
                  Add an address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.addresses.map(addr => (
                  <div key={addr.id} className={`bg-white rounded-xl p-5 relative border transition-shadow ${addr.isDefault ? 'border-black shadow-sm ring-1 ring-black' : 'border-zinc-200 hover:shadow-sm'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {addr.type === 'WORK' ? <Briefcase className="w-4 h-4 text-zinc-500" /> : <Home className="w-4 h-4 text-zinc-500" />}
                        <span className="font-semibold text-sm">{addr.name || user.name}</span>
                        <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-medium">{addr.type}</span>
                      </div>
                      {addr.isDefault && <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-medium">Default</span>}
                    </div>

                    <div className="text-sm text-zinc-600 space-y-1 mb-4">
                      <p>{addr.line1}</p>
                      {addr.line2 && <p>{addr.line2}</p>}
                      <p>{addr.city}, {addr.state} {addr.pincode}</p>
                      <p className="pt-1">Phone: {addr.phone}</p>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-zinc-100">
                      <button onClick={() => handleOpenAddressModal(addr)} className="text-sm text-zinc-600 hover:text-black font-medium flex items-center gap-1">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => deleteAddress(addr.id)} className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                      {!addr.isDefault && (
                        <button onClick={() => setDefaultAddress(addr.id)} className="ml-auto text-sm text-black font-medium hover:underline">
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Address Modal ────────────────────────────────────────── */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAddressModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-black">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
              <button onClick={() => setShowAddressModal(false)} className="p-2 text-zinc-400 hover:text-black rounded-full hover:bg-zinc-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 block mb-1.5">Full Name</label>
                  <input type="text" required value={addressForm.name} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 block mb-1.5">Phone Number</label>
                  <input type="tel" required value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1.5">Flat, House no., Building</label>
                <input type="text" required value={addressForm.line1} onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1.5">Area, Street, Sector (Optional)</label>
                <input type="text" value={addressForm.line2} onChange={e => setAddressForm({ ...addressForm, line2: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 block mb-1.5">City</label>
                  <input type="text" required value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 block mb-1.5">State</label>
                  <input type="text" required value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 block mb-1.5">Pincode</label>
                  <input type="text" required value={addressForm.pincode} onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-2">Address Type</label>
                <div className="flex gap-3">
                  {['HOME', 'WORK'].map(type => (
                    <button key={type} type="button" onClick={() => setAddressForm({ ...addressForm, type })} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${addressForm.type === type ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-black text-white font-medium text-sm rounded-lg hover:bg-zinc-800 transition-colors mt-6">
                {editingAddressId ? 'Update Address' : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
