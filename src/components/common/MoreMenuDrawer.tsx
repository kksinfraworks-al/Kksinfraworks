import React from 'react';
import {
  IndianRupee,
  CalendarClock,
  Images,
  Receipt,
  FileSpreadsheet,
  Building2,
  History,
  Settings,
  CreditCard,
  Database,
  X,
  ChevronRight,
} from 'lucide-react';

interface MoreMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  activeTab: string;
}

export const MoreMenuDrawer: React.FC<MoreMenuDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  activeTab,
}) => {
  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'ledger',
      label: 'Complete Worker Ledger (हिसाब-किताब)',
      sub: 'Chronological earnings, hourly wages, food allowances, advances & balance',
      icon: FileSpreadsheet,
      color: 'text-amber-400 bg-amber-500/10',
    },
    {
      id: 'food_allowance',
      label: 'Food Allowance Register (खोराकी)',
      sub: 'Track daily food allowances earned (Credit) vs paid/advance (Debit)',
      icon: IndianRupee,
      color: 'text-purple-400 bg-purple-500/10',
    },
    {
      id: 'salary',
      label: 'Worker Salaries & Accounts',
      sub: 'Wage calculations, OT multiplier, advances adjustment & ledger',
      icon: CreditCard,
      color: 'text-amber-400 bg-amber-500/10',
    },
    {
      id: 'advances',
      label: 'Advance Payments',
      sub: 'Worker advance register, adjustments & remaining balances',
      icon: IndianRupee,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      id: 'planning',
      label: "Tomorrow's Work Plan",
      sub: 'Next-day activity scheduling, materials, team & priorities',
      icon: CalendarClock,
      color: 'text-amber-400 bg-amber-500/10',
    },
    {
      id: 'gallery',
      label: 'Site Photo & Video Gallery',
      sub: 'Browse work report visual media, photos & site video clips',
      icon: Images,
      color: 'text-sky-400 bg-sky-500/10',
    },
    {
      id: 'expenses',
      label: 'Site Expenses',
      sub: 'Materials, fuel, hardware, transport & daily site expenses',
      icon: Receipt,
      color: 'text-purple-400 bg-purple-500/10',
    },
    {
      id: 'backup',
      label: 'Backup & Restore Data',
      sub: '1-Click JSON export, restore from backup & IndexedDB storage info',
      icon: Database,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      id: 'reports',
      label: 'Reports & Exports',
      sub: 'Export attendance, wage sheets & progress to PDF / Excel / CSV',
      icon: FileSpreadsheet,
      color: 'text-rose-400 bg-rose-500/10',
    },
    {
      id: 'sites',
      label: 'Construction Sites Register',
      sub: 'Active projects, site addresses, supervisors & work categories',
      icon: Building2,
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      id: 'audit',
      label: 'Audit History',
      sub: 'Chronological activity log: who changed what & when',
      icon: History,
      color: 'text-teal-400 bg-teal-500/10',
    },
    {
      id: 'settings',
      label: 'Settings & Security PIN',
      sub: 'Change PIN, auto-lock timer, proprietor details & firm info',
      icon: Settings,
      color: 'text-slate-400 bg-slate-800',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-lg mx-auto bg-slate-900 border-t border-slate-700 rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div>
            <h2 className="text-base font-bold text-white">More Modules</h2>
            <p className="text-xs text-slate-400">KKSInfraWorks Construction Management</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu list */}
        <div className="p-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition text-left ${
                  isSelected
                    ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-tight">{item.label}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
          KKSInfraWorks • Bargawn Road, Mairwa, Bihar – 841239
        </div>
      </div>
    </div>
  );
};
