import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, ArrowRight, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, getProductSizeStock } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function QuickViewModal({ product, onClose }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, wishlist, toggleWishlist } = useAuth();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!product) return;
    setSelectedSize(product.sizes[0] || 'M');
    setSelectedColor(product.colors[0] || { name: 'Default', hex: '#111111' });
    setSelectedImage(product.images[0] || '');
    setAdded(false);
  }, [product]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!product) return null;

  const isWishlisted = wishlist.includes(product.id);
  const currentPrice = product.discountPrice || product.basePrice;
  const discountPct = product.discountPrice
    ? Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }
    addToCart(product, selectedSize, selectedColor, 1);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white max-w-3xl w-full shadow-2xl border border-zinc-200 flex flex-col md:flex-row overflow-hidden"
        style={{ maxHeight: '92vh', animation: 'scale-in 0.25s ease both' }}
      >
        {/* ── Gallery ── */}
        <div className="md:w-[45%] bg-zinc-50 flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
              style={{ minHeight: 280 }}
            />
            {discountPct > 0 && (
              <span className="absolute top-3 left-3 bg-black text-white text-[9px] font-mono font-bold px-2 py-0.5 uppercase">
                -{discountPct}% OFF
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-1.5 p-3 bg-white border-t border-zinc-100">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(img)}
                  className={`w-12 h-14 border overflow-hidden shrink-0 transition-all ${
                    selectedImage === img ? 'border-black' : 'border-zinc-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Details ── */}
        <div className="md:w-[55%] flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-zinc-100">
            <div className="font-mono pr-4">
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{product.category}</p>
              <h2 className="font-display font-extrabold text-black text-lg uppercase leading-tight tracking-tight">
                {product.name}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-3 h-3 ${i <= Math.round(product.rating) ? 'fill-black text-black' : 'text-zinc-200 fill-zinc-200'}`} />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-black">{product.rating}</span>
                <span className="text-[10px] text-zinc-400">({product.reviewCount})</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button onClick={onClose} className="p-1.5 border border-zinc-200 text-zinc-500 hover:text-black hover:border-black transition-all">
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    onClose();
                    navigate('/login');
                    return;
                  }
                  toggleWishlist(product.id);
                }}
                className={`p-1.5 border transition-all ${isWishlisted ? 'bg-black text-white border-black' : 'border-zinc-200 text-zinc-500 hover:border-black hover:text-black'}`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5 flex-1">
            {/* Price */}
            <div className="flex items-baseline gap-2 font-mono">
              <span className="font-extrabold text-black text-2xl">₹{currentPrice}</span>
              {product.discountPrice && (
                <span className="text-sm text-zinc-400 line-through">₹{product.basePrice}</span>
              )}
            </div>

            <p className="text-[11px] text-zinc-600 leading-relaxed">
              {product.description}
            </p>

            {/* Size with Quantity according to Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">GARMENT SIZE</p>
                <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase">
                  {(() => {
                    const sq = getProductSizeStock(product, selectedSize);
                    return sq > 0 ? `${sq} IN STOCK (${selectedSize})` : `OUT OF STOCK (${selectedSize})`;
                  })()}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map(size => {
                  const sizeQty = getProductSizeStock(product, size);
                  const isOut = sizeQty <= 0;

                  return (
                    <button key={size} disabled={isOut} onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-10 px-2 text-xs font-bold font-mono border transition-all flex flex-col items-center justify-center ${
                        isOut
                          ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed opacity-60 line-through'
                          : selectedSize === size
                            ? 'bg-black text-white border-black shadow-sm'
                            : 'border-zinc-300 text-zinc-700 hover:border-black'
                      }`}
                    >
                      <span>{size}</span>
                      <span className={`text-[7px] font-bold ${isOut ? 'text-red-500' : selectedSize === size ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {isOut ? '0 Qty' : `${sizeQty} Qty`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color */}
            <div>
              <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2">
                COLOR — <span className="text-black">{selectedColor?.name}</span>
              </p>
              <div className="flex gap-2">
                {product.colors.map((c, i) => (
                  <button key={i} onClick={() => setSelectedColor(c)}
                    title={c.name}
                    className={`w-7 h-7 rounded-full border-2 p-0.5 transition-all ${
                      selectedColor?.name === c.name ? 'border-black scale-110' : 'border-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    <span className="block w-full h-full rounded-full border border-black/10"
                      style={{ backgroundColor: c.hex }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="p-5 border-t border-zinc-100 space-y-2 font-mono">
            {((product.stockQty !== undefined && product.stockQty <= 0) || product.isSoldOut) ? (
              <button disabled className="w-full py-3 bg-zinc-200 text-zinc-500 font-bold text-xs uppercase tracking-widest cursor-not-allowed border border-zinc-300">
                SOLD OUT
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className={`w-full py-3 font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  added
                    ? 'bg-zinc-100 text-black border border-black'
                    : 'bg-black text-white hover:bg-zinc-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {added ? 'ADDED TO BAG ✓' : 'ADD TO BAG'}
              </button>
            )}

            <Link
              to={`/product/${product.slug || product.id}`}
              onClick={onClose}
              className="w-full py-2.5 bg-white border border-zinc-300 text-black font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:border-black transition-all"
            >
              VIEW FULL DETAILS <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
