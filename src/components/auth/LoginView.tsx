import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  HardHat,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [resetUserId, setResetUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setError('Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(usernameOrEmail.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (username: string, pass: string) => {
    setUsernameOrEmail(username);
    setPassword(pass);
    setLoading(true);
    setError(null);
    try {
      await login(username, pass);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError(null);
    setForgotMessage(null);

    try {
      if (forgotStep === 'request') {
        const res = await api.forgotPassword(forgotInput.trim());
        setResetUserId(res.userId);
        setForgotStep('reset');
        setForgotMessage(res.message);
      } else {
        const res = await api.resetPassword(resetUserId, newPassword);
        setForgotMessage(res.message);
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStep('request');
          setPassword(newPassword);
        }, 1500);
      }
    } catch (err: any) {
      setForgotError(err.message || 'Operation failed');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-slate-950 shadow-xl shadow-amber-500/20 mb-3 border border-amber-400/40">
            <HardHat className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            KKS<span className="text-amber-500">Infra</span>Works
          </h1>
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mt-0.5">
            Civil & Shuttering Contractor Supplier
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <Building2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Prop. Kalindra Kumar Singh • Estd. 2002</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Bargawn Road, Mairwa, Bihar – 841239</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">Authorized Login</h2>
              <p className="text-xs text-slate-400">Secure site management access</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified RBAC
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="e.g. kalindra or manager@kksinfraworks.com"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Log In to Construction Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick-switch buttons for testing both authorized users */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Authorized Profile to Test Sync:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('kalindra', 'KKS@Admin2002')}
                className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-amber-500/30 text-left transition hover:border-amber-500/60 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white group-hover:text-amber-400">
                    Kalindra K. Singh
                  </span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-semibold">
                    Proprietor
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Full Admin & Financial Control</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('sitemanager', 'KKS@Site2026')}
                className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-sky-500/30 text-left transition hover:border-sky-500/60 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white group-hover:text-sky-400">
                    Ramesh Sharma
                  </span>
                  <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-semibold">
                    Site Manager
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Daily Site Reports & Attendance</p>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2.5">
              Both users synchronize to the shared online database across phones in real time.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Reset Authorized Password</h3>
            <p className="text-xs text-slate-400 mb-4">
              Authorized users: Kalindra Kumar Singh or Ramesh Sharma.
            </p>

            {forgotError && (
              <div className="mb-3 p-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
                {forgotError}
              </div>
            )}
            {forgotMessage && (
              <div className="mb-3 p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{forgotMessage}</span>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-3">
              {forgotStep === 'request' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Enter your Username or Email
                  </label>
                  <input
                    type="text"
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    placeholder="e.g. kalindra or manager@kksinfraworks.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-amber-500"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Enter New Secure Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-amber-500"
                    required
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition disabled:opacity-50"
                >
                  {forgotLoading
                    ? 'Processing...'
                    : forgotStep === 'request'
                    ? 'Verify User'
                    : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
