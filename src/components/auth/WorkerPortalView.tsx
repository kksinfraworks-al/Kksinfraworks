import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { WorkerProfileModal } from '../workers/WorkerProfileModal';
import {
  HardHat,
  ShieldCheck,
  UserCheck,
  LogOut,
  Phone,
  Building2,
  FileText,
  Clock,
  Briefcase,
  IndianRupee,
  Utensils,
  ArrowDownLeft,
  CreditCard,
  FileSpreadsheet,
  Share2,
  Search,
} from 'lucide-react';

export const WorkerPortalView: React.FC = () => {
  const { user, switchRole, logout } = useAuth();
  const { workers, getWorkerStatementWithRange } = useData();

  // Find worker record matching logged-in worker user
  const loggedInWorker = workers.find(
    (w) => w.id === user?.workerId || w.mobile === user?.mobile || w.id.toLowerCase() === user?.username?.toLowerCase()
  ) || workers[0];

  const [dateRange, setDateRange] = useState<string>('this_month');
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'sitework' | 'ledger'>(
    'overview'
  );

  const statement = getWorkerStatementWithRange(loggedInWorker?.id || 'KKS001', dateRange);
  const closingBal = statement?.closingBalance || 0;
  const isPayable = closingBal >= 0;

  const handleShareWhatsApp = () => {
    if (!loggedInWorker || !statement) return;
    const text = `*KKSInfraWorks - My Account Statement / मेरा हिसाब*\n` +
      `Worker: ${loggedInWorker.name} (${loggedInWorker.id})\n` +
      `Period: ${statement.period}\n` +
      `Present Days: ${statement.presentDays} | Hours Worked: ${statement.totalHoursWorked || 0} hrs\n` +
      `Total Wages Earned: ₹${statement.totalEarnings}\n` +
      `Food Allowance: ₹${statement.foodAllowanceEarned}\n` +
      `Total Advances: ₹${statement.totalAdvancesTaken}\n` +
      `Payments Received: ₹${statement.totalPaymentsMade}\n` +
      `*NET BALANCE: ₹${Math.abs(closingBal)}* (${isPayable ? 'Payable to Me' : 'Advance Taken'})\n\n` +
      `_KKSInfraWorks • Bargawn Road, Mairwa, Bihar_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      {/* Top Banner indicating Worker Portal Mode */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center">
            <HardHat className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm sm:text-base">KKSInfraWorks</span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                Worker Portal (मजदूर पोर्टल)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Welcome, <strong className="text-white">{loggedInWorker.name}</strong> ({loggedInWorker.id})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => switchRole('admin')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Switch back to Admin view"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin Mode</span>
          </button>
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-3 sm:p-5 space-y-5">
        {/* Profile Card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-500/50 shrink-0 shadow-lg">
              {loggedInWorker.photo ? (
                <img src={loggedInWorker.photo} alt={loggedInWorker.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-400 font-black text-xl">
                  {loggedInWorker.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                  {loggedInWorker.id}
                </span>
                <span className="text-xs text-slate-400">
                  Rate: <strong className="text-white">₹{loggedInWorker.rate}</strong>/day (₹{Math.round(loggedInWorker.rate / 8)}/hr)
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">{loggedInWorker.name}</h2>
              <p className="text-xs text-slate-400">
                {loggedInWorker.workCategory} • {loggedInWorker.assignedSiteName}
              </p>
            </div>
          </div>

          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Share My Statement</span>
          </button>
        </div>

        {/* Balance Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/80 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              My Current Payable Balance / मेरा बकाया हिसाब ({statement?.period})
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-white">
                ₹{Math.abs(closingBal).toLocaleString('en-IN')}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  isPayable
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {isPayable ? 'Payable to Me (देना बाकी)' : 'Advance Given (एडवांस बाकी)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              All records updated by KKSInfraWorks (Prop. Kalindra Kumar Singh)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
            >
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="prev_month">Previous Month</option>
              <option value="all_time">All Time</option>
            </select>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Present Days</span>
            <p className="text-xl font-black text-white mt-0.5">{statement?.presentDays || 0} days</p>
            <span className="text-[10px] text-slate-500">Half Days: {statement?.halfDays || 0}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Hours Worked</span>
            <p className="text-xl font-black text-amber-400 mt-0.5">{statement?.totalHoursWorked || 0} hrs</p>
            <span className="text-[10px] text-slate-500">OT: {statement?.overtimeHours || 0} hrs</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Wages Earned</span>
            <p className="text-xl font-black text-emerald-400 mt-0.5">₹{(statement?.totalEarnings || 0).toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-purple-400">Food: +₹{statement?.foodAllowanceEarned || 0}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Advances Taken</span>
            <p className="text-xl font-black text-rose-400 mt-0.5">₹{(statement?.totalAdvancesTaken || 0).toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-sky-400">Paid: ₹{statement?.totalPaymentsMade || 0}</span>
          </div>
        </div>

        {/* Sub navigation */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Details', icon: FileText },
            { id: 'ledger', label: 'My Complete Ledger (हिसाब)', icon: FileSpreadsheet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview Details */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
              <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>Personal & Work Profile</span>
              </h3>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Father's Name:</span>
                <span className="text-white font-medium">{loggedInWorker.fatherName || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Registered Mobile:</span>
                <span className="text-white font-medium">{loggedInWorker.mobile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Skill Level & Category:</span>
                <span className="text-amber-300 font-semibold">{loggedInWorker.workCategory} ({loggedInWorker.skillLevel})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Assigned Construction Site:</span>
                <span className="text-white font-medium">{loggedInWorker.assignedSiteName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Village / Address:</span>
                <span className="text-white font-medium">{loggedInWorker.fullAddress || loggedInWorker.village}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Bank Account Details:</span>
                <span className="text-white font-medium">
                  {loggedInWorker.bankDetails?.bankName
                    ? `${loggedInWorker.bankDetails.bankName} - A/C: ${loggedInWorker.bankDetails.accountNo}`
                    : 'Cash Payout registered'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Complete Ledger */}
        {activeTab === 'ledger' && (
          <div className="space-y-3">
            <div className="overflow-x-auto bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-200 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Site</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-center">Hours</th>
                    <th className="p-3 text-right text-emerald-400">Earned (+)</th>
                    <th className="p-3 text-right text-rose-400">Advance/Paid (−)</th>
                    <th className="p-3 text-right text-white">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {statement?.transactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-medium text-slate-300">{tx.date}</td>
                      <td className="p-3 text-slate-300">{tx.siteName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                          {tx.transactionType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 max-w-xs">{tx.description}</td>
                      <td className="p-3 text-center text-slate-400">{tx.hours ? `${tx.hours}h` : '—'}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">
                        {tx.credit > 0 ? `₹${tx.credit.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="p-3 text-right font-bold text-rose-400">
                        {tx.debit > 0 ? `₹${tx.debit.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="p-3 text-right font-black text-white font-mono">
                        ₹{tx.runningBalance.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
