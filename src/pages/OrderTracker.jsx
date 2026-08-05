import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2, Package, Truck, Home, MapPin, Sparkles, AlertCircle, ArrowRight,
  Copy, Check, Phone, ShieldCheck, Printer, Radio, Navigation, Clock, ExternalLink,
  XCircle, RotateCcw, X
} from 'lucide-react';
import { FirebaseService } from '../services/firebaseService';
import LoadingScreen from '../components/common/LoadingScreen';

const STATUS_STEPS = [
  { id: 'placed',           label: 'ORDER PLACED',       desc: 'Payment confirmed & order logged', icon: CheckCircle2 },
  { id: 'confirmed',        label: 'CONFIRMED',           desc: 'Fabric cut & DTG quality check',   icon: CheckCircle2 },
  { id: 'packed',           label: 'PACKED',              desc: 'Pouch sealed in anti-tamper box',  icon: Package },
  { id: 'shipped',          label: 'SHIPPED',             desc: 'Dispatched via Air Express',       icon: Truck },
  { id: 'out_for_delivery', label: 'OUT FOR DELIVERY',    desc: 'Courier agent on route to home',   icon: Navigation },
  { id: 'delivered',        label: 'DELIVERED',           desc: 'Package handed to recipient',      icon: Home },
];

const RETURN_STEPS = [
  { id: 'return_requested', label: 'RETURN REQUESTED', desc: 'Request under review by logistics', icon: RotateCcw },
  { id: 'return_picked',    label: 'RETURN PICKED UP', desc: 'Item collected by courier agent',   icon: Truck },
  { id: 'refund_processed', label: 'REFUND PROCESSED', desc: 'Refund credited to bank account',   icon: CheckCircle2 },
];

export default function OrderTracker() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedAwb, setCopiedAwb] = useState(false);

  // Cancel & Return Modal States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered wrong size');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Defective item / Print issue');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsub = FirebaseService.subscribeToOrder(orderId, (updated) => {
      setOrder(updated);
      setLoading(false);
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [orderId]);

  if (loading) return (
    <LoadingScreen message="CONNECTING TO LIVE RADAR SATELLITE TRACKER..." />
  );

  if (!order) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center font-mono space-y-4 page-enter">
      <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto animate-bounce" />
      <h2 className="font-display font-black text-2xl uppercase tracking-tight">ORDER NOT FOUND</h2>
      <p className="text-xs text-zinc-500 uppercase">WE COULD NOT LOCATE ORDER #{orderId}. PLEASE CHECK YOUR ID.</p>
      <Link to="/shop" className="btn-magnetic press px-8 py-3 bg-black text-white font-bold text-xs uppercase inline-block">
        RETURN TO CATALOG
      </Link>
    </div>
  );

  const isCancelled = order.status === 'cancelled';
  const isReturnFlow = ['return_requested', 'return_picked', 'refund_processed'].includes(order.status);
  const canCancel = ['placed', 'confirmed', 'packed'].includes(order.status);
  const canReturn = ['shipped', 'out_for_delivery', 'delivered'].includes(order.status);

  const currentSteps = isReturnFlow ? RETURN_STEPS : STATUS_STEPS;
  const currentIdx = currentSteps.findIndex(s => s.id === order.status);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;
  const awbNumber = order.awb || `BD-${(order.orderNumber || 849201) * 31}-IN`;

  const handleCopyAwb = () => {
    navigator.clipboard.writeText(awbNumber);
    setCopiedAwb(true);
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    setUpdating(true);
    await FirebaseService.updateOrderStatus(order.id || orderId, 'cancelled', cancelReason);
    setShowCancelModal(false);
    setUpdating(false);
  };

  const handleRequestReturn = async (e) => {
    e.preventDefault();
    setUpdating(true);
    await FirebaseService.updateOrderStatus(order.id || orderId, 'return_requested', returnReason);
    setShowReturnModal(false);
    setUpdating(false);
  };

  // Generate realistic delivery timestamps based on order creation
  const orderDate = new Date(order.createdAt || Date.now());
  const formattedDate = orderDate.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  const formattedTime = orderDate.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });

  // Progress percentage for progress bar & radar marker
  const progressPercent = isCancelled ? 0 : Math.min(100, Math.round(((activeIdx + 1) / currentSteps.length) * 100));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-mono page-enter">

      {/* Live Radar Header & Status Banner */}
      <div className="bg-black text-white p-6 sm:p-8 border border-zinc-900 shadow-xl space-y-6 relative overflow-hidden">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize:'24px 24px' }} />

        {/* Live Satellite Ping Badge Removed */}

        {/* Main Order Metadata */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">ORDER REFERENCE:</span>
              <strong className="text-emerald-400 font-bold text-xs uppercase">#{order.orderNumber}</strong>
            </div>
            <h1 className="font-display font-black text-white text-3xl sm:text-4xl uppercase tracking-tighter">
              {isCancelled ? 'CANCELLED' : (currentSteps[activeIdx]?.label || order.status?.toUpperCase())}
            </h1>
            <p className="text-[11px] text-zinc-400 uppercase pt-0.5">
              PLACED ON {formattedDate} AT {formattedTime}
            </p>
          </div>

          {/* Express AWB Courier Card */}
          <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-2 min-w-[240px] text-right">
            <div className="flex items-center justify-between gap-3 text-[10px] text-zinc-400 font-bold uppercase">
              <span>EXPRESS COURIER AWB:</span>
              <button onClick={handleCopyAwb} className="text-white hover:text-emerald-400 transition-colors">
                {copiedAwb ? <Check className="w-3.5 h-3.5 text-emerald-400 inline" /> : <Copy className="w-3.5 h-3.5 inline" />}
              </button>
            </div>
            <strong className="text-white font-bold text-sm tracking-widest block font-mono">{awbNumber}</strong>
            <p className="text-[9px] text-emerald-400 uppercase font-bold flex items-center justify-end gap-1">
              <ShieldCheck className="w-3 h-3" /> BLUEDART AIR EXPRESS DISPATCH
            </p>
          </div>
        </div>

      </div>

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="bg-red-950 border border-red-800 p-5 text-red-200 text-xs uppercase flex items-center gap-3">
          <XCircle className="w-6 h-6 shrink-0 text-red-400" />
          <div>
            <strong className="block text-white font-bold">THIS ORDER WAS CANCELLED</strong>
            <p className="text-[10px] text-red-300">If any payment was deducted, refund will be credited back to your payment account within 3-5 business days.</p>
          </div>
        </div>
      )}

      {/* Return Requested Banner */}
      {isReturnFlow && (
        <div className="bg-amber-950 border border-amber-800 p-5 text-amber-200 text-xs uppercase flex items-center gap-3">
          <RotateCcw className="w-6 h-6 shrink-0 text-amber-400 animate-spin" />
          <div>
            <strong className="block text-white font-bold">RETURN &amp; EXCHANGE LOGISTICS</strong>
            <p className="text-[10px] text-amber-300">Your return request is currently being processed by our logistics team. Please pack the item securely.</p>
          </div>
        </div>
      )}

      {/* 📍 Tactical Interactive Route Radar Map Simulation */}
      {!isCancelled && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 space-y-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="font-display font-black text-white text-sm uppercase tracking-wider">
                REAL-TIME GPS ROUTE RADAR
              </h3>
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">
              EST. ARRIVAL: 3–5 BUSINESS DAYS
            </span>
          </div>

          {/* Simulated Route Progress Bar with Pulsing Carrier Icon */}
          <div className="space-y-4">
            <div className="relative pt-6 pb-2">
              
              {/* Background Line */}
              <div className="h-2 bg-zinc-950 border border-zinc-800 w-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-zinc-600 via-emerald-500 to-white transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Carrier Radar Icon Pin */}
              <div
                className="absolute top-1 transform -translate-x-1/2 transition-all duration-1000 flex flex-col items-center"
                style={{ left: `${Math.max(5, Math.min(95, progressPercent))}%` }}
              >
                <div className="bg-white text-black p-1.5 shadow-lg border border-black animate-bounce">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="text-[8px] bg-black text-white px-1.5 py-0.5 border border-zinc-700 font-bold uppercase tracking-wider mt-1 whitespace-nowrap">
                  {progressPercent}% EN ROUTE
                </span>
              </div>

            </div>

            <div className="flex justify-between text-[10px] text-zinc-400 uppercase font-bold pt-2">
              <div>
                <span className="text-zinc-500 block text-[8px]">DISPATCH ORIGIN</span>
                <strong className="text-white">BENGALURU STUDIO HUB</strong>
              </div>
              <div className="text-center">
                <span className="text-zinc-500 block text-[8px]">TRANSIT HUB</span>
                <strong className="text-white">AIR EXPRESS TERMINAL</strong>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block text-[8px]">DESTINATION</span>
                <strong className="text-emerald-400">{order.shippingAddress?.city?.toUpperCase() || 'DELIVERY PINCODE'}</strong>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Stepper Timeline Grid */}
      {!isCancelled && (
        <div className="bg-white border border-zinc-200 p-6 sm:p-8 space-y-6">
          <h3 className="font-bold text-xs uppercase tracking-widest text-black border-b border-zinc-100 pb-3 flex items-center justify-between">
            <span>TRACKING MILESTONES</span>
            <span className="text-[10px] text-zinc-400">STATUS: {currentSteps[activeIdx]?.label}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentSteps.map((step, idx) => {
              const isPast = idx < activeIdx;
              const isCurrent = idx === activeIdx;
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`p-4 border transition-all flex items-start gap-3.5 ${
                    isCurrent
                      ? 'border-black bg-black text-white shadow-md scale-[1.02]'
                      : isPast
                      ? 'border-zinc-300 bg-zinc-50 text-black'
                      : 'border-zinc-100 bg-white text-zinc-400 opacity-60'
                  }`}
                >
                  <div className={`p-2 shrink-0 ${isCurrent ? 'bg-white text-black' : isPast ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 truncate">
                    <div className="flex items-center justify-between">
                      <strong className="font-bold text-xs uppercase truncate">{step.label}</strong>
                      {isPast && <Check className="w-3 h-3 text-emerald-500 shrink-0" />}
                    </div>
                    <p className={`text-[10px] leading-tight ${isCurrent ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Items & Shipping Address Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Items Summary */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 p-6 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-widest text-black border-b border-zinc-100 pb-3 flex items-center justify-between">
            <span>GARMENT MANIFEST</span>
            <span>{order.items?.length || 0} ITEM(S)</span>
          </h3>

          <div className="divide-y divide-zinc-100 space-y-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="pt-4 first:pt-0 flex gap-4 items-center text-[11px]">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'}
                  alt={item.name}
                  className="w-16 h-20 object-cover border border-zinc-200 shrink-0"
                />
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-black uppercase text-xs">{item.name}</h4>
                  <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase font-bold">
                    <span>SIZE: {item.size || 'L'}</span>
                    <span>·</span>
                    <span>COLOR: {item.color?.name || item.color || 'BLACK'}</span>
                  </div>
                  {item.customization && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-black bg-zinc-100 border border-zinc-300 px-2 py-0.5 uppercase">
                      <Sparkles className="w-2.5 h-2.5" /> DTG CUSTOM PRINT
                    </span>
                  )}
                  <p className="font-bold text-black text-xs pt-1">
                    QTY: {item.quantity || 1} × ₹{item.unitPrice || item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Address & Support */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Shipping Address */}
          <div className="bg-white border border-zinc-200 p-6 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-widest text-black flex items-center gap-2 border-b border-zinc-100 pb-3">
              <MapPin className="w-4 h-4 text-black" /> DESTINATION ADDRESS
            </h3>
            <div className="text-[11px] text-zinc-700 space-y-1 bg-zinc-50 p-4 border border-zinc-200 font-sans">
              <strong className="block text-black font-bold text-xs uppercase">{order.shippingAddress?.name || order.customerName}</strong>
              <p>{order.shippingAddress?.line1}</p>
              {order.shippingAddress?.line2 && <p>{order.shippingAddress?.line2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} — <strong>{order.shippingAddress?.pincode}</strong></p>
              {order.phone || order.shippingAddress?.phone ? (
                <p className="pt-2 text-[10px] font-bold text-black font-mono">PHONE: {order.phone || order.shippingAddress?.phone}</p>
              ) : null}
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white border border-zinc-200 p-6 space-y-2.5 text-[11px]">
            <div className="flex justify-between border-b border-zinc-100 pb-2">
              <span className="text-zinc-500 uppercase">PAYMENT MODE</span>
              <strong className="text-black uppercase">{order.paymentMethod || 'UPI'}</strong>
            </div>
            <div className="flex justify-between border-b border-zinc-100 pb-2">
              <span className="text-zinc-500 uppercase">PAYMENT STATUS</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-200 uppercase">
                {order.paymentStatus || 'PAID VERIFIED'}
              </span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-black pt-2">
              <span>GRAND TOTAL</span>
              <span className="text-base font-black">₹{order.total}</span>
            </div>
          </div>

          {/* Interactive Cancel Order & Return / Exchange Action Buttons */}
          <div className="space-y-2">
            
            {canCancel && !isCancelled && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors press"
              >
                <XCircle className="w-4 h-4" /> CANCEL THIS ORDER
              </button>
            )}

            {canReturn && !isReturnFlow && !isCancelled && (
              <button
                onClick={() => setShowReturnModal(true)}
                className="w-full py-3.5 bg-zinc-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors press"
              >
                <RotateCcw className="w-4 h-4" /> REQUEST RETURN / EXCHANGE
              </button>
            )}

            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors press"
            >
              <Phone className="w-3.5 h-3.5" /> HELP / WHATSAPP AGENT
            </a>
            
            <Link
              to="/shop"
              className="btn-magnetic press w-full py-3.5 bg-black text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
            >
              CONTINUE SHOPPING <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>

      {/* ── Cancel Order Modal ────────────────────────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowCancelModal(false)}>
          <div className="bg-white border border-zinc-200 max-w-md w-full p-6 space-y-4 font-mono shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-display font-black text-black text-base uppercase">CANCEL ORDER #{order.orderNumber}</h3>
              </div>
              <button onClick={() => setShowCancelModal(false)} className="p-1 text-zinc-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 uppercase leading-relaxed">
              Are you sure you want to cancel this order? Any payments made will be refunded to your original payment method.
            </p>

            <form onSubmit={handleCancelOrder} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">REASON FOR CANCELLATION</label>
                <select
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 text-xs p-3 font-mono uppercase focus:outline-none focus:border-black font-bold"
                >
                  <option value="Ordered wrong size">ORDERED WRONG SIZE</option>
                  <option value="Changed my mind">CHANGED MY MIND</option>
                  <option value="Delivery address error">DELIVERY ADDRESS ERROR</option>
                  <option value="Found better alternative">FOUND BETTER ALTERNATIVE</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 bg-zinc-100 border border-zinc-300 font-bold text-xs uppercase tracking-wider hover:bg-zinc-200"
                >
                  KEEP ORDER
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-3 bg-red-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-700 disabled:opacity-50"
                >
                  {updating ? 'CONFIRMING...' : 'CONFIRM CANCEL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Return / Exchange Request Modal ────────────────────────────── */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowReturnModal(false)}>
          <div className="bg-white border border-zinc-200 max-w-md w-full p-6 space-y-4 font-mono shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-black" />
                <h3 className="font-display font-black text-black text-base uppercase">RETURN / EXCHANGE REQUEST</h3>
              </div>
              <button onClick={() => setShowReturnModal(false)} className="p-1 text-zinc-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 uppercase leading-relaxed">
              Submit a 7-day hassle-free size replacement or defective item return request. Our logistics team will arrange reverse doorstep pickup.
            </p>

            <form onSubmit={handleRequestReturn} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">REASON FOR RETURN / EXCHANGE</label>
                <select
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 text-xs p-3 font-mono uppercase focus:outline-none focus:border-black font-bold"
                >
                  <option value="Defective item / Print issue">DEFECTIVE ITEM / PRINT ISSUE</option>
                  <option value="Garment size fitting issue">GARMENT SIZE FITTING ISSUE</option>
                  <option value="Received wrong item">RECEIVED WRONG ITEM</option>
                  <option value="Quality not as expected">QUALITY NOT AS EXPECTED</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 py-3 bg-zinc-100 border border-zinc-300 font-bold text-xs uppercase tracking-wider hover:bg-zinc-200"
                >
                  DISCARD
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-3 bg-black text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-50"
                >
                  {updating ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
