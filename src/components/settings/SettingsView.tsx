import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePinLock } from '../../context/PinLockContext';
import { useData } from '../../context/DataContext';
import { PWAInstallButton } from '../common/PWAInstallButton';
import {
  Settings,
  Building2,
  Lock,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Phone,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Clock,
  HardDrive,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, isAdmin, switchRole } = useAuth();
  const { settings, updateSettings, changePin, lockApp } = usePinLock();
  const { resetDemoData } = useData();

  // Change PIN state
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // WhatsApp Phone state
  const [phoneInput, setPhoneInput] = useState(settings.proprietorPhone || '919835000000');
  const [phoneSaved, setPhoneSaved] = useState(false);

  // Reset Data state
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccess(false);

    const res = await changePin(oldPin, newPin);
    if (res.success) {
      setPinSuccess(true);
      setOldPin('');
      setNewPin('');
      setTimeout(() => setPinSuccess(false), 3000);
    } else {
      setPinError(res.error || 'Failed to update PIN');
    }
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({ proprietorPhone: phoneInput.trim() });
    setPhoneSaved(true);
    setTimeout(() => setPhoneSaved(false), 3000);
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        'Reset local construction data to default benchmark records? All records will be refreshed.'
      )
    ) {
      setIsResetting(true);
      try {
        await resetDemoData();
        setResetMessage('Sample data successfully refreshed.');
        setTimeout(() => setResetMessage(null), 3500);
      } catch (err: any) {
        alert(err.message || 'Reset failed');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-3 sm:px-4 pt-3">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-500" />
          <h1 className="text-lg font-bold text-white">System Settings & Security • सेटिंग्स</h1>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Local PIN lock, WhatsApp recipient, user role switching, and firm details
        </p>
      </div>

      {/* Firm Profile Card */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <Building2 className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-bold text-white">KKSInfraWorks Firm Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Company Name:</span>
            <p className="text-sm font-bold text-white mt-0.5">KKSInfraWorks</p>
            <p className="text-[11px] text-amber-400 font-medium">Civil Construction & Shuttering Supplier</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Proprietor:</span>
            <p className="text-sm font-bold text-white mt-0.5">Kalindra Kumar Singh</p>
            <p className="text-[11px] text-slate-400">Proprietorship Firm • Established 2002</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 sm:col-span-2">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Registered Address:</span>
            <p className="text-xs font-semibold text-slate-200 mt-0.5">
              Bargawn Road, Mairwa, Bihar – 841239
            </p>
          </div>
        </div>
      </section>

      {/* Active User Role Switcher */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <UserCheck className="w-5 h-5 text-sky-400" />
          <div>
            <h2 className="text-sm font-bold text-white">Active User Profile</h2>
            <p className="text-[11px] text-slate-400">
              Switch role between Proprietor and Site Manager for testing or daily usage
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => switchRole('admin')}
            className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
              isAdmin
                ? 'bg-amber-500/10 border-amber-500/60 shadow-lg'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                isAdmin ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              KS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">Kalindra Kumar Singh</span>
                {isAdmin && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-400 font-medium">Proprietor / Admin</p>
              <p className="text-[10px] text-slate-400 mt-1">Full authority: salary, workers, all sites</p>
            </div>
          </button>

          <button
            onClick={() => switchRole('manager')}
            className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
              !isAdmin
                ? 'bg-sky-500/10 border-sky-500/60 shadow-lg'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                !isAdmin ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              SM
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">Authorized Site Manager</span>
                {!isAdmin && (
                  <span className="text-[9px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded font-bold">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-sky-400 font-medium">Site Supervisor</p>
              <p className="text-[10px] text-slate-400 mt-1">Daily attendance, advances & site reports</p>
            </div>
          </button>
        </div>
      </section>

      {/* Security & PIN Lock Settings */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white">App Security & PIN Lock</h2>
              <p className="text-[11px] text-slate-400">
                Prevent unauthorized access to construction records on this device
              </p>
            </div>
          </div>
          <button
            onClick={lockApp}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Now</span>
          </button>
        </div>

        {/* PIN Config Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Toggle PIN lock & Auto lock timer */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Enable Local PIN Lock</p>
                <p className="text-[10px] text-slate-400">Prompts for PIN when opening app</p>
              </div>
              <input
                type="checkbox"
                checked={settings.pinLockEnabled}
                onChange={(e) => updateSettings({ pinLockEnabled: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Auto-lock after Inactivity
              </label>
              <select
                value={settings.autoLockMinutes}
                onChange={(e) => updateSettings({ autoLockMinutes: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value={0}>Disabled (Never auto-lock)</option>
                <option value={2}>2 Minutes</option>
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes (Recommended)</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>
          </div>

          {/* Change PIN Form */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              Change Security PIN
            </h3>

            {pinSuccess && (
              <p className="text-[11px] text-emerald-400 font-medium mb-2">
                ✓ Security PIN updated successfully!
              </p>
            )}
            {pinError && (
              <p className="text-[11px] text-rose-400 font-medium mb-2">{pinError}</p>
            )}

            <form onSubmit={handleChangePinSubmit} className="space-y-2.5">
              <div>
                <label className="block text-[10px] text-slate-400">Current PIN (Default: 2002)</label>
                <input
                  type="password"
                  maxLength={6}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="Enter current PIN"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400">New PIN (4 to 6 Digits)</label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition active:scale-95"
              >
                Update PIN
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* WhatsApp Configuration */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <Phone className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-white">WhatsApp Daily Report Recipient</h2>
            <p className="text-[11px] text-slate-400">
              Mobile number where 1-tap WhatsApp site reports will be directed
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePhone} className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="e.g. 919835000000 or 9835000000"
            className="w-full sm:w-80 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            required
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition active:scale-95"
          >
            Save Recipient Number
          </button>
          {phoneSaved && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved!
            </span>
          )}
        </form>
      </section>

      {/* Android Mobile PWA Setup Guide */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">
            Mobile App Installation Guide (Android / PWA)
          </h2>
        </div>

        <p className="text-xs text-slate-300">
          KKSInfraWorks is built as an offline-first Progressive Web App (PWA). Follow these steps to install directly onto your home screen:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold text-xs">Step 1: Open on Phone</span>
            <p className="text-slate-400 text-[11px]">
              Open this web address in <strong>Google Chrome</strong> on Android.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold text-xs">Step 2: Tap Install</span>
            <p className="text-slate-400 text-[11px]">
              Tap the <strong>"Install App"</strong> button below, or Chrome menu (⋮) → <strong>Install app</strong>.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold text-xs">Step 3: Work Offline</span>
            <p className="text-slate-400 text-[11px]">
              Launch from your home screen. App will open even in airplane mode with zero internet!
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">Install to home screen:</span>
          <PWAInstallButton />
        </div>
      </section>

      {/* Reset Demo Data */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Reset Benchmark Sample Data</h3>
            <p className="text-xs text-slate-400">
              Reload initial Mairwa, Siwan, and Gopalganj construction records
            </p>
          </div>
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-rose-400 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database</span>
          </button>
        </div>

        {resetMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{resetMessage}</span>
          </div>
        )}
      </section>
    </div>
  );
};
