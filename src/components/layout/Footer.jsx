import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, RefreshCw, Shield, Mail, CheckCircle2, Instagram, Twitter, X, HelpCircle, Phone, MapPin } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activePolicyKey, setActivePolicyKey] = useState(null);

  const handleOpenPolicy = (key) => {
    setActivePolicyKey(key);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(''); }
  };

  const POLICY_DOCS = {
    shipping: {
      title: 'SHIPPING & DISPATCH POLICY',
      body: `Orders placed before 2:00 PM IST are dispatched on the same business day from our facility. All-India express shipping takes 2 to 5 business days depending on delivery pincode. Shipping is completely FREE on orders above ₹${settings.freeShippingThreshold || 999}.`
    },
    size: {
      title: 'SIZE & FIT GUIDE',
      body: `Our garments feature a classic relaxed streetwear fit crafted from 240 GSM heavyweight combed cotton. If you prefer a standard fit, order your normal size. For a heavy drop-shoulder oversized look, we recommend sizing up.`
    },
    privacy: {
      title: 'PRIVACY POLICY',
      body: `We respect your privacy. Your contact details, shipping address, and payment information are encrypted and strictly used for order fulfillment and delivery tracking. We never sell or share customer data.`
    },
    terms: {
      title: 'TERMS OF SERVICE',
      body: `By placing an order on ${settings.storeName || 'जेनwin.clothing'}, you agree to our transparent store policies. Custom DTG print graphics are created according to your canvas input. Exchange is available within 7 days of delivery.`
    },
    refund: {
      title: '7-DAY REPLACEMENT & REFUND POLICY',
      body: `We offer a 7-day hassle-free replacement for size changes or transit damages. To initiate a return or exchange, navigate to your Account page or contact ${settings.supportEmail} with your GW- order number.`
    },
    contact: {
      title: 'CONTACT SUPPORT',
      body: `Email: ${settings.supportEmail}\nPhone / WhatsApp: ${settings.supportPhone}\nLocation: ${settings.address}\nOperating Hours: Monday – Saturday, 10:00 AM – 7:00 PM IST`
    }
  };

  return (
    <footer className="bg-black text-zinc-400 border-t border-zinc-900 font-mono">

      {/* USP Row */}
      <div className="border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Truck,      title: 'FREE SHIPPING',    body: `All-India express on orders above ₹${settings.freeShippingThreshold || 999}` },
            { icon: RefreshCw,  title: '7-DAY RETURNS',    body: 'Hassle-free size exchange & replacement' },
            { icon: Shield,     title: 'SECURE PAYMENTS',  body: 'UPI, Cards, & Cash on Delivery accepted' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white text-black flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">{title}</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1 space-y-4">
          <Link to="/" className="font-display font-black text-2xl tracking-tighter text-white block">
            {settings.storeName || 'जेनwin.clothing'}
          </Link>
          <p className="text-[11px] text-zinc-500 leading-relaxed uppercase max-w-xs">
            {settings.tagline || 'Premium heavyweight apparel — built for those who wear their identity with confidence.'}
          </p>

          {/* Dynamic Contact Badges */}
          <div className="space-y-1.5 text-[10px] text-zinc-400 uppercase pt-2 border-t border-zinc-900">
            {settings.supportEmail && (
              <p className="flex items-center gap-2 truncate">
                <Mail className="w-3 h-3 text-white shrink-0" />
                <span className="truncate">{settings.supportEmail}</span>
              </p>
            )}
            {settings.supportPhone && (
              <p className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-white shrink-0" />
                <span>{settings.supportPhone}</span>
              </p>
            )}
            {settings.address && (
              <p className="flex items-start gap-2 text-zinc-500 leading-tight">
                <MapPin className="w-3 h-3 text-white shrink-0 mt-0.5" />
                <span className="line-clamp-2">{settings.address}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <a href={`https://instagram.com/${String(settings?.instagram || '').replace('@','')}`} target="_blank" rel="noreferrer" className="p-2 border border-zinc-800 text-zinc-500 hover:text-white hover:border-white transition-all">
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a href={`https://wa.me/${String(settings?.whatsapp || '').replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer" className="p-2 border border-zinc-800 text-zinc-500 hover:text-white hover:border-white transition-all">
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-5">CATALOG</h5>
          <ul className="space-y-3 text-xs text-zinc-500 uppercase">
            {[
              ['/shop', 'All Products'],
              ['/shop?category=t-shirts', 'T-Shirts & Oversized'],
              ['/shop?category=hoodies', 'Hoodies & Sweatshirts'],
              ['/shop?category=jackets', 'Jackets & Outerwear'],
              ['/shop?category=accessories', 'Caps & Accessories'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-5">HELP &amp; POLICIES</h5>
          <ul className="space-y-3 text-xs text-zinc-500 uppercase">
            <li><Link to="/account" className="hover:text-white transition-colors">Track My Order</Link></li>
            <li><Link to="/account" className="hover:text-white transition-colors">My Account</Link></li>
            <li><button onClick={() => handleOpenPolicy('shipping')} className="hover:text-white transition-colors text-left">Shipping Policy</button></li>
            <li><button onClick={() => handleOpenPolicy('size')} className="hover:text-white transition-colors text-left">Size Guide</button></li>
            <li><button onClick={() => handleOpenPolicy('refund')} className="hover:text-white transition-colors text-left">Refund &amp; Returns</button></li>
            <li><button onClick={() => handleOpenPolicy('contact')} className="hover:text-white transition-colors text-left">Contact Us</button></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-3">STAY UPDATED</h5>
          <p className="text-[11px] text-zinc-500 mb-4 leading-relaxed">
            NEW DROPS, EXCLUSIVE OFFERS &amp; SALE ALERTS STRAIGHT TO YOUR INBOX.
          </p>
          {subscribed ? (
            <div className="flex items-center gap-2 text-white text-xs font-bold uppercase">
              <CheckCircle2 className="w-4 h-4" /> SUBSCRIBED — THANK YOU!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="YOUR EMAIL..."
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white py-2.5 pl-3 pr-10 focus:outline-none focus:border-white uppercase placeholder:text-zinc-700"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-zinc-700 uppercase">NO SPAM. UNSUBSCRIBE ANYTIME.</p>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-600 uppercase">
          <p>© {new Date().getFullYear()} {settings.storeName || 'जेनwin.clothing'}. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-5">
            <button onClick={() => handleOpenPolicy('privacy')} className="hover:text-zinc-400 transition-colors">PRIVACY POLICY</button>
            <button onClick={() => handleOpenPolicy('terms')} className="hover:text-zinc-400 transition-colors">TERMS OF SERVICE</button>
            <button onClick={() => handleOpenPolicy('refund')} className="hover:text-zinc-400 transition-colors">REFUND POLICY</button>
          </div>
        </div>
      </div>

      {/* ── Policy Dialog Modal ────────────────────────────────────────── */}
      {activePolicyKey && POLICY_DOCS[activePolicyKey] && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setActivePolicyKey(null)}>
          <div className="bg-zinc-900 border border-zinc-800 max-w-md w-full p-6 space-y-4 text-white" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-white" />
                <h3 className="font-display font-black text-sm uppercase tracking-tight">{POLICY_DOCS[activePolicyKey].title}</h3>
              </div>
              <button onClick={() => setActivePolicyKey(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line uppercase">
              {POLICY_DOCS[activePolicyKey].body}
            </p>
            <button onClick={() => setActivePolicyKey(null)} className="w-full py-2.5 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200">
              CLOSE
            </button>
          </div>
        </div>
      )}

    </footer>
  );
}
