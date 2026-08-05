import React, { useState, useEffect } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FirebaseService } from '../services/firebaseService';
import ProductCard from '../components/shop/ProductCard';

export default function Wishlist() {
  const { wishlist } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const prods = await FirebaseService.getProducts();
        setWishlistProducts(prods.filter(p => wishlist.includes(p.id)));
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, [wishlist]);

  return (
    <div className="min-h-screen bg-white text-black font-sans pt-28 pb-20 selection:bg-black selection:text-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4 border-b border-zinc-200 pb-8 animate-slide-up">
          <div className="space-y-4">
            <Link to="/shop" className="inline-flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase hover:text-black transition-colors">
              <ArrowLeft className="w-3 h-3" /> BACK TO SHOP
            </Link>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black uppercase tracking-tighter leading-[0.9]">
              YOUR <span className="text-zinc-300">WISHLIST</span>
            </h1>
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
              {wishlistProducts.length} {wishlistProducts.length === 1 ? 'ITEM' : 'ITEMS'} SAVED
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="aspect-[3/4] bg-zinc-100" />
              ))}
            </div>
          ) : wishlistProducts.length === 0 ? (
            <div className="border border-zinc-200 bg-zinc-50 p-16 text-center space-y-4 py-32">
              <Heart className="w-12 h-12 text-zinc-300 mx-auto" />
              <h3 className="font-black text-sm uppercase text-black">WISHLIST IS EMPTY</h3>
              <p className="text-[10px] text-zinc-400 uppercase">TAP ♡ ON ANY GARMENT TO SAVE IT TO YOUR PERSONAL WISHLIST.</p>
              <Link
                to="/shop"
                className="btn-magnetic press inline-block px-8 py-3.5 bg-black text-white font-bold text-xs uppercase tracking-widest mt-6"
              >
                BROWSE SHOP
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
              {wishlistProducts.map(p => (
                <ProductCard key={p.id} product={p} onQuickView={() => {}} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
