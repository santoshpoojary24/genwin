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
  const [ads,        setAds]        = useState([]);
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
    Promise.all([
      FirebaseService.getProducts(),
      FirebaseService.getCategories(),
      FirebaseService.getAds()
    ])
      .then(([p, c, a]) => {
        setProducts(p || []);
        setCategories(c || []);
        setAds(a || []);
      })
      .finally(() => setLoading(false));

    const unsubCats = FirebaseService.subscribeToCategories((liveCats) => {
      if (liveCats && liveCats.length > 0) setCategories(liveCats);
    });

    const unsubAds = FirebaseService.subscribeToAds((liveAds) => {
      if (liveAds && liveAds.length > 0) setAds(liveAds);
    });

    return () => {
      if (typeof unsubCats === 'function') unsubCats();
      if (typeof unsubAds === 'function') unsubAds();
    };
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
    <div className="page-enter font-mono">

      {/* ── Shop Header & Category Banner Image ───────────────────────────────────────────────── */}
      {(() => {
        const catCoverImg = activeCatObj?.image || activeCatObj?.banner || activeCatObj?.imageUrl || activeCatObj?.bannerUrl;
        return (
          <div className="bg-black text-white border-b border-zinc-900 relative overflow-hidden">
            {catCoverImg && (
              <>
                <img src={catCoverImg} alt={catName} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
              </>
            )}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 relative z-10">
              <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{ backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize:'24px 24px' }} />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="section-num text-zinc-400 font-bold">जेनwin.</span>
                  <span className="block h-px w-6 bg-zinc-800" />
                  <span className="section-num text-zinc-400 font-bold">COLLECTION CATALOG</span>
                </div>
                <h1 className="font-display font-black text-white uppercase"
                  style={{ fontSize:'clamp(2.5rem,6vw,5rem)', letterSpacing:'-0.04em', lineHeight:1 }}>
                  {catName}
                </h1>
                <p className="font-mono text-zinc-300 text-xs uppercase tracking-[0.12em] mt-3 max-w-xl leading-relaxed">
                  {activeCatObj?.description || '240 GSM HEAVYWEIGHT COTTON · CUSTOM PRINTS · DIRECT-TO-GARMENT'}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

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
            {/* Promo Category Banner (from Admin Ads placement = category_banner) */}
            {(() => {
              const matchedAd = ads.find(a => a.active !== false && (a.placement === 'category_banner' || a.placement === 'category' || a.placement === 'shop_banner' || a.placement === 'shop'))
                             || ads.find(a => a.active !== false);

              const categoryAd = matchedAd || {
                badge: 'EXPRESS DISPATCH',
                headline: 'SAME DAY SHIPPING ON ORDERS BEFORE 2 PM',
                sub: '240 GSM heavy combed cotton drops, acid-wash hoodies, and custom prints.',
                cta: 'EXPLORE COLLECTIONS',
                link: '/shop',
                image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&q=80'
              };

              return (
                <div className="mb-6 relative bg-zinc-950 border border-zinc-800 text-white p-6 sm:p-8 font-mono overflow-hidden shadow-xl">
                  {categoryAd.image && (
                    <>
                      <img src={categoryAd.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
                    </>
                  )}
                  <div className="relative z-10 space-y-2 max-w-lg">
                    {categoryAd.badge && (
                      <span className="px-2.5 py-1 text-[9px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-400 uppercase tracking-widest inline-block">
                        {categoryAd.badge}
                      </span>
                    )}
                    <h3 className="font-display font-black text-xl sm:text-2xl uppercase text-white tracking-tight">
                      {categoryAd.headline || categoryAd.title}
                    </h3>
                    <p className="text-xs text-zinc-300 uppercase leading-relaxed">
                      {categoryAd.sub || categoryAd.subtitle}
                    </p>
                    {categoryAd.cta && (
                      <div className="pt-2">
                        <a
                          href={categoryAd.link || '/shop'}
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                        >
                          {categoryAd.cta} →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

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
