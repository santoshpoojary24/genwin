import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginModal() {
  const { isLoginOpen, setIsLoginOpen, loginWithGoogle, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.pathname === '/login') {
      setIsLoginOpen(true);
    }
  }, [location.pathname, setIsLoginOpen]);

  if (!isLoginOpen) return null;

  const handleClose = () => {
    setIsLoginOpen(false);
    setError('');
    if (location.pathname === '/login') {
      navigate('/', { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const res = await loginWithGoogle();
    if (res?.success) handleClose();
    else setError(res?.error || 'GOOGLE AUTHENTICATION FAILED.');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setError('PLEASE ENTER A VALID 10-DIGIT MOBILE NUMBER.');
      return;
    }
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setShowOtp(true);
    setOtpNotice(`📩 OTP SENT TO +91 ${cleanDigits.slice(-10)} — CODE: ${code}`);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otpCode.trim() !== generatedOtp) {
      setError(`INCORRECT OTP. ENTER EXACT CODE (${generatedOtp}).`);
      return;
    }
    const res = await loginWithPhone(phone);
    if (res?.success) handleClose();
    else setError(res?.error || 'PHONE AUTHENTICATION FAILED.');
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-mono" onClick={handleClose}>
      <div className="relative bg-white border border-zinc-200 max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 text-black" onClick={e => e.stopPropagation()}>
        
        {/* Close Button Top Right */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 shadow-md border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Poster Side (Matching Reference Image) */}
        <div className="relative bg-black text-white p-8 flex flex-col justify-between overflow-hidden min-h-[260px] md:min-h-[420px]">
          <img
            src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80"
            alt="Promo Poster"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Top Logo */}
          <div className="relative z-10">
            <span className="font-display font-black text-white text-xl tracking-tighter uppercase">
              जेनwin.
            </span>
          </div>

          {/* Center Discount Offer Headline */}
          <div className="relative z-10 space-y-2 my-auto pt-8">
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tighter leading-none text-white drop-shadow-lg">
              WANT 10% OFF?
            </h2>
            <p className="text-xs text-zinc-200 uppercase tracking-widest font-mono drop-shadow-md max-w-xs">
              Sign up to unlock your exclusive discount code.
            </p>
          </div>
        </div>

        {/* Right Form Side (Matching Reference Image) */}
        <div className="p-6 sm:p-8 flex flex-col justify-between bg-white space-y-5">
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-black">
                SIGN IN / REGISTER
              </h3>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Access your account &amp; track orders
              </p>
            </div>

            {error && (
              <div className="bg-black text-white text-[10px] p-2.5 rounded-xl font-mono uppercase border border-black animate-shake">
                ⚠ {error}
              </div>
            )}

            {/* Google 1-Tap Primary Action Button */}
            <div className="space-y-4 pt-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-4 bg-black text-white hover:bg-zinc-800 font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all rounded-xl shadow-xl press disabled:opacity-50 border border-black"
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
                <span>{loading ? 'CONNECTING...' : 'CONTINUE WITH GOOGLE'}</span>
              </button>

              <div className="flex items-center gap-2 justify-center text-[10px] text-zinc-400 font-bold uppercase tracking-wider pt-1">
                <Shield className="w-3.5 h-3.5 text-zinc-500" />
                <span>100% SECURE &amp; ENCRYPTED</span>
              </div>
            </div>
          </div>

          {/* Legal Footer Links (Matching Reference Image) */}
          <div className="text-[9px] text-zinc-400 font-mono leading-relaxed border-t border-zinc-100 pt-3">
            By logging in, you're agreeing to our{' '}
            <a href="/support" target="_blank" rel="noreferrer" className="text-zinc-700 underline font-bold">Privacy Policy</a>{' '}
            &amp;{' '}
            <a href="/support" target="_blank" rel="noreferrer" className="text-zinc-700 underline font-bold">Terms of Service</a>.
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
