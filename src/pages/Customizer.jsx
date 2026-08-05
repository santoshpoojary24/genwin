import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Check } from 'lucide-react';
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

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const prod = await FirebaseService.getProductBySlug(productId);
      setProduct(prod);
      if (prod) {
        setSelectedSize(prod.sizes[0]);
        setSelectedColor(prod.colors[0]);
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
      ...customizationData
    });
    addToCart(product, selectedSize, selectedColor, 1, saved);
    setJustAdded(true);
    setTimeout(() => { setJustAdded(false); navigate('/'); }, 2000);
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center font-mono">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">INITIALIZING CANVAS...</p>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center font-mono space-y-3">
      <h2 className="font-bold text-xl uppercase">PRODUCT NOT FOUND</h2>
      <Link to="/shop" className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase inline-block">RETURN TO SHOP</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-mono">

      {/* Studio Header */}
      <div className="bg-black text-white p-6 border border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to={`/product/${product.slug || product.id}`}
            className="p-2 border border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> DTG PRINT STUDIO
            </p>
            <h1 className="font-display font-extrabold text-lg sm:text-xl uppercase tracking-tighter">{product.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] uppercase">
          <div className="border border-zinc-700 px-3 py-1.5">
            <span className="text-zinc-400">BASE: </span>
            <strong className="text-white">₹{product.discountPrice || product.basePrice}</strong>
          </div>
          <div className="bg-white text-black px-3 py-1.5 font-bold">
            PRINT: +₹{product.customizationFee || 150}
          </div>
        </div>
      </div>

      {/* Garment Size & Color quick selectors */}
      <div className="bg-zinc-50 border border-zinc-200 p-4 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">SIZE:</span>
          <div className="flex gap-1">
            {product.sizes.map(size => (
              <button key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-2 py-1 text-xs font-bold border transition-all ${selectedSize === size ? 'bg-black text-white border-black' : 'border-zinc-300 text-zinc-700 hover:border-black'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">COLOUR:</span>
          <div className="flex gap-1.5">
            {product.colors.map((c, i) => (
              <button key={i}
                onClick={() => setSelectedColor(c)}
                className={`w-5 h-5 rounded-full border-2 ${(selectedColor?.name === c.name) ? 'border-black ring-1 ring-black' : 'border-zinc-300'}`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
          <span className="text-[10px] text-zinc-600 font-bold">{selectedColor?.name}</span>
        </div>

        {justAdded && (
          <div className="ml-auto flex items-center gap-2 text-[10px] font-bold text-black uppercase">
            <Check className="w-4 h-4" /> DESIGN SAVED — REDIRECTING...
          </div>
        )}
      </div>

      {/* Canvas Editor */}
      <CanvasEditor product={product} onSaveCustomization={handleSaveCustomization} />

    </div>
  );
}
