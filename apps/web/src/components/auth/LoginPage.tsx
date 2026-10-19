import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, User as AuthUser } from '../../contexts/AuthContext';
import { ROLES, RoleId } from '../../config/rbac';
import { Eye, EyeOff, Lock, AlertCircle, Key, Check, Users, Search, X } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithCredentials, users } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Demo accounts helper modal/drawer
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoSearch, setDemoSearch] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Role lookup map
  const roleMap = React.useMemo(() => {
    const map = new Map<RoleId, string>();
    ROLES.forEach(r => map.set(r.id, r.label));
    return map;
  }, []);

  const filteredDemoUsers = React.useMemo(() => {
    const q = demoSearch.toLowerCase().trim();
    if (!q) return users;
    return users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      (roleMap.get(u.role) || '').toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q)
    );
  }, [users, demoSearch, roleMap]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = loginWithCredentials(emailOrId, password);
    setIsSubmitting(false);

    if (result.success) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Invalid credentials.');
    }
  };

  const handleAutofill = (u: AuthUser) => {
    setEmailOrId(u.email);
    setPassword(u.password || 'apar123');
    setError(null);
    setShowDemoModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col items-center justify-center p-4 font-sans select-none">
      {/* ── Main Login Card ── */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg border border-slate-200/80 p-8 sm:p-10 transition-all">
        {/* APAR Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            {/* 4-Diamond APAR Grid Logo */}
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <rect x="14" y="3" width="7" height="7" rx="1" transform="rotate(45 14 3)" fill="#f59e0b" />
              <rect x="23" y="12" width="7" height="7" rx="1" transform="rotate(45 23 12)" fill="#ea580c" />
              <rect x="5" y="12" width="7" height="7" rx="1" transform="rotate(45 5 12)" fill="#f97316" />
              <rect x="14" y="21" width="7" height="7" rx="1" transform="rotate(45 14 21)" fill="#ef4444" />
            </svg>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
              APAR
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium tracking-tight mt-1">
            Tomorrow's solutions today
          </p>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-6">
            Welcome to APAR
          </h1>
          <p className="text-sm text-slate-500 mt-1 mb-8">
            Enter your credentials to access the portal
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Authentication Failed</p>
              <p className="text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Email
            </label>
            <input
              type="text"
              autoFocus
              value={emailOrId}
              onChange={e => {
                setEmailOrId(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter your email"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#f38b18]/25 focus:border-[#f38b18] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#f38b18]/25 focus:border-[#f38b18] transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-2.5 px-4 bg-[#f38b18] hover:bg-[#e07a0e] active:bg-[#c96c09] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors duration-150 flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs font-medium text-slate-700 hover:text-[#f38b18] hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>

      {/* ── Demo Credentials Quick Access Bar ── */}
      <div className="mt-6 flex flex-col items-center">
        <button
          type="button"
          onClick={() => setShowDemoModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-slate-700 hover:text-[#f38b18] text-xs font-semibold rounded-full border border-slate-300/80 shadow-xs transition-all hover:shadow-sm cursor-pointer"
        >
          <Key size={14} className="text-[#f38b18]" />
          <span>Click to view Demo Accounts & Passwords ({users.length} Users)</span>
        </button>
        <p className="text-[11px] text-slate-400 mt-2">
          Universal fallback password: <code className="bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-700 font-mono">apar123</code>
        </p>
      </div>

      {/* ── Demo Credentials Modal ── */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-[#f38b18] rounded-xl">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">Demo Accounts & Credentials</h3>
                  <p className="text-xs text-slate-500">Pick any role to auto-fill credentials into the login form</p>
                </div>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search filter */}
            <div className="p-3 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={demoSearch}
                  onChange={e => setDemoSearch(e.target.value)}
                  placeholder="Search by name, role, email, or department..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#f38b18]"
                />
              </div>
            </div>

            {/* Users list */}
            <div className="overflow-y-auto divide-y divide-slate-100 p-2 flex-1">
              {filteredDemoUsers.map(u => {
                const roleLabel = roleMap.get(u.role) || u.role;
                return (
                  <div
                    key={u.id}
                    className="p-3 hover:bg-amber-50/50 rounded-xl transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#f38b18] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 truncate">{u.name}</p>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {roleLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          ID: <span className="font-mono text-slate-700">{u.id}</span> · Email: <span className="font-mono text-slate-700">{u.email}</span>
                        </p>
                        <p className="text-[11px] text-amber-800 font-medium">
                          Password: <code className="bg-amber-100/70 px-1 rounded font-mono text-[10px]">{u.password || 'apar123'}</code>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAutofill(u)}
                      className="px-3 py-1.5 text-xs font-bold text-[#f38b18] hover:text-white hover:bg-[#f38b18] border border-[#f38b18]/40 hover:border-[#f38b18] rounded-lg transition-all shrink-0 cursor-pointer"
                    >
                      Auto-fill
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Forgot Password Modal ── */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-[#f38b18] rounded-xl">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Forgot Password?</h3>
                <p className="text-xs text-slate-500">Portal Credentials Assistance</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-2">
              <p>For development and testing, all accounts can log in using either:</p>
              <ul className="list-disc pl-4 space-y-1 font-mono text-[11px] text-slate-700">
                <li>Their personal password (e.g. <span className="font-bold">admin</span>, <span className="font-bold">priya123</span>)</li>
                <li>The universal fallback password: <span className="font-bold text-[#f38b18]">apar123</span></li>
              </ul>
              <p className="text-slate-500 text-[11px]">
                In production, password reset instructions are dispatched via APAR corporate directory.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 bg-[#f38b18] hover:bg-[#de7a0e] text-white text-xs font-semibold rounded-lg"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
