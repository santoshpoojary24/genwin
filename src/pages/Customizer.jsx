import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Check, X } from 'lucide-react';
import { FirebaseService } from '../services/firebaseService';
import { useCart } from '../context/CartContext';
import CanvasEditor from '../components/customization/CanvasEditor';

export default function Customizer() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState({ name: 'Pure White', hex: '#FFFFFF' });
  const [justAdded, setJustAdded] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const prod = await FirebaseService.getProductBySlug(productId);
      setProduct(prod);
      if (prod) {
        setSelectedSize(prod.sizes?.[0] || 'M');
        setSelectedColor(prod.colors?.[0] || { name: 'White', hex: '#FFFFFF' });
      }
      setLoading(false);
    }
    loadProduct();
  }, [productId]);

  const handleSaveCustomization = async (customizationData) => {
    if (!product) return;
    const saved = await FirebaseService.saveCustomization({
      productId: product.id,
      productName: product.name,
      size: selectedSize,
      color: selectedColor,
      ...customizationData,
    });
    addToCart(product, selectedSize, selectedColor, 1, saved);
    setJustAdded(true);
    setTimeout(() => { setJustAdded(false); navigate('/'); }, 2200);
  };

  if (loading) return (
    <div className="fixed inset-0 bg-[#1a1a2e] flex flex-col items-center justify-center gap-4 font-mono">
      <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[11px] text-zinc-400 uppercase tracking-widest">INITIALIZING DTG STUDIO...</p>
    </div>
  );

  if (!product) return (
    <div className="fixed inset-0 bg-[#1a1a2e] flex flex-col items-center justify-center gap-4 font-mono text-white">
      <Sparkles className="w-12 h-12 text-zinc-600" />
      <h2 className="font-bold text-xl uppercase">Product Not Found</h2>
      <Link to="/shop" className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold uppercase rounded transition-all">
        Return to Shop
      </Link>
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden z-50 bg-[#1a1a2e]">

      {/* ── Studio Nav Bar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-[#0f172a] border-b border-white/10 px-4 py-2.5 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to={`/product/${product.slug || product.id}`}
            className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-all"
            title="Back to product"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">DTG PRINT STUDIO</p>
              <h1 className="text-[12px] font-bold text-white uppercase tracking-tight leading-none">
                {product.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Size & Color quick selectors */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded px-3 py-1.5">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider">SIZE:</span>
            <div className="flex gap-1">
              {product.sizes?.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${selectedSize === size ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded px-3 py-1.5">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider">COLOR:</span>
            <div className="flex gap-1.5">
              {product.colors?.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(c)}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${selectedColor?.name === c.name ? 'border-violet-400 scale-125' : 'border-zinc-600 hover:border-zinc-400'}`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
            <span className="text-[9px] text-zinc-400">{selectedColor?.name}</span>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded px-3 py-1.5">
            <span className="text-[9px] text-zinc-500">BASE</span>
            <span className="text-[11px] font-bold text-white">₹{product.discountPrice || product.basePrice}</span>
            <span className="text-[9px] text-zinc-500">+ PRINT</span>
            <span className="text-[11px] font-bold text-violet-400">+₹{product.customizationFee || 150}</span>
          </div>
        </div>
      </div>

      {/* ── Canvas Editor (Full Screen) ─────────────────────────── */}
      <div className="flex-1 min-h-0">
        <CanvasEditor
          product={product}
          onSaveCustomization={handleSaveCustomization}
        />
      </div>

      {/* ── Success Toast ─────────────────────────────────────── */}
      {justAdded && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-violet-600 text-white px-6 py-3.5 rounded-xl shadow-2xl font-mono">
          <Check className="w-5 h-5" />
          <div>
            <p className="text-sm font-bold">Design Saved!</p>
            <p className="text-[11px] text-violet-200">Redirecting to home...</p>
          </div>
        </div>
      )}
    </div>
  );
}
