import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { FirebaseService } from '../services/firebaseService';
import ProductCard from '../components/shop/ProductCard';
import FilterSidebar from '../components/shop/FilterSidebar';
import QuickViewModal from '../components/shop/QuickViewModal';
import LoadingScreen from '../components/common/LoadingScreen';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,  setProducts]  = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categoryParam = searchParams.get('category') || 'all';
  const searchParam   = searchParams.get('search')   || '';

  const [selectedCategory,  setSelectedCategory]  = useState(categoryParam);
  const [onlyCustomizable,  setOnlyCustomizable]  = useState(false);
  const [maxPrice,          setMaxPrice]          = useState(4000);
  const [sortBy,            setSortBy]            = useState('featured');
  const [searchQuery,       setSearchQuery]       = useState(searchParam);

  useEffect(() => {
    Promise.all([FirebaseService.getProducts(), FirebaseService.getCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  const handleCategoryChange = (catSlug) => {
    setSelectedCategory(catSlug);
    if (catSlug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catSlug);
    }
    setSearchParams(searchParams);
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setOnlyCustomizable(false);
    setMaxPrice(4000);
    setSortBy('featured');
    setSearchQuery('');
    setSearchParams({});
  };

  const filtered = products.filter(p => {
    // Robust category comparison matching slug, category ID, or exact string
    if (selectedCategory !== 'all') {
      const targetSlug = selectedCategory.toLowerCase();
      const prodCat = (p.category || '').toLowerCase();
      const matchedCat = categories.find(c => c.slug === targetSlug || c.id === targetSlug);
      
      const isMatch = prodCat === targetSlug || 
                      (matchedCat && prodCat === matchedCat.slug) ||
                      (matchedCat && prodCat === matchedCat.name.toLowerCase());
                      
      if (!isMatch) return false;
    }

    if (onlyCustomizable && !p.isCustomizable) return false;
    if ((p.discountPrice || p.basePrice) > maxPrice) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    const pa = a.discountPrice || a.basePrice;
    const pb = b.discountPrice || b.basePrice;
    if (sortBy === 'price_low')  return pa - pb;
    if (sortBy === 'price_high') return pb - pa;
    if (sortBy === 'rating')     return b.rating - a.rating;
    return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
  });

  const activeCatObj = categories.find(c => c.slug === selectedCategory || c.id === selectedCategory);
  const catName = selectedCategory === 'all'
    ? 'ALL APPAREL'
    : (activeCatObj?.name || selectedCategory).toUpperCase();

  if (loading) return (
    <LoadingScreen message="LOADING STORE CATALOG & COLLECTIONS..." />
  );

  return (
    <div className="page-enter">

      {/* ── Shop Header ───────────────────────────────────────────────── */}
      <div className="bg-black text-white border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize:'24px 24px' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="section-num text-zinc-700">GENWIN STUDIO</span>
              <span className="block h-px w-6 bg-zinc-800" />
              <span className="section-num text-zinc-700">CATALOG</span>
            </div>
            <h1 className="font-display font-black text-white uppercase"
              style={{ fontSize:'clamp(2.5rem,6vw,5rem)', letterSpacing:'-0.04em', lineHeight:1 }}>
              {catName}
            </h1>
            <p className="font-mono text-zinc-600 text-xs uppercase tracking-[0.12em] mt-3">
              240 GSM HEAVYWEIGHT COTTON · CUSTOM PRINTS · DIRECT-TO-GARMENT
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-6">

        {/* ── Search + Controls ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-5 font-mono">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (e.target.value) searchParams.set('search', e.target.value);
                else searchParams.delete('search');
                setSearchParams(searchParams);
              }}
              className="w-full bg-zinc-50 border border-zinc-200 text-xs py-2.5 pl-9 pr-4 uppercase focus:outline-none focus:border-black font-mono"
            />
          </div>
          <button onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 border border-zinc-300 text-black font-bold text-xs uppercase hover:border-black transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" /> FILTER
          </button>
          <span className="ml-auto text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
            {filtered.length} PRODUCTS FOUND
          </span>
        </div>

        {/* ── Main Layout ───────────────────────────────────────────────── */}
        <div className="flex gap-10">

          {/* Sidebar — desktop */}
          <div className="hidden lg:block shrink-0 w-52">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategoryChange}
              onlyCustomizable={onlyCustomizable}
              setOnlyCustomizable={setOnlyCustomizable}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              sortBy={sortBy}
              setSortBy={setSortBy}
              resetFilters={resetFilters}
            />
          </div>

          {/* Mobile filter drawer */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFilterOpen(false)} />
              <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto p-6 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <span className="font-mono font-black text-xs uppercase tracking-widest">FILTERS</span>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-zinc-400 hover:text-black">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <FilterSidebar
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={c => { handleCategoryChange(c); setMobileFilterOpen(false); }}
                  onlyCustomizable={onlyCustomizable}
                  setOnlyCustomizable={setOnlyCustomizable}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  resetFilters={resetFilters}
                />
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="border border-zinc-200 bg-zinc-50 p-20 text-center font-mono space-y-4">
                <p className="font-black text-zinc-200 text-6xl">0</p>
                <h3 className="font-black text-black text-sm uppercase tracking-widest">NO PRODUCTS MATCH THIS CATEGORY</h3>
                <p className="text-[10px] text-zinc-400 uppercase">TRY CLEARING YOUR FILTERS OR SEARCH TERM.</p>
                <button onClick={resetFilters}
                  className="px-6 py-2.5 bg-black text-white font-mono font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors">
                  CLEAR FILTERS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}
