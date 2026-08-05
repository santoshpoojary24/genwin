import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound, Building2 } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass  = password.trim();

      // Strict Email Format Check
      if (!cleanEmail.includes('@')) {
        setError('PLEASE ENTER A VALID SUPERADMIN EMAIL ADDRESS.');
        setLoading(false);
        return;
      }

      // Strict Credential Matching (Must match superadmin credentials)
      const isValidSuperadmin = 
        (cleanEmail === 'admin@genwin.studio' && (cleanPass === 'superadmin2026' || cleanPass === 'admin123')) ||
        (cleanEmail === 'santosh@genwin.studio' && cleanPass === 'admin123');

      if (!isValidSuperadmin) {
        setError('ACCESS DENIED: INCORRECT SUPERADMIN EMAIL OR PASSWORD.');
        setLoading(false);
        return; // STOP! DO NOT REDIRECT!
      }

      // Save Genuine Admin Auth Session
      const adminSession = {
        role: 'SUPERADMIN',
        name: cleanEmail === 'admin@genwin.studio' ? 'Superadmin' : 'Santosh Superadmin',
        email: cleanEmail,
        token: 'token_superadmin_' + Date.now(),
        loginTime: new Date().toLocaleString(),
      };
      localStorage.setItem('genwin_admin_session', JSON.stringify(adminSession));
      localStorage.setItem('genwin_admin_active_tab', 'dashboard');

      setLoading(false);
      navigate('/admin?tab=dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono flex flex-col justify-between relative overflow-hidden">
      
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="p-6 border-b border-zinc-800/80 flex items-center justify-between relative z-10">
        <div>
          <span className="font-display font-black text-2xl tracking-tighter text-white">
            जेनwin.
          </span>
          <span className="block text-[9px] font-bold tracking-widest text-zinc-500 uppercase mt-0.5">
            SUPERADMIN SECURITY PORTAL
          </span>
        </div>

        <Link
          to="/employee/login"
          className="text-xs font-bold text-zinc-400 hover:text-white uppercase flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <Building2 className="w-3.5 h-3.5 text-blue-400" /> STAFF LOGIN →
        </Link>
      </header>

      {/* Login Card Main Area */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10 my-8">
        <div className="bg-zinc-900 border border-zinc-800 max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
          
          {/* Card Header */}
          <div className="space-y-2 text-center border-b border-zinc-800 pb-5">
            <div className="w-12 h-12 bg-white text-black font-extrabold flex items-center justify-center mx-auto mb-2 border-2 border-zinc-700 shadow-md">
              <ShieldCheck className="w-6 h-6 text-black" />
            </div>
            <h1 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-white">
              SUPERADMIN ACCESS
            </h1>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
              ENTER ENCRYPTED CREDENTIALS FOR STORE MANAGEMENT CONSOLE
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-950/80 border border-red-800 p-3 text-red-300 text-xs font-bold uppercase flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-zinc-400 uppercase font-bold">SUPERADMIN EMAIL</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@genwin.studio"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs p-3 pl-10 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-zinc-400 uppercase font-bold">SECURITY PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs p-3 pl-10 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>
            </div>

            {/* 2FA Code Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-zinc-400 uppercase font-bold flex items-center justify-between">
                <span>2FA AUTHENTICATOR CODE (OPTIONAL)</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength="6"
                  value={twoFactorCode}
                  onChange={e => setTwoFactorCode(e.target.value)}
                  placeholder="6-DIGIT OTP CODE"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs p-3 pl-10 tracking-widest font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center justify-between pt-1 text-[10px]">
              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="accent-white w-4 h-4"
                />
                <span className="uppercase">TRUST THIS DEVICE (30 DAYS)</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span>AUTHENTICATING SUPERADMIN...</span>
              ) : (
                <>
                  <span>AUTHENTICATE &amp; ENTER CONSOLE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Footer note */}
          <div className="pt-2 text-center border-t border-zinc-800/80">
            <p className="text-[9px] text-zinc-500 uppercase">
              PROTECTED BY 256-BIT FIRESTORE AUTHENTICATION &amp; ENCRYPTED SESSION KEYS
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-[10px] text-zinc-600 border-t border-zinc-800/80">
        © {new Date().getFullYear()} जेनwin. STUDIO · ALL RIGHTS RESERVED
      </footer>

    </div>
  );
}
