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

function PromoSlider({ customAds = [] }) {
  const displayAds = customAds.length > 0 
    ? customAds.map(a => {
        const rawHeadline = a.headline || a.title || 'SALE';
        const parts = rawHeadline.split(' ');
        const h1 = parts[0];
        const h2 = parts.slice(1).join(' ');
        return {
          id: a.id,
          eyebrow: a.badge || 'PROMO',
          h1: h1,
          h2: h2,
          body: a.sub || a.subtitle || '',
          cta: a.cta || a.linkText || 'SHOP NOW',
          to: a.link || a.linkUrl || '/shop',
          image: a.image || null
        };
      })
    : DEFAULT_ADS;

  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const next = useCallback(() => setCur(c => (c + 1) % displayAds.length), [displayAds.length]);
  const prev = useCallback(() => setCur(c => (c - 1 + displayAds.length) % displayAds.length), [displayAds.length]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [paused, next]);
  const ad = displayAds[cur] || displayAds[0];

  return (
    <div className="relative bg-black overflow-hidden border border-zinc-900 shadow-2xl"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>

      {/* Background Image if available */}
      {ad.image && (
        <>
          <img src={ad.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </>
      )}

      {/* Dot texture */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '24px 24px' }} />

      <div key={ad.id} className="relative z-10 px-8 sm:px-16 py-14 sm:py-20 text-white"
        style={{ animation: 'slideAdIn 0.45s var(--ease-expo) both' }}>

        <span className="anim-pop-in tag text-zinc-400 border-zinc-700 mb-6 inline-flex font-mono">
          <Tag className="w-2.5 h-2.5 mr-1" />{ad.eyebrow}
        </span>

        <h2 className="font-display font-black uppercase leading-none text-display-lg tracking-tighter">
          {ad.h1}<br /><span className="text-zinc-600">{ad.h2}</span>
        </h2>

        <p className="font-mono text-zinc-400 text-xs uppercase tracking-widest mt-4 max-w-sm leading-relaxed">
          {ad.body}
        </p>

        {(() => {
          const lp = getAdLinkProps(ad.to);
          return lp.isExternal ? (
            <a
              href={lp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-magnetic press inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-white text-black font-mono font-black text-xs uppercase tracking-widest hover:bg-zinc-100 transition-colors"
            >
              {ad.cta} <ArrowRight className="w-3.5 h-3.5" />
            </a>
          ) : (
            <Link
              to={lp.url}
              className="btn-magnetic press inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-white text-black font-mono font-black text-xs uppercase tracking-widest hover:bg-zinc-100 transition-colors"
            >
              {ad.cta} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          );
        })()}
      </div>

      {/* Controls */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white flex items-center justify-center transition-all press bg-black/60">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white flex items-center justify-center transition-all press bg-black/60">
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Progress */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-zinc-900">
        {!paused && (
          <div key={cur} className="h-full bg-emerald-400 origin-left"
            style={{ animation: 'progressBar 4.5s linear forwards' }} />
        )}
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-8 sm:left-16 flex gap-1.5 z-20">
        {displayAds.map((_, i) => (
          <button key={i} onClick={() => setCur(i)}
            className={`transition-all duration-300 h-px ${i === cur ? 'w-6 bg-white' : 'w-2 bg-zinc-700 hover:bg-zinc-500'}`} />
        ))}
      </div>
    </div>
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

  const filteredBestsellers = products.filter(p => p.isBestseller || p.rating >= 4.5);
  const bestsellers = (filteredBestsellers.length > 0 ? filteredBestsellers : products).slice(0, 4);
  const featuredDress = products[0] || null;

  const handleSelectModelGarment = (m) => {
    const keywords = m.label.toUpperCase().split(' ');
    const matched = products.find(p => {
      const pName = (p.name || '').toUpperCase();
      const pCat = (p.category || '').toUpperCase();
      return keywords.some(k => k.length >= 3 && (pName.includes(k) || pCat.includes(k)));
    }) || products[0];

    if (matched) {
      navigate(`/product/${matched.slug || matched.id}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <div className="page-enter font-mono">

      {/* ══ 1. HERO SECTION WITH ANIMATED DRESS SHOWCASE ══════════════════ */}
      <section className="relative bg-black min-h-[92vh] flex flex-col justify-between overflow-hidden">

        {/* Tactical Grid overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 0,transparent 80px),repeating-linear-gradient(90deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 0,transparent 80px)' }} />

        <div className="relative flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 pt-12 pb-12 grid lg:grid-cols-12 gap-10 items-center">

          {/* ── Left copy ── */}
          <div className="lg:col-span-7 space-y-7 z-10">

            <div className="anim-fade-left d-100 flex items-center gap-3">
              <FlashCountdown />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">SPRING / SUMMER 2026</span>
            </div>

            {/* Giant headline */}
            <div className="space-y-0 overflow-hidden">
              <p className="anim-fade-up d-150 font-display font-black text-white uppercase"
                style={{ fontSize: 'clamp(3.5rem,7.5vw,7rem)', lineHeight: 0.95, letterSpacing: '-0.04em' }}>
                WEAR
              </p>
              <p className="anim-fade-up d-200 font-display font-black text-zinc-700 uppercase"
                style={{ fontSize: 'clamp(3.5rem,7.5vw,7rem)', lineHeight: 0.95, letterSpacing: '-0.04em' }}>
                YOUR
              </p>
              <p className="anim-fade-up d-250 font-display font-black text-white uppercase"
                style={{ fontSize: 'clamp(3.5rem,7.5vw,7rem)', lineHeight: 0.95, letterSpacing: '-0.04em' }}>
                IDENTITY.
              </p>
            </div>

            <p className="anim-fade-up d-350 text-zinc-400 text-xs uppercase tracking-[0.12em] max-w-md leading-relaxed">
              240 GSM heavyweight cotton streetwear, acid-wash hoodies, and custom DTG prints. Low-end device friendly ultra smooth GPU performance.
            </p>

            {/* Action Buttons */}
            <div className="anim-fade-up d-400 flex flex-wrap items-center gap-3 pt-2">
              <Link to="/shop"
                className="btn-magnetic press flex items-center gap-2 px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-widest shadow-xl hover:bg-zinc-200 transition-all">
                EXPLORE SHOP <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/customizer"
                className="press flex items-center gap-2 px-8 py-4 bg-zinc-900 border border-zinc-800 text-white hover:border-zinc-500 font-bold text-xs uppercase tracking-widest transition-colors">
                <Sparkles className="w-4 h-4 text-emerald-400" /> CUSTOM T-SHIRT PRINTER
              </Link>
            </div>

            {/* Animated stats row */}
            <div className="anim-fade-up d-500 pt-6 border-t border-zinc-900 grid grid-cols-3 gap-6 stagger">
              <Stat value={240} suffix=" GSM" label="HEAVY COTTON" delay={0} />
              <Stat value={50} suffix="+" label="WASH PROOF" delay={80} />
              <Stat value={49} suffix=" ★" label="RATING / 5" delay={160} />
            </div>
          </div>

          {/* ── Right: Floating Animated Dress Showcase Card ── */}
          {featuredDress && (
            <div className="lg:col-span-5 anim-fade-right d-200 flex justify-center">
              <div
                onClick={() => navigate(`/product/${featuredDress.slug || featuredDress.id}`)}
                className="garment-card-gpu anim-garment-float relative w-full max-w-sm bg-zinc-950 border border-zinc-800 hover:border-white p-4 space-y-3 cursor-pointer group shadow-2xl transition-all"
              >
                <div className="relative overflow-hidden aspect-[3/4] bg-zinc-900">
                  <img
                    src={featuredDress.images?.[0] || featuredDress.image || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&q=85'}
                    alt={featuredDress.name || 'Featured Dress'}
                    className="garment-img-zoom w-full h-full object-cover object-top opacity-90"
                  />
                  
                  {/* Floating stock pill */}
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-zinc-700 px-2.5 py-1 text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>9 IN STOCK</span>
                  </div>

                  {/* Price Tag Badge */}
                  <div className="absolute top-3 right-3 bg-white text-black px-2.5 py-1 font-black text-xs uppercase shadow-md">
                    ₹{featuredDress.discountPrice || featuredDress.price || featuredDress.basePrice}
                  </div>

                  {/* Hover overlay button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <span className="bg-white text-black text-xs font-black px-5 py-3 uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                      VIEW DRESS DETAILS <Eye className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">{featuredDress.category || 'FEATURED DRESS'}</span>
                    <h4 className="font-bold text-xs text-white uppercase truncate max-w-[200px]">{featuredDress.name}</h4>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase group-hover:text-white transition-colors">TAP TO VIEW →</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom ticker */}
        <div className="border-t border-zinc-900 py-3 overflow-hidden select-none bg-black/50">
          <div className="flex gap-8 whitespace-nowrap anim-marquee font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            {['240 GSM COTTON', '·', 'DTG PRINT', '·', 'SAME DAY DISPATCH', '·', 'ALL-INDIA DELIVERY', '·', '50+ WASH GUARANTEE', '·', '4.9 ★ RATING', '·',
              '240 GSM COTTON', '·', 'DTG PRINT', '·', 'SAME DAY DISPATCH', '·', 'ALL-INDIA DELIVERY', '·', '50+ WASH GUARANTEE', '·', '4.9 ★ RATING', '·'].map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 3. PROMO CAROUSEL ════════════════════════════════════════════ */}
      <SR className="max-w-7xl mx-auto px-6 lg:px-12 space-y-5">
        <div className="flex items-center justify-between">
          <EyeBrow n="02" label="LATEST OFFERS & DROPS" />
          <Link to="/shop" className="underline-wipe font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-black flex items-center gap-1 transition-colors">
            All Products <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <PromoSlider customAds={ads.filter(a => a.active !== false && a.placement === 'homepage_hero')} />
      </SR>

      {/* ══ 5. CATEGORIES ════════════════════════════════════════════════ */}
      <SR className="max-w-7xl mx-auto px-6 lg:px-12 mt-20 space-y-6">
        <div className="flex items-center justify-between">
          <EyeBrow n="04" label="SHOP BY CATEGORY" />
          <Link to="/shop" className="underline-wipe font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-black flex items-center gap-1 transition-colors">
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          {categories.length === 0
            ? [1, 2, 3, 4].map(n => <div key={n} className="skeleton sr" style={{ aspectRatio: '3/4' }} />)
            : categories.map((cat, i) => {
                const catImg = cat.image || cat.banner || cat.imageUrl || cat.bannerUrl || cat.heroImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80';
                return (
                  <Link key={cat.id || cat.slug || i} to={`/shop?category=${cat.slug}`}
                    className="garment-card-gpu group relative border border-zinc-200 overflow-hidden block bg-black shadow-sm hover:shadow-xl"
                    style={{ aspectRatio: '3/4' }}>
                    <img src={catImg} alt={cat.name || 'Category'} loading="lazy"
                      className="garment-img-zoom w-full h-full object-cover opacity-90" />
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

      {/* ══ 7. BESTSELLERS & DRESSES ═════════════════════════════════════ */}
      <SR className="max-w-7xl mx-auto px-6 lg:px-12 mt-20 space-y-8">
        <div className="flex items-end justify-between border-b border-zinc-200 pb-5">
          <div>
            <EyeBrow n="05" label="BESTSELLERS &amp; TRENDING DRESSES" />
            <h2 className="font-display font-black text-black uppercase mt-2 text-2xl sm:text-4xl tracking-tight">
              TOP APPAREL DROPS
            </h2>
          </div>
          <Link to="/shop"
            className="underline-wipe font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-black flex items-center gap-1 transition-colors shrink-0">
            Explore All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => <div key={n} className="skeleton border border-zinc-200" style={{ aspectRatio: '3/4' }} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {bestsellers.map((p) => (
              <div key={p.id} className="w-full">
                <ProductCard product={p} onQuickView={setQv} />
              </div>
            ))}
          </div>
        )}
      </SR>

      {/* ══ 8. EDITORIAL BANNER ══════════════════════════════════════════ */}
      <SR className="max-w-7xl mx-auto px-6 lg:px-12 mt-20">
        <div className="grid lg:grid-cols-2 border border-zinc-200 shadow-sm">
          {/* Left: image */}
          <div className="img-zoom border-b lg:border-b-0 lg:border-r border-zinc-200 relative overflow-hidden bg-black" style={{ aspectRatio: '4/3', minHeight: 280 }}>
            <img
              src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=85"
              alt="Fleece hoodie collection"
              className="w-full h-full object-cover opacity-90"
              loading="lazy"
            />
          </div>
          {/* Right: copy */}
          <div className="bg-zinc-50 p-8 sm:p-14 flex flex-col justify-between space-y-6">
            <div>
              <span className="section-num text-zinc-500 font-bold">MATERIAL SPOTLIGHT</span>
              <h2 className="font-display font-black text-black uppercase mt-4 text-3xl sm:text-4xl tracking-tight leading-none">
                380 GSM<br />FLEECE<br />HOODIE.
              </h2>
              <p className="font-mono text-zinc-500 text-xs uppercase tracking-wide mt-5 leading-relaxed max-w-xs">
                Ultra-soft fleece lining. Kangaroo pocket. Ribbed cuffs. Built for cold-weather comfort — and turning heads.
              </p>
            </div>
            <div className="space-y-4">
              {['Available in S–XXL', '4 colourways', 'DTG & embroidery ready'].map(f => (
                <div key={f} className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-black shrink-0" />
                  <span className="text-zinc-700">{f}</span>
                </div>
              ))}
              <Link to="/shop?category=hoodies"
                className="btn-magnetic press inline-flex items-center gap-2 mt-4 px-8 py-3.5 bg-black text-white font-mono font-black text-xs uppercase tracking-widest shadow-md">
                SHOP HOODIES <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </SR>

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
