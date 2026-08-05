import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, MapPin, ArrowRight, Lock, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FirebaseService } from '../services/firebaseService';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  
  const cartContext = useCart() || {};
  const cartItems = cartContext.cartItems || [];
  const getSubtotal = cartContext.getSubtotal || (() => 0);
  const getShippingFee = cartContext.getShippingFee || (() => 0);
  const getTotal = cartContext.getTotal || (() => 0);
  const discountAmount = cartContext.discountAmount || 0;
  const appliedCoupon = cartContext.appliedCoupon || null;
  const clearCart = cartContext.clearCart || (() => {});

  const authContext = useAuth() || {};
  const user = authContext.user || null;
  const addAddress = authContext.addAddress || (() => {});

  const [step, setStep] = useState(1); // 1: Address, 2: Payment
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);
  const savedAddressesList = user?.addresses || [];
  const [selectedAddrId, setSelectedAddrId] = useState(savedAddressesList[0]?.id || null);

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    line1: user?.addresses?.[0]?.line1 || '',
    line2: user?.addresses?.[0]?.line2 || '',
    city: user?.addresses?.[0]?.city || 'Mumbai',
    state: user?.addresses?.[0]?.state || 'Maharashtra',
    pincode: user?.addresses?.[0]?.pincode || '400013'
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const total = getTotal();

  const handlePincodeChange = async (e) => {
    const val = e.target.value;
    setAddress(prev => ({ ...prev, pincode: val }));
    if (val.length === 6 && /^\d+$/.test(val)) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.[0]) {
          const po = data[0].PostOffice[0];
          setAddress(prev => ({ ...prev, city: po.District || po.Block, state: po.State }));
        }
      } catch (err) {}
    }
  };

  const handleSelectSavedAddress = (sAddr) => {
    if (!sAddr) return;
    setSelectedAddrId(sAddr.id || null);
    setAddress({
      name: sAddr.name || '',
      phone: sAddr.phone || '',
      line1: sAddr.line1 || '',
      line2: sAddr.line2 || '',
      city: sAddr.city || '',
      state: sAddr.state || '',
      pincode: sAddr.pincode || ''
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center font-mono space-y-4">
        <h2 className="font-bold text-xl uppercase text-black">CART IS CURRENTLY EMPTY</h2>
        <p className="text-xs text-zinc-500 uppercase">SELECT APPAREL FROM THE SHOP CATALOG TO PROCEED TO CHECKOUT.</p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/shop" className="px-6 py-3 bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors">
            EXPLORE SHOP CATALOG →
          </Link>
        </div>
      </div>
    );
  }

  const finalizeFirebaseOrder = async (paymentDetails = null) => {
    try {
      const orderPayload = {
        userId: user?.uid || 'guest_' + Date.now(),
        customerName: address.name,
        customerPhone: address.phone,
        shippingAddress: address,
        items: cartItems,
        subtotal,
        shippingFee,
        discountAmount,
        couponCode: appliedCoupon?.code || null,
        total,
        paymentMethod,
        paymentDetails
      };
      const newOrder = await FirebaseService.createOrder(orderPayload);
      clearCart();
      setSubmitting(false);
      navigate(`/order-success/${newOrder.id || newOrder.orderNumber}`);
    } catch (err) {
      console.error("Failed to place order:", err);
      alert('Failed to save order. Please contact support.');
      setSubmitting(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (saveAddressForFuture && address.line1 && address.pincode && user) {
        const isAlreadySaved = savedAddressesList.some(a => a.line1 === address.line1 && a.pincode === address.pincode);
        if (!isAlreadySaved) {
          addAddress({
            title: address.city ? `${address.city.toUpperCase()} ADDRESS` : 'SAVED ADDRESS',
            ...address
          });
        }
      }

      if (paymentMethod === 'cod') {
        await finalizeFirebaseOrder();
        return;
      }

      // Razorpay Flow
      const resLoaded = await loadRazorpayScript();
      if (!resLoaded) {
        alert('Razorpay SDK failed to load. Are you online?');
        setSubmitting(false);
        return;
      }

      const apiBase = import.meta.env.VITE_API_BASE_URL || (window.location.origin.includes('localhost') ? 'http://localhost:5000' : '/api');
      const createOrderRes = await fetch(`${apiBase}/create-razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
      });
      
      const orderData = await createOrderRes.json();
      if (!orderData.id) {
         alert('Payment Session Error: ' + (orderData.error || 'Unknown') + ' | Details: ' + JSON.stringify(orderData.details || ''));
         setSubmitting(false);
         return;
      }

      const options = {
        key: 'rzp_test_TM0e930fFxpDsE',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'GenWin Studio',
        description: 'Apparel Purchase',
        order_id: orderData.id,
        handler: async function (response) {
          await finalizeFirebaseOrder({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature
          });
        },
        prefill: {
          name: address.name,
          email: user?.email || '',
          contact: address.phone
        },
        theme: {
          color: '#000000'
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
         alert('Payment failed: ' + response.error.description);
         setSubmitting(false);
      });
      rzp1.open();

    } catch (err) {
      console.error("Failed to place order:", err);
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-white border border-zinc-300 text-xs px-3 py-2.5 font-sans normal-case focus:outline-none focus:border-black transition-colors";
  const labelClass = "block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-mono">

      {/* Page Header */}
      <div className="border-b border-zinc-200 pb-6 mb-8">
        <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1 mb-1">
          <Lock className="w-3 h-3" /> SECURE CHECKOUT
        </p>
        <h1 className="font-display font-extrabold text-3xl uppercase tracking-tighter text-black">Checkout</h1>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-8 font-mono text-[10px] uppercase font-bold">
        <div className={`flex items-center gap-2 px-4 py-2 border-b-2 ${step >= 1 ? 'border-black text-black' : 'border-zinc-200 text-zinc-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${step >= 1 ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-500'}`}>1</span>
          SHIPPING ADDRESS
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-300" />
        <div className={`flex items-center gap-2 px-4 py-2 border-b-2 ${step >= 2 ? 'border-black text-black' : 'border-zinc-200 text-zinc-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${step >= 2 ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-500'}`}>2</span>
          PAYMENT
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Form */}
        <div className="lg:col-span-7 space-y-6">

          {/* Step 1: Address */}
          <div className={`bg-white border border-zinc-200 p-6 space-y-5 ${step !== 1 ? 'opacity-60 pointer-events-none' : ''}`}>
            <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-black flex items-center gap-2 border-b border-zinc-100 pb-3">
              <MapPin className="w-4 h-4" /> 1. DELIVERY ADDRESS
            </h3>

            {/* Saved Address Cards */}
            {savedAddressesList.length > 0 && (
              <div className="space-y-2 pb-2 border-b border-zinc-100">
                <label className={labelClass}>SAVED ADDRESSES (TAP TO AUTO-FILL)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddressesList.map((s, idx) => {
                    const isSelected = selectedAddrId === (s.id || idx);
                    return (
                      <div
                        key={s.id || idx}
                        onClick={() => handleSelectSavedAddress(s)}
                        className={`p-3.5 border cursor-pointer font-mono transition-all text-left relative ${
                          isSelected ? 'border-black bg-zinc-50 ring-1 ring-black' : 'border-zinc-200 hover:border-zinc-400 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase text-black">{s.title || 'SAVED ADDRESS'}</span>
                          {isSelected && (
                            <span className="text-[9px] font-bold bg-black text-white px-1.5 py-0.2 uppercase">SELECTED</span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-black uppercase truncate">{s.name}</p>
                        <p className="text-[10px] text-zinc-600 line-clamp-2 uppercase mt-0.5">{s.line1}, {s.city} - {s.pincode}</p>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">{s.phone}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input type="text" required value={address.name}
                  onChange={e => setAddress({...address, name: e.target.value})}
                  placeholder="Rahul Sharma" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone *</label>
                <input type="tel" required value={address.phone}
                  onChange={e => setAddress({...address, phone: e.target.value})}
                  placeholder="+91 98765 43210" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Street Address *</label>
              <input type="text" required value={address.line1}
                onChange={e => setAddress({...address, line1: e.target.value})}
                placeholder="Flat 402, MG Road" className={inputClass} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>PIN Code *</label>
                <input type="text" required maxLength={6} value={address.pincode}
                  onChange={handlePincodeChange} placeholder="560038" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input type="text" required value={address.city}
                  onChange={e => setAddress({...address, city: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input type="text" required value={address.state}
                  onChange={e => setAddress({...address, state: e.target.value})} className={inputClass} />
              </div>
            </div>

            <label className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase text-zinc-700 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={saveAddressForFuture}
                onChange={e => setSaveAddressForFuture(e.target.checked)}
                className="accent-black w-4 h-4"
              />
              <span>SAVE THIS ADDRESS FOR FUTURE CHECKOUTS</span>
            </label>

            {step === 1 && (
              <button type="button" onClick={() => setStep(2)}
                className="w-full py-3 bg-black text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors font-mono">
                CONTINUE TO PAYMENT <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Step 2: Payment */}
          <div className={`bg-white border border-zinc-200 p-6 space-y-4 ${step !== 2 ? 'opacity-60 pointer-events-none' : ''}`}>
            <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-black flex items-center gap-2 border-b border-zinc-100 pb-3">
              <CreditCard className="w-4 h-4" /> 2. PAYMENT METHOD
            </h3>

            {[
              { value: 'upi', label: 'UPI (GPay / PhonePe / Paytm)', sub: 'Fastest — scan or enter VPA', badge: 'RECOMMENDED' },
              { value: 'cod', label: 'Cash on Delivery', sub: 'Pay cash or UPI at doorstep', badge: null },
              { value: 'card', label: 'Credit / Debit Card', sub: 'Visa, MasterCard, RuPay', badge: null },
            ].map(method => (
              <label key={method.value} className={`flex items-center justify-between p-4 border-2 cursor-pointer transition-all ${
                paymentMethod === method.value ? 'border-black bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400'
              }`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment" value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)}
                    className="accent-black w-4 h-4" />
                  <div className="font-mono">
                    <strong className="block text-xs text-black uppercase">{method.label}</strong>
                    <span className="text-[10px] text-zinc-400 uppercase">{method.sub}</span>
                  </div>
                </div>
                {method.badge && (
                  <span className="text-[9px] font-bold bg-black text-white px-2 py-0.5 uppercase font-mono">{method.badge}</span>
                )}
              </label>
            ))}

            {step === 2 && (
              <button type="button" onClick={() => setStep(1)}
                className="text-[10px] font-mono font-bold uppercase text-zinc-500 hover:text-black underline mt-1">
                ← EDIT SHIPPING ADDRESS
              </button>
            )}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-zinc-200 p-6 space-y-5 sticky top-24 font-mono">
            <h3 className="font-bold text-xs uppercase tracking-widest text-black border-b border-zinc-100 pb-3">
              ORDER SUMMARY ({cartItems.length} ITEMS)
            </h3>

            {/* Items */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cartItems.map((item, idx) => (
                <div key={item.cartItemId || idx} className="flex gap-3 items-center text-[11px]">
                  <img src={item.image || ''} alt="" className="w-10 h-12 object-cover border border-zinc-200 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-black uppercase text-[10px] line-clamp-1">{item.name || 'Garment Item'}</p>
                    <p className="text-zinc-400 text-[9px] uppercase">
                      SIZE: {item.size || 'M'} · QTY: {item.quantity || 1}
                    </p>
                  </div>
                  <span className="font-bold text-black">₹{(item.unitPrice || 0) * (item.quantity || 1)}</span>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-[11px] text-zinc-600 uppercase border-t border-zinc-100 pt-4">
              <div className="flex justify-between">
                <span>SUBTOTAL</span>
                <span className="font-bold text-black">₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-black font-bold">
                  <span>COUPON ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>SHIPPING</span>
                <span className="font-bold text-black">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-black border-t border-zinc-300 pt-2">
                <span>TOTAL</span>
                <span className="text-lg">₹{total}</span>
              </div>
            </div>

            {/* Place Order */}
            <button
              type="submit"
              disabled={submitting || step !== 2}
              className="w-full py-4 bg-black text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'PROCESSING...' : `PLACE ORDER — ₹${total}`}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>

            {step !== 2 && (
              <p className="text-center text-[10px] text-zinc-400 uppercase">COMPLETE SHIPPING ADDRESS FIRST</p>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[9px] text-zinc-400 uppercase pt-1">
              <Lock className="w-3 h-3" />
              <span>SSL ENCRYPTED · POWERED BY FIREBASE</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
