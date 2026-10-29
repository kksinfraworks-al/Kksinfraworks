import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { usePinLock } from '../../context/PinLockContext';
import {
  X,
  Share2,
  Copy,
  Printer,
  Check,
  Send,
  Building2,
  Calendar,
  Phone,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface WhatsAppReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSiteId?: string;
  initialDate?: string;
}

export const WhatsAppReportModal: React.FC<WhatsAppReportModalProps> = ({
  isOpen,
  onClose,
  initialSiteId,
  initialDate,
}) => {
  const { sites, attendance, siteReports, advances, expenses, nextDayPlans, workers, media } = useData();
  const { settings } = usePinLock();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || todayStr);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(initialSiteId || 'all');
  const [recipientPhone, setRecipientPhone] = useState<string>(settings.proprietorPhone || '919835000000');
  const [copied, setCopied] = useState<boolean>(false);

  // Filter records based on selected site and date
  const filteredSite = sites.find((s) => s.id === selectedSiteId);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((a) => {
      const matchDate = a.date === selectedDate;
      const matchSite = selectedSiteId === 'all' || a.siteId === selectedSiteId;
      return matchDate && matchSite;
    });
  }, [attendance, selectedDate, selectedSiteId]);

  const filteredReports = useMemo(() => {
    return siteReports.filter((r) => {
      const matchDate = r.reportDate === selectedDate;
      const matchSite = selectedSiteId === 'all' || r.siteId === selectedSiteId;
      return matchDate && matchSite;
    });
  }, [siteReports, selectedDate, selectedSiteId]);

  const filteredAdvances = useMemo(() => {
    return advances.filter((a) => {
      const matchDate = a.date === selectedDate;
      const matchSite = selectedSiteId === 'all' || a.siteId === selectedSiteId;
      return matchDate && matchSite;
    });
  }, [advances, selectedDate, selectedSiteId]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchDate = e.date === selectedDate;
      const matchSite = selectedSiteId === 'all' || e.siteId === selectedSiteId;
      return matchDate && matchSite;
    });
  }, [expenses, selectedDate, selectedSiteId]);

  const tomorrowStr = useMemo(() => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, [selectedDate]);

  const filteredPlans = useMemo(() => {
    return nextDayPlans.filter((p) => {
      const matchDate = p.planDate === tomorrowStr || p.planDate === selectedDate;
      const matchSite = selectedSiteId === 'all' || p.siteId === selectedSiteId;
      return matchDate && matchSite;
    });
  }, [nextDayPlans, tomorrowStr, selectedDate, selectedSiteId]);

  const filteredMedia = useMemo(() => {
    return media.filter((m) => {
      const matchDate = m.date === selectedDate;
      const matchSite = selectedSiteId === 'all' || m.siteId === selectedSiteId;
      return matchDate && matchSite;
    });
  }, [media, selectedDate, selectedSiteId]);

  // Attendance Metrics
  const presentWorkers = filteredAttendance.filter((a) => a.status === 'present');
  const halfDayWorkers = filteredAttendance.filter((a) => a.status === 'half_day');
  const absentWorkers = filteredAttendance.filter((a) => a.status === 'absent');
  const leaveWorkers = filteredAttendance.filter((a) => a.status === 'leave');
  const totalOtHours = filteredAttendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

  // Labour Cost calculation
  const workerRateMap = useMemo(() => {
    const map = new Map<string, number>();
    workers.forEach((w) => map.set(w.id, Number(w.rate || 0)));
    return map;
  }, [workers]);

  const dailyLabourCost = useMemo(() => {
    let cost = 0;
    filteredAttendance.forEach((rec) => {
      const rate = workerRateMap.get(rec.workerId) || 0;
      const otHours = rec.overtimeHours || 0;
      const otPay = otHours * ((rate / 8) * 1.5);
      if (rec.status === 'present') cost += rate + otPay;
      else if (rec.status === 'half_day') cost += rate / 2 + otPay;
    });
    return Math.round(cost);
  }, [filteredAttendance, workerRateMap]);

  // Format the WhatsApp message exactly as requested
  const generatedReportText = useMemo(() => {
    const siteTitle = filteredSite ? filteredSite.name : 'All Construction Sites (Combined)';
    const siteAddress = filteredSite ? filteredSite.siteAddress : 'Mairwa / Siwan / Bihar';
    const totalAdvAmount = filteredAdvances
      .filter((a) => a.type === 'advance')
      .reduce((sum, a) => sum + Number(a.amount || 0), 0);
    const totalExpAmount = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    let text = `*🏗️ KKSInfraWorks DAILY SITE REPORT*\n`;
    text += `*Civil & Shuttering Contractor Supplier*\n`;
    text += `Proprietor: Kalindra Kumar Singh (Estd. 2002)\n`;
    text += `----------------------------------------\n`;
    text += `📅 *Date:* ${selectedDate}\n`;
    text += `🏢 *Site:* ${siteTitle}\n`;
    text += `📍 *Location:* ${siteAddress}\n`;
    text += `----------------------------------------\n\n`;

    // 1. Attendance Summary
    text += `*1️⃣ ATTENDANCE SUMMARY (दैनिक हाजिरी):*\n`;
    text += `• Total Present: *${presentWorkers.length}* workers\n`;
    text += `• Half Day: *${halfDayWorkers.length}* workers\n`;
    text += `• Absent: *${absentWorkers.length}* workers\n`;
    text += `• On Leave: *${leaveWorkers.length}* workers\n`;
    text += `• Overtime (OT): *${totalOtHours} hours* total\n`;
    if (presentWorkers.length > 0) {
      text += `\n_Present Workers & Trades:_\n`;
      presentWorkers.forEach((p, idx) => {
        text += `  ${idx + 1}. ${p.workerName} (${p.workerTrade || 'Mistri'})${
          p.overtimeHours ? ` [OT: ${p.overtimeHours}h]` : ''
        }\n`;
      });
    }
    text += `\n`;

    // 2. Work Completed Today
    text += `*2️⃣ WORK COMPLETED TODAY (आज का संपन्न कार्य):*\n`;
    if (filteredReports.length === 0) {
      text += `• No work reports logged yet for this date.\n`;
    } else {
      filteredReports.forEach((rep, idx) => {
        text += `• *Task ${idx + 1} (${rep.workCategory || 'Shuttering'}):*\n`;
        text += `  Location: ${rep.workLocation}\n`;
        text += `  Output: *${rep.quantityCompleted} ${rep.unit}*\n`;
        text += `  Work: ${rep.workCompletedToday}\n`;
        if (rep.materialsUsed) text += `  Materials: ${rep.materialsUsed}\n`;
        if (rep.descriptionHindiEnglish) text += `  विवरण: ${rep.descriptionHindiEnglish}\n`;
        text += `\n`;
      });
    }

    // 3. Work In Progress & Problems
    text += `*3️⃣ WORK IN PROGRESS & DELAYS (प्रगति एवं रुकावट):*\n`;
    const inProgressTasks = filteredReports.filter((r) => r.workInProgress);
    const delayTasks = filteredReports.filter((r) => r.hasProblemsOrDelays);

    if (inProgressTasks.length > 0) {
      inProgressTasks.forEach((t) => {
        text += `• In Progress: ${t.workInProgress} (${t.workLocation})\n`;
      });
    } else {
      text += `• All scheduled sections completed on time.\n`;
    }

    if (delayTasks.length > 0) {
      delayTasks.forEach((d) => {
        text += `⚠️ *Issue / Delay:* ${d.delayReason || 'Material or weather delay'}\n`;
      });
    } else {
      text += `• Zero safety incidents or critical delays reported.\n`;
    }
    text += `\n`;

    // 4. Advances Given
    text += `*4️⃣ WORKER ADVANCES GIVEN (पेसगी भुगतान):*\n`;
    if (filteredAdvances.length === 0) {
      text += `• No worker advances paid today. (₹0)\n`;
    } else {
      filteredAdvances.forEach((a) => {
        text += `• *₹${a.amount}* - ${a.workerName} (${a.paymentMethod}) - Reason: ${a.purpose}\n`;
      });
      text += `• *Total Advances Today:* ₹${totalAdvAmount.toLocaleString('en-IN')}\n`;
    }
    text += `\n`;

    // 5. Site Expenses
    text += `*5️⃣ SITE EXPENSES TODAY (साइट खर्च):*\n`;
    if (filteredExpenses.length === 0) {
      text += `• No direct site expenses incurred today. (₹0)\n`;
    } else {
      filteredExpenses.forEach((e) => {
        text += `• *₹${e.amount}* [${e.category}] - ${e.description} (${e.paymentMethod})\n`;
      });
      text += `• *Total Site Expenses Today:* ₹${totalExpAmount.toLocaleString('en-IN')}\n`;
    }
    text += `\n`;

    // 6. Tomorrow's Work Plan
    text += `*6️⃣ TOMORROW'S WORK PLAN (कल की कार्य योजना - ${tomorrowStr}):*\n`;
    if (filteredPlans.length === 0) {
      text += `• Standard shuttering and reinforcement continuation.\n`;
    } else {
      filteredPlans.forEach((plan, idx) => {
        text += `• *Target ${idx + 1} [Priority: ${plan.priority.toUpperCase()}]:* ${plan.expectedWork}\n`;
        text += `  Location: ${plan.workLocation}\n`;
        text += `  Workers Required: *${plan.expectedWorkersCount} workers* (${plan.assignedTeam})\n`;
        if (plan.materialsRequired) text += `  Materials Needed: ${plan.materialsRequired}\n`;
        if (plan.toolsEquipmentRequired) text += `  Tools / Plant: ${plan.toolsEquipmentRequired}\n`;
        if (plan.plannedActivities && plan.plannedActivities.length > 0) {
          text += `  Checklist: ${plan.plannedActivities.join('; ')}\n`;
        }
        text += `\n`;
      });
    }

    // 7. Labour Cost & Financial Summary
    text += `*7️⃣ DAILY LABOUR & FINANCIAL SUMMARY:*\n`;
    text += `• Est. Daily Labour Wage Cost: *₹${dailyLabourCost.toLocaleString('en-IN')}*\n`;
    text += `• Total Advances Given: *₹${totalAdvAmount.toLocaleString('en-IN')}*\n`;
    text += `• Total Site Expenses: *₹${totalExpAmount.toLocaleString('en-IN')}*\n`;
    text += `• Total Daily Cash Flow: *₹${(dailyLabourCost + totalExpAmount).toLocaleString('en-IN')}*\n`;
    text += `• Photos/Videos Recorded: *${filteredMedia.length} files attached*\n\n`;

    text += `_Report submitted via KKSInfraWorks Mobile Offline Management App._\n`;
    text += `_Proprietor: Kalindra Kumar Singh, Mairwa, Bihar_`;

    return text;
  }, [
    filteredSite,
    filteredAdvances,
    filteredExpenses,
    selectedDate,
    presentWorkers,
    halfDayWorkers,
    absentWorkers,
    leaveWorkers,
    totalOtHours,
    filteredReports,
    filteredPlans,
    tomorrowStr,
    dailyLabourCost,
    filteredMedia.length,
  ]);

  if (!isOpen) return null;

  // Actions
  const handleSendWhatsApp = () => {
    let cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(generatedReportText)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `KKSInfraWorks Site Report - ${selectedDate}`,
          text: generatedReportText,
        });
      } catch (err) {
        console.warn('Share cancelled or not supported:', err);
      }
    } else {
      handleCopyToClipboard();
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedReportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                WhatsApp Daily Report Generator
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold">
                  1-Tap Share
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Send structured daily construction log to Proprietor Kalindra Kumar Singh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Filters */}
        <div className="p-4 bg-slate-900/50 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Site Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              Construction Site
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Sites Combined (पूरा विवरण)</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Report Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Recipient Phone */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Proprietor Mobile (WhatsApp)
            </label>
            <input
              type="tel"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="e.g. 9835000000"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Live Preview Text Box */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Live WhatsApp Message Preview
            </span>
            <div className="text-[11px] text-slate-400">
              {presentWorkers.length} Present • {filteredReports.length} Work items • {filteredMedia.length} Photos
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed select-all max-h-[360px] overflow-y-auto shadow-inner">
            {generatedReportText}
          </div>
        </div>

        {/* Modal Footer with Action Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyToClipboard}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Share App</span>
              </button>
            )}

            <button
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Send on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
