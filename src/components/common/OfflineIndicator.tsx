import React from 'react';
import { useData } from '../../context/DataContext';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useData();

  if (isOnline) return null;

  return (
    <div className="fixed top-14 left-3 right-3 sm:left-auto sm:right-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white shadow-xl border border-amber-400/40 animate-pulse">
      <WifiOff className="w-4 h-4 shrink-0 text-amber-100" />
      <span>Offline Mode — Cached data active. Changes will sync when reconnected.</span>
    </div>
  );
};
