import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X, ArrowRight, LogIn } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { totalCount, setIsCartOpen } = useCart();
  const { user, wishlist } = useAuth();
  const { settings } = useSettings();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `text-xs font-bold uppercase tracking-wider transition-colors font-mono ${
      isActive ? 'text-black' : 'text-zinc-500 hover:text-black'
    }`;

  const NAV_LINKS = [
    ['/', 'HOME'],
    ['/shop', 'ALL PRODUCTS'],
    ['/shop?category=t-shirts', 'T-SHIRTS & OVERSIZED'],
    ['/shop?category=hoodies', 'HOODIES & SWEATSHIRTS'],
    ['/shop?category=jackets', 'JACKETS & OUTERWEAR'],
    ['/shop?category=accessories', 'CAPS & ACCESSORIES'],
    [user ? '/account' : '/login', user ? 'MY ACCOUNT & ORDERS' : 'SIGN IN / REGISTER'],
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 bg-white transition-shadow ${scrolled ? 'shadow-md border-b border-zinc-200' : 'border-b border-zinc-100'}`}>

        {/* Dynamic Announcement Banner */}
        {settings.announcementEnabled !== false && (
          <div className="bg-black text-white text-[10px] sm:text-[11px] py-2 px-4 text-center font-mono tracking-wider uppercase flex items-center justify-center gap-2">
            <span>{settings.announcementText || `FREE SHIPPING OVER ₹${settings.freeShippingThreshold || 999}`}</span>
            <span className="text-zinc-600">·</span>
            <span>CODE <strong className="underline underline-offset-2 cursor-pointer text-white">GENWIN20</strong> FOR 20% OFF</span>
          </div>
        )}

        {/* Main Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">

          {/* Left: Mobile menu toggle & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-zinc-800 hover:text-black transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="font-display font-black text-2xl sm:text-3xl tracking-tighter text-black">
                {settings.storeName || 'जेनwin.'}
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/shop" className={navLinkClass}>All</NavLink>
            <NavLink to="/shop?category=t-shirts" className={navLinkClass}>T-Shirts</NavLink>
            <NavLink to="/shop?category=hoodies" className={navLinkClass}>Hoodies</NavLink>
            <NavLink to="/shop?category=jackets" className={navLinkClass}>Jackets</NavLink>
            <NavLink to="/shop?category=accessories" className={navLinkClass}>Accessories</NavLink>
          </nav>

          {/* Right: Search & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">

            {/* Desktop Search Input */}
            <form onSubmit={handleSearch} className="hidden lg:flex relative w-44 focus-within:w-60 transition-all duration-300">
              <input
                type="text"
                placeholder="SEARCH..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 text-xs py-2 pl-3 pr-8 focus:outline-none focus:border-black placeholder:text-zinc-400 font-mono uppercase"
              />
              <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black">
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Wishlist Button */}
            <Link
              to="/account?tab=wishlist"
              className="p-2 border border-transparent hover:border-zinc-200 text-zinc-700 hover:text-black relative transition-all"
              title="Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center anim-pop-in">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Account / User Button — Sleek Pill Button displaying Gmail Avatar */}
            <Link
              to={user ? '/account' : '/login'}
              className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 border text-xs font-mono font-bold uppercase tracking-wider transition-all press ${
                user
                  ? 'border-zinc-900 bg-black text-white hover:bg-zinc-800'
                  : 'border-zinc-200 text-zinc-800 hover:border-black hover:bg-zinc-50'
              }`}
              title={user ? user.name : 'Sign In'}
            >
              {user ? (
                <>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="w-5 h-5 rounded-full object-cover border border-white shrink-0"
                    />
                  ) : (
                    <span className="w-5 h-5 bg-white text-black font-extrabold text-[10px] flex items-center justify-center uppercase rounded-none shrink-0">
                      {user.name.charAt(0)}
                    </span>
                  )}
                  <span className="hidden xl:inline text-[11px] max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">ACCOUNT</span>
                </>
              )}
            </Link>

            {/* Cart / Bag Button — Bold & Interactive */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn-magnetic press flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-sm"
              title="Cart / Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">BAG</span>
              <span className="bg-white text-black font-extrabold text-[10px] px-1.5 py-0.5 min-w-[18px] text-center">
                {totalCount}
              </span>
            </button>

          </div>
        </div>
      </header>

      {/* ── Left-slide Mobile Drawer ───────────────────────────────────────── */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className="md:hidden fixed inset-0 z-50 bg-black/60 transition-opacity duration-300"
        style={{
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
        }}
      />

      {/* Drawer panel */}
      <div
        className="md:hidden fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw] bg-white flex flex-col shadow-2xl"
        style={{
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-5 bg-black text-white border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-2xl tracking-tighter uppercase">
              {settings.storeName || 'जेनwin.'}
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Status Bar in Drawer displaying Gmail Avatar */}
        <div className="px-5 py-3.5 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between font-mono">
          {user ? (
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-zinc-300 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 bg-black text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="truncate">
                <p className="font-bold text-xs text-black uppercase line-clamp-1">{user.name}</p>
                <p className="text-[9px] text-zinc-400 uppercase truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">GUEST ACCOUNT</span>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[10px] font-bold text-black uppercase underline flex items-center gap-1"
              >
                SIGN IN <LogIn className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Search inside drawer */}
        <form onSubmit={handleSearch} className="px-5 py-4 border-b border-zinc-100">
          <div className="relative">
            <input
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 text-xs py-2.5 pl-4 pr-9 focus:outline-none focus:border-black uppercase font-mono"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black">
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto divide-y divide-zinc-100 font-mono">
          {NAV_LINKS.map(([to, label]) => (
            <Link
              key={label}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-5 py-4 text-xs font-bold uppercase tracking-widest text-black hover:bg-zinc-50 hover:pl-7 transition-all duration-150"
            >
              <span>{label}</span>
              <ArrowRight className="w-3 h-3 text-zinc-300" />
            </Link>
          ))}
        </nav>

        {/* Drawer Footer */}
        <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            USE CODE <strong className="text-black">GENWIN20</strong> FOR 20% OFF
          </p>
        </div>
      </div>
    </>
  );
}
