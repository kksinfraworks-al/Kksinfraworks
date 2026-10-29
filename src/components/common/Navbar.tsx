import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PWAInstallButton } from './PWAInstallButton';
import { RefreshCw, Wifi, WifiOff, LogOut, HardHat, ShieldCheck, UserCheck, Share2, Lock } from 'lucide-react';
import { usePinLock } from '../../context/PinLockContext';

export const Navbar: React.FC<{
  onOpenTab?: (tab: string) => void;
  onOpenWhatsApp?: () => void;
}> = ({ onOpenTab, onOpenWhatsApp }) => {
  const { user, logout, isAdmin, switchRole } = useAuth();
  const { lockApp } = usePinLock();
  const { isOnline, isSyncing, lastSyncTime, triggerSync } = useData();

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Brand identity */}
        <div
          onClick={() => onOpenTab && onOpenTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <HardHat className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                KKS<span className="text-amber-500">Infra</span>Works
              </span>
              <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                ESTD 2002
              </span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-1">
              Civil & Shuttering • Prop. Kalindra Kumar Singh
            </p>
          </div>
        </div>

        {/* Right side controls: Sync status, PWA install, user profile, logout */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton compact />

          {/* Sync status & Manual trigger */}
          <button
            onClick={() => triggerSync()}
            disabled={isSyncing || !isOnline}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] border transition ${
              isSyncing
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title={`Last synchronized: ${formatLastSync(lastSyncTime)}. Click to sync across phones.`}
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Network indicator */}
          <div
            className="flex items-center gap-1 px-1.5 py-1 rounded-lg text-[11px] bg-slate-800/80 border border-slate-700"
            title={isOnline ? 'Online - Live cloud connection active' : 'Offline - Using cached local data'}
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>

          {/* WhatsApp Report Button */}
          {onOpenWhatsApp && (
            <button
              onClick={onOpenWhatsApp}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition active:scale-95"
              title="Generate and Share WhatsApp Daily Site Report"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          )}

          {/* Worker Portal Switch */}
          <button
            onClick={() => switchRole('worker', { id: 'KKS001', name: 'Ramesh Kumar Sah' })}
            className="px-2 py-1 rounded-lg text-[11px] font-bold bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition flex items-center gap-1"
            title="Switch to Worker Portal (Ramesh Kumar Sah - KKS001)"
          >
            <UserCheck className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline">Worker Portal</span>
          </button>

          {/* User profile badge */}
          {user && (
            <div
              onClick={() => onOpenTab && onOpenTab('settings')}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer hover:border-slate-600 transition"
              title={`Active as ${user.name} (${user.role})`}
            >
              <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-amber-400">
                {isAdmin ? <ShieldCheck className="w-3 h-3 text-amber-400" /> : <UserCheck className="w-3 h-3 text-sky-400" />}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-[11px] font-semibold text-white leading-tight">{user.name.split(' ')[0]}</p>
                <p className="text-[9px] text-amber-400 leading-tight">
                  {isAdmin ? 'Proprietor' : 'Site Manager'}
                </p>
              </div>
            </div>
          )}

          {/* Lock App button */}
          <button
            onClick={() => lockApp()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
            title="Lock App (PIN Screen)"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
