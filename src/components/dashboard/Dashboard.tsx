import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  UserCheck,
  UserX,
  Building2,
  CheckCircle2,
  Clock,
  IndianRupee,
  CalendarClock,
  Camera,
  FileSpreadsheet,
  PlusCircle,
  ClipboardPen,
  CalendarCheck2,
  ChevronRight,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Play,
  Layers,
  Share2,
  CreditCard,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string, extra?: any) => void;
  onOpenQuickAction: (action: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenQuickAction }) => {
  const { user, isAdmin } = useAuth();
  const { metrics, siteReports, nextDayPlans, media, sites } = useData();

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const todayStr = now.toISOString().split('T')[0];
  const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().split('T')[0];

  const todayReports = siteReports.filter((r) => r.reportDate === todayStr);
  const tomorrowPlans = nextDayPlans.filter((p) => p.planDate === tomorrowStr || p.planDate === todayStr);
  const recentMedia = media.slice(0, 6);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                100% Offline Mode (IndexedDB)
              </span>
              <span className="text-xs text-slate-400">{formattedDate}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Namaste, <span className="text-amber-400">{user?.name}</span>
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Role: <strong className="text-white">{isAdmin ? 'Proprietor & Admin' : 'Site Manager'}</strong> •
              Firm: KKSInfraWorks (Mairwa, Bihar)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('attendance')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Mark Attendance</span>
            </button>
            <button
              onClick={() => onNavigate('site_work')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-bold text-xs transition"
            >
              <ClipboardPen className="w-4 h-4" />
              <span>Site Work</span>
            </button>
            <button
              onClick={() => onNavigate('ledger')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 font-semibold text-xs transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Complete Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Quick Actions • त्वरित कार्य
          </h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          <button
            onClick={() => onOpenQuickAction('add_worker')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition text-center group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200 line-clamp-1">Add Worker</span>
            <span className="text-[9px] text-slate-500">नया मजदूर</span>
          </button>

          <button
            onClick={() => onNavigate('attendance')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition text-center group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200 line-clamp-1">Attendance</span>
            <span className="text-[9px] text-slate-500">हाजिरी</span>
          </button>

          <button
            onClick={() => onOpenQuickAction('add_advance')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 transition text-center group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <IndianRupee className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200 line-clamp-1">Add Advance</span>
            <span className="text-[9px] text-slate-500">पेसगी दर्ज</span>
          </button>

          <button
            onClick={() => onNavigate('site_work')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/80 transition text-center group"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <ClipboardPen className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200 line-clamp-1">Site Work</span>
            <span className="text-[9px] text-slate-500">साइट रिपोर्ट</span>
          </button>

          <button
            onClick={() => onOpenQuickAction('upload_media')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800/80 transition text-center group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200 line-clamp-1">Photo/Video</span>
            <span className="text-[9px] text-slate-500">कैमरा / फोटो</span>
          </button>

          <button
            onClick={() => onNavigate('planning')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition text-center group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <CalendarClock className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200 line-clamp-1">Plan Tomorrow</span>
            <span className="text-[9px] text-slate-500">कल की योजना</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 transition text-center group col-span-2 sm:col-span-1"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200 line-clamp-1">View Reports</span>
            <span className="text-[9px] text-slate-500">पीडीएफ / एक्सेल</span>
          </button>
        </div>
      </section>

      {/* Main KPI Stats Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Workers Present */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl hover:border-emerald-500/40 transition cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Present Today</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {metrics?.workersPresentToday ?? 0}
            </span>
            <span className="text-xs text-slate-400">/ {metrics?.totalWorkers ?? 0} total</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-rose-400 font-medium">{metrics?.workersAbsentToday ?? 0} Absent</span> •
            <span className="text-amber-400 font-medium">{metrics?.workersOnLeaveToday ?? 0} Leave</span>
          </p>
        </div>

        {/* Active Sites */}
        <div
          onClick={() => onNavigate('sites')}
          className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl hover:border-blue-500/40 transition cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active Sites</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {metrics?.activeSitesCount ?? sites.length}
            </span>
            <span className="text-xs text-slate-400">projects</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Mairwa, Siwan, Gopalganj</p>
        </div>

        {/* Advances Outstanding */}
        <div
          onClick={() => onNavigate('advances')}
          className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl hover:border-purple-500/40 transition cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Outstanding Advances</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">
              ₹{(metrics?.totalOutstandingAdvance ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Total Given: ₹{(metrics?.totalAdvancesGiven ?? 0).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Tomorrow's Planned Tasks */}
        <div
          onClick={() => onNavigate('planning')}
          className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl hover:border-amber-500/40 transition cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Tomorrow's Plan</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {metrics?.tomorrowPlannedTasksCount ?? 0}
            </span>
            <span className="text-xs text-slate-400">activities</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {metrics?.pendingWorkCount ?? 0} pending overall
          </p>
        </div>
      </section>

      {/* Dual Section: Today's Site Work Reports & Tomorrow's Work Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Completed Work & In-Progress */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Today's Site Work Reports</h3>
            </div>
            <button
              onClick={() => onNavigate('site_work')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayReports.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <ClipboardPen className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              <p>No site work reported yet for today ({todayStr}).</p>
              <button
                onClick={() => onNavigate('site_work')}
                className="mt-2 text-amber-400 font-semibold hover:underline"
              >
                + Create Daily Work Report
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => onNavigate('site_work')}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        {report.workCategory}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1 leading-snug">
                        {report.siteName}
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{report.workLocation}</span>
                      </p>
                    </div>
                    {report.quantityCompleted > 0 && (
                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-emerald-400">
                          {report.quantityCompleted} {report.unit}
                        </span>
                        <p className="text-[10px] text-slate-400">Done</p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    "{report.descriptionHindiEnglish}"
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Supervisor: {report.supervisorName}</span>
                    <span>{report.workersCount} Workers Involved</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tomorrow's Planned Work */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Tomorrow's Work Plan • कल का कार्य</h3>
            </div>
            <button
              onClick={() => onNavigate('planning')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5"
            >
              <span>Manage Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {tomorrowPlans.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <CalendarClock className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
              <p>No work plan created for tomorrow ({tomorrowStr}) yet.</p>
              <button
                onClick={() => onNavigate('planning')}
                className="mt-2 text-amber-400 font-semibold hover:underline"
              >
                + Plan Tomorrow's Tasks Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tomorrowPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => onNavigate('planning')}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-white leading-tight">
                      {plan.siteName}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        plan.priority === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {plan.priority} Priority
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-medium">
                    {plan.expectedWork}
                  </p>

                  <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
                    <p>• Location: {plan.workLocation}</p>
                    <p>• Team: {plan.assignedTeam || `${plan.expectedWorkersCount} Workers`}</p>
                    {plan.materialsRequired && (
                      <p className="text-amber-300/90">• Materials: {plan.materialsRequired}</p>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-700/50">
                    <span>Target: {plan.planDate}</span>
                    <span className="capitalize text-amber-400 font-semibold">{plan.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Uploaded Site Photos and Videos */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Recent Site Media • साइट फोटो/वीडियो</h3>
          </div>
          <button
            onClick={() => onNavigate('gallery')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5"
          >
            <span>Open Gallery</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentMedia.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            <Camera className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p>No site media uploaded yet. Use quick upload to capture site progress.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {recentMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('gallery')}
                className="group relative aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-700/80 cursor-pointer shadow-sm hover:border-amber-500/50 transition"
              >
                {item.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950">
                    <video src={item.url} className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="w-8 h-8 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-2 text-left">
                  <p className="text-[10px] font-semibold text-white line-clamp-1">{item.caption}</p>
                  <p className="text-[9px] text-slate-400 line-clamp-1">{item.siteName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
