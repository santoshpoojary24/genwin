import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, Star, ShoppingBag, Truck, RefreshCw, Heart, ChevronRight, Plus, Minus, ArrowRight, X, Ruler,
  CheckCircle2, Lock, MessageSquare, ShieldCheck, ThumbsUp
} from 'lucide-react';
import { FirebaseService } from '../services/firebaseService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/shop/ProductCard';
import QuickViewModal from '../components/shop/QuickViewModal';
import LoadingScreen from '../components/common/LoadingScreen';

const SIZE_CHART = [
  { size: 'S',   chest: '38"', length: '27"', shoulder: '18"' },
  { size: 'M',   chest: '40"', length: '28"', shoulder: '19"' },
  { size: 'L',   chest: '42"', length: '29"', shoulder: '20"' },
  { size: 'XL',  chest: '44"', length: '30"', shoulder: '21"' },
  { size: 'XXL', chest: '46"', length: '31"', shoulder: '22"' },
];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, wishlist, toggleWishlist } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [qvProduct, setQvProduct] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Verified Buyer Review States
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const prod = await FirebaseService.getProductBySlug(slug);
        setProduct(prod);
        if (prod) {
          setSelectedImage(prod.images[0]);
          setSelectedSize(prod.sizes[0] || 'M');
          setSelectedColor(prod.colors[0] || null);

          // Non-blocking background fetches
          FirebaseService.getProducts().then(all => {
            const related = all.filter(p => p.id !== prod.id && p.category === prod.category).slice(0, 4);
            setRelatedProducts(related.length ? related : all.filter(p => p.id !== prod.id).slice(0, 4));
          }).catch(() => {});

          FirebaseService.getProductReviews(prod.id).then(revs => {
            setReviews(revs || []);
          }).catch(() => {});

          if (user) {
            FirebaseService.getUserOrders(user.uid).then(userOrders => {
              const hasDelivered = userOrders.some(o =>
                o.status === 'delivered' &&
                o.items?.some(i => i.id === prod.id || i.name === prod.name)
              );
              setCanReview(hasDelivered);
            }).catch(() => setCanReview(false));
          }
        }
      } catch (_) {
      } finally {
        setLoading(false);
      }
    }
    load();
    window.scrollTo(0, 0);
  }, [slug, user]);

  if (loading) return (
    <LoadingScreen message="LOADING GARMENT SPECIFICATIONS..." />
  );

  if (!product) return (
    <div className="min-h-[70vh] flex items-center justify-center font-mono page-enter">
      <div className="text-center space-y-4">
        <h2 className="font-display font-black text-black text-2xl uppercase tracking-tighter">PRODUCT NOT FOUND</h2>
        <Link to="/shop" className="btn-magnetic press inline-block px-8 py-3 bg-black text-white text-xs uppercase font-mono font-bold tracking-widest">
          RETURN TO CATALOG
        </Link>
      </div>
    </div>
  );

  const isWishlisted = wishlist.includes(product.id);
  const currentPrice = product.discountPrice || product.basePrice;
  const discountPercent = product.discountPrice
    ? Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    const added = await FirebaseService.addReview({
      productId: product.id,
      userId: user.uid,
      userName: user.name || 'Verified Customer',
      userEmail: user.email,
      rating: newRating,
      title: newTitle || 'Verified Customer Review',
      comment: newComment,
      verified: true
    });
    setReviews(prev => [added, ...prev]);
    setShowReviewForm(false);
    setNewComment('');
    setNewTitle('');
    setSubmittingReview(false);
  };

  // Compute Average Rating
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : (product.rating || 4.9);

  return (
    <div className="page-enter pb-20 font-mono">
      
      {/* Breadcrumb Nav */}
      <div className="border-b border-zinc-100 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-zinc-300" />
            <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
            <ChevronRight className="w-3 h-3 text-zinc-300" />
            <Link to={`/shop?category=${product.category}`} className="hover:text-black transition-colors">{product.category}</Link>
            <ChevronRight className="w-3 h-3 text-zinc-300" />
            <span className="text-black font-bold truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-16">
        
        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative overflow-hidden bg-zinc-100 border border-zinc-200 aspect-[4/5] img-zoom">
              <img
                src={selectedImage || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-top"
              />

              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  SAVE {discountPercent}%
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 aspect-[4/5] border transition-all overflow-hidden shrink-0 ${
                      selectedImage === img ? 'border-black ring-1 ring-black' : 'border-zinc-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Specifications & CTA */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="space-y-2 border-b border-zinc-100 pb-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{product.category}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-200 uppercase">
                  IN STOCK · {product.stockQty || 12} UNITS LEFT
                </span>
              </div>

              <h1 className="font-display font-black text-black text-2xl sm:text-3xl uppercase tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Price & Rating */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-display font-black text-black text-2xl">₹{currentPrice}</span>
                  {product.discountPrice && (
                    <span className="text-xs text-zinc-400 line-through">₹{product.basePrice}</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-2.5 py-1">
                  <Star className="w-3.5 h-3.5 fill-black text-black" />
                  <strong className="text-xs font-bold text-black">{avgRating}</strong>
                  <span className="text-[10px] text-zinc-400">({reviews.length})</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-zinc-600 uppercase leading-relaxed font-sans">
              {product.description || 'Heavyweight 240 GSM organic combed cotton streetwear blank. Double-stitched seams with pre-shrunk wash treatment.'}
            </p>

            {/* Size Selector */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-black uppercase tracking-wider">GARMENT SIZE</label>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-[10px] text-zinc-400 hover:text-black uppercase underline flex items-center gap-1 transition-colors"
                >
                  <Ruler className="w-3 h-3" /> SIZE CHART
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.sizes?.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-xs font-bold uppercase transition-all border ${
                      selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-black border-zinc-200 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatches */}
            {product.colors?.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-black uppercase tracking-wider">COLOURWAY</label>
                <div className="flex gap-2">
                  {product.colors.map((c, i) => {
                    const name = typeof c === 'string' ? c : c.name;
                    const hex = typeof c === 'object' ? c.hex : '#000000';
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedColor(c);
                          if (product.images && product.images[i]) {
                            setSelectedImage(product.images[i]);
                          }
                        }}
                        className={`px-3 py-2 text-xs font-bold uppercase border transition-all flex items-center gap-2 ${
                          (selectedColor?.name === name || selectedColor === name) ? 'bg-black text-white border-black' : 'bg-white text-black border-zinc-200 hover:border-black'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border border-zinc-400" style={{ backgroundColor: hex }} />
                        <span>{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold text-black uppercase tracking-wider">QUANTITY</label>
              <div className="flex items-center border border-zinc-200 w-max bg-white">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3.5 py-2.5 hover:bg-zinc-50 text-black font-bold border-r border-zinc-200 transition-colors">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-5 font-bold text-xs">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="px-3.5 py-2.5 hover:bg-zinc-50 text-black font-bold border-l border-zinc-200 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-zinc-100">
              {product.isCustomizable && (
                <Link
                  to={`/customize/${product.id}`}
                  className="btn-magnetic press w-full py-4 bg-black text-white font-mono font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  CUSTOMIZE IN DTG STUDIO (+₹{product.customizationFee || 150})
                </Link>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`btn-magnetic press flex-1 py-4 font-mono font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    addedToCart
                      ? 'bg-zinc-100 text-black border border-black'
                      : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {addedToCart ? 'ADDED TO BAG ✓' : 'ADD TO BAG'}
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-4 border transition-all press ${
                    isWishlisted ? 'bg-black text-white border-black' : 'border-zinc-200 text-zinc-500 hover:border-black hover:text-black'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                </button>
              </div>
            </div>

            {/* Product Specifications & Trust Badges */}
            <div className="space-y-3 pt-4 border-t border-zinc-100 text-[11px] uppercase tracking-wider">
              <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-100">
                <Truck className="w-4 h-4 text-black shrink-0" />
                <span className="text-zinc-600">FREE EXPRESS SHIPPING ON ORDERS OVER ₹999</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-100">
                <RefreshCw className="w-4 h-4 text-black shrink-0" />
                <span className="text-zinc-600">7-DAY HASSLE-FREE REPLACEMENT GUARANTEE</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── 🌟 VERIFIED DELIVERED CUSTOMER REVIEWS SECTION ────────────────── */}
        <div className="space-y-8 pt-12 border-t border-zinc-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
            <div>
              <span className="section-num">AUTHENTIC REVIEWS</span>
              <h3 className="font-display font-black text-black text-2xl uppercase tracking-tighter mt-1 flex items-center gap-2">
                VERIFIED CUSTOMER REVIEWS
              </h3>
              <p className="text-[10px] text-zinc-500 uppercase mt-0.5">
                ONLY DELIVERED BUYERS CAN POST RATING REVIEWS
              </p>
            </div>

            {canReview ? (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="btn-magnetic press px-6 py-3 bg-black text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                {showReviewForm ? 'CLOSE FORM' : 'WRITE VERIFIED REVIEW'}
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-300 px-4 py-2 text-[10px] font-bold text-zinc-600 uppercase">
                <Lock className="w-3.5 h-3.5" /> REVIEWS RESTRICTED TO DELIVERED BUYERS
              </div>
            )}
          </div>

          {/* Review Submission Form Modal / Box */}
          {canReview && showReviewForm && (
            <div className="bg-zinc-50 border border-zinc-200 p-6 space-y-4 font-mono shadow-md">
              <h4 className="font-bold text-sm text-black uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> SUBMIT RATING &amp; REVIEW
              </h4>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">STAR RATING (1-5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 text-black hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${star <= newRating ? 'fill-black text-black' : 'text-zinc-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">REVIEW TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. PERFECT HEAVYWEIGHT FIT!"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-white border border-zinc-200 p-3 text-xs uppercase font-mono focus:outline-none focus:border-black font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">YOUR REVIEW FEEDBACK</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="SHARE DETAILS ABOUT THE FABRIC QUALITY, SIZE FIT, AND PACKAGING..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    className="w-full bg-white border border-zinc-200 p-3 text-xs font-mono uppercase focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-8 py-3.5 bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50"
                >
                  {submittingReview ? 'POSTING...' : 'PUBLISH VERIFIED REVIEW'}
                </button>
              </form>
            </div>
          )}

          {/* Display Public Customer Reviews List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.length === 0 ? (
              <div className="col-span-2 border border-zinc-200 bg-zinc-50 p-12 text-center space-y-2">
                <Star className="w-8 h-8 text-zinc-300 mx-auto" />
                <p className="font-bold text-xs uppercase text-zinc-500">NO CUSTOMER REVIEWS PUBLISHED YET.</p>
              </div>
            ) : (
              reviews.map(r => (
                <div key={r.id} className="bg-white border border-zinc-200 p-5 space-y-3 font-mono shadow-sm">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <div className="flex items-center gap-2">
                      <strong className="text-black uppercase font-bold text-xs">{r.userName || 'CUSTOMER'}</strong>
                      {r.verified && (
                        <span className="tag bg-emerald-50 text-emerald-700 border-emerald-300 text-[8px] font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> VERIFIED BUYER
                        </span>
                      )}
                    </div>

                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-black text-black' : 'fill-zinc-200 text-zinc-200'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-bold text-xs uppercase text-black">{r.title}</h5>
                    <p className="text-[11px] text-zinc-600 font-sans uppercase leading-relaxed">{r.comment}</p>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-zinc-400 uppercase pt-2 border-t border-zinc-100">
                    <span>{new Date(r.createdAt || r.date || Date.now()).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 text-zinc-500 font-bold">
                      <ThumbsUp className="w-3 h-3" /> HELPFUL VERIFIED REVIEW
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommended Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-8 pt-12 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="section-num">RECOMMENDED</span>
                <h3 className="font-display font-black text-black text-2xl uppercase tracking-tighter mt-1">
                  YOU MAY ALSO LIKE
                </h3>
              </div>
              <Link to="/shop" className="underline-wipe font-mono text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black flex items-center gap-1">
                View Catalog <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} onQuickView={setQvProduct} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Genuine Size Guide Modal ────────────────────────────────────── */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" onClick={() => setShowSizeGuide(false)}>
          <div className="bg-white border border-zinc-200 max-w-md w-full p-6 space-y-5 font-mono" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                <h3 className="font-display font-black text-black text-base uppercase">GARMENT SIZE CHART</h3>
              </div>
              <button onClick={() => setShowSizeGuide(false)} className="p-1 text-zinc-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-zinc-500 uppercase leading-relaxed">
              All measurements are in inches. Fits true to size with a relaxed streetwear drape.
            </p>

            <div className="border border-zinc-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-black text-white text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">SIZE</th>
                    <th className="p-3">CHEST</th>
                    <th className="p-3">LENGTH</th>
                    <th className="p-3">SHOULDER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {SIZE_CHART.map(row => (
                    <tr key={row.size} className={selectedSize === row.size ? 'bg-zinc-100 font-bold' : ''}>
                      <td className="p-3 font-bold">{row.size}</td>
                      <td className="p-3">{row.chest}</td>
                      <td className="p-3">{row.length}</td>
                      <td className="p-3">{row.shoulder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-zinc-50 p-3 border border-zinc-200 text-[10px] text-zinc-600 uppercase">
              💡 <strong>TIP:</strong> For an extreme oversized fit, order 1 size up.
            </div>
          </div>
        </div>
      )}

      {qvProduct && (
        <QuickViewModal product={qvProduct} onClose={() => setQvProduct(null)} />
      )}
    </div>
  );
}
