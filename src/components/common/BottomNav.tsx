import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  ClipboardList,
  Menu,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMoreMenu: () => void;
  isMoreOpen: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenMoreMenu,
  isMoreOpen,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workers', label: 'Workers', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck2 },
    { id: 'site_work', label: 'Site Work', icon: ClipboardList },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400 py-1.5 px-2 safe-area-pb shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && !isMoreOpen;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-amber-400 bg-amber-500/10 font-bold'
                  : 'hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] mt-0.5 tracking-tight line-clamp-1">{tab.label}</span>
            </button>
          );
        })}

        {/* More Tab */}
        <button
          onClick={onOpenMoreMenu}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            isMoreOpen ||
            ['advances', 'planning', 'gallery', 'expenses', 'reports', 'sites', 'audit', 'settings'].includes(
              activeTab
            )
              ? 'text-amber-400 bg-amber-500/10 font-bold'
              : 'hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Menu className={`w-5 h-5 ${isMoreOpen ? 'rotate-90' : ''} transition-transform`} />
          <span className="text-[10px] mt-0.5 tracking-tight">More</span>
        </button>
      </div>
    </nav>
  );
};
