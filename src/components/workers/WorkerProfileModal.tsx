import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Worker, AttendanceRecord, AdvancePayment, SalaryPayment, DailyWorkReport, FoodAllowanceRecord, WorkerLedgerEntry } from '../../types';
import {
  X,
  Calendar,
  IndianRupee,
  Briefcase,
  MapPin,
  Phone,
  Clock,
  Building2,
  FileText,
  CreditCard,
  Plus,
  Printer,
  Download,
  Share2,
  ArrowUpRight,
  ArrowDownLeft,
  Utensils,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Images,
} from 'lucide-react';

interface WorkerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker | null;
  readOnly?: boolean;
}

type TabType =
  | 'overview'
  | 'attendance'
  | 'sitework'
  | 'earnings'
  | 'food'
  | 'advances'
  | 'payments'
  | 'ledger';

export const WorkerProfileModal: React.FC<WorkerProfileModalProps> = ({
  isOpen,
  onClose,
  worker,
  readOnly = false,
}) => {
  const { user, isAdmin } = useAuth();
  const {
    attendance,
    advances,
    salaryPayments,
    siteReports,
    foodAllowances,
    createAdvance,
    createFoodAllowance,
    createSalaryPayment,
    getWorkerStatementWithRange,
  } = useData();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateRange, setDateRange] = useState<string>('this_month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // Quick Action Modals inside Worker Profile
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advAmount, setAdvAmount] = useState('');
  const [advPurpose, setAdvPurpose] = useState('');
  const [advMethod, setAdvMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');

  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [foodAmount, setFoodAmount] = useState('');
  const [foodType, setFoodType] = useState<'earned' | 'paid'>('earned');
  const [foodRemarks, setFoodRemarks] = useState('');

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');
  const [payoutRef, setPayoutRef] = useState('');

  if (!isOpen || !worker) return null;

  // Compute statement & ledger based on selected date range
  const statement = getWorkerStatementWithRange(
    worker.id,
    dateRange,
    customStart || undefined,
    customEnd || undefined
  );

  // Filtered worker records for the specific tabs
  const workerAttendance = useMemo(() => {
    return attendance
      .filter((a) => a.workerId === worker.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendance, worker.id]);

  const workerSiteWork = useMemo(() => {
    return siteReports
      .filter(
        (r) =>
          (r.workerIds && r.workerIds.includes(worker.id)) ||
          (r.workerNames && r.workerNames.includes(worker.name))
      )
      .sort((a, b) => (b.reportDate || '').localeCompare(a.reportDate || ''));
  }, [siteReports, worker.id, worker.name]);

  const workerAdvances = useMemo(() => {
    return advances
      .filter((a) => a.workerId === worker.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [advances, worker.id]);

  const workerFoodAllowances = useMemo(() => {
    return foodAllowances
      .filter((f) => f.workerId === worker.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [foodAllowances, worker.id]);

  const workerPayments = useMemo(() => {
    return salaryPayments
      .filter((s) => s.workerId === worker.id)
      .sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''));
  }, [salaryPayments, worker.id]);

  const closingBal = statement?.closingBalance || 0;
  const isPayable = closingBal >= 0;

  // Handlers for quick actions
  const handleAddAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advAmount || Number(advAmount) <= 0) return;
    await createAdvance({
      workerId: worker.id,
      workerName: worker.name,
      amount: Number(advAmount),
      purpose: advPurpose || 'Advance payment',
      paymentMethod: advMethod,
      siteId: worker.assignedSiteId,
      siteName: worker.assignedSiteName,
      date: new Date().toISOString().split('T')[0],
    });
    setAdvAmount('');
    setAdvPurpose('');
    setIsAdvanceModalOpen(false);
  };

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodAmount || Number(foodAmount) <= 0) return;
    await createFoodAllowance({
      workerId: worker.id,
      workerName: worker.name,
      amount: Number(foodAmount),
      type: foodType,
      remarks: foodRemarks,
      siteId: worker.assignedSiteId,
      siteName: worker.assignedSiteName,
      date: new Date().toISOString().split('T')[0],
    });
    setFoodAmount('');
    setFoodRemarks('');
    setIsFoodModalOpen(false);
  };

  const handleAddPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAmount || Number(payoutAmount) <= 0) return;
    const currentMonth = new Date().toISOString().slice(0, 7);
    await createSalaryPayment({
      workerId: worker.id,
      workerName: worker.name,
      month: currentMonth,
      paymentDate: new Date().toISOString().split('T')[0],
      amountPaid: Number(payoutAmount),
      paymentMethod: payoutMethod,
      referenceNumber: payoutRef,
      remarks: `Wage settlement payment for ${worker.name}`,
    });
    setPayoutAmount('');
    setPayoutRef('');
    setIsPayoutModalOpen(false);
  };

  const handleShareWhatsApp = () => {
    const text = `*KKSInfraWorks - Worker Statement / हिसाब-किताब*\n` +
      `-----------------------------------------\n` +
      `Worker: ${worker.name} (${worker.id})\n` +
      `Father: ${worker.fatherName || 'N/A'}\n` +
      `Trade: ${worker.workCategory} (Rate: ₹${worker.rate}/day)\n` +
      `Site: ${worker.assignedSiteName}\n` +
      `Period: ${statement?.period || 'Current'}\n` +
      `-----------------------------------------\n` +
      `Days Present: ${statement?.presentDays || 0} | Half Days: ${statement?.halfDays || 0}\n` +
      `Total Hours: ${statement?.totalHoursWorked || 0} hrs\n` +
      `Total Wages Earned: ₹${statement?.totalEarnings || 0}\n` +
      `Food Allowance Earned: ₹${statement?.foodAllowanceEarned || 0}\n` +
      `Food Allowance Paid: ₹${statement?.foodAllowancePaid || 0}\n` +
      `Total Advances: ₹${statement?.totalAdvancesTaken || 0}\n` +
      `Total Payments Made: ₹${statement?.totalPaymentsMade || 0}\n` +
      `-----------------------------------------\n` +
      `*NET BALANCE: ₹${Math.abs(closingBal)}* (${isPayable ? 'Payable to Worker' : 'Advance Recoverable'})\n\n` +
      `_KKSInfraWorks • Bargawn Road, Mairwa, Bihar_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header Card */}
        <div className="p-4 sm:p-6 bg-slate-900/95 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-500/50 shrink-0 shadow-lg">
              {worker.photo ? (
                <img src={worker.photo} alt={worker.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-400 font-black text-xl">
                  {worker.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                  {worker.id}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    worker.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {worker.status}
                </span>
                <span className="text-xs text-slate-400">
                  Daily Rate: <strong className="text-white">₹{worker.rate}</strong>/day
                  (≈ ₹{Math.round(worker.rate / 8)}/hr)
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-white mt-1">{worker.name}</h2>
              <p className="text-xs text-slate-400">
                S/o {worker.fatherName || '—'} • {worker.workCategory} ({worker.skillLevel})
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1 text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>{worker.assignedSiteName}</span>
                </span>
                {worker.village && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{worker.village}, {worker.district}</span>
                  </span>
                )}
                {worker.mobile && (
                  <a
                    href={`tel:${worker.mobile}`}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{worker.mobile}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons & Close */}
          <div className="flex items-center gap-2 self-end sm:self-start">
            <button
              onClick={handleShareWhatsApp}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
              title="Share Hisab-Kitaab on WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              title="Print Ledger"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Date Filter & Navigation Tabs Bar */}
        <div className="bg-slate-950/80 border-b border-slate-800 px-3 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* 8 Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'attendance', label: `Attendance (${workerAttendance.length})`, icon: Clock },
              { id: 'sitework', label: `Site Work (${workerSiteWork.length})`, icon: Briefcase },
              { id: 'earnings', label: 'Earnings', icon: IndianRupee },
              { id: 'food', label: `Food (${workerFoodAllowances.length})`, icon: Utensils },
              { id: 'advances', label: `Advances (${workerAdvances.length})`, icon: ArrowDownLeft },
              { id: 'payments', label: `Payments (${workerPayments.length})`, icon: CreditCard },
              { id: 'ledger', label: 'Complete Ledger', icon: FileSpreadsheet },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
            <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-hidden focus:border-amber-500 font-medium"
            >
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="prev_month">Previous Month</option>
              <option value="custom">Custom Range</option>
              <option value="all_time">All Time</option>
            </select>

            {dateRange === 'custom' && (
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-[11px] text-white"
                />
                <span className="text-slate-500 text-xs">-</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-[11px] text-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Highlight Balance Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/80 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Net Balance / हिसाब-किताब ({statement?.period})
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
                      {isPayable ? 'Payable to Worker (देना बाकी)' : 'Advance Recoverable (एडवांस बाकी)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Formula: Wages Earned (₹{statement?.totalEarnings}) + Food Allowance (₹{statement?.foodAllowanceEarned}) −
                    Advances (₹{statement?.totalAdvancesTaken}) − Payments (₹{statement?.totalPaymentsMade})
                  </p>
                </div>

                {!readOnly && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setIsAdvanceModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Give Advance</span>
                    </button>
                    <button
                      onClick={() => setIsFoodModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Utensils className="w-4 h-4" />
                      <span>Food Allowance</span>
                    </button>
                    <button
                      onClick={() => {
                        setPayoutAmount(String(Math.max(0, closingBal)));
                        setIsPayoutModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1.5 transition"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Record Payment</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 6 Metric KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400">Total Present Days</span>
                  <p className="text-xl font-black text-white mt-1">
                    {statement?.presentDays || 0} <span className="text-xs text-slate-400 font-normal">days</span>
                  </p>
                  <span className="text-[10px] text-slate-500">Half Days: {statement?.halfDays || 0}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400">Hours Worked</span>
                  <p className="text-xl font-black text-amber-400 mt-1">
                    {statement?.totalHoursWorked || 0} <span className="text-xs text-slate-400 font-normal">hrs</span>
                  </p>
                  <span className="text-[10px] text-slate-500">OT: {statement?.overtimeHours || 0} hrs</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400">Wages Earned</span>
                  <p className="text-xl font-black text-emerald-400 mt-1">
                    ₹{(statement?.totalEarnings || 0).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-emerald-400/80">Regular + Overtime</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400">Food Allowance</span>
                  <p className="text-xl font-black text-purple-400 mt-1">
                    ₹{(statement?.foodAllowanceEarned || 0).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-purple-400/80">Paid: ₹{statement?.foodAllowancePaid || 0}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400">Advances Taken</span>
                  <p className="text-xl font-black text-rose-400 mt-1">
                    ₹{(statement?.totalAdvancesTaken || 0).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-slate-500">{workerAdvances.length} records</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400">Total Paid Out</span>
                  <p className="text-xl font-black text-sky-400 mt-1">
                    ₹{(statement?.totalPaymentsMade || 0).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-sky-400/80">Salary & settlements</span>
                </div>
              </div>

              {/* Bank & Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2 text-xs">
                  <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-500" />
                    <span>Personal & Contact Information</span>
                  </h4>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Father's Name:</span>
                    <span className="text-white font-medium">{worker.fatherName || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Primary Mobile:</span>
                    <span className="text-white font-medium">{worker.mobile || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Emergency Contact:</span>
                    <span className="text-white font-medium">{worker.emergencyContact || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Village / Address:</span>
                    <span className="text-white font-medium text-right max-w-[200px] truncate">
                      {worker.fullAddress || worker.village || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Joining Date:</span>
                    <span className="text-white font-medium">{worker.joiningDate}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2 text-xs">
                  <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Bank & UPI Settlement Details</span>
                  </h4>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Bank Name:</span>
                    <span className="text-white font-medium">{worker.bankDetails?.bankName || 'Not Added'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Account Number:</span>
                    <span className="text-white font-medium">{worker.bankDetails?.accountNo || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">IFSC Code:</span>
                    <span className="text-white font-medium">{worker.bankDetails?.ifsc || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">UPI ID / GPay:</span>
                    <span className="text-emerald-400 font-mono font-medium">{worker.bankDetails?.upiId || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">Attendance Records • उपस्थिति विवरण</h3>
                  <p className="text-xs text-slate-400">
                    Full day, half day, hourly shifts, and overtime breakdown
                  </p>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-xl border border-slate-700">
                  Total {workerAttendance.length} records
                </span>
              </div>

              {workerAttendance.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  No attendance records logged for this worker.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/80 text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Site Name</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Hours Worked</th>
                        <th className="p-3">Wage Rate</th>
                        <th className="p-3">Calculated Wage</th>
                        <th className="p-3">OT Hours</th>
                        <th className="p-3">Remarks / Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                      {workerAttendance.map((att) => {
                        const isHourly = att.status === 'present_hourly';
                        const isPresent = att.status === 'present' || att.status === 'present_full';
                        const isHalf = att.status === 'half_day';
                        const hours = isHourly ? att.hoursWorked : isHalf ? 4 : isPresent ? 8 : 0;
                        const hrRate = att.hourlyWage || Math.round(worker.rate / 8);

                        return (
                          <tr key={att.id} className="hover:bg-slate-800/40 transition">
                            <td className="p-3 font-mono font-medium text-slate-200">{att.date}</td>
                            <td className="p-3 text-slate-300 font-semibold">{att.siteName}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                                  isHourly
                                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                    : isPresent
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : isHalf
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {isHourly ? `Hourly (${hours}h)` : att.status}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-white">{hours} hrs</td>
                            <td className="p-3 text-slate-400">
                              ₹{att.dailyWage || worker.rate}/day (₹{hrRate}/hr)
                            </td>
                            <td className="p-3 font-bold text-emerald-400">
                              ₹{att.calculatedWage || 0}
                              {att.isWageOverridden && (
                                <span className="block text-[9px] text-amber-400 font-normal">
                                  Overridden: {att.overrideReason || 'Manual'}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-slate-300 font-medium">
                              {att.overtimeHours ? `+${att.overtimeHours} hrs` : '—'}
                            </td>
                            <td className="p-3 text-slate-400 text-[11px]">{att.remarks || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SITE WORK */}
          {activeTab === 'sitework' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">Site Work Involvement • साइट कार्य विवरण</h3>
                  <p className="text-xs text-slate-400">
                    Construction site tasks, shuttering and concreting work completed
                  </p>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-xl border border-slate-700">
                  Total {workerSiteWork.length} tasks
                </span>
              </div>

              {workerSiteWork.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  No direct site work entries tagged with this worker yet. When recording Daily Site Work, tag {worker.name} to link tasks here.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {workerSiteWork.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-400 font-bold">
                          {report.reportDate}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {report.workCategory}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm">{report.siteName}</h4>
                      <p className="text-slate-300">{report.workCompletedToday || report.workDescription}</p>

                      {report.quantityCompleted > 0 && (
                        <div className="text-slate-400 text-[11px]">
                          Quantity: <strong className="text-white">{report.quantityCompleted} {report.unit}</strong>
                        </div>
                      )}

                      {report.mediaItems && report.mediaItems.length > 0 && (
                        <div className="pt-2 flex items-center gap-2 overflow-x-auto">
                          {report.mediaItems.map((m) => (
                            <div key={m.id} className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                              <img src={m.dataUrl} alt={m.caption} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EARNINGS */}
          {activeTab === 'earnings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white text-base">Earnings Ledger • कमाई का हिसाब</h3>
                  <p className="text-xs text-slate-400">
                    Calculated daily wages, hourly earnings, and overtime pay for {statement?.period}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Total Wages Earned</span>
                  <p className="text-2xl font-black text-emerald-400">
                    ₹{(statement?.totalEarnings || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-xs text-slate-400">Full Day Earnings</span>
                  <p className="text-xl font-bold text-white mt-1">
                    ₹{((statement?.presentDays || 0) * worker.rate).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-slate-500">{statement?.presentDays || 0} shifts @ ₹{worker.rate}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-xs text-slate-400">Half Day Earnings</span>
                  <p className="text-xl font-bold text-white mt-1">
                    ₹{Math.round((statement?.halfDays || 0) * (worker.rate / 2)).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-slate-500">{statement?.halfDays || 0} shifts @ ₹{Math.round(worker.rate / 2)}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-xs text-slate-400">Overtime Earnings</span>
                  <p className="text-xl font-bold text-amber-400 mt-1">
                    ₹{Math.round((statement?.overtimeHours || 0) * ((worker.rate / 8) * 1.5)).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-slate-500">{statement?.overtimeHours || 0} OT hrs @ 1.5x</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FOOD ALLOWANCE */}
          {activeTab === 'food' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white text-base">Food Allowance Register • खोराकी विवरण</h3>
                  <p className="text-xs text-slate-400">
                    Track food allowance earned (Credit) vs food advance/paid (Debit)
                  </p>
                </div>
                {!readOnly && (
                  <button
                    onClick={() => setIsFoodModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 self-start"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Food Record</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                  <span className="text-xs text-purple-300 font-semibold">Total Food Allowance Earned</span>
                  <p className="text-xl font-black text-purple-300 mt-1">
                    ₹{(statement?.foodAllowanceEarned || 0).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-purple-400/80">Part of earnings (Credit)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                  <span className="text-xs text-rose-300 font-semibold">Total Food Allowance Paid</span>
                  <p className="text-xl font-black text-rose-300 mt-1">
                    ₹{(statement?.foodAllowancePaid || 0).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-rose-400/80">Deducted / Given (Debit)</span>
                </div>
              </div>

              {workerFoodAllowances.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  No separate food allowance entries found. You can add daily food allowance (खोराकी) using the button above.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/80 text-slate-300 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Site</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Payment Method</th>
                        <th className="p-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                      {workerFoodAllowances.map((f) => (
                        <tr key={f.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-medium text-slate-200">{f.date}</td>
                          <td className="p-3 text-slate-300">{f.siteName}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                f.type === 'earned'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {f.type === 'earned' ? 'Earned (+)' : 'Paid / Advance (-)'}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-white">₹{f.amount}</td>
                          <td className="p-3 text-slate-400">{f.paymentMethod || 'Cash'}</td>
                          <td className="p-3 text-slate-400 text-[11px]">{f.remarks || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ADVANCES */}
          {activeTab === 'advances' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white text-base">Advance Payment Register • अग्रिम / एडवांस</h3>
                  <p className="text-xs text-slate-400">
                    Advances given for personal expenses, travel, or medical needs
                  </p>
                </div>
                {!readOnly && (
                  <button
                    onClick={() => setIsAdvanceModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 self-start"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Give Advance</span>
                  </button>
                )}
              </div>

              {workerAdvances.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  No advances recorded for {worker.name}.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/80 text-slate-300 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Site</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Purpose / Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                      {workerAdvances.map((adv) => (
                        <tr key={adv.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-medium text-slate-200">{adv.date}</td>
                          <td className="p-3 text-slate-300">{adv.siteName}</td>
                          <td className="p-3 font-bold text-rose-400">₹{adv.amount}</td>
                          <td className="p-3 text-slate-400">{adv.paymentMethod}</td>
                          <td className="p-3 text-slate-300">
                            {adv.purpose} {adv.remarks ? `(${adv.remarks})` : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white text-base">Payment History • वेतन भुगतान विवरण</h3>
                  <p className="text-xs text-slate-400">
                    Official wage settlements and salary payments made to worker
                  </p>
                </div>
                {!readOnly && (
                  <button
                    onClick={() => {
                      setPayoutAmount(String(Math.max(0, closingBal)));
                      setIsPayoutModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 self-start"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Record Payment</span>
                  </button>
                )}
              </div>

              {workerPayments.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  No payment settlements recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/80 text-slate-300 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Payment Date</th>
                        <th className="p-3">Month</th>
                        <th className="p-3">Amount Paid</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Reference / Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                      {workerPayments.map((sal) => (
                        <tr key={sal.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-medium text-slate-200">{sal.paymentDate || '—'}</td>
                          <td className="p-3 text-slate-300 font-bold">{sal.month}</td>
                          <td className="p-3 font-bold text-emerald-400 text-sm">₹{sal.amountPaid}</td>
                          <td className="p-3 text-slate-400">{sal.paymentMethod}</td>
                          <td className="p-3 text-slate-300">
                            {sal.referenceNumber ? `Ref: ${sal.referenceNumber}` : ''} {sal.remarks || ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: COMPLETE LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-white text-base">Complete Worker Ledger • सम्पूर्ण हिसाब-किताब</h3>
                  <p className="text-xs text-slate-400">
                    Chronological audit of all earnings (+), advances (−), and payments (−) with running balance
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-semibold">Net Closing Balance</span>
                  <p className="text-2xl font-black text-white">
                    ₹{Math.abs(closingBal).toLocaleString('en-IN')}{' '}
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${
                        isPayable ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      ({isPayable ? 'Payable' : 'Recoverable'})
                    </span>
                  </p>
                </div>
              </div>

              {(!statement || statement.transactions.length === 0) ? (
                <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  No ledger transactions recorded in this date range.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-md">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800 text-slate-200 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Site</th>
                        <th className="p-3">Transaction Type</th>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-center">Hours</th>
                        <th className="p-3 text-right text-emerald-400">Credit (+)</th>
                        <th className="p-3 text-right text-rose-400">Debit (−)</th>
                        <th className="p-3 text-right text-white">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/80">
                      {statement.transactions.map((tx, idx) => {
                        const isCredit = tx.credit > 0;
                        const isDebit = tx.debit > 0;

                        return (
                          <tr key={idx} className="hover:bg-slate-800/40 transition">
                            <td className="p-3 font-mono font-medium text-slate-200">{tx.date}</td>
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
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-800/90 text-white font-bold border-t border-slate-700">
                      <tr>
                        <td colSpan={5} className="p-3 text-right uppercase text-[10px] tracking-wider text-slate-400">
                          Total Summary ({statement.transactions.length} entries):
                        </td>
                        <td className="p-3 text-right text-emerald-400 text-sm">
                          ₹{(statement.totalEarnings + statement.foodAllowanceEarned).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right text-rose-400 text-sm">
                          ₹{(statement.foodAllowancePaid + statement.totalAdvancesTaken + statement.totalPaymentsMade).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right text-base text-amber-400">
                          ₹{statement.closingBalance.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QUICK MODAL 1: GIVE ADVANCE */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70">
          <form
            onSubmit={handleAddAdvance}
            className="bg-slate-900 border border-slate-700 p-5 rounded-2xl w-full max-w-md space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white text-sm">Give Advance to {worker.name}</h4>
              <button
                type="button"
                onClick={() => setIsAdvanceModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Advance Amount (₹) *</label>
              <input
                type="number"
                required
                min="10"
                value={advAmount}
                onChange={(e) => setAdvAmount(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
              <select
                value={advMethod}
                onChange={(e) => setAdvMethod(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Cash">Cash (नकद)</option>
                <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                <option value="Bank Transfer">Bank Transfer (बैंक खाता)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Purpose / Note</label>
              <input
                type="text"
                value={advPurpose}
                onChange={(e) => setAdvPurpose(e.target.value)}
                placeholder="e.g. Family expense / medicine / travel"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdvanceModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Save Advance
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QUICK MODAL 2: FOOD ALLOWANCE */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70">
          <form
            onSubmit={handleAddFood}
            className="bg-slate-900 border border-slate-700 p-5 rounded-2xl w-full max-w-md space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white text-sm">Food Allowance (खोराकी) • {worker.name}</h4>
              <button
                type="button"
                onClick={() => setIsFoodModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFoodType('earned')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-center ${
                    foodType === 'earned'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Food Allowance Earned (+)
                  <span className="block text-[10px] font-normal text-purple-400">Part of worker earnings</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFoodType('paid')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-center ${
                    foodType === 'paid'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Food Advance Paid (−)
                  <span className="block text-[10px] font-normal text-rose-400">Cash given for meals</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                min="10"
                value={foodAmount}
                onChange={(e) => setFoodAmount(e.target.value)}
                placeholder="e.g. 150"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Remarks</label>
              <input
                type="text"
                value={foodRemarks}
                onChange={(e) => setFoodRemarks(e.target.value)}
                placeholder="e.g. Evening meal / overtime tiffin"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsFoodModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Save Food Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QUICK MODAL 3: RECORD PAYMENT */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70">
          <form
            onSubmit={handleAddPayout}
            className="bg-slate-900 border border-slate-700 p-5 rounded-2xl w-full max-w-md space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white text-sm">Record Wage Payment • {worker.name}</h4>
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Amount (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-hidden focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400">
                Current Net Payable: ₹{Math.max(0, closingBal)}
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Cash">Cash (नकद)</option>
                <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reference / UTR Number</label>
              <input
                type="text"
                value={payoutRef}
                onChange={(e) => setPayoutRef(e.target.value)}
                placeholder="e.g. UTR / Transaction ID"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
