import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Eye, EyeOff, Lock, Mail, User, ArrowLeft, CheckCircle2, X, Shield, FileText, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPass,   setShowPass]   = useState(false);
  const [error,      setError]      = useState('');
  const [form,       setForm]       = useState({ name:'', email:'', phone:'', password:'' });

  // Forgot Password modal state
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent,  setResetSent]  = useState(false);

  // Policy Modal state
  const [policyTab, setPolicyTab]   = useState(null); // 'terms' | 'privacy' | 'refund'

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = isRegister
      ? await register(form.email, form.password, form.name, form.phone)
      : await login(form.email, form.password);
    if (res?.success) navigate('/account');
    else setError(res?.error || 'AUTHENTICATION FAILED — PLEASE TRY AGAIN.');
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const res = await loginWithGoogle();
    if (res?.success) navigate('/account');
    else setError(res?.error || 'GOOGLE AUTHENTICATION FAILED. PLEASE TRY AGAIN.');
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (resetEmail.trim()) {
      setResetSent(true);
      setTimeout(() => {
        setResetSent(false);
        setShowForgot(false);
        setResetEmail('');
      }, 2500);
    }
  };

  const field = 'w-full bg-white border border-zinc-200 text-sm px-4 py-3.5 pl-11 focus:outline-none focus:border-black transition-colors font-sans text-zinc-900 placeholder:text-zinc-400';

  return (
    <div className="min-h-screen bg-white flex page-enter font-mono selection:bg-black selection:text-white">

      {/* ── Left: Editorial panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] bg-black p-14 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize:'28px 28px' }} />

        <Link to="/" className="relative z-10 font-display font-black text-white text-2xl uppercase tracking-tighter">
          जेनwin.
        </Link>

        <div className="relative z-10 space-y-6">
          <p className="font-display font-black text-white uppercase leading-none"
            style={{ fontSize:'clamp(2rem,3.5vw,3rem)', letterSpacing:'-0.04em' }}>
            PREMIUM<br />APPAREL.<br /><span className="text-zinc-700">DELIVERED.</span>
          </p>
          <div className="space-y-3">
            {['Free shipping above ₹999','7-day hassle-free returns','Same-day dispatch before 2 PM','4.9 ★ verified customer rating'].map(f => (
              <div key={f} className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-zinc-500">
                <span className="w-1 h-1 bg-zinc-700 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[10px] text-zinc-700 uppercase tracking-widest border-t border-zinc-900 pt-4">
          <span>© {new Date().getFullYear()} GENWIN STUDIO</span>
          <div className="flex gap-3 text-zinc-500">
            <button onClick={() => setPolicyTab('terms')} className="hover:text-white transition-colors">TERMS</button>
            <span>·</span>
            <button onClick={() => setPolicyTab('privacy')} className="hover:text-white transition-colors">PRIVACY</button>
          </div>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12">
        
        {/* Top Back Link */}
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black transition-colors font-bold">
            <ArrowLeft className="w-3.5 h-3.5" /> BACK TO STORE
          </Link>
          <span className="text-[10px] text-zinc-400 uppercase font-bold">SECURE AUTHENTICATION</span>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-sm mx-auto space-y-6 my-auto py-8">

          {/* Logo (mobile only) */}
          <div className="lg:hidden">
            <p className="font-display font-black text-black text-2xl uppercase tracking-tighter">जेनwin.</p>
          </div>

          <div>
            <h1 className="font-display font-black text-black text-3xl uppercase tracking-tighter">
              {isRegister ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </h1>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">
              {isRegister ? 'Join for exclusive access & order tracking' : 'Welcome back to Genwin Studio'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 bg-zinc-50 border border-zinc-300 hover:border-black text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-colors press disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>{loading ? 'CONNECTING TO GOOGLE...' : 'CONTINUE WITH GOOGLE'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-200 w-full" />
            <span className="bg-white px-3 text-[9px] text-zinc-400 font-bold uppercase tracking-widest shrink-0 absolute">
              OR EMAIL SIGN IN
            </span>
          </div>

          {/* Tab toggle */}
          <div className="flex border border-zinc-200">
            {[['SIGN IN', false],['REGISTER', true]].map(([label, val]) => (
              <button key={label} onClick={() => { setIsRegister(val); setError(''); }}
                className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-all ${
                  isRegister === val ? 'bg-black text-white' : 'text-zinc-400 hover:text-black'
                }`}>{label}</button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 border border-zinc-900 bg-zinc-950 text-white p-3 text-[10px] uppercase tracking-wide animate-shake">
              <span>⚠</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Full Name" value={form.name}
                  onChange={set('name')} required={isRegister} className={field} />
              </div>
            )}
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="email" placeholder="Email Address" value={form.email}
                onChange={set('email')} required className={field} />
            </div>
            {isRegister && (
              <div className="relative">
                <span className="text-[10px] font-bold text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2">+91</span>
                <input type="tel" placeholder="Phone Number" value={form.phone}
                  onChange={set('phone')} className={`${field} pl-12`} />
              </div>
            )}
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type={showPass ? 'text' : 'password'} placeholder="Password"
                value={form.password} onChange={set('password')} required className={field} />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {!isRegister && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-[10px] text-zinc-400 hover:text-black uppercase tracking-widest underline underline-offset-2 transition-colors font-bold"
                >
                  FORGOT PASSWORD?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-magnetic press w-full py-4 bg-black text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : isRegister
                  ? <><UserPlus className="w-4 h-4" /> CREATE ACCOUNT</>
                  : <><LogIn className="w-4 h-4" /> SIGN IN</>
              }
            </button>
          </form>

          {/* Footer Terms & Policy Links */}
          <div className="text-center pt-2 text-[10px] text-zinc-400 uppercase leading-relaxed font-mono">
            By logging in, you accept our{' '}
            <button
              type="button"
              onClick={() => setPolicyTab('terms')}
              className="text-black font-bold underline cursor-pointer hover:text-zinc-600"
            >
              Terms of Service
            </button>{' '}
            &amp;{' '}
            <button
              type="button"
              onClick={() => setPolicyTab('privacy')}
              className="text-black font-bold underline cursor-pointer hover:text-zinc-600"
            >
              Privacy Policy
            </button>.
          </div>

        </div>

        {/* Clean Footer */}
        <div className="text-center text-[10px] text-zinc-400 uppercase tracking-widest border-t border-zinc-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} GENWIN STUDIO</span>
          <div className="flex gap-4">
            <button onClick={() => setPolicyTab('terms')} className="hover:text-black transition-colors font-bold">TERMS OF SERVICE</button>
            <button onClick={() => setPolicyTab('privacy')} className="hover:text-black transition-colors font-bold">PRIVACY POLICY</button>
            <button onClick={() => setPolicyTab('refund')} className="hover:text-black transition-colors font-bold">REFUND POLICY</button>
          </div>
        </div>

      </div>

      {/* ── Genuine Forgot Password Modal ─────────────────────────────── */}
      {showForgot && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" onClick={() => setShowForgot(false)}>
          <div className="bg-white border border-zinc-200 max-w-sm w-full p-6 space-y-4 text-black font-mono shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-display font-black text-base uppercase tracking-tight">RESET PASSWORD</h3>
              <button onClick={() => setShowForgot(false)} className="p-1 text-zinc-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSent ? (
              <div className="space-y-3 text-center py-4">
                <CheckCircle2 className="w-10 h-10 text-black mx-auto" />
                <h4 className="font-bold text-xs uppercase">RESET LINK SENT!</h4>
                <p className="text-[10px] text-zinc-500 uppercase leading-relaxed">
                  We've sent a password reset link to <strong>{resetEmail}</strong>. Please check your inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <p className="text-[10px] text-zinc-500 uppercase leading-relaxed">
                  Enter your registered email address and we'll send you instructions to reset your password.
                </p>
                <input
                  type="email"
                  required
                  placeholder="YOUR EMAIL..."
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 text-xs p-3 font-mono uppercase focus:outline-none focus:border-black"
                />
                <button type="submit" className="w-full py-3 bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-zinc-800">
                  SEND RESET LINK
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Interactive Terms & Policy Modal ────────────────────────────── */}
      {policyTab && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={() => setPolicyTab(null)}>
          <div className="bg-white border border-zinc-200 max-w-2xl w-full p-6 space-y-5 text-black font-mono shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header & Navigation Filter */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-black" />
                <h3 className="font-display font-black text-lg uppercase tracking-tight">STORE POLICIES &amp; LEGAL</h3>
              </div>
              <button onClick={() => setPolicyTab(null)} className="p-1 text-zinc-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Policy Tabs */}
            <div className="flex border border-zinc-200 text-xs font-bold uppercase">
              <button
                onClick={() => setPolicyTab('terms')}
                className={`flex-1 py-2.5 transition-colors ${policyTab === 'terms' ? 'bg-black text-white' : 'text-zinc-500 hover:text-black'}`}
              >
                TERMS OF SERVICE
              </button>
              <button
                onClick={() => setPolicyTab('privacy')}
                className={`flex-1 py-2.5 transition-colors border-x border-zinc-200 ${policyTab === 'privacy' ? 'bg-black text-white' : 'text-zinc-500 hover:text-black'}`}
              >
                PRIVACY POLICY
              </button>
              <button
                onClick={() => setPolicyTab('refund')}
                className={`flex-1 py-2.5 transition-colors ${policyTab === 'refund' ? 'bg-black text-white' : 'text-zinc-500 hover:text-black'}`}
              >
                REFUND &amp; RETURNS
              </button>
            </div>

            {/* Tab 1: Terms of Service */}
            {policyTab === 'terms' && (
              <div className="space-y-4 text-xs leading-relaxed text-zinc-700 animate-fade-in">
                <h4 className="font-bold text-black text-sm uppercase">1. TERMS OF USE</h4>
                <p>
                  By accessing or purchasing from जेनwin. Studio, you agree to be bound by these Terms of Service. All designs, graphics, and apparel products are protected by Indian trademark and copyright laws.
                </p>

                <h4 className="font-bold text-black text-sm uppercase">2. DTG PRINT CUSTOMIZATION</h4>
                <p>
                  Custom Direct-to-Garment (DTG) prints created in our customization studio must not contain copyrighted trademarks or offensive material. Custom orders are printed specifically for you upon order placement.
                </p>

                <h4 className="font-bold text-black text-sm uppercase">3. PRICING &amp; TAXES</h4>
                <p>
                  All prices listed include applicable Goods &amp; Services Tax (GST 18%). Prices are subject to revision without prior notice for special promotional sales drops.
                </p>
              </div>
            )}

            {/* Tab 2: Privacy Policy */}
            {policyTab === 'privacy' && (
              <div className="space-y-4 text-xs leading-relaxed text-zinc-700 animate-fade-in">
                <h4 className="font-bold text-black text-sm uppercase">1. DATA PROTECTION</h4>
                <p>
                  We store customer credentials, delivery addresses, and order records securely using 256-bit encrypted Firestore databases. Your payment details (UPI, Debit/Credit Card) are processed directly by certified payment gateways.
                </p>

                <h4 className="font-bold text-black text-sm uppercase">2. INFORMATION USAGE</h4>
                <p>
                  We collect your phone number and email address exclusively for dispatch SMS tracking updates and essential account authentication. We never sell or share your personal data with third-party advertisers.
                </p>
              </div>
            )}

            {/* Tab 3: Refund & Returns Policy */}
            {policyTab === 'refund' && (
              <div className="space-y-4 text-xs leading-relaxed text-zinc-700 animate-fade-in">
                <h4 className="font-bold text-black text-sm uppercase">1. 7-DAY REPLACEMENT GUARANTEE</h4>
                <p>
                  If you receive a defective item or wrong garment size, you may request a hassle-free replacement within 7 days of delivery through our Customer Support portal.
                </p>

                <h4 className="font-bold text-black text-sm uppercase">2. REFUND PROCESSING</h4>
                <p>
                  Approved refunds are credited back to your original payment method (UPI account or Debit/Credit card) within 3-5 business days following garment inspection at our warehouse.
                </p>
              </div>
            )}

            <button
              onClick={() => setPolicyTab(null)}
              className="w-full py-3 bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors mt-2"
            >
              CLOSE POLICIES
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
