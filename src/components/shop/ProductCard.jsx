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
      className="garment-card-gpu group relative bg-white border border-zinc-200 overflow-hidden hover:border-black transition-all duration-300 flex flex-col h-full shadow-sm hover:shadow-xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 font-mono">
        {isSoldOut ? (
          <span className="text-[9px] font-bold bg-red-600 text-white px-2 py-0.5 uppercase tracking-widest">
            SOLD OUT
          </span>
        ) : (
          <>
            {discountPct > 0 && (
              <span className="text-[9px] font-bold bg-black text-white px-2 py-0.5 uppercase tracking-widest">
                -{discountPct}%
              </span>
            )}
            {product.isNew && (
              <span className="text-[9px] font-bold bg-white text-black border border-zinc-300 px-2 py-0.5 uppercase tracking-widest">
                NEW
              </span>
            )}
            {product.isBestseller && (
              <span className="text-[9px] font-bold bg-zinc-100 text-black border border-zinc-300 px-2 py-0.5 uppercase tracking-widest">
                BESTSELLER
              </span>
            )}
          </>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={(e) => {
          e.preventDefault();
          if (!user) {
            navigate('/login');
            return;
          }
          toggleWishlist(product.id);
        }}
        className={`absolute top-2 right-2 z-10 p-1.5 transition-all ${
          isWishlisted ? 'bg-black text-white' : 'bg-white/90 text-zinc-700 border border-zinc-200 hover:border-black hover:text-black'
        }`}
        aria-label="Wishlist"
      >
        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
      </button>

      {/* Image */}
      <Link to={`/product/${product.slug || product.id}`} className="block relative overflow-hidden bg-zinc-100" style={{ aspectRatio: '4/5' }}>
        {/* Placeholder blur while loading */}
        {!imgLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        <img
          src={displayImg}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Quick View overlay */}
        <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
          <button
            onClick={(e) => { e.preventDefault(); onQuickView?.(product); }}
            className="flex-1 py-2 bg-black/90 hover:bg-black text-white text-[9px] font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-1"
          >
            <Eye className="w-3 h-3" /> QUICK VIEW
          </button>
          <button
            onClick={handleQuickAdd}
            disabled={isSoldOut}
            className={`px-3 py-2 text-[9px] font-mono font-bold uppercase border border-zinc-200 ${
              isSoldOut ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed border-zinc-300' : 'bg-white/90 hover:bg-white text-black'
            }`}
            title={isSoldOut ? "Sold Out" : "Add to bag"}
          >
            {isSoldOut ? 'SOLD OUT' : '+BAG'}
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex items-center justify-between text-[9px] font-mono font-bold text-zinc-400 uppercase mb-1.5">
            <span>{product.category}</span>
            {isSoldOut ? (
              <span className="text-red-600 font-bold border border-red-200 bg-red-50 px-1">SOLD OUT</span>
            ) : product.stockQty < 5 ? (
              <span className="text-black border border-black px-1">ONLY {product.stockQty} LEFT</span>
            ) : null}
          </div>

          <Link to={`/product/${product.slug || product.id}`}>
            <h3 className="font-bold text-black text-xs uppercase tracking-tight line-clamp-1 hover:text-zinc-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-2.5 h-2.5 ${i <= Math.round(product.rating) ? 'fill-black text-black' : 'fill-zinc-200 text-zinc-200'}`} />
              ))}
            </div>
            <span className="text-[9px] text-zinc-500 font-mono">({product.reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 font-mono">
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-black text-sm">₹{currentPrice}</span>
            {product.discountPrice && (
              <span className="text-[10px] text-zinc-400 line-through">₹{product.basePrice}</span>
            )}
          </div>
          <Link
            to={`/product/${product.slug || product.id}`}
            className="text-[9px] font-bold uppercase text-zinc-500 hover:text-black transition-colors"
          >
            VIEW →
          </Link>
        </div>
      </div>
    </div>
  );
}
