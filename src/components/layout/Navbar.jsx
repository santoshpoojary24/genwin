import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, ArrowRight, LogIn } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { totalCount, setIsCartOpen } = useCart();
  const { user, wishlist, setIsLoginOpen } = useAuth();
  const { settings } = useSettings();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `text-xs font-black uppercase tracking-wider transition-colors font-mono ${
      isActive ? 'text-black underline underline-offset-4' : 'text-zinc-500 hover:text-black'
    }`;

  const NAV_LINKS = [
    ['/', 'HOME'],
    ['/shop', 'ALL PRODUCTS'],
    ['/shop?category=t-shirts', 'T-SHIRTS & OVERSIZED'],
    ['/shop?category=hoodies', 'HOODIES & SWEATSHIRTS'],
    ['/shop?category=jackets', 'JACKETS & OUTERWEAR'],
    ['/shop?category=accessories', 'CAPS & ACCESSORIES'],
    ['/support', 'HELP & TICKETS'],
    [user ? '/account' : '/login', user ? 'MY ACCOUNT & ORDERS' : 'SIGN IN / REGISTER'],
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 bg-white text-black transition-shadow ${scrolled ? 'shadow-md border-b border-zinc-200' : 'border-b border-zinc-200/80'}`}>

        {/* Top Black Announcement Bar */}
        {settings.announcementEnabled !== false && (
          <div className="bg-black text-white text-[10px] sm:text-[11px] py-1.5 px-4 text-center font-mono tracking-wider uppercase flex items-center justify-center gap-2">
            <span>⚡ EMI AVAILABLE 💡</span>
            <span className="text-zinc-600">•</span>
            <span>{settings.announcementText || `FREE HOME DELIVERY FOR PAID ORDERS`}</span>
          </div>
        )}

        {/* Main Monochrome Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 select-none">

          {/* Left Action Icons: Menu + Search */}
          <div className="flex items-center gap-4 sm:gap-5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 text-black hover:text-zinc-600 transition-colors md:hidden"
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6 stroke-[2.2]" />
            </button>

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1 text-black hover:text-zinc-600 transition-colors"
              aria-label="Search"
            >
              <Search className="w-6 h-6 stroke-[2.2]" />
            </button>
          </div>

          {/* Center Brand Monogram / Logo */}
          <Link to="/" className="flex items-center justify-center">
            <span className="font-display font-black text-2xl sm:text-3xl tracking-tighter text-black">
              {settings.storeName || 'जेनwin.'}
            </span>
          </Link>

          {/* Right Action Icons: Wishlist + Shopping Cart */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Desktop Account / Sign In Button */}
            <div className="hidden md:flex items-center gap-2 mr-2 font-mono">
              {user ? (
                <Link
                  to="/account"
                  className="p-1 text-black hover:text-zinc-600 transition-colors flex items-center gap-1.5"
                  title="My Account"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover border border-zinc-350"
                    />
                  ) : (
                    <User className="w-6 h-6 stroke-[2.2]" />
                  )}
                  <span className="text-[10px] font-black uppercase tracking-wider hidden xl:inline-block max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                </Link>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="p-1 text-black hover:text-zinc-600 transition-colors flex items-center gap-1.5"
                  title="Sign In"
                >
                  <User className="w-6 h-6 stroke-[2.2]" />
                  <span className="text-[10px] font-black uppercase tracking-wider hidden xl:inline-block">SIGN IN</span>
                </button>
              )}
            </div>

            {/* Wishlist / Heart Icon */}
            <Link
              to="/wishlist"
              className="p-1 text-black relative hover:text-zinc-600 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-6 h-6 stroke-[2.2]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1 text-black relative hover:text-zinc-600 transition-colors"
              title="Cart / Shopping Bag"
            >
              <ShoppingCart className="w-6 h-6 stroke-[2.2]" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Dropdown Search Bar when Search Icon is tapped */}
        {searchOpen && (
          <div className="bg-black p-3 border-t border-zinc-800 animate-fade-in">
            <form onSubmit={handleSearch} className="max-w-xl mx-auto relative flex items-center">
              <input
                type="text"
                autoFocus
                placeholder="SEARCH FOR SHIRTS, HOODIES, PANTS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs py-2.5 pl-4 pr-10 focus:outline-none focus:border-white uppercase font-mono tracking-wider"
              />
              <button type="submit" className="absolute right-3 text-white">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
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
          <span className="font-display font-black text-2xl tracking-tighter">
            {settings.storeName || 'जेनwin.'}
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>

        {/* User Status Bar in Drawer */}
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
              <button
                onClick={() => { setMobileMenuOpen(false); setIsLoginOpen(true); }}
                className="text-[10px] font-bold text-black uppercase underline flex items-center gap-1"
              >
                SIGN IN <LogIn className="w-3.5 h-3.5" />
              </button>
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
              <Search className="w-4 h-4" />
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
              className="flex items-center justify-between px-5 py-4 text-xs font-bold uppercase tracking-widest text-black hover:bg-[#FFC700]/20 hover:pl-7 transition-all duration-150"
            >
              <span>{label}</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
