import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { AdvancePayment, AdvancePaymentMethod } from '../../types';
import {
  IndianRupee,
  Plus,
  Search,
  Calendar,
  Building2,
  Receipt,
  User,
  ArrowDownRight,
  ArrowUpRight,
  History,
  AlertCircle,
  CheckCircle2,
  X,
  CreditCard,
  Edit,
} from 'lucide-react';

export const AdvanceRegister: React.FC<{ initialCreateOpen?: boolean }> = ({
  initialCreateOpen = false,
}) => {
  const { user } = useAuth();
  const { workers, sites, advances, createAdvance, updateAdvance } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkerFilter, setSelectedWorkerFilter] = useState('all');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(initialCreateOpen);
  const [editingAdvance, setEditingAdvance] = useState<AdvancePayment | null>(null);

  // Form states
  const [workerId, setWorkerId] = useState(workers[0]?.id || '');
  const [amount, setAmount] = useState<number>(2000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'advance' | 'repayment' | 'salary_deduction'>('advance');
  const [paymentMethod, setPaymentMethod] = useState<AdvancePaymentMethod>('Cash');
  const [purpose, setPurpose] = useState('');
  const [siteId, setSiteId] = useState(sites[0]?.id || 'SITE-01');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Worker-wise balance calculator
  const workerBalances = useMemo(() => {
    const balances: Record<string, { totalAdvances: number; totalRepayments: number; outstanding: number }> = {};

    workers.forEach((w) => {
      balances[w.id] = { totalAdvances: 0, totalRepayments: 0, outstanding: 0 };
    });

    advances.forEach((a) => {
      if (!balances[a.workerId]) {
        balances[a.workerId] = { totalAdvances: 0, totalRepayments: 0, outstanding: 0 };
      }
      if (a.type === 'advance') {
        balances[a.workerId].totalAdvances += Number(a.amount || 0);
      } else {
        balances[a.workerId].totalRepayments += Number(a.amount || 0);
      }
      balances[a.workerId].outstanding =
        balances[a.workerId].totalAdvances - balances[a.workerId].totalRepayments;
    });

    return balances;
  }, [workers, advances]);

  // Overall financial summary
  const summary = useMemo(() => {
    let advancesSum = 0;
    let repaymentsSum = 0;
    advances.forEach((a) => {
      if (a.type === 'advance') advancesSum += Number(a.amount || 0);
      else repaymentsSum += Number(a.amount || 0);
    });
    return {
      advancesSum,
      repaymentsSum,
      outstanding: Math.max(0, advancesSum - repaymentsSum),
    };
  }, [advances]);

  // Filtered advances list
  const filteredAdvances = useMemo(() => {
    return advances.filter((a) => {
      const matchSearch =
        a.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.workerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.referenceNumber && a.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchWorker =
        selectedWorkerFilter === 'all' || a.workerId === selectedWorkerFilter;

      const matchSite =
        selectedSiteFilter === 'all' || a.siteId === selectedSiteFilter;

      return matchSearch && matchWorker && matchSite;
    });
  }, [advances, searchTerm, selectedWorkerFilter, selectedSiteFilter]);

  const handleOpenCreate = () => {
    setEditingAdvance(null);
    setWorkerId(workers[0]?.id || '');
    setAmount(2000);
    setDate(new Date().toISOString().split('T')[0]);
    setType('advance');
    setPaymentMethod('Cash');
    setPurpose('');
    setReferenceNumber('');
    setRemarks('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: AdvancePayment) => {
    setEditingAdvance(a);
    setWorkerId(a.workerId);
    setAmount(a.amount);
    setDate(a.date);
    setType(a.type);
    setPaymentMethod(a.paymentMethod);
    setPurpose(a.purpose);
    setSiteId(a.siteId);
    setReferenceNumber(a.referenceNumber || '');
    setRemarks(a.remarks || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerId || !amount || !purpose.trim()) {
      setError('Worker, amount, and purpose are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const worker = workers.find((w) => w.id === workerId);
    const site = sites.find((s) => s.id === siteId);

    const payload = {
      workerId,
      workerName: worker?.name || workerId,
      date,
      type,
      amount: Number(amount),
      paymentMethod,
      purpose: purpose.trim(),
      siteId,
      siteName: site?.name || 'Site',
      referenceNumber: referenceNumber.trim(),
      remarks: remarks.trim(),
    };

    try {
      if (editingAdvance) {
        await updateAdvance(editingAdvance.id, payload);
      } else {
        await createAdvance(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-purple-400" />
            <h1 className="text-lg font-bold text-white">Worker Advance Register • पेसगी बहीखाता</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Record advances, repayments, and track outstanding balance with complete audit trail
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Advance (पेसगी दर्ज करें)</span>
        </button>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Advances Given</span>
            <ArrowUpRight className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400">
            ₹{summary.advancesSum.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Gross advance payments to workers</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Repaid / Adjusted</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">
            ₹{summary.repaymentsSum.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Salary deductions & worker repayments</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Current Outstanding Balance</span>
            <IndianRupee className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">
            ₹{summary.outstanding.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Net amount recoverable from future wages</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search advances by worker name, ID, purpose, or reference..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">
              Filter by Worker
            </label>
            <select
              value={selectedWorkerFilter}
              onChange={(e) => setSelectedWorkerFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-purple-500"
            >
              <option value="all">All Workers</option>
              {workers.map((w) => {
                const bal = workerBalances[w.id]?.outstanding || 0;
                return (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.id}) - Bal: ₹{bal}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">
              Filter by Site
            </label>
            <select
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-purple-500"
            >
              <option value="all">All Sites</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Advance Transaction History ({filteredAdvances.length} records)
          </span>
          <span className="text-xs text-slate-400">All edits logged</span>
        </div>

        {filteredAdvances.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p>No advance payment records match your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredAdvances.map((adv) => {
              const isAdvance = adv.type === 'advance';
              const worker = workers.find((w) => w.id === adv.workerId);
              const bal = workerBalances[adv.workerId]?.outstanding || 0;

              return (
                <div
                  key={adv.id}
                  className="p-4 hover:bg-slate-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isAdvance
                          ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isAdvance ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.2 rounded">
                          {adv.workerId}
                        </span>
                        <h4 className="text-xs font-bold text-white">{adv.workerName}</h4>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            isAdvance ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {adv.type.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-1 font-medium">{adv.purpose}</p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 mt-1">
                        <span>Date: {adv.date}</span>
                        <span>Mode: {adv.paymentMethod}</span>
                        {adv.referenceNumber && <span>Ref: {adv.referenceNumber}</span>}
                        <span>Site: {adv.siteName}</span>
                      </div>

                      {adv.remarks && (
                        <p className="text-[10px] text-slate-500 italic mt-0.5">
                          Note: {adv.remarks}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Amount and Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <div className="text-right">
                      <span
                        className={`text-base font-black ${
                          isAdvance ? 'text-purple-400' : 'text-emerald-400'
                        }`}
                      >
                        {isAdvance ? '-' : '+'}₹{adv.amount.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Worker Bal: <strong className="text-amber-400">₹{bal}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(adv)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition"
                    >
                      <Edit className="w-3 h-3 text-purple-400" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Record Advance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl my-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingAdvance ? 'Edit Advance Transaction' : 'Record Advance / Repayment'}
                </h3>
                <p className="text-xs text-slate-400">KKSInfraWorks Financial Register</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-3 p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Worker (मजदूर चुनें) *
                  </label>
                  <select
                    value={workerId}
                    onChange={(e) => setWorkerId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                    required
                  >
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.id}) - {w.workCategory}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Transaction Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="advance">Advance (पेसगी दिया)</option>
                    <option value="repayment">Worker Repayment (वापस मिला)</option>
                    <option value="salary_deduction">Salary Adjustment (वेतन कटौती)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amount (रुपये ₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="50"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      placeholder="e.g. 2000"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-6 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500 font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date (तारीख)
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Payment Method (भुगतान माध्यम)
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as AdvancePaymentMethod)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="Cash">Cash (नगद)</option>
                    <option value="UPI">UPI (PhonePe / GPay / Paytm)</option>
                    <option value="Bank Transfer">Bank Transfer (खाते में)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Site Name
                  </label>
                  <select
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Purpose / Reason (कारण) *
                  </label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Festival advance, Medical emergency, Home ration..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    UPI / Bank Ref # (Optional)
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. UPI/602981..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Remarks
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Approved by Kalindra Singh"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
