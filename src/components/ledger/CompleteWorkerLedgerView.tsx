import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Worker, WorkerAccountStatement, WorkerLedgerEntry } from '../../types';
import { WorkerProfileModal } from '../workers/WorkerProfileModal';
import {
  FileSpreadsheet,
  Search,
  Calendar,
  Filter,
  Download,
  Printer,
  Share2,
  Users,
  IndianRupee,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Utensils,
  CreditCard,
  FileText,
} from 'lucide-react';

export const CompleteWorkerLedgerView: React.FC = () => {
  const { workers, getWorkerStatementWithRange } = useData();

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workers[0]?.id || 'all');
  const [dateRangeKey, setDateRangeKey] = useState<string>('this_month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const [profileWorker, setProfileWorker] = useState<Worker | null>(null);

  // Compute statements
  const statementsByWorker = useMemo(() => {
    const list: Array<{ worker: Worker; statement: WorkerAccountStatement }> = [];
    const targetWorkers =
      selectedWorkerId === 'all'
        ? workers.filter((w) => w.status === 'active')
        : workers.filter((w) => w.id === selectedWorkerId);

    targetWorkers.forEach((w) => {
      const stmt = getWorkerStatementWithRange(
        w.id,
        dateRangeKey,
        customStart || undefined,
        customEnd || undefined
      );
      if (stmt) {
        list.push({ worker: w, statement: stmt });
      }
    });

    return list;
  }, [workers, selectedWorkerId, dateRangeKey, customStart, customEnd, getWorkerStatementWithRange]);

  // Aggregate stats across selected statements
  const aggregatedStats = useMemo(() => {
    let totalEarnings = 0;
    let foodEarned = 0;
    let foodPaid = 0;
    let advances = 0;
    let payments = 0;
    let closingBalance = 0;
    let totalHours = 0;

    statementsByWorker.forEach(({ statement }) => {
      totalEarnings += statement.totalEarnings;
      foodEarned += statement.foodAllowanceEarned;
      foodPaid += statement.foodAllowancePaid;
      advances += statement.totalAdvancesTaken;
      payments += statement.totalPaymentsMade;
      closingBalance += statement.closingBalance;
      totalHours += statement.totalHoursWorked || 0;
    });

    return { totalEarnings, foodEarned, foodPaid, advances, payments, closingBalance, totalHours };
  }, [statementsByWorker]);

  // Combined transactions
  const combinedTransactions = useMemo(() => {
    const allTx: Array<WorkerLedgerEntry & { workerName: string; workerId: string }> = [];

    statementsByWorker.forEach(({ worker, statement }) => {
      statement.transactions.forEach((tx) => {
        allTx.push({
          ...tx,
          workerName: worker.name,
          workerId: worker.id,
        });
      });
    });

    return allTx
      .filter((tx) => {
        if (!searchFilter) return true;
        const q = searchFilter.toLowerCase();
        return (
          tx.workerName.toLowerCase().includes(q) ||
          tx.workerId.toLowerCase().includes(q) ||
          tx.siteName.toLowerCase().includes(q) ||
          tx.description.toLowerCase().includes(q) ||
          tx.transactionType.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [statementsByWorker, searchFilter]);

  const handleShareWhatsAppSummary = () => {
    const activeStmt = statementsByWorker[0]?.statement;
    const activeW = statementsByWorker[0]?.worker;

    let text = `*KKSInfraWorks - Complete Worker Ledger*\n`;
    text += `Firm: KKSInfraWorks (Prop. Kalindra Kumar Singh)\n`;
    text += `Address: Bargawn Road, Mairwa, Bihar\n`;
    text += `Period: ${activeStmt?.period || 'Selected Period'}\n`;
    text += `-----------------------------------------\n`;

    if (selectedWorkerId !== 'all' && activeW && activeStmt) {
      text += `Worker: ${activeW.name} (${activeW.id}) - ${activeW.workCategory}\n`;
      text += `Daily Wage Rate: ₹${activeW.rate}/day\n`;
      text += `Total Hours Worked: ${activeStmt.totalHoursWorked || 0} hrs\n`;
      text += `Total Wages Earned (+): ₹${activeStmt.totalEarnings}\n`;
      text += `Food Allowance Earned (+): ₹${activeStmt.foodAllowanceEarned}\n`;
      text += `Food Allowance Paid (−): ₹${activeStmt.foodAllowancePaid}\n`;
      text += `Advances Taken (−): ₹${activeStmt.totalAdvancesTaken}\n`;
      text += `Payments Received (−): ₹${activeStmt.totalPaymentsMade}\n`;
      text += `-----------------------------------------\n`;
      text += `*NET BALANCE: ₹${Math.abs(activeStmt.closingBalance)}* (${
        activeStmt.closingBalance >= 0 ? 'Payable to Worker' : 'Advance Recoverable'
      })\n`;
    } else {
      text += `Summary for ${statementsByWorker.length} Workers:\n`;
      text += `Total Wages Earned: ₹${aggregatedStats.totalEarnings}\n`;
      text += `Food Allowance: ₹${aggregatedStats.foodEarned}\n`;
      text += `Total Advances: ₹${aggregatedStats.advances}\n`;
      text += `Total Payments: ₹${aggregatedStats.payments}\n`;
      text += `*TOTAL NET OUTSTANDING: ₹${aggregatedStats.closingBalance}*\n`;
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleExportCSV = () => {
    let csv = 'Date,Worker ID,Worker Name,Site,Type,Description,Hours,Credit (Income),Debit (Advance/Payout),Running Balance\n';
    combinedTransactions.forEach((tx) => {
      csv += `"${tx.date}","${tx.workerId}","${tx.workerName}","${tx.siteName}","${tx.transactionType}","${tx.description.replace(/"/g, '""')}","${tx.hours || ''}","${tx.credit}","${tx.debit}","${tx.runningBalance}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KKSInfraWorks_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-24 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-500" />
            <h1 className="text-lg font-bold text-white">Complete Worker Ledger • सम्पूर्ण हिसाब-किताब</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological audit of regular wages, hourly shifts, food allowances, advances, payments, and net balances
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareWhatsAppSummary}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1.5 transition active:scale-95"
            title="Share Statement on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Hours</span>
          <p className="text-xl font-black text-amber-400 mt-0.5">{aggregatedStats.totalHours} hrs</p>
          <span className="text-[10px] text-slate-500">Regular + Overtime</span>
        </div>
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Wages Earned (+)</span>
          <p className="text-xl font-black text-emerald-400 mt-0.5">₹{aggregatedStats.totalEarnings.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-emerald-400/80">Credited to workers</span>
        </div>
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Food Khoraki (+)</span>
          <p className="text-xl font-black text-purple-400 mt-0.5">₹{aggregatedStats.foodEarned.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-purple-400/80">Paid: ₹{aggregatedStats.foodPaid}</span>
        </div>
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Advances Taken (−)</span>
          <p className="text-xl font-black text-rose-400 mt-0.5">₹{aggregatedStats.advances.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-slate-500">Subtracted from due</span>
        </div>
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Payments Made (−)</span>
          <p className="text-xl font-black text-sky-400 mt-0.5">₹{aggregatedStats.payments.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-sky-400/80">Settled salary/wages</span>
        </div>
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Net Due Balance</span>
          <p className="text-xl font-black text-white mt-0.5">₹{aggregatedStats.closingBalance.toLocaleString('en-IN')}</p>
          <span className={`text-[10px] font-bold ${aggregatedStats.closingBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {aggregatedStats.closingBalance >= 0 ? 'Payable' : 'Advance Recoverable'}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Select Worker</label>
          <select
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
          >
            <option value="all">All Active Workers ({workers.length})</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.id}) • ₹{w.rate}/day
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Date Period</label>
          <select
            value={dateRangeKey}
            onChange={(e) => setDateRangeKey(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium"
          >
            <option value="this_week">This Week (सोमवार - रविवार)</option>
            <option value="this_month">This Month (वर्तमान माह)</option>
            <option value="prev_month">Previous Month (पिछला माह)</option>
            <option value="custom">Custom Date Range (कस्टम अवधि)</option>
            <option value="all_time">All Time (शुरुआत से अब तक)</option>
          </select>

          {dateRangeKey === 'custom' && (
            <div className="flex items-center gap-1 mt-1.5">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white"
              />
              <span className="text-slate-500">-</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Search Description / Site</label>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search by task, site, worker, or description..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* Complete Chronological Ledger Table */}
      <div className="overflow-x-auto bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/90 text-slate-200 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Worker Name</th>
              <th className="p-3">Site</th>
              <th className="p-3">Type</th>
              <th className="p-3">Description</th>
              <th className="p-3 text-center">Hours</th>
              <th className="p-3 text-right text-emerald-400">Credit (+)</th>
              <th className="p-3 text-right text-rose-400">Debit (−)</th>
              <th className="p-3 text-right text-white">Running Balance</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {combinedTransactions.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-10 text-center text-slate-500">
                  No ledger transactions found for the selected criteria.
                </td>
              </tr>
            ) : (
              combinedTransactions.map((tx, idx) => {
                const w = workers.find((item) => item.id === tx.workerId);
                const isCredit = tx.credit > 0;
                const isDebit = tx.debit > 0;

                return (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 font-mono font-medium text-slate-300">{tx.date}</td>
                    <td className="p-3">
                      <button
                        onClick={() => w && setProfileWorker(w)}
                        className="font-bold text-white hover:text-amber-400 text-left"
                      >
                        {tx.workerName}
                      </button>
                      <span className="block text-[10px] text-slate-500 font-mono">{tx.workerId}</span>
                    </td>
                    <td className="p-3 text-slate-300 font-medium">{tx.siteName}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tx.transactionType === 'Wage' || tx.transactionType === 'Hourly Wage'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : tx.transactionType === 'Food Allowance Earned'
                            ? 'bg-purple-500/20 text-purple-300'
                            : tx.transactionType === 'Food Allowance Paid'
                            ? 'bg-rose-500/20 text-rose-300'
                            : tx.transactionType === 'Advance'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 max-w-xs">{tx.description}</td>
                    <td className="p-3 text-center text-slate-400 font-medium">
                      {tx.hours ? `${tx.hours}h` : '—'}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      {isCredit ? `₹${tx.credit.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="p-3 text-right font-bold text-rose-400">
                      {isDebit ? `₹${tx.debit.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="p-3 text-right font-black text-white font-mono">
                      ₹{tx.runningBalance.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => w && setProfileWorker(w)}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold transition"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* WORKER PROFILE MODAL */}
      <WorkerProfileModal
        isOpen={!!profileWorker}
        onClose={() => setProfileWorker(null)}
        worker={profileWorker}
      />
    </div>
  );
};
