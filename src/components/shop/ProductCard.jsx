import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

/** Shrink Unsplash URLs to w=400 for card thumbnails (faster load) */
function thumbUrl(url) {
  if (!url) return '';
  return url.replace(/(\?w=)\d+/, '$1400').replace(/(&q=)\d+/, '$180');
}

export default function ProductCard({ product, onQuickView }) {
  const navigate = useNavigate();
  const { user, wishlist, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const isSoldOut = (product.stockQty !== undefined && product.stockQty <= 0) || product.isSoldOut;
  const currentPrice = product.discountPrice || product.basePrice;
  const discountPct = product.discountPrice
    ? Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)
    : 0;

  const mainImg  = thumbUrl(product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80');
  const displayImg = mainImg;

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
    <div
      className="garment-card-gpu group relative bg-white border border-zinc-200 rounded-xl overflow-hidden hover:border-black transition-all duration-300 flex flex-col h-full shadow-xs hover:shadow-xl font-mono text-xs"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
        {isSoldOut ? (
          <span className="text-[9px] font-bold bg-black text-white px-2 py-0.5 uppercase tracking-widest rounded-xs">
            SOLD OUT
          </span>
        ) : (
          <>
            {product.isNew && (
              <span className="text-[9px] font-bold bg-black text-white px-2 py-0.5 uppercase tracking-widest rounded-xs">
                NEW
              </span>
            )}
            {product.isBestseller && (
              <span className="text-[9px] font-bold bg-zinc-900 text-white px-2 py-0.5 uppercase tracking-widest rounded-xs">
                BESTSELLER
              </span>
            )}
          </>
        )}
      </div>

      {/* Wishlist Heart Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          if (!user) {
            navigate('/login');
            return;
          }
          toggleWishlist(product.id);
        }}
        className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full transition-all shadow-sm ${
          isWishlisted 
            ? 'bg-black text-white' 
            : 'bg-white/90 text-zinc-700 hover:text-black border border-zinc-200 hover:border-black'
        }`}
        aria-label="Wishlist"
      >
        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white text-white' : ''}`} />
      </button>

      {/* Product Image Area */}
      <Link to={`/product/${product.slug || product.id}`} className="block relative overflow-hidden bg-zinc-100 rounded-t-xl" style={{ aspectRatio: '3/4' }}>
        <img
          src={displayImg}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80';
            setImgLoaded(true);
          }}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        {/* Quick Add / Quick View Hover Overlay */}
        <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 z-20">
          <button
            onClick={(e) => { e.preventDefault(); onQuickView?.(product); }}
            className="flex-1 py-2.5 bg-black/90 hover:bg-black text-white text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 rounded-xs shadow-md"
          >
            <Eye className="w-3.5 h-3.5" /> QUICK VIEW
          </button>
          <button
            onClick={handleQuickAdd}
            disabled={isSoldOut}
            className={`px-3 py-2.5 text-[9px] font-bold uppercase border border-zinc-300 rounded-xs shadow-md ${
              isSoldOut ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-white hover:bg-zinc-100 text-black'
            }`}
          >
            {isSoldOut ? 'OUT' : '+BAG'}
          </button>
        </div>
      </Link>

      {/* Card Info Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-white space-y-2">
        <div>
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">
            {product.category || 'SHIRT'}
          </span>

          <Link to={`/product/${product.slug || product.id}`}>
            <h3 className="font-bold text-black text-xs uppercase tracking-tight line-clamp-1 hover:text-zinc-600 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 font-mono">
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-black text-sm">₹{currentPrice}</span>
            {product.discountPrice && (
              <span className="text-[10px] text-zinc-400 line-through">₹{product.basePrice}</span>
            )}
          </div>

          {discountPct > 0 && (
            <span className="text-[9px] font-bold text-emerald-600 border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 uppercase tracking-widest rounded-xs">
              {discountPct}% OFF
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
