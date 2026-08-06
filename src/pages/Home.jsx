import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Tag, Sparkles, Zap, ShieldCheck,
  Eye, Heart, Flame, Clock, Truck, Star, RefreshCw, Mail, Phone, Instagram, MessageCircle, MessageSquare, X
} from 'lucide-react';
import { FirebaseService } from '../services/firebaseService';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/shop/ProductCard';
import QuickViewModal from '../components/shop/QuickViewModal';

/* ── Scroll-reveal hook ────────────────────────────────────────────────── */
function useSR(threshold = 0.1) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('is-visible'); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}

/* ── Count-up hook ─────────────────────────────────────────────────────── */
function useCountUp(target, dur = 1100) {
  const [n, setN] = useState(0);
  const [go, setGo] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!go) return;
    let raf;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      setN(Math.round((1 - (1 - p) ** 3) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go, target, dur]);

  return [ref, n];
}

/* ── Stat block ────────────────────────────────────────────────────────── */
function Stat({ value, suffix, label, delay = 0 }) {
  const [ref, n] = useCountUp(value);
  return (
    <div ref={ref} className="sr space-y-1" style={{ transitionDelay: `${delay}ms` }}>
      <p className="font-display font-black text-white leading-none text-2xl sm:text-3xl">
        {n}{suffix}
      </p>
      <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{label}</p>
    </div>
  );
}

/* ── Section label ─────────────────────────────────────────────────────── */
function EyeBrow({ n, label }) {
  return (
    <div className="flex items-center gap-3 font-mono">
      {n && <span className="section-num text-zinc-500 font-bold">{n}</span>}
      {n && <span className="draw-line active flex-1 bg-zinc-800" style={{ maxWidth: 24, height: 1 }} />}
      <span className="section-num text-zinc-400 font-extrabold uppercase tracking-widest">{label}</span>
    </div>
  );
}

/* ── Reveal wrapper ────────────────────────────────────────────────────── */
function SR({ children, className = '', tag = 'div', delay = 0, type = 'sr' }) {
  const ref = useSR();
  const Tag = tag;
  return (
    <Tag ref={ref} className={`${type} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}

/* ── Genuine Real-Time Flash Drop Countdown Timer ───────────────────────── */
function FlashCountdown() {
  const getTimeRemaining = useCallback(() => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  }, []);

  const [time, setTime] = useState(getTimeRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getTimeRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, [getTimeRemaining]);

  const fmt = n => n.toString().padStart(2, '0');

  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-950/80 border border-red-800/80 text-red-400 font-mono text-[10px] font-bold uppercase tracking-wider">
      <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
      <span>TODAY'S DROP ENDS IN:</span>
      <strong className="text-white font-mono font-black">{fmt(time.hours)}H {fmt(time.minutes)}M {fmt(time.seconds)}S</strong>
    </div>
  );
}

/* ── Real Products Scrolling Model Lookbook Strip ─────────────────────────────── */
function ModelStrip({ products = [] }) {
  const trackRef = useRef(null);
  const pos = useRef(0);
  const raf = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const tick = () => {
      pos.current += 0.55;
      if (pos.current >= track.scrollWidth / 2) pos.current = 0;
      track.style.transform = `translate3d(-${pos.current}px, 0, 0)`;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    const p = track.parentElement;
    const pause = () => cancelAnimationFrame(raf.current);
    const resume = () => { raf.current = requestAnimationFrame(tick); };
    p?.addEventListener('mouseenter', pause);
    p?.addEventListener('mouseleave', resume);
    return () => { cancelAnimationFrame(raf.current); p?.removeEventListener('mouseenter', pause); p?.removeEventListener('mouseleave', resume); };
  }, [products]);

  if (!products || products.length === 0) return null;

  // Duplicate items array so continuous marquee scrolling is seamless
  const displayItems = products.length < 4 ? [...products, ...products, ...products, ...products] : [...products, ...products];

  return (
    <div className="overflow-hidden select-none">
      <div ref={trackRef} className="flex gap-3 will-change-transform" style={{ width: 'max-content' }}>
        {displayItems.map((p, i) => (
          <Link
            key={i}
            to={`/product/${p.slug || p.id}`}
            className="garment-card-gpu relative shrink-0 w-44 sm:w-52 border border-zinc-200 hover:border-black cursor-pointer group bg-white p-2 space-y-2 shadow-sm block"
          >
            <div className="relative overflow-hidden aspect-[3/4] bg-zinc-100">
              <img 
                src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'} 
                alt={p.name} 
                loading="lazy" 
                draggable={false} 
                className="garment-img-zoom w-full h-full object-cover object-top" 
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                <span className="bg-black text-white text-[9px] font-mono font-bold px-2.5 py-1 uppercase tracking-widest flex items-center gap-1 shadow-md">
                  VIEW DRESS <Eye className="w-3 h-3" />
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold gap-2">
              <span className="text-black truncate flex-1">{p.name}</span>
              <span className="text-emerald-600 font-extrabold shrink-0">₹{p.price || p.basePrice || p.discountPrice}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Promo carousel ────────────────────────────────────────────────────── */
const DEFAULT_ADS = [
  { id: 1, eyebrow: 'LIMITED TIME', h1: '20% OFF', h2: 'SITE-WIDE.', body: 'Code GENWIN20 at checkout. Orders above ₹999.', cta: 'CLAIM OFFER', to: '/shop' },
  { id: 2, eyebrow: 'NEW ARRIVAL', h1: 'HEAVYWEIGHT', h2: 'CANVAS TEE.', body: '240 GSM premium combed cotton. 12 washed colourways.', cta: 'SHOP NOW', to: '/shop?category=t-shirts' },
  { id: 3, eyebrow: 'FREE SHIPPING', h1: 'ORDERS', h2: 'ABOVE ₹999.', body: 'All-India express delivery. Same-day dispatch before 2 PM.', cta: 'START SHOPPING', to: '/shop' },
  { id: 4, eyebrow: 'COLLEGE DROPS', h1: 'BULK', h2: 'PRICING.', body: '10+ pieces for clubs, teams, and events. Special rates apply.', cta: 'GET QUOTE', to: '/customizer' },
];

function getAdLinkProps(targetUrl) {
  if (!targetUrl || typeof targetUrl !== 'string') {
    return { isExternal: false, url: '/shop' };
  }

  const trimmed = targetUrl.trim();
  if (!trimmed) return { isExternal: false, url: '/shop' };

  if (/^https?:\/\//i.test(trimmed)) {
    return { isExternal: true, url: trimmed };
  }

  if (/^www\./i.test(trimmed)) {
    return { isExternal: true, url: `https://${trimmed}` };
  }

  try {
    if (trimmed.includes(window.location.host) || trimmed.includes('vercel.app')) {
      const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      return { isExternal: false, url: parsed.pathname + parsed.search + parsed.hash };
    }
  } catch (_) {}

  let internalUrl = trimmed;
  if (!internalUrl.startsWith('/') && !internalUrl.startsWith('#')) {
    internalUrl = '/' + internalUrl;
  }

  return { isExternal: false, url: internalUrl };
}

function HeroBannerCarousel({ customAds = [] }) {
  const heroAds = (customAds || []).filter(a => a.active !== false && (a.placement === 'header_slider' || a.placement === 'top_header_banner'));
  
  const HERO_BANNER_DEFAULTS = [
    {
      id: 'h1',
      badge: 'NEW DROP',
      headline: 'Gurkha Pants',
      sub: 'Tailored For Comfort',
      cta: 'SHOP NOW',
      link: '/shop?category=pants',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1600&q=85'
    },
    {
      id: 'h2',
      badge: 'HEAVYWEIGHT 240 GSM',
      headline: 'Oversized Shirts & Tees',
      sub: 'Combed Organic Cotton Streetwear',
      cta: 'SHOP SHIRTS',
      link: '/shop?category=t-shirts',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1600&q=85'
    },
    {
      id: 'h3',
      badge: 'COLD WEATHER FLEECE',
      headline: '380 GSM Hoodies',
      sub: 'Drop-Shoulder Street Oversized Fits',
      cta: 'SHOP HOODIES',
      link: '/shop?category=hoodies',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1600&q=85'
    },
    {
      id: 'h4',
      badge: 'TACTICAL LAYERS',
      headline: 'Denim & Washed Jackets',
      sub: 'Vintage Overdyed Outerwear',
      cta: 'SHOP JACKETS',
      link: '/shop?category=jackets',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1600&q=85'
    },
    {
      id: 'h5',
      badge: 'DTG PRINT STUDIO',
      headline: 'Custom Graphic Printer',
      sub: 'Print Your Own Art On Combed Cotton',
      cta: 'START CREATING',
      link: '/customizer',
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1600&q=85'
    }
  ];

  const displaySlides = heroAds.length > 0 
    ? heroAds.map(a => ({
        id: a.id || Math.random(),
        badge: a.badge || 'PROMO DROP',
        headline: a.headline || a.title || 'GENWIN STREETWEAR',
        sub: a.sub || a.subtitle || '',
        cta: a.cta || a.linkText || 'SHOP NOW',
        link: a.link || a.linkUrl || '/shop',
        image: a.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1600&q=85'
      }))
    : HERO_BANNER_DEFAULTS;

  const [cur, setCur] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();

  const next = useCallback(() => setCur(c => (c + 1) % displaySlides.length), [displaySlides.length]);
  const prev = useCallback(() => setCur(c => (c - 1 + displaySlides.length) % displaySlides.length), [displaySlides.length]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 2000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = displaySlides[cur] || displaySlides[0];

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const diff = touchStart - touchEnd;
    if (diff > 40) next();
    else if (diff < -40) prev();
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleSlideClick = () => {
    const lp = getAdLinkProps(slide.link);
    if (lp.isExternal) {
      window.open(lp.url, '_blank');
    } else {
      navigate(lp.url);
    }
  };

  return (
    <div 
      className="relative w-full overflow-hidden bg-black select-none border-b border-zinc-900 shadow-2xl min-h-[55vh] sm:min-h-[75vh] lg:min-h-[85vh] flex flex-col justify-end"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Banner Image - Tap anywhere to open category */}
      <div 
        key={slide.id}
        onClick={handleSlideClick}
        className="absolute inset-0 cursor-pointer group"
      >
        <img 
          src={slide.image} 
          alt={slide.headline} 
          className="w-full h-full object-cover object-top opacity-85 group-hover:scale-105 transition-transform duration-700 ease-out" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      </div>

      {/* Content Overlay - Pure Info, No Buttons */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-12 pb-12 pt-20 text-white font-mono space-y-3 pointer-events-none">
        {slide.badge && (
          <span className="inline-block px-3 py-1 bg-white text-black font-extrabold text-[10px] uppercase tracking-widest shadow-lg">
            {slide.badge}
          </span>
        )}

        <div className="space-y-1 max-w-2xl">
          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-7xl uppercase tracking-tight text-white leading-tight drop-shadow-2xl">
            {slide.headline}
          </h1>
          {slide.sub && (
            <p className="text-xs sm:text-sm text-zinc-300 uppercase tracking-widest max-w-md leading-relaxed font-mono drop-shadow-md">
              {slide.sub}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar & Pagination Dots */}
      <div className="absolute bottom-4 left-6 sm:left-12 flex items-center gap-2 z-20">
        {displaySlides.map((s, i) => (
          <button
            key={s.id || i}
            onClick={(e) => { e.stopPropagation(); setCur(i); }}
            className={`transition-all duration-300 h-1 rounded-full ${i === cur ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </div>
  );
}

const PromoSlider = HeroBannerCarousel;

/* ── Homepage Hero Banner (Supports Multiple Rotating Hero Banners) ── */
function HomepageHeroBanner({ customAds = [] }) {
  const heroAds = (customAds || []).filter(a => a.active !== false && a.placement === 'homepage_hero');

  const defaultHero = {
    id: 'default',
    badge: 'SPRING / SUMMER 2026',
    headline: 'WEAR YOUR IDENTITY.',
    body: '240 GSM heavyweight cotton streetwear, acid-wash hoodies, and custom DTG prints.',
    cta: 'EXPLORE CATALOG',
    link: '/shop',
    image: null
  };

  const slides = heroAds.length > 0 
    ? heroAds.map((a, i) => ({
        id: a.id || i,
        badge: a.badge || 'SPRING / SUMMER 2026',
        headline: a.headline || a.title || 'WEAR YOUR IDENTITY.',
        body: a.sub || a.subtitle || '240 GSM heavyweight cotton streetwear, acid-wash hoodies, and custom DTG prints.',
        cta: a.cta || a.linkText || 'EXPLORE CATALOG',
        link: a.link || a.linkUrl || '/shop',
        image: a.image || null
      }))
    : [defaultHero];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slides.length]);

  const currentSlide = slides[currentIndex] || slides[0];

  const rawHeadline = currentSlide.headline;
  const parts = rawHeadline.split(' ');
  const h1 = parts[0] || 'WEAR';
  const h2 = parts[1] || 'YOUR';
  const h3 = parts.slice(2).join(' ') || 'IDENTITY.';

  return (
    <SR className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-20">
      <div className="relative bg-black border border-zinc-900 shadow-2xl overflow-hidden text-white font-mono p-8 sm:p-16 rounded-2xl">
        {currentSlide.image && (
          <>
            <img src={currentSlide.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          </>
        )}
        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="flex items-center gap-3">
            <FlashCountdown />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {currentSlide.badge}
            </span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-none text-white">
            {h1} <span className="text-zinc-600">{h2}</span> {h3}
          </h2>

          <p className="text-xs text-zinc-400 uppercase tracking-widest leading-relaxed max-w-md">
            {currentSlide.body}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {(() => {
              const lp = getAdLinkProps(currentSlide.link);
              return lp.isExternal ? (
                <a href={lp.url} target="_blank" rel="noreferrer"
                  className="btn-magnetic press inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-widest shadow-xl hover:bg-zinc-200 transition-colors rounded-xl">
                  {currentSlide.cta} <ArrowRight className="w-4 h-4" />
                </a>
              ) : (
                <Link to={lp.url}
                  className="btn-magnetic press inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-widest shadow-xl hover:bg-zinc-200 transition-colors rounded-xl">
                  {currentSlide.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              );
            })()}

            <Link to="/customizer"
              className="press inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 border border-zinc-800 text-white hover:border-zinc-500 font-bold text-xs uppercase tracking-widest transition-colors rounded-xl">
              <Sparkles className="w-4 h-4 text-emerald-400" /> CUSTOM PRINT STUDIO
            </Link>
          </div>

          {slides.length > 1 && (
            <div className="flex items-center gap-2 pt-4">
              {slides.map((s, idx) => (
                <button
                  key={s.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-zinc-700 hover:bg-zinc-500'}`}
                />
              ))}
            </div>
          )}

          <div className="pt-6 border-t border-zinc-900 grid grid-cols-3 gap-6">
            <Stat value={240} suffix=" GSM" label="HEAVY COTTON" delay={0} />
            <Stat value={50} suffix="+" label="WASH PROOF" delay={80} />
            <Stat value={49} suffix=" ★" label="RATING / 5" delay={160} />
          </div>
        </div>
      </div>
    </SR>
  );
}

/* ── Front & Center Scroll-Triggered Promo Modal (One-Time Display) ───────── */
function PopupPromoModal({ ads = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('genwin_popup_dismissed') === 'true';
    } catch (_) {
      return false;
    }
  });

  const customPopupAd = ads.find(a => a.active !== false && (a.placement === 'popup' || a.placement === 'modal'));

  useEffect(() => {
    if (dismissed || !customPopupAd) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [dismissed, customPopupAd]);

  if (!isOpen || dismissed || !customPopupAd) return null;

  const handleClose = () => {
    setIsOpen(false);
    setDismissed(true);
    try {
      sessionStorage.setItem('genwin_popup_dismissed', 'true');
    } catch (_) {}
  };

  const popupAd = customPopupAd;
  const rawHeadline = popupAd?.headline || popupAd?.title || 'SPECIAL STORE DISCOUNT';
  const subtext = popupAd.sub || popupAd.subtitle || '240 GSM organic cotton streetwear drop. Limited availability.';
  const badge = popupAd.badge || 'PROMO DROP';
  const cta = popupAd.cta || popupAd.linkText || 'CLAIM OFFER NOW';
  const link = popupAd.link || popupAd.linkUrl || '/shop';
  const image = popupAd.image || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80';

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="relative bg-zinc-950 border border-zinc-800 text-white max-w-sm sm:max-w-md w-full overflow-hidden shadow-2xl space-y-0"
        onClick={e => e.stopPropagation()}
      >


        {/* Promo Image Header */}
        {image && (
          <div className="h-44 w-full relative overflow-hidden bg-zinc-900 border-b border-zinc-800">
            <img src={image} alt={rawHeadline} className="w-full h-full object-cover opacity-85" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
            <div className="absolute bottom-3 left-4">
              <span className="px-2.5 py-1 text-[9px] font-mono font-bold bg-white text-black uppercase tracking-widest shadow-md">
                {badge}
              </span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-4 font-mono">
          {!image && (
            <span className="px-2.5 py-1 text-[9px] font-mono font-bold bg-white text-black uppercase tracking-widest inline-block">
              {badge}
            </span>
          )}
          <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-white leading-tight">
            {rawHeadline}
          </h3>
          <p className="text-xs text-zinc-400 uppercase leading-relaxed">
            {subtext}
          </p>

          <div className="space-y-2 pt-2">
            {(() => {
              const lp = getAdLinkProps(link);
              return lp.isExternal ? (
                <a
                  href={lp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose}
                  className="btn-magnetic press w-full py-3.5 bg-white text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-zinc-200 transition-colors"
                >
                  {cta} <ArrowRight className="w-4 h-4" />
                </a>
              ) : (
                <Link
                  to={lp.url}
                  onClick={handleClose}
                  className="btn-magnetic press w-full py-3.5 bg-white text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-zinc-200 transition-colors"
                >
                  {cta} <ArrowRight className="w-4 h-4" />
                </Link>
              );
            })()}

            <button
              onClick={handleClose}
              className="w-full py-2 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest text-center transition-colors"
            >
              NO THANKS, CONTINUE SHOPPING
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ══════════════════════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════════════════════ */
export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qv, setQv] = useState(null);
  const { settings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([FirebaseService.getProducts(), FirebaseService.getCategories(), FirebaseService.getAds()])
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

  const availableProducts = products.filter(p => !((p.stockQty !== undefined && p.stockQty <= 0) || p.isSoldOut));

  const topPicksList = (() => {
    const list = [...availableProducts.filter(p => p.isBestseller || p.rating >= 4.5)];
    availableProducts.forEach(p => {
      if (list.length < 10 && !list.some(item => item.id === p.id)) {
        list.push(p);
      }
    });
    return list.slice(0, 10);
  })();

  const newArrivalsList = (() => {
    const list = [...availableProducts.filter(p => p.isNew)];
    [...availableProducts].reverse().forEach(p => {
      if (list.length < 10 && !list.some(item => item.id === p.id)) {
        list.push(p);
      }
    });
    return list.slice(0, 10);
  })();

  return (
    <div className="page-enter font-mono">

      {/* ══ 1. HERO BANNER CAROUSEL (5-6 SWIPEABLE PHOTOS WITH DIRECT CATEGORY LINKS) ══ */}
      <HeroBannerCarousel customAds={ads} />

      {/* ══ 2. WEEK'S TOP PICKS (AT LEAST 10 PRODUCTS) ═══════════════ */}
      <SR className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-10 space-y-6">
        <div className="text-center py-2">
          <h2 className="font-display font-black text-xl sm:text-3xl uppercase tracking-tight text-black">
            WEEK'S TOP PICKS
          </h2>
        </div>

        {/* Swipeable Product Cards Row (At Least 10 Products) */}
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-none">
          {loading
            ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <div key={n} className="w-[220px] sm:w-[260px] shrink-0 aspect-[3/4] skeleton rounded-2xl" />)
            : topPicksList.map((p, idx) => (
                <div key={p.id || idx} className="w-[220px] sm:w-[260px] shrink-0 snap-start">
                  <ProductCard product={p} onQuickView={setQv} />
                </div>
              ))
          }
        </div>

        {/* NEW ARRIVALS Section (AT LEAST 10 PRODUCTS) */}
        <div className="text-center pt-8 pb-2">
          <h2 className="font-display font-black text-xl sm:text-3xl uppercase tracking-tight text-black">
            NEW ARRIVALS
          </h2>
        </div>

        {/* Swipeable Product Cards Row for New Arrivals (At Least 10 Products) */}
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-none">
          {loading
            ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <div key={n} className="w-[220px] sm:w-[260px] shrink-0 aspect-[3/4] skeleton rounded-2xl" />)
            : newArrivalsList.map((p, idx) => (
                <div key={p.id || idx} className="w-[220px] sm:w-[260px] shrink-0 snap-start">
                  <ProductCard product={p} onQuickView={setQv} />
                </div>
              ))
          }
        </div>
      </SR>

      {/* ══ 4. HOMEPAGE HERO BANNER (PROMO HERO BANNER BEFORE CATEGORIES) ═════ */}
      <HomepageHeroBanner customAds={ads} />

      {/* ══ 5. CATEGORIES SECTION ════════════════════════════════════════════ */}
      <SR className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-16 space-y-6">
        <div className="text-center py-2">
          <h2 className="font-display font-black text-xl sm:text-3xl uppercase tracking-tight text-black">
            SHOP BY CATEGORY
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          {categories.length === 0
            ? [1, 2, 3, 4].map(n => <div key={n} className="skeleton sr" style={{ aspectRatio: '3/4' }} />)
            : categories.map((cat, i) => {
                const catImg = cat.image || cat.banner || cat.imageUrl || cat.bannerUrl || cat.heroImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80';
                return (
                  <Link key={cat.id || cat.slug || i} to={`/shop?category=${cat.slug}`}
                    className="garment-card-gpu group relative border border-zinc-200 overflow-hidden block bg-black shadow-sm hover:shadow-xl rounded-xl"
                    style={{ aspectRatio: '3/4' }}>
                    <img src={catImg} alt={cat.name || 'Category'} loading="lazy"
                      className="garment-img-zoom w-full h-full object-cover opacity-90 rounded-xl" />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/60 transition-colors duration-300 flex flex-col justify-end p-5">
                      <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-300 space-y-1">
                        <h3 className="font-display font-black text-white text-sm sm:text-base uppercase leading-tight">{cat.name}</h3>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-1">
                          <span className="font-mono text-[9px] font-bold text-white uppercase tracking-widest">EXPLORE CATEGORY</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </div>
                    {/* Always-visible label */}
                    <div className="absolute top-3 left-3">
                      <span className="tag text-white border-white/40 bg-black/60 backdrop-blur-sm font-mono text-[9px]">
                        {(cat.name || 'CATEGORY').split('&')[0].trim().toUpperCase()}
                      </span>
                    </div>
                  </Link>
                );
              })
          }
        </div>
      </SR>

      {/* ══ 6. REVERSE TICKER ════════════════════════════════════════════ */}
      <div className="mt-20 border-y border-zinc-200 py-3 overflow-hidden select-none bg-zinc-50">
        <div className="flex gap-8 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500"
          style={{ animation: 'marquee 38s linear infinite reverse', width: 'max-content', display: 'flex' }}>
          {['HEAVYWEIGHT COTTON', '·', 'STREETWEAR ESSENTIALS', '·', 'PREMIUM FLEECE', '·', 'OVERSIZED FITS', '·', 'CUSTOM PRINTS', '·', 'ALL-INDIA DELIVERY', '·',
            'HEAVYWEIGHT COTTON', '·', 'STREETWEAR ESSENTIALS', '·', 'PREMIUM FLEECE', '·', 'OVERSIZED FITS', '·', 'CUSTOM PRINTS', '·', 'ALL-INDIA DELIVERY', '·'].map((t, i) => (
            <span key={i} className="shrink-0">{t}</span>
          ))}
        </div>
      </div>



      {/* ══ 11. FINAL CTA ════════════════════════════════════════════════ */}
      <SR className="max-w-7xl mx-auto px-6 lg:px-12 mt-16 mb-16">
        <div className="relative bg-black overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 px-8 sm:px-14 py-16 border border-zinc-900 shadow-2xl">
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="relative z-10 space-y-2">
            <p className="section-num text-zinc-500 font-bold">जेनwin.</p>
            <h2 className="font-display font-black text-white uppercase text-3xl sm:text-5xl tracking-tight leading-none">
              PREMIUM APPAREL.<br /><span className="text-zinc-600">DELIVERED FAST.</span>
            </h2>
            <p className="font-mono text-zinc-400 text-xs uppercase tracking-widest pt-2">
              Same-day dispatch · All-India · 7-day returns · 4.9★
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <Link to="/shop"
              className="btn-magnetic press flex items-center gap-2 px-10 py-5 bg-white text-black font-mono font-black text-sm uppercase tracking-widest shadow-xl">
              BROWSE CATALOG <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </SR>

      {/* Floating Support Ticket Action Button */}
      <Link
        to="/support"
        className="fixed bottom-6 right-6 z-40 bg-black text-white p-3.5 rounded-full border border-zinc-700 shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 font-mono group"
        title="Create Support Ticket"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold">
          <MessageSquare className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-extrabold uppercase pr-2 tracking-wider hidden sm:inline-block">
          HELP &amp; TICKETS
        </span>
      </Link>

      {qv && <QuickViewModal product={qv} onClose={() => setQv(null)} />}
      <PopupPromoModal ads={ads} />
    </div>
  );
}
