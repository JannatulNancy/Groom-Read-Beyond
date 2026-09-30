import React, { useState } from 'react';
import { loginAdmin } from '../services/auth';
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToStore }) => {
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = loginAdmin(identifier, password, rememberMe);
      setLoading(false);

      if (res.success) {
        onSuccess();
      } else {
        setError(res.message);
      }
    }, 200);
  };

  const handleApplyPreset = (user: string, pass: string) => {
    setIdentifier(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Whimsical background glows matching Doraemon & Fest branding */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top back button */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between z-10">
        <button
          type="button"
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-xs font-semibold text-sky-200 hover:text-white transition-colors cursor-pointer bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customer Storefront</span>
        </button>

        <span className="text-[11px] font-mono text-sky-300 font-bold bg-sky-950/80 px-2.5 py-1 rounded-full border border-sky-700/60">
          Stall #09 (ISU Lawn)
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-7 sm:p-9 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-400 to-amber-300 text-white shadow-lg shadow-sky-500/20 mb-1 border-2 border-white">
            <span className="text-2xl font-black">🔔</span>
          </div>

          <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
            Admin Portal Login
          </h1>

          <div className="flex items-center justify-center gap-1.5 text-xs text-sky-700 font-semibold">
            <span>Groom, Read & Beyond</span>
            <span>•</span>
            <span className="text-rose-600 font-bold">BizVenture 2026</span>
          </div>

          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Authorized access only for book catalog management, orders database, and live landing page CMS.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Email Field */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-700 block flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-600" />
                <span>Admin Username or Email</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Username: admin</span>
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. admin or jnnancy345@gmail.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-hidden transition-all"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-700 block flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                <span>Password</span>
              </span>
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="text-[10px] text-sky-600 hover:text-sky-800 font-semibold cursor-pointer underline flex items-center gap-0.5"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Default credentials</span>
              </button>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password..."
                className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-hidden transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Credential Helpers */}
          {showHints && (
            <div className="p-3 bg-sky-50/80 rounded-xl border border-sky-200 text-xs space-y-2 animate-in fade-in duration-150">
              <div className="font-bold text-sky-900 flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Stall #09 Team Quick Logins:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('admin', 'bizventure2026')}
                  className="p-1.5 bg-white hover:bg-sky-100 rounded-lg border border-sky-200 text-left font-mono cursor-pointer transition-colors text-slate-700"
                >
                  <div className="font-bold text-sky-700">admin</div>
                  <div className="text-[10px] text-slate-500">bizventure2026</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('jnnancy345@gmail.com', 'admin')}
                  className="p-1.5 bg-white hover:bg-sky-100 rounded-lg border border-sky-200 text-left font-mono cursor-pointer transition-colors text-slate-700 truncate"
                >
                  <div className="font-bold text-sky-700 truncate">jnnancy345@...</div>
                  <div className="text-[10px] text-slate-500">admin</div>
                </button>
              </div>
            </div>
          )}

          {/* Remember me checkbox */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
              />
              <span>Remember login on this browser</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 active:from-sky-700 active:to-blue-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-sky-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign In to Admin Panel</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit Session Encrypted</span>
          </div>
          <span className="font-mono">ISU Dept of BBA</span>
        </div>
      </div>

      {/* Direct URL instruction for user */}
      <div className="mt-4 text-center text-xs text-sky-300/70 max-w-sm z-10">
        Direct URL: <code className="bg-sky-950/80 px-2 py-0.5 rounded text-sky-200 font-mono">/admin</code> or{' '}
        <code className="bg-sky-950/80 px-2 py-0.5 rounded text-sky-200 font-mono">#admin</code>
      </div>
    </div>
  );
};
