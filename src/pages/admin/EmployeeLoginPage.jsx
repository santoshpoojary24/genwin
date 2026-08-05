import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserCheck, Lock, Mail, ArrowRight, AlertCircle, Building2, ShieldCheck, BadgeCheck } from 'lucide-react';

export default function EmployeeLoginPage() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState('EMP-4092');
  const [email, setEmail] = useState('staff@genwin.studio');
  const [password, setPassword] = useState('staffpass2026');
  const [department, setDepartment] = useState('fulfillment');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmployeeLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (!employeeId || !email) {
        setError('EMPLOYEE ID AND STAFF EMAIL ARE REQUIRED.');
        setLoading(false);
        return;
      }
      if (password.length < 4) {
        setError('PASSWORD MUST BE AT LEAST 4 CHARACTERS.');
        setLoading(false);
        return;
      }

      // Save Employee Auth Session
      const staffSession = {
        role: 'EMPLOYEE',
        name: email.split('@')[0].toUpperCase() + ' (STAFF)',
        email: email,
        employeeId: employeeId,
        department: department,
        loginTime: new Date().toLocaleString(),
      };
      localStorage.setItem('genwin_employee_session', JSON.stringify(staffSession));

      // Redirect staff directly to Employee Workspace (/employee)
      const targetTab = department === 'inventory' ? 'inventory' : 'orders';

      setLoading(false);
      navigate(`/employee?tab=${targetTab}`);
    }, 600);
  };

  const handleQuickDemoStaff = () => {
    setEmployeeId('EMP-4092');
    setEmail('staff@genwin.studio');
    setPassword('staffpass2026');
    setDepartment('fulfillment');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="p-6 border-b border-zinc-800/80 flex items-center justify-between relative z-10">
        <div>
          <span className="font-display font-black text-2xl tracking-tighter text-white">
            जेनwin.
          </span>
          <span className="block text-[9px] font-bold tracking-widest text-zinc-500 uppercase mt-0.5">
            STAFF &amp; EMPLOYEE CONSOLE
          </span>
        </div>

        <Link
          to="/admin/login"
          className="text-xs font-bold text-zinc-400 hover:text-white uppercase flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> SUPERADMIN LOGIN →
        </Link>
      </header>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10 my-8">
        <div className="bg-zinc-900 border border-zinc-800 max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
          
          {/* Card Header */}
          <div className="space-y-2 text-center border-b border-zinc-800 pb-5">
            <div className="w-12 h-12 bg-white text-black font-extrabold flex items-center justify-center mx-auto mb-2 border-2 border-zinc-700 shadow-md">
              <UserCheck className="w-6 h-6 text-black" />
            </div>
            <h1 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-white">
              EMPLOYEE PORTAL
            </h1>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
              STAFF LOGISTICS, INVENTORY &amp; ORDER PROCESSING
            </p>
          </div>

          {/* Quick Demo Staff Badge */}
          <div className="bg-zinc-950 p-3 border border-zinc-800 flex items-center justify-between text-xs">
            <div>
              <span className="block text-[9px] text-zinc-500 uppercase font-bold">1-TAP DEMO STAFF:</span>
              <span className="font-bold text-blue-400 text-[10px]">staff@genwin.studio (EMP-4092)</span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoStaff}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[9px] uppercase tracking-wider transition-colors"
            >
              AUTO-FILL
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-950/80 border border-red-800 p-3 text-red-300 text-xs font-bold uppercase flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmployeeLogin} className="space-y-4 text-xs">
            
            {/* Employee ID */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-zinc-400 uppercase font-bold">STAFF / EMPLOYEE BADGE ID</label>
              <div className="relative">
                <BadgeCheck className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value.toUpperCase())}
                  placeholder="EMP-XXXX"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs p-3 pl-10 focus:outline-none focus:border-zinc-500 uppercase font-mono"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-zinc-400 uppercase font-bold">STAFF EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="staff@genwin.studio"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs p-3 pl-10 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-zinc-400 uppercase font-bold">DEPARTMENT WORKSPACE</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs p-3 focus:outline-none focus:border-zinc-500 uppercase font-mono"
              >
                <option value="fulfillment">FULFILLMENT &amp; ORDERS</option>
                <option value="inventory">INVENTORY &amp; CATALOG</option>
                <option value="support">CUSTOMER SUPPORT</option>
              </select>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-zinc-400 uppercase font-bold">STAFF ACCESS PASSWORD</label>
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span>VERIFYING STAFF CREDENTIALS...</span>
              ) : (
                <>
                  <span>ENTER EMPLOYEE WORKSPACE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Footer note */}
          <div className="pt-2 text-center border-t border-zinc-800/80">
            <p className="text-[9px] text-zinc-500 uppercase">
              EMPLOYEE ACCESS IS MONITORED &amp; LOGGED IN STORE MANAGEMENT TRAIL
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-[10px] text-zinc-600 border-t border-zinc-800/80">
        © 2026 जेनwin. STUDIO · ALL RIGHTS RESERVED
      </footer>

    </div>
  );
}
