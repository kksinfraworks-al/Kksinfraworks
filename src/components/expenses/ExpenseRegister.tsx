import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { SiteExpense, ExpenseCategory, AdvancePaymentMethod } from '../../types';
import {
  Receipt,
  Plus,
  Search,
  Calendar,
  Building2,
  IndianRupee,
  ArrowUpRight,
  Filter,
  X,
  AlertCircle,
  Fuel,
  Truck,
  Wrench,
  Coffee,
  HardHat,
  ShoppingBag,
} from 'lucide-react';

const CATEGORIES: ExpenseCategory[] = [
  'Materials',
  'Transport',
  'Equipment Rental',
  'Fuel',
  'Food & Tea',
  'Hardware & Fasteners',
  'Safety Gear',
  'Travel',
  'Labor Overtime',
  'Miscellaneous',
];

export const ExpenseRegister: React.FC = () => {
  const { user } = useAuth();
  const { sites, expenses, createExpense } = useData();

  const [selectedSiteFilter, setSelectedSiteFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [siteId, setSiteId] = useState(sites[0]?.id || 'SITE-01');
  const [category, setCategory] = useState<ExpenseCategory>('Hardware & Fasteners');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(1500);
  const [paymentMethod, setPaymentMethod] = useState<AdvancePaymentMethod>('Cash');
  const [paidBy, setPaidBy] = useState(user?.name || 'Ramesh Sharma');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Total calculations
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSite = selectedSiteFilter === 'all' || e.siteId === selectedSiteFilter;
      const matchCat = selectedCategoryFilter === 'all' || e.category === selectedCategoryFilter;
      const matchSearch =
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.paidBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.referenceNumber && e.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSite && matchCat && matchSearch;
    });
  }, [expenses, selectedSiteFilter, selectedCategoryFilter, searchTerm]);

  const handleOpenCreate = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setSiteId(sites[0]?.id || 'SITE-01');
    setCategory('Hardware & Fasteners');
    setDescription('');
    setAmount(1500);
    setPaymentMethod('Cash');
    setPaidBy(user?.name || 'Ramesh Sharma');
    setReferenceNumber('');
    setRemarks('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) {
      setError('Description and amount are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const site = sites.find((s) => s.id === siteId);

    const payload: Partial<SiteExpense> = {
      date,
      siteId,
      siteName: site?.name || 'Site',
      category,
      description: description.trim(),
      amount: Number(amount),
      paymentMethod,
      paidBy: paidBy.trim(),
      referenceNumber: referenceNumber.trim(),
      remarks: remarks.trim(),
    };

    try {
      await createExpense(payload);
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-purple-400" />
            <h1 className="text-lg font-bold text-white">Site Expense Register • साइट खर्च बही</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Log site hardware, diesel fuel, transport, and equipment rent (kept distinct from worker advances)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record Site Expense (खर्च दर्ज करें)</span>
        </button>
      </div>

      {/* KPI Total Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400">Total Construction Expenses</span>
          <p className="text-2xl font-black text-white mt-0.5">
            ₹{totalAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-500">Across {expenses.length} expense items</p>
        </div>
        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <Receipt className="w-6 h-6" />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
            Expense Category
          </label>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-purple-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
            Search Description & Bill #
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search memo, fuel, nails..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-purple-500"
          />
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Expense Register ({filteredExpenses.length} Records)
          </span>
          <span className="text-xs text-slate-400">Financial Log</span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p>No expense records match your filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-4 hover:bg-slate-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Receipt className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
                        {exp.category}
                      </span>
                      <span className="text-xs text-slate-400">Date: {exp.date}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1">{exp.description}</h4>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 mt-1">
                      <span>Site: <strong className="text-slate-300">{exp.siteName}</strong></span>
                      <span>Paid By: {exp.paidBy}</span>
                      <span>Mode: {exp.paymentMethod}</span>
                      {exp.referenceNumber && <span>Ref/Bill: {exp.referenceNumber}</span>}
                    </div>

                    {exp.remarks && (
                      <p className="text-[10px] text-slate-500 italic mt-0.5">{exp.remarks}</p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-black text-amber-400">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl my-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Record Site Expense</h3>
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
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Construction Site *
                  </label>
                  <select
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                    required
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date *
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
                    Expense Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amount (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      placeholder="e.g. 1500"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-6 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500 font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Expense Description (विवरण) *
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. 3-inch nails, binding wire roll 25kg, diesel 30L for mixer"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as AdvancePaymentMethod)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="Cash">Cash (नगद)</option>
                    <option value="UPI">UPI (Online)</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Paid By (किसने भुगतान किया)
                  </label>
                  <input
                    type="text"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bill / Cash Memo / Ref #
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. Bill #841 / BPCL Inv 710"
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
                    placeholder="e.g. Purchased from Mairwa hardware store"
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
                  {loading ? 'Saving...' : 'Save Site Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
