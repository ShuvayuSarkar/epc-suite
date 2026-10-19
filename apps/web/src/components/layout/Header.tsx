import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, User as UserIcon, Lock, LogOut, X, CheckCircle, ShieldCheck } from 'lucide-react';
import NotificationBell from '../ui/NotificationBell';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../config/rbac';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const { user, logout, changePassword } = useAuth();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Change password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentRoleConfig = ROLES.find(r => r.id === user?.role);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!newPassword || newPassword.length < 3) {
      setPasswordError('Password must be at least 3 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    if (user) {
      changePassword(user.id, newPassword);
      setPasswordSuccess(true);
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AP';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
      {/* ── Breadcrumb ── */}
      <div className="flex-1 flex items-center">
        <nav className="text-sm font-medium text-slate-500 hidden md:block">
          <ol className="flex items-center space-x-2">
            <li>EPC Suite</li>
            {pathnames.map((value, index) => {
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;
              const isLast = index === pathnames.length - 1;
              const formattedValue = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

              return (
                <React.Fragment key={to}>
                  <li>/</li>
                  <li className={isLast ? 'text-slate-900 font-semibold' : ''}>
                    {formattedValue}
                  </li>
                </React.Fragment>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* ── Search Bar ── */}
      <div className="flex-1 flex justify-center px-4">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search projects, documents, transmittals, P.O.s..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#f38b18] focus:border-[#f38b18] sm:text-sm transition duration-150 ease-in-out"
          />
        </div>
      </div>

      {/* ── Actions & User Profile Menu ── */}
      <div className="flex-1 flex items-center justify-end space-x-4">
        <NotificationBell />

        {/* ── User Profile Menu (Matched to Screenshot) ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left focus:outline-none"
            aria-expanded={profileDropdownOpen}
          >
            {/* Circular orange initials badge */}
            <div className="h-10 w-10 rounded-full bg-[#f38b18] flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
              {initials}
            </div>

            {/* User Name & Role text */}
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-bold text-slate-900 leading-tight">
                {user?.name || 'APAR User'}
              </span>
              <span className="text-xs text-slate-500 font-normal leading-tight">
                {currentRoleConfig?.label || user?.department || 'User'}
              </span>
            </div>

            {/* Chevron toggle icon */}
            <div className="text-slate-600 pl-1">
              {profileDropdownOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {/* Profile Dropdown Panel */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn">
              {/* View Profile */}
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  setShowProfileModal(true);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="font-medium">View Profile</span>
              </button>

              {/* Change Password */}
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  setShowPasswordModal(true);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="font-medium">Change Password</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-500 shrink-0" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── View Profile Modal ── */}
      {showProfileModal && user && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">User Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[#f38b18] flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                {initials}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{user.name}</h4>
                <p className="text-xs text-slate-500">{user.email}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  {currentRoleConfig?.label || user.role}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-xs text-slate-600 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">User ID</span>
                <span className="font-mono font-semibold text-slate-800">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Department</span>
                <span className="font-semibold text-slate-800">{user.department || 'Operations'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Role System Key</span>
                <span className="font-mono text-slate-700">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Session Status</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {showPasswordModal && user && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#f38b18]" />
                <h3 className="font-bold text-slate-800 text-sm">Change Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {passwordSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Password Updated Successfully!</p>
                <p className="text-xs text-slate-500">Your new credentials are saved.</p>
              </div>
            ) : (
              <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
                {passwordError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 font-medium">
                    {passwordError}
                  </p>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#f38b18]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#f38b18]"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#f38b18] hover:bg-[#de7a0e] text-white text-xs font-semibold rounded-lg shadow-xs"
                  >
                    Save Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
