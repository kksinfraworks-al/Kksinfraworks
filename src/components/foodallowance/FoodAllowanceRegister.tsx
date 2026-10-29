import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { FoodAllowanceRecord, Worker } from '../../types';
import { WorkerProfileModal } from '../workers/WorkerProfileModal';
import {
  Utensils,
  Plus,
  Calendar,
  Building2,
  Users,
  Search,
  Filter,
  Trash2,
  Edit,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  CreditCard,
  IndianRupee,
} from 'lucide-react';

export const FoodAllowanceRegister: React.FC = () => {
  const { user } = useAuth();
  const { workers, sites, foodAllowances, createFoodAllowance, updateFoodAllowance, deleteFoodAllowance } = useData();

  const todayStr = new Date().toISOString().split('T')[0];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FoodAllowanceRecord | null>(null);

  // Form states
  const [workerId, setWorkerId] = useState(workers[0]?.id || '');
  const [siteId, setSiteId] = useState(sites[0]?.id || 'SITE-01');
  const [date, setDate] = useState(todayStr);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'earned' | 'paid'>('earned');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');
  const [remarks, setRemarks] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkerFilter, setSelectedWorkerFilter] = useState('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('all');

  const [profileWorker, setProfileWorker] = useState<Worker | null>(null);

  const filteredAllowances = useMemo(() => {
    return foodAllowances.filter((f) => {
      const matchWorker = selectedWorkerFilter === 'all' || f.workerId === selectedWorkerFilter;
      const matchType = selectedTypeFilter === 'all' || f.type === selectedTypeFilter;
      const matchSite = selectedSiteFilter === 'all' || f.siteId === selectedSiteFilter;
      const matchSearch =
        !searchTerm ||
        f.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.workerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.remarks || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchWorker && matchType && matchSite && matchSearch;
    });
  }, [foodAllowances, selectedWorkerFilter, selectedTypeFilter, selectedSiteFilter, searchTerm]);

  // Overall statistics
  const totalEarned = foodAllowances
    .filter((f) => f.type === 'earned')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const totalPaid = foodAllowances
    .filter((f) => f.type === 'paid')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const netDue = totalEarned - totalPaid;

  const handleOpenModal = (record?: FoodAllowanceRecord) => {
    if (record) {
      setEditingRecord(record);
      setWorkerId(record.workerId);
      setSiteId(record.siteId);
      setDate(record.date);
      setAmount(String(record.amount));
      setType(record.type);
      setPaymentMethod(record.paymentMethod || 'Cash');
      setRemarks(record.remarks || '');
    } else {
      setEditingRecord(null);
      setWorkerId(workers[0]?.id || '');
      setSiteId(sites[0]?.id || 'SITE-01');
      setDate(todayStr);
      setAmount('150');
      setType('earned');
      setPaymentMethod('Cash');
      setRemarks('Daily food allowance (खोराकी)');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const w = workers.find((item) => item.id === workerId);
    const s = sites.find((item) => item.id === siteId);

    const payload: Partial<FoodAllowanceRecord> = {
      workerId,
      workerName: w?.name || 'Worker',
      siteId,
      siteName: s?.name || 'Site',
      date,
      amount: Number(amount),
      type,
      paymentMethod,
      remarks,
    };

    if (editingRecord) {
      await updateFoodAllowance(editingRecord.id, payload);
    } else {
      await createFoodAllowance(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-24 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-purple-400" />
            <h1 className="text-lg font-bold text-white">Food Allowance Register • खोराकी रजिस्टर</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Track food allowances earned (Credit) and food advances/payments paid (Debit) per worker
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Food Allowance Record</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30">
          <span className="text-xs text-purple-300 font-semibold">Total Food Allowance Earned</span>
          <p className="text-2xl font-black text-purple-300 mt-1">₹{totalEarned.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-purple-400/80">Worker entitled entitlement (Credit)</span>
        </div>
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
          <span className="text-xs text-rose-300 font-semibold">Total Food Allowance Paid</span>
          <p className="text-2xl font-black text-rose-300 mt-1">₹{totalPaid.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-rose-400/80">Cash/advance handed out (Debit)</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
          <span className="text-xs text-slate-300 font-semibold">Net Food Balance</span>
          <p className="text-2xl font-black text-white mt-1">₹{Math.abs(netDue).toLocaleString('en-IN')}</p>
          <span className={`text-[11px] font-bold ${netDue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netDue >= 0 ? 'Payable with salary' : 'Excess advance paid'}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Filter by Worker</label>
          <select
            value={selectedWorkerFilter}
            onChange={(e) => setSelectedWorkerFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
          >
            <option value="all">All Workers</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Type</label>
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
          >
            <option value="all">All Types</option>
            <option value="earned">Earned (खुराकी बानी)</option>
            <option value="paid">Paid (खुराकी भुगतान)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Filter by Site</label>
          <select
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
          >
            <option value="all">All Sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search remarks / worker..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/80 text-slate-300 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Worker Name</th>
              <th className="p-3">Site</th>
              <th className="p-3">Type</th>
              <th className="p-3 text-right">Amount (₹)</th>
              <th className="p-3">Method</th>
              <th className="p-3">Remarks / Details</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {filteredAllowances.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  No food allowance records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredAllowances.map((f) => {
                const w = workers.find((item) => item.id === f.workerId);
                return (
                  <tr key={f.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 font-mono font-medium text-slate-300">{f.date}</td>
                    <td className="p-3 font-bold text-white">
                      <button
                        onClick={() => w && setProfileWorker(w)}
                        className="hover:text-amber-400 text-left"
                      >
                        {f.workerName}
                      </button>
                      <span className="block text-[10px] text-slate-500 font-mono">{f.workerId}</span>
                    </td>
                    <td className="p-3 text-slate-300">{f.siteName}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          f.type === 'earned'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {f.type === 'earned' ? 'Earned (+)' : 'Paid (−)'}
                      </span>
                    </td>
                    <td
                      className={`p-3 text-right font-black text-sm ${
                        f.type === 'earned' ? 'text-purple-300' : 'text-rose-400'
                      }`}
                    >
                      ₹{f.amount}
                    </td>
                    <td className="p-3 text-slate-400">{f.paymentMethod || 'Cash'}</td>
                    <td className="p-3 text-slate-300">{f.remarks || '—'}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleOpenModal(f)}
                        className="p-1 text-slate-400 hover:text-amber-400 mr-1"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete food allowance record of ₹${f.amount} for ${f.workerName}?`)) {
                            deleteFoodAllowance(f.id);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingRecord ? 'Edit Food Allowance' : 'Add Food Allowance (खोराकी)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Worker *</label>
              <select
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.id}) • {w.assignedSiteName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Site</label>
                <select
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Allowance Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('earned')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-center ${
                    type === 'earned'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Earned Khoraki (+)
                  <span className="block text-[9px] font-normal text-purple-400">Added to earnings</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('paid')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-center ${
                    type === 'paid'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Paid Out / Advance (−)
                  <span className="block text-[9px] font-normal text-rose-400">Cash given to worker</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="150"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white"
                >
                  <option value="Cash">Cash (नकद)</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Afternoon tea & snacks / lunch allowance"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Save Food Allowance
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PROFILE MODAL */}
      <WorkerProfileModal
        isOpen={!!profileWorker}
        onClose={() => setProfileWorker(null)}
        worker={profileWorker}
      />
    </div>
  );
};
