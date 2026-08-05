import React from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';

export default function FilterSidebar({ 
  categories, 
  selectedCategory, 
  setSelectedCategory,
  onlyCustomizable,
  setOnlyCustomizable,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  resetFilters
}) {
  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6 bg-white p-5 border border-zinc-200">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <h3 className="font-bold text-black text-xs uppercase tracking-widest font-mono">Filters & Sort</h3>
        <button 
          onClick={resetFilters}
          className="text-[10px] text-zinc-500 hover:text-black flex items-center gap-1 font-mono uppercase underline"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Sort By Dropdown */}
      <div>
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
          Sort Order
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-300 text-xs p-2 font-mono uppercase focus:outline-none focus:border-black"
        >
          <option value="featured">Featured / Bestseller</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Customizable Only Toggle */}
      <div className="pt-2 border-t border-zinc-100">
        <label className="flex items-center justify-between cursor-pointer p-2.5 bg-zinc-50 border border-zinc-200">
          <span className="flex items-center gap-1.5 text-xs font-bold text-black uppercase font-mono">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            Customizable Only
          </span>
          <input
            type="checkbox"
            checked={onlyCustomizable}
            onChange={(e) => setOnlyCustomizable(e.target.checked)}
            className="w-4 h-4 accent-black cursor-pointer"
          />
        </label>
      </div>

      {/* Categories */}
      <div className="pt-2 border-t border-zinc-100">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
          Categories
        </label>
        <div className="space-y-1 text-xs font-mono uppercase">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-left px-3 py-2 border transition-colors flex items-center justify-between ${
              selectedCategory === 'all' ? 'bg-black text-white border-black font-bold' : 'text-zinc-700 border-transparent hover:bg-zinc-100'
            }`}
          >
            <span>All Apparel</span>
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`w-full text-left px-3 py-2 border transition-colors flex items-center justify-between ${
                selectedCategory === cat.slug ? 'bg-black text-white border-black font-bold' : 'text-zinc-700 border-transparent hover:bg-zinc-100'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="pt-2 border-t border-zinc-100 font-mono">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Max Price
          </label>
          <span className="text-xs font-extrabold text-black">₹{maxPrice}</span>
        </div>
        <input
          type="range"
          min="400"
          max="4000"
          step="100"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-black bg-zinc-200 h-1 rounded-none cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-zinc-400 mt-1">
          <span>₹400</span>
          <span>₹4,000</span>
        </div>
      </div>
    </aside>
  );
}
