import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Eye, EyeOff, Lock, Mail, User, ArrowLeft, CheckCircle2, X, Shield, FileText, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { loginWithGoogle, loginWithPhone, loading } = useAuth();
  const navigate = useNavigate();
  const [error,      setError]      = useState('');
  const [phone,      setPhone]      = useState('');
  const [showOtp,    setShowOtp]    = useState(false);
  const [otpCode,    setOtpCode]    = useState('');
  const [otpSending, setOtpSending] = useState(false);

  // Policy Modal state
  const [policyTab, setPolicyTab]   = useState(null); // 'terms' | 'privacy' | 'refund'

  const handleGoogleSignIn = async () => {
    setError('');
    const res = await loginWithGoogle();
    if (res?.success) navigate('/account');
    else setError(res?.error || 'GOOGLE AUTHENTICATION FAILED. PLEASE TRY AGAIN.');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setError('PLEASE ENTER A VALID 10-DIGIT MOBILE NUMBER.');
      return;
    }
    setOtpSending(true);
    // Simulate SMS OTP dispatch
    setTimeout(() => {
      setOtpSending(false);
      setShowOtp(true);
    }, 800);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otpCode.length < 4) {
      setError('PLEASE ENTER THE VERIFICATION OTP.');
      return;
    }
    const res = await loginWithPhone(phone);
    if (res?.success) navigate('/account');
    else setError(res?.error || 'PHONE AUTHENTICATION FAILED.');
  };

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
          <span>© {new Date().getFullYear()} जेनwin.</span>
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
            <p className="font-display font-black text-black text-3xl tracking-tighter">जेनwin.</p>
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-black text-black text-3xl sm:text-4xl uppercase tracking-tighter">
              SIGN IN
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest leading-relaxed">
              Sign in using Mobile OTP or Google 1-Tap Auth.
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className="flex items-start gap-2 border border-black bg-black text-white p-4 text-xs uppercase tracking-wide rounded-xl animate-shake font-mono">
              <span className="text-amber-400">⚠</span> {error}
            </div>
          )}

          {/* Google One-Tap Primary Action Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || otpSending}
            className="w-full py-3.5 bg-black text-white hover:bg-zinc-800 font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all rounded-xl shadow-lg press disabled:opacity-50 disabled:cursor-not-allowed border border-black"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>CONTINUE WITH GOOGLE</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="border-t border-zinc-200 w-full" />
            <span className="bg-white px-3 text-[10px] text-zinc-400 font-bold uppercase tracking-widest shrink-0 absolute">
              OR PHONE NUMBER
            </span>
          </div>

          {/* Mobile Phone Number Auth Form */}
          {!showOtp ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="relative">
                <span className="text-xs font-bold text-black absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  placeholder="Enter Mobile Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-zinc-50 border border-zinc-200 text-sm py-3.5 pl-20 pr-4 focus:outline-none focus:border-black transition-colors font-mono rounded-xl font-bold placeholder:font-normal placeholder:text-zinc-400"
                />
              </div>

              <button
                type="submit"
                disabled={otpSending || phone.length < 10}
                className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-widest transition-all rounded-xl press disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                {otpSending ? 'SENDING OTP...' : 'GET OTP / SIGN IN'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
              <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
                <span>📱 +91 {phone}</span>
                <button
                  type="button"
                  onClick={() => setShowOtp(false)}
                  className="text-[10px] font-bold text-black uppercase underline"
                >
                  CHANGE
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  ENTER 4-DIGIT VERIFICATION CODE
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  placeholder="• • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-white border border-zinc-300 text-center text-lg tracking-[0.4em] py-3 focus:outline-none focus:border-black font-mono font-bold rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-widest transition-all rounded-xl press disabled:opacity-40 shadow-md"
              >
                {loading ? 'VERIFYING...' : 'VERIFY &amp; SIGN IN'}
              </button>
            </form>
          )}

          {/* Footer Terms & Policy Links */}
          <div className="text-center pt-4 text-[10px] text-zinc-400 uppercase leading-relaxed font-mono border-t border-zinc-100">
            By continuing, you agree to जेनwin.'s{' '}
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
          <span>© {new Date().getFullYear()} जेनwin.</span>
          <div className="flex gap-4">
            <button onClick={() => setPolicyTab('terms')} className="hover:text-black transition-colors font-bold">TERMS OF SERVICE</button>
            <button onClick={() => setPolicyTab('privacy')} className="hover:text-black transition-colors font-bold">PRIVACY POLICY</button>
            <button onClick={() => setPolicyTab('refund')} className="hover:text-black transition-colors font-bold">REFUND POLICY</button>
          </div>
        </div>

      </div>



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
                  By accessing or purchasing from जेनwin., you agree to be bound by these Terms of Service. All designs, graphics, and apparel products are protected by Indian trademark and copyright laws.
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
