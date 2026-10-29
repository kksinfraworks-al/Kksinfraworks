import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Building2,
  Calendar,
  Users,
  IndianRupee,
  Receipt,
  ClipboardPen,
  CalendarClock,
  HardHat,
} from 'lucide-react';

type ReportType =
  | 'attendance_daily'
  | 'attendance_monthly'
  | 'worker_register'
  | 'advance_ledger'
  | 'daily_work_report'
  | 'planned_vs_completed'
  | 'site_expenses';

export const ExportReportsView: React.FC = () => {
  const { user } = useAuth();
  const { workers, sites, attendance, advances, siteReports, nextDayPlans, expenses } = useData();

  const [selectedReport, setSelectedReport] = useState<ReportType>('attendance_daily');
  const [selectedSiteId, setSelectedSiteId] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  // Compute worker advance ledger balances
  const advanceBalances = useMemo(() => {
    const map: Record<string, { advances: number; repayments: number; balance: number }> = {};
    workers.forEach((w) => {
      map[w.id] = { advances: 0, repayments: 0, balance: 0 };
    });
    advances.forEach((a) => {
      if (!map[a.workerId]) map[a.workerId] = { advances: 0, repayments: 0, balance: 0 };
      if (a.type === 'advance') map[a.workerId].advances += Number(a.amount || 0);
      else map[a.workerId].repayments += Number(a.amount || 0);
      map[a.workerId].balance = map[a.workerId].advances - map[a.workerId].repayments;
    });
    return map;
  }, [workers, advances]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';

    if (selectedReport === 'attendance_daily') {
      csv += 'Worker ID,Name,Trade,Daily Rate,Date,Site,Status,Overtime Hours,Remarks\n';
      const attList = attendance.filter(
        (a) => (!selectedDate || a.date === selectedDate) && (selectedSiteId === 'all' || a.siteId === selectedSiteId)
      );
      attList.forEach((a) => {
        csv += `"${a.workerId}","${a.workerName}","${a.workerTrade || ''}",,"${a.date}","${a.siteName}","${a.status}",${a.overtimeHours},"${a.remarks || ''}"\n`;
      });
    } else if (selectedReport === 'worker_register') {
      csv += 'Worker ID,Full Name,Father Name,Mobile,Trade,Skill Level,Designation,Wage Type,Rate,Assigned Site,Status\n';
      workers.forEach((w) => {
        csv += `"${w.id}","${w.name}","${w.fatherName}","${w.mobile}","${w.workCategory}","${w.skillLevel}","${w.designation}","${w.wageType}",${w.rate},"${w.assignedSiteName}","${w.status}"\n`;
      });
    } else if (selectedReport === 'advance_ledger') {
      csv += 'Transaction ID,Date,Worker ID,Worker Name,Type,Amount,Payment Method,Site,Purpose,Reference\n';
      advances.forEach((a) => {
        csv += `"${a.id}","${a.date}","${a.workerId}","${a.workerName}","${a.type}",${a.amount},"${a.paymentMethod}","${a.siteName}","${a.purpose}","${a.referenceNumber || ''}"\n`;
      });
    } else if (selectedReport === 'daily_work_report') {
      csv += 'Report Date,Site,Location,Category,Quantity,Unit,Workers Count,Supervisor,Description\n';
      siteReports.forEach((r) => {
        csv += `"${r.reportDate}","${r.siteName}","${r.workLocation}","${r.workCategory}",${r.quantityCompleted},"${r.unit}",${r.workersCount},"${r.supervisorName}","${r.descriptionHindiEnglish.replace(/"/g, '""')}"\n`;
      });
    } else if (selectedReport === 'site_expenses') {
      csv += 'Date,Site,Category,Description,Amount,Payment Method,Paid By,Reference\n';
      expenses.forEach((e) => {
        csv += `"${e.date}","${e.siteName}","${e.category}","${e.description}",${e.amount},"${e.paymentMethod}","${e.paidBy}","${e.referenceNumber || ''}"\n`;
      });
    }

    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KKS_${selectedReport}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-20 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      {/* Top Controls Bar (hidden during print) */}
      <div className="print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-500" />
              <h1 className="text-lg font-bold text-white">Reports & Official Exports • रिपोर्ट व निर्यात</h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Printable PDF reports with KKSInfraWorks official letterhead & downloadable CSV sheets
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Report Type
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as ReportType)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
            >
              <option value="attendance_daily">Daily Attendance Report</option>
              <option value="worker_register">Worker Profile & Wage Register</option>
              <option value="advance_ledger">Worker Advance & Balance Ledger</option>
              <option value="daily_work_report">Daily Site Work Report</option>
              <option value="planned_vs_completed">Planned vs Actual Work Progress</option>
              <option value="site_expenses">Site Expense Register</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Filter by Site
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
            >
              <option value="all">All Construction Sites</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Official Printable Report Container */}
      <div className="bg-slate-950 text-slate-100 p-6 sm:p-8 rounded-3xl border border-slate-800 print:border-none print:p-0 print:m-0 print:bg-white print:text-black shadow-2xl">
        {/* Official Header */}
        <div className="border-b-2 border-amber-500 pb-4 mb-6 print:border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                <HardHat className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white print:text-black">
                  KKS<span className="text-amber-500">Infra</span>Works
                </h1>
                <p className="text-xs font-bold text-amber-400 print:text-black uppercase tracking-wider">
                  Civil Construction, Shuttering and Labour Contractor Supplier
                </p>
                <p className="text-[11px] text-slate-400 print:text-gray-700">
                  Proprietor: <strong>Kalindra Kumar Singh</strong> • Established: 2002
                </p>
                <p className="text-[11px] text-slate-400 print:text-gray-700">
                  Address: Bargawn Road, Mairwa, Bihar – 841239
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400 print:text-gray-700">
              <p className="font-semibold text-white print:text-black">
                Generated: {new Date().toLocaleDateString('en-IN')}
              </p>
              <p>User: {user?.name} ({user?.role === 'admin' ? 'Proprietor' : 'Site Manager'})</p>
              <p>Site: {selectedSite?.name || 'All Sites'}</p>
            </div>
          </div>
        </div>

        {/* Report Sub-Title */}
        <div className="mb-4">
          <h2 className="text-base font-bold text-amber-400 print:text-black uppercase tracking-wider">
            {selectedReport === 'attendance_daily' && `Daily Attendance Sheet • ${selectedDate}`}
            {selectedReport === 'worker_register' && 'Labour & Worker Registration Register'}
            {selectedReport === 'advance_ledger' && 'Worker Advance & Adjustment Ledger'}
            {selectedReport === 'daily_work_report' && `Site Daily Work Progress Report • ${selectedDate}`}
            {selectedReport === 'planned_vs_completed' && 'Planned vs Actual Execution Comparison'}
            {selectedReport === 'site_expenses' && 'Construction Site Expense Summary'}
          </h2>
        </div>

        {/* Report Content Table */}
        <div className="overflow-x-auto">
          {/* DAILY ATTENDANCE */}
          {selectedReport === 'attendance_daily' && (
            <table className="w-full text-left text-xs border border-slate-800 print:border-gray-400">
              <thead className="bg-slate-900 print:bg-gray-100 text-slate-300 print:text-black font-bold uppercase text-[10px] border-b border-slate-800 print:border-gray-400">
                <tr>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">ID</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Worker Name</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Trade</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Site</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Status</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">OT (hrs)</th>
                  <th className="p-2">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {attendance
                  .filter(
                    (a) => (!selectedDate || a.date === selectedDate) && (selectedSiteId === 'all' || a.siteId === selectedSiteId)
                  )
                  .map((a) => (
                    <tr key={a.id} className="hover:bg-slate-900/40">
                      <td className="p-2 font-mono font-bold text-amber-400 print:text-black border-r border-slate-800 print:border-gray-300">
                        {a.workerId}
                      </td>
                      <td className="p-2 font-semibold text-white print:text-black border-r border-slate-800 print:border-gray-300">
                        {a.workerName}
                      </td>
                      <td className="p-2 text-slate-300 print:text-black border-r border-slate-800 print:border-gray-300">
                        {a.workerTrade}
                      </td>
                      <td className="p-2 text-slate-300 print:text-black border-r border-slate-800 print:border-gray-300">
                        {a.siteName}
                      </td>
                      <td className="p-2 font-bold uppercase border-r border-slate-800 print:border-gray-300">
                        <span
                          className={
                            a.status === 'present'
                              ? 'text-emerald-400 print:text-black'
                              : a.status === 'absent'
                              ? 'text-rose-400 print:text-black'
                              : 'text-amber-400 print:text-black'
                          }
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="p-2 text-center border-r border-slate-800 print:border-gray-300 font-bold">
                        {a.overtimeHours || '-'}
                      </td>
                      <td className="p-2 text-slate-400 print:text-gray-700 italic">{a.remarks || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* WORKER WAGE REGISTER */}
          {selectedReport === 'worker_register' && (
            <table className="w-full text-left text-xs border border-slate-800 print:border-gray-400">
              <thead className="bg-slate-900 print:bg-gray-100 text-slate-300 print:text-black font-bold uppercase text-[10px] border-b border-slate-800 print:border-gray-400">
                <tr>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">ID</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Name & Father</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Mobile</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Village / Address</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Trade & Skill</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Daily Rate (₹)</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Site</th>
                  <th className="p-2">Outstanding Bal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {workers.map((w) => {
                  const bal = advanceBalances[w.id]?.balance || 0;
                  return (
                    <tr key={w.id}>
                      <td className="p-2 font-mono font-bold text-amber-400 print:text-black border-r border-slate-800 print:border-gray-300">
                        {w.id}
                      </td>
                      <td className="p-2 font-bold text-white print:text-black border-r border-slate-800 print:border-gray-300">
                        {w.name} {w.fatherName ? `(S/o ${w.fatherName})` : ''}
                      </td>
                      <td className="p-2 text-slate-300 print:text-black border-r border-slate-800 print:border-gray-300">
                        {w.mobile}
                      </td>
                      <td className="p-2 text-slate-400 print:text-gray-700 border-r border-slate-800 print:border-gray-300">
                        {w.villageAddress}
                      </td>
                      <td className="p-2 text-slate-300 print:text-black border-r border-slate-800 print:border-gray-300">
                        {w.workCategory} ({w.skillLevel})
                      </td>
                      <td className="p-2 font-bold text-white print:text-black border-r border-slate-800 print:border-gray-300">
                        ₹{w.rate}
                      </td>
                      <td className="p-2 text-slate-300 print:text-black border-r border-slate-800 print:border-gray-300">
                        {w.assignedSiteName}
                      </td>
                      <td className="p-2 font-bold text-amber-400 print:text-black">
                        ₹{bal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* ADVANCE REGISTER */}
          {selectedReport === 'advance_ledger' && (
            <table className="w-full text-left text-xs border border-slate-800 print:border-gray-400">
              <thead className="bg-slate-900 print:bg-gray-100 text-slate-300 print:text-black font-bold uppercase text-[10px] border-b border-slate-800 print:border-gray-400">
                <tr>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Date</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Worker</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Type</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Amount (₹)</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Payment Mode</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Purpose</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Ref #</th>
                  <th className="p-2">Entered By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {advances.map((a) => (
                  <tr key={a.id}>
                    <td className="p-2 border-r border-slate-800 print:border-gray-300">{a.date}</td>
                    <td className="p-2 font-bold text-white print:text-black border-r border-slate-800 print:border-gray-300">
                      {a.workerName} ({a.workerId})
                    </td>
                    <td className="p-2 uppercase font-semibold border-r border-slate-800 print:border-gray-300">
                      {a.type}
                    </td>
                    <td className="p-2 font-bold text-amber-400 print:text-black border-r border-slate-800 print:border-gray-300">
                      ₹{a.amount}
                    </td>
                    <td className="p-2 border-r border-slate-800 print:border-gray-300">{a.paymentMethod}</td>
                    <td className="p-2 text-slate-300 print:text-black border-r border-slate-800 print:border-gray-300">
                      {a.purpose}
                    </td>
                    <td className="p-2 font-mono text-[11px] border-r border-slate-800 print:border-gray-300">
                      {a.referenceNumber || '-'}
                    </td>
                    <td className="p-2 text-slate-400 print:text-gray-700">{a.enteredByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* DAILY WORK REPORT */}
          {selectedReport === 'daily_work_report' && (
            <div className="space-y-4">
              {siteReports
                .filter(
                  (r) => (!selectedDate || r.reportDate === selectedDate) && (selectedSiteId === 'all' || r.siteId === selectedSiteId)
                )
                .map((r) => (
                  <div
                    key={r.id}
                    className="p-4 border border-slate-800 print:border-gray-400 rounded-xl space-y-2"
                  >
                    <div className="flex justify-between items-start font-bold">
                      <span className="text-white print:text-black text-sm">
                        {r.siteName} — {r.workLocation} ({r.workCategory})
                      </span>
                      <span className="text-emerald-400 print:text-black">
                        {r.quantityCompleted} {r.unit} Completed
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 print:text-black whitespace-pre-line italic">
                      "{r.descriptionHindiEnglish}"
                    </p>
                    <div className="text-[11px] text-slate-400 print:text-gray-700 flex justify-between pt-1 border-t border-slate-800 print:border-gray-300">
                      <span>Supervisor: {r.supervisorName} | {r.workersCount} Workers</span>
                      <span>Materials: {r.materialsUsed || 'Standard site stock'}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* PLANNED VS ACTUAL PROGRESS */}
          {selectedReport === 'planned_vs_completed' && (
            <div className="space-y-3">
              {nextDayPlans.map((p) => {
                const actual = siteReports.find(
                  (r) => r.siteId === p.siteId && r.reportDate === p.planDate
                );
                return (
                  <div
                    key={p.id}
                    className="p-3.5 border border-slate-800 print:border-gray-400 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400 print:text-black">
                        Planned Target ({p.planDate})
                      </span>
                      <h4 className="text-xs font-bold text-white print:text-black">{p.siteName}</h4>
                      <p className="text-xs text-slate-300 print:text-gray-800 mt-1">{p.expectedWork}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Status: {p.status}</p>
                    </div>

                    <div className="border-t sm:border-t-0 sm:border-l border-slate-800 print:border-gray-300 pt-2 sm:pt-0 sm:pl-3">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 print:text-black">
                        Actual Execution Reported
                      </span>
                      {actual ? (
                        <div className="text-xs text-slate-300 print:text-gray-800 mt-1 space-y-0.5">
                          <p className="font-bold text-emerald-400 print:text-black">
                            {actual.quantityCompleted} {actual.unit} Done
                          </p>
                          <p>{actual.workCompletedToday}</p>
                          <p className="text-[10px] text-slate-500">By: {actual.supervisorName}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic mt-1">
                          No matching execution report filed for this target date.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SITE EXPENSES */}
          {selectedReport === 'site_expenses' && (
            <table className="w-full text-left text-xs border border-slate-800 print:border-gray-400">
              <thead className="bg-slate-900 print:bg-gray-100 text-slate-300 print:text-black font-bold uppercase text-[10px] border-b border-slate-800 print:border-gray-400">
                <tr>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Date</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Site</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Category</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Description</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Amount (₹)</th>
                  <th className="p-2 border-r border-slate-800 print:border-gray-300">Paid By</th>
                  <th className="p-2">Bill / Memo #</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="p-2 border-r border-slate-800 print:border-gray-300">{e.date}</td>
                    <td className="p-2 font-semibold text-white print:text-black border-r border-slate-800 print:border-gray-300">
                      {e.siteName}
                    </td>
                    <td className="p-2 border-r border-slate-800 print:border-gray-300">{e.category}</td>
                    <td className="p-2 text-slate-300 print:text-black border-r border-slate-800 print:border-gray-300">
                      {e.description}
                    </td>
                    <td className="p-2 font-bold text-amber-400 print:text-black border-r border-slate-800 print:border-gray-300">
                      ₹{e.amount}
                    </td>
                    <td className="p-2 border-r border-slate-800 print:border-gray-300">{e.paidBy}</td>
                    <td className="p-2 text-slate-400 print:text-gray-700">{e.referenceNumber || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Official Sign-off block at bottom of printed report */}
        <div className="mt-12 pt-6 border-t border-slate-800 print:border-black flex items-center justify-between text-xs text-slate-400 print:text-black">
          <div>
            <p className="font-bold text-white print:text-black">Prepared By:</p>
            <p>{user?.name} ({user?.role === 'admin' ? 'Proprietor' : 'Site Manager'})</p>
          </div>

          <div className="text-right">
            <p className="font-bold text-white print:text-black">For KKSInfraWorks:</p>
            <div className="mt-8 border-t border-slate-600 print:border-black pt-1 w-44 inline-block text-center">
              <span>Kalindra Kumar Singh</span>
              <span className="block text-[10px] text-slate-400 print:text-gray-600">Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
