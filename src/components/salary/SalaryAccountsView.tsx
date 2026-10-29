import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Worker, WorkerAccountStatement } from '../../types';
import { WorkerStatementModal } from './WorkerStatementModal';
import {
  IndianRupee,
  Search,
  Calendar,
  CreditCard,
  FileText,
  UserCheck,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Building2,
} from 'lucide-react';

export const SalaryAccountsView: React.FC = () => {
  const { workers, attendance, advances, salaryPayments, createSalaryPayment, getWorkerStatement } = useData();

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatement, setSelectedStatement] = useState<WorkerAccountStatement | null>(null);

  // Payout Modal State
  const [payoutWorker, setPayoutWorker] = useState<Worker | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [advanceDeduction, setAdvanceDeduction] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');
  const [refNumber, setRefNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Compute table records for each worker
  const workerRows = useMemo(() => {
    return workers
      .filter((w) => w.status === 'active')
      .map((worker) => {
        const stmt = getWorkerStatement(worker.id, selectedMonth);
        return {
          worker,
          statement: stmt,
        };
      })
      .filter((row) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          row.worker.name.toLowerCase().includes(q) ||
          row.worker.id.toLowerCase().includes(q) ||
          row.worker.workCategory.toLowerCase().includes(q) ||
          row.worker.village.toLowerCase().includes(q)
        );
      });
  }, [workers, selectedMonth, searchQuery, getWorkerStatement, attendance, advances, salaryPayments]);

  // Overall totals
  const totalGross = workerRows.reduce((sum, r) => sum + (r.statement?.totalEarnings || 0), 0);
  const totalAdvances = workerRows.reduce((sum, r) => sum + (r.statement?.totalAdvancesTaken || 0), 0);
  const totalPaid = workerRows.reduce((sum, r) => sum + (r.statement?.totalPaymentsMade || 0), 0);
  const totalNetDue = workerRows.reduce((sum, r) => sum + (r.statement?.closingBalance || 0), 0);

  const handleOpenPayout = (worker: Worker, stmt: WorkerAccountStatement | null) => {
    if (!stmt) return;
    setPayoutWorker(worker);
    setPayoutAmount(Math.max(0, stmt.closingBalance));
    setAdvanceDeduction(Math.min(stmt.totalAdvancesTaken, stmt.totalEarnings));
    setPaymentMethod('Cash');
    setRefNumber('');
  };

  const handleConfirmPayout = async () => {
    if (!payoutWorker) return;
    setIsSubmitting(true);
    try {
      const stmt = getWorkerStatement(payoutWorker.id, selectedMonth);
      if (!stmt) return;

      await createSalaryPayment({
        workerId: payoutWorker.id,
        workerName: payoutWorker.name,
        month: selectedMonth,
        paymentDate: new Date().toISOString().split('T')[0],
        presentDays: stmt.presentDays,
        halfDays: stmt.halfDays,
        absentDays: stmt.absentDays,
        overtimeHours: stmt.overtimeHours,
        baseEarnings: stmt.totalEarnings,
        overtimeEarnings: 0,
        grossEarnings: stmt.totalEarnings,
        advancesDeducted: advanceDeduction,
        otherDeductions: 0,
        netPayable: stmt.closingBalance,
        amountPaid: payoutAmount,
        remainingBalance: Math.max(0, stmt.closingBalance - payoutAmount),
        paymentMethod,
        referenceNumber: refNumber,
        remarks: `Salary payment for ${selectedMonth}`,
      });

      setPayoutWorker(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-400" />
            <span>Worker Salaries & Accounts Register</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated daily wages, OT rates, advance deductions, and net monthly payouts
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400">Total Gross Earned</span>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">
            ₹{totalGross.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-500">Based on logged attendance & OT</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400">Total Advances Given</span>
          <p className="text-xl sm:text-2xl font-black text-purple-400 mt-1">
            ₹{totalAdvances.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-500">Subject to monthly adjustment</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400">Total Paid Out</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
            ₹{totalPaid.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-500">Recorded salary transactions</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400">Net Due Balance</span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
            ₹{totalNetDue.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-500">Pending worker payouts</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by worker name, trade, village, or ID (KKS001)..."
          className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Workers Ledger Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Worker</th>
                <th className="p-3.5">Trade & Rate</th>
                <th className="p-3.5 text-center">Days Worked</th>
                <th className="p-3.5 text-center">OT (Hrs)</th>
                <th className="p-3.5 text-right">Gross Earned</th>
                <th className="p-3.5 text-right">Advances</th>
                <th className="p-3.5 text-right">Net Due</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {workerRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No matching workers found for this month.
                  </td>
                </tr>
              ) : (
                workerRows.map(({ worker, statement }) => (
                  <tr key={worker.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        {worker.photo ? (
                          <img
                            src={worker.photo}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold">
                            {worker.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            {worker.name}
                            <span className="text-[10px] font-mono text-amber-400/80 font-normal">
                              ({worker.id})
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {worker.village}, {worker.district}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-medium text-slate-200">{worker.workCategory}</span>
                      <p className="text-[10px] text-slate-400">₹{worker.rate}/day</p>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="font-bold text-white">{statement?.presentDays ?? 0}</span>
                      {statement && statement.halfDays > 0 && (
                        <span className="text-[10px] text-amber-400 block">
                          +{statement.halfDays} half
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center font-medium text-amber-400">
                      {statement?.overtimeHours ?? 0}h
                    </td>

                    <td className="p-3.5 text-right font-bold text-emerald-400">
                      ₹{(statement?.totalEarnings ?? 0).toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5 text-right font-medium text-purple-400">
                      ₹{(statement?.totalAdvancesTaken ?? 0).toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5 text-right">
                      <span
                        className={`font-black text-sm ${
                          (statement?.closingBalance ?? 0) > 0 ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        ₹{(statement?.closingBalance ?? 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedStatement(statement)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 flex items-center gap-1 transition"
                          title="View Ledger Statement"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>Statement</span>
                        </button>

                        <button
                          onClick={() => handleOpenPayout(worker, statement)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 transition active:scale-95"
                          title="Pay Out Salary"
                        >
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Pay</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worker Account Statement Modal */}
      {selectedStatement && (
        <WorkerStatementModal
          statement={selectedStatement}
          onClose={() => setSelectedStatement(null)}
        />
      )}

      {/* Record Salary Payment Modal */}
      {payoutWorker && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl animate-fadeIn space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Record Salary Payout</h3>
                <p className="text-xs text-amber-400">
                  {payoutWorker.name} ({payoutWorker.id}) • {selectedMonth}
                </p>
              </div>
              <button
                onClick={() => setPayoutWorker(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Net Payment Amount (₹)
              </label>
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Advance Deduction Adjusted (₹)
              </label>
              <input
                type="number"
                value={advanceDeduction}
                onChange={(e) => setAdvanceDeduction(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="Cash">Cash (नकद)</option>
                <option value="UPI">UPI / PhonePe / GPay</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Reference / Transaction ID (Optional)
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="e.g. UPI Ref / Cash voucher #49"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPayoutWorker(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayout}
                disabled={isSubmitting || payoutAmount <= 0}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Confirm Payout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
