import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

/** Shrink Unsplash URLs to w=500 for card thumbnails (faster load) */
function thumbUrl(url) {
  if (!url) return '';
  return url.replace(/(\?w=)\d+/, '$1500').replace(/(&q=)\d+/, '$185');
}

export default function ProductCard({ product, onQuickView }) {
  const navigate = useNavigate();
  const { user, wishlist, toggleWishlist } = useAuth();
  const { addToCart } = useCart();

  const isWishlisted = wishlist.includes(product.id);
  const isSoldOut = (product.stockQty !== undefined && product.stockQty <= 0) || product.isSoldOut;
  const currentPrice = product.discountPrice || product.basePrice;
  const discountPct = product.discountPrice
    ? Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)
    : 0;

  const mainImg = thumbUrl(product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80');

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product, product.sizes?.[0] || 'M', product.colors?.[0] || 'Default', 1);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-zinc-200/90 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden select-none">
      {/* Product Image Box */}
      <Link to={`/product/${product.slug || product.id}`} className="block relative overflow-hidden aspect-[3/4] bg-zinc-100 rounded-xl m-2 mb-0">
        <img
          src={mainImg}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80';
          }}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 rounded-xl"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {isSoldOut ? (
            <span className="text-[9px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-xs uppercase tracking-wider">
              SOLD OUT
            </span>
          ) : discountPct > 0 ? (
            <span className="text-[9px] font-extrabold bg-black text-white px-2 py-0.5 rounded-xs uppercase tracking-wider">
              {discountPct}% OFF
            </span>
          ) : product.isNew ? (
            <span className="text-[9px] font-extrabold bg-amber-400 text-black px-2 py-0.5 rounded-xs uppercase tracking-wider">
              NEW
            </span>
          ) : null}
        </div>
      </Link>

      {/* Product Details Section */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-white space-y-2">
        <div>
          {/* Category & Wishlist Row */}
          <div className="flex items-center justify-between text-[11px] font-extrabold text-zinc-900 uppercase tracking-wide">
            <span>{product.category || 'SHIRT'}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!user) {
                  navigate('/login');
                  return;
                }
                toggleWishlist(product.id);
              }}
              className="p-1 text-zinc-500 hover:text-red-500 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-zinc-400 hover:text-zinc-800'}`} />
            </button>
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug || product.id}`} className="block">
            <h3 className="text-xs font-semibold text-zinc-800 line-clamp-1 group-hover:text-black transition-colors mt-0.5">
              {product.name}
            </h3>
          </Link>

          {/* Pricing Row */}
          <div className="flex items-center gap-2 mt-1.5 font-sans">
            <span className="text-sm font-black text-black">₹ {currentPrice}</span>
            {product.discountPrice && (
              <span className="text-xs text-zinc-400 line-through font-normal">₹ {product.basePrice}</span>
            )}
            {discountPct > 0 && (
              <span className="text-xs font-bold text-amber-600">{discountPct}% OFF</span>
            )}
          </div>
        </div>

        {/* Yellow Action Add To Cart Button (Matching Reference Image) */}
        <button
          onClick={handleQuickAdd}
          disabled={isSoldOut}
          className={`w-full py-2.5 px-4 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 mt-2 ${
            isSoldOut
              ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              : 'bg-[#FFC700] hover:bg-[#e6b300] text-black active:scale-[0.98]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {isSoldOut ? 'SOLD OUT' : 'ADD TO BAG'}
        </button>
      </div>
    </div>
  );
}
