import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CustomTshirtPreview } from '../shop/CustomTshirtPreview';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    getSubtotal,
    getShippingFee,
    getTotal,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isCartOpen) return null;

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const total = getTotal();
  const freeShippingThreshold = 1499;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) return;

    const res = await applyCoupon(couponInput);
    if (res.valid) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="drawer-enter w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-zinc-200">
          
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-black text-white">
            <div className="flex items-center gap-2 font-mono uppercase text-xs tracking-wider">
              <ShoppingBag className="w-4 h-4" />
              <h2 className="font-extrabold text-sm">Shopping Cart</h2>
              <span className="bg-white text-black text-[10px] font-bold px-1.5 py-0.2">
                {cartItems.length}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-zinc-100 px-4 py-3 border-b border-zinc-200 text-xs font-mono">
            {amountNeededForFreeShipping > 0 ? (
              <p className="text-black font-medium mb-1">
                ADD <strong className="font-bold">₹{amountNeededForFreeShipping}</strong> MORE FOR <span className="font-bold underline">FREE SHIPPING</span>
              </p>
            ) : (
              <p className="text-black font-bold flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-4 h-4 text-black" /> FREE SHIPPING UNLOCKED!
              </p>
            )}
            <div className="w-full bg-zinc-300 h-1.5">
              <div 
                className="bg-black h-full transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-zinc-200 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-400 space-y-4 font-mono">
                <ShoppingBag className="w-10 h-10 text-zinc-300" />
                <h3 className="font-bold text-black text-sm uppercase">Cart is empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs">No apparel or custom graphic prints added yet.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2 bg-black text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.cartItemId} className="pt-4 first:pt-0 flex gap-4 items-center font-mono">
                  {/* Thumbnail */}
                  <div className="w-16 h-20 bg-zinc-100 overflow-hidden shrink-0 relative border border-zinc-300 flex items-center justify-center">
                    {item.customization ? (
                      <CustomTshirtPreview customization={item.customization} className="w-full h-full" />
                    ) : (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    )}
                    {item.customization && (
                      <span className="absolute bottom-0 right-0 bg-black text-white text-[8px] font-bold p-0.5 z-10">
                        <Sparkles className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-black text-xs uppercase line-clamp-1">{item.name}</h4>
                    <div className="text-[10px] text-zinc-500 uppercase">
                      <span>SIZE: <strong className="text-black">{item.size}</strong></span> | 
                      <span> COLOR: <strong className="text-black">{item.color.name || item.color}</strong></span>
                    </div>

                    {item.customization && (
                      <p className="text-[9px] text-black font-bold border border-black px-1 py-0.2 inline-block uppercase">
                        Custom Print (+₹{item.customizationFee})
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-zinc-300 bg-zinc-50 text-xs">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="px-2 py-0.5 hover:bg-zinc-200 text-black font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-black">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          disabled={item.stockQty !== undefined && item.quantity >= item.stockQty}
                          className="px-2 py-0.5 hover:bg-zinc-200 text-black font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                          title={item.stockQty !== undefined && item.quantity >= item.stockQty ? "Max available stock reached" : "Increase quantity"}
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-black text-xs">
                        ₹{item.unitPrice * item.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="text-zinc-400 hover:text-black p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Summary & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 space-y-3 font-mono">
              
              {/* Coupon */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 bg-black text-white text-xs">
                    <span className="uppercase">COUPON: <strong>{appliedCoupon.code}</strong> (-₹{discountAmount})</span>
                    <button onClick={removeCoupon} className="text-zinc-400 hover:text-white text-[10px] underline uppercase">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="COUPON CODE"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 bg-white border border-zinc-300 text-xs px-3 py-1.5 uppercase focus:outline-none focus:border-black font-mono"
                    />
                    <button type="submit" className="px-3 py-1.5 bg-black text-white font-bold text-xs uppercase hover:bg-zinc-800">
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[10px] text-black font-bold mt-1 uppercase">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-black font-bold mt-1 uppercase">{couponSuccess}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1 text-xs text-zinc-600 border-t border-zinc-200 pt-2 uppercase">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-black font-bold">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-black">
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-black pt-2 border-t border-zinc-300">
                  <span>Total</span>
                  <span className="text-black">₹{total}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
              >
                <span>Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
