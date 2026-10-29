import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { AttendanceStatus, Worker, AttendanceRecord } from '../../types';
import { WorkerProfileModal } from '../workers/WorkerProfileModal';
import {
  CalendarCheck2,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  Save,
  Search,
  UserCheck,
  UserX,
  Printer,
  Download,
  AlertCircle,
  Sparkles,
  Info,
  DollarSign,
  Utensils,
  ChevronDown,
  Layers,
  FileText,
  Trash2,
  Share2,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { user } = useAuth();
  const { workers, sites, attendance, saveAttendanceBatch, deleteAttendanceRecord } = useData();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || 'SITE-01');
  const [viewMode, setViewMode] = useState<'mark' | 'history'>('mark');
  const [searchFilter, setSearchFilter] = useState('');
  const [historyWorkerFilter, setHistoryWorkerFilter] = useState('all');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Profile modal
  const [profileWorker, setProfileWorker] = useState<Worker | null>(null);

  // Active workers
  const activeWorkers = useMemo(() => {
    return workers.filter((w) => w.status === 'active');
  }, [workers]);

  const selectedSite = useMemo(() => {
    return sites.find((s) => s.id === selectedSiteId) || sites[0];
  }, [sites, selectedSiteId]);

  // Extended local attendance entry map
  const [entryMap, setEntryMap] = useState<
    Record<
      string,
      {
        status: AttendanceStatus;
        hoursWorked: number;
        overtimeHours: number;
        foodAllowance: number;
        isWageOverridden: boolean;
        overrideWage: number | '';
        overrideReason: string;
        checkInTime: string;
        checkOutTime: string;
        remarks: string;
      }
    >
  >({});

  // Sync existing attendance records for the selected site and date
  useEffect(() => {
    const existingForSiteDate = attendance.filter(
      (a) => a.date === selectedDate && a.siteId === selectedSiteId
    );

    const initialMap: Record<string, any> = {};

    activeWorkers.forEach((w) => {
      const match = existingForSiteDate.find((e) => e.workerId === w.id);
      if (match) {
        initialMap[w.id] = {
          status: match.status,
          hoursWorked: match.hoursWorked !== undefined ? match.hoursWorked : (match.status === 'present_hourly' ? 4 : match.status === 'half_day' ? 4 : 8),
          overtimeHours: match.overtimeHours || 0,
          foodAllowance: match.foodAllowanceEarned || 0,
          isWageOverridden: !!match.isWageOverridden,
          overrideWage: match.overrideWage !== undefined ? match.overrideWage : '',
          overrideReason: match.overrideReason || '',
          checkInTime: match.checkInTime || '08:00 AM',
          checkOutTime: match.checkOutTime || '05:00 PM',
          remarks: match.remarks || '',
        };
      } else {
        const isAssigned = w.assignedSiteId === selectedSiteId;
        initialMap[w.id] = {
          status: isAssigned ? 'present' : 'absent',
          hoursWorked: 8,
          overtimeHours: 0,
          foodAllowance: 0,
          isWageOverridden: false,
          overrideWage: '',
          overrideReason: '',
          checkInTime: '08:00 AM',
          checkOutTime: '05:00 PM',
          remarks: isAssigned ? '' : '',
        };
      }
    });

    setEntryMap(initialMap);
  }, [selectedDate, selectedSiteId, attendance, activeWorkers]);

  // Find other site attendances for each worker on selected date
  const otherSitesByWorker = useMemo(() => {
    const map: Record<string, Array<{ siteName: string; hours: number; status: string }>> = {};
    attendance
      .filter((a) => a.date === selectedDate && a.siteId !== selectedSiteId)
      .forEach((a) => {
        if (!map[a.workerId]) map[a.workerId] = [];
        const hrs = a.status === 'present_hourly' ? (a.hoursWorked || 0) : a.status === 'half_day' ? 4 : 8;
        map[a.workerId].push({
          siteName: a.siteName,
          hours: hrs,
          status: a.status,
        });
      });
    return map;
  }, [attendance, selectedDate, selectedSiteId]);

  const handleUpdateWorker = (workerId: string, field: string, value: any) => {
    setEntryMap((prev) => ({
      ...prev,
      [workerId]: {
        ...(prev[workerId] || {
          status: 'present',
          hoursWorked: 8,
          overtimeHours: 0,
          foodAllowance: 0,
          isWageOverridden: false,
          overrideWage: '',
          overrideReason: '',
          checkInTime: '08:00 AM',
          checkOutTime: '05:00 PM',
          remarks: '',
        }),
        [field]: value,
      },
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setEntryMap((prev) => {
      const next = { ...prev };
      activeWorkers.forEach((w) => {
        next[w.id] = {
          ...(next[w.id] || {}),
          status,
          hoursWorked: status === 'present' || status === 'present_full' ? 8 : status === 'half_day' ? 4 : 8,
        };
      });
      return next;
    });
  };

  // Summary counts
  const summary = useMemo(() => {
    let fullDay = 0;
    let hourlyCount = 0;
    let halfDay = 0;
    let absent = 0;
    let leave = 0;
    let totalHours = 0;
    let totalOt = 0;
    let totalEstWages = 0;

    activeWorkers.forEach((w) => {
      const e = entryMap[w.id];
      if (!e) return;
      const hourlyRate = Math.round(w.rate / 8);

      if (e.status === 'present' || e.status === 'present_full') {
        fullDay++;
        totalHours += 8;
        totalEstWages += e.isWageOverridden && e.overrideWage !== '' ? Number(e.overrideWage) : w.rate;
      } else if (e.status === 'present_hourly') {
        hourlyCount++;
        const h = Number(e.hoursWorked) || 0;
        totalHours += h;
        totalEstWages += e.isWageOverridden && e.overrideWage !== '' ? Number(e.overrideWage) : Math.round(h * hourlyRate);
      } else if (e.status === 'half_day') {
        halfDay++;
        totalHours += 4;
        totalEstWages += e.isWageOverridden && e.overrideWage !== '' ? Number(e.overrideWage) : Math.round(w.rate / 2);
      } else if (e.status === 'absent') {
        absent++;
      } else {
        leave++;
      }

      const ot = Number(e.overtimeHours) || 0;
      totalOt += ot;
      totalEstWages += Math.round(ot * hourlyRate * 1.5);
    });

    return { fullDay, hourlyCount, halfDay, absent, leave, totalHours, totalOt, totalEstWages };
  }, [entryMap, activeWorkers]);

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const recordsToSave = activeWorkers.map((w) => {
        const entry = entryMap[w.id] || {
          status: 'present',
          hoursWorked: 8,
          overtimeHours: 0,
          foodAllowance: 0,
          isWageOverridden: false,
          overrideWage: '',
          overrideReason: '',
          checkInTime: '08:00 AM',
          checkOutTime: '05:00 PM',
          remarks: '',
        };

        const hourlyRate = Math.round(w.rate / 8);
        let calcWage = 0;
        let hrs = Number(entry.hoursWorked) || 0;

        if (entry.status === 'present' || entry.status === 'present_full') {
          hrs = 8;
          calcWage = w.rate;
        } else if (entry.status === 'half_day') {
          hrs = 4;
          calcWage = Math.round(w.rate / 2);
        } else if (entry.status === 'present_hourly') {
          calcWage = Math.round(hrs * hourlyRate);
        } else {
          hrs = 0;
          calcWage = 0;
        }

        if (entry.isWageOverridden && entry.overrideWage !== '') {
          calcWage = Number(entry.overrideWage);
        }

        return {
          workerId: w.id,
          workerName: w.name,
          status: entry.status,
          hoursWorked: hrs,
          dailyWage: w.rate,
          hourlyWage: hourlyRate,
          calculatedWage: calcWage,
          isWageOverridden: entry.isWageOverridden,
          overrideWage: entry.overrideWage !== '' ? Number(entry.overrideWage) : undefined,
          overrideReason: entry.overrideReason,
          foodAllowanceEarned: Number(entry.foodAllowance) || 0,
          checkInTime: entry.checkInTime,
          checkOutTime: entry.checkOutTime,
          overtimeHours: Number(entry.overtimeHours) || 0,
          remarks: entry.remarks,
        };
      });

      await saveAttendanceBatch(selectedSiteId, selectedDate, recordsToSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return attendance
      .filter((a) => {
        const matchSite = selectedSiteId === 'all' || a.siteId === selectedSiteId;
        const matchWorker = historyWorkerFilter === 'all' || a.workerId === historyWorkerFilter;
        const matchSearch =
          !searchFilter ||
          a.workerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
          a.workerId.toLowerCase().includes(searchFilter.toLowerCase()) ||
          a.siteName.toLowerCase().includes(searchFilter.toLowerCase());
        return matchSite && matchWorker && matchSearch;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendance, selectedSiteId, historyWorkerFilter, searchFilter]);

  return (
    <div className="space-y-4 pb-24 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      {/* Title & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-amber-500" />
            <h1 className="text-lg font-bold text-white">Daily & Hourly Attendance System • दैनिक एवं घंटेवार हाजिरी</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full Day (8h), Hourly Attendance (1-8h+), Half Day, Multi-Site Shift Tracking & Wage Calculations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
            <button
              onClick={() => setViewMode('mark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'mark'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mark Attendance
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'history'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Attendance History ({attendance.length})
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'mark' ? (
        <>
          {/* Site and Date Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Attendance Date (तारीख)</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Construction Site (साइट का चयन)</span>
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 font-bold"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.siteAddress})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Full Day (8h)</span>
              <p className="text-xl font-black text-emerald-400">{summary.fullDay}</p>
            </div>
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Hourly Work</span>
              <p className="text-xl font-black text-sky-400">{summary.hourlyCount}</p>
            </div>
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Half Day (4h)</span>
              <p className="text-xl font-black text-amber-400">{summary.halfDay}</p>
            </div>
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Absent / Leave</span>
              <p className="text-xl font-black text-rose-400">{summary.absent + summary.leave}</p>
            </div>
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Hours</span>
              <p className="text-xl font-black text-white">{summary.totalHours + summary.totalOt} hrs</p>
            </div>
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Est. Labour Cost</span>
              <p className="text-xl font-black text-emerald-400">₹{summary.totalEstWages.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Quick Batch Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Quick Set All Workers:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleMarkAll('present')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
              >
                All Full Day (8h)
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('absent')}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition"
              >
                All Absent
              </button>
            </div>
          </div>

          {/* Notifications */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>✓ Attendance records saved successfully to local database.</span>
            </div>
          )}
          {saveError && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Workers Attendance List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Worker Attendance Roster ({activeWorkers.length} Active Workers)
              </span>
              <span className="text-xs text-amber-400 font-bold">{selectedSite?.name}</span>
            </div>

            <div className="divide-y divide-slate-800">
              {activeWorkers.map((w) => {
                const entry = entryMap[w.id] || {
                  status: 'present',
                  hoursWorked: 8,
                  overtimeHours: 0,
                  foodAllowance: 0,
                  isWageOverridden: false,
                  overrideWage: '',
                  overrideReason: '',
                  checkInTime: '08:00 AM',
                  checkOutTime: '05:00 PM',
                  remarks: '',
                };

                const isPresent = entry.status === 'present' || entry.status === 'present_full';
                const isHourly = entry.status === 'present_hourly';
                const isHalfDay = entry.status === 'half_day';
                const isAbsent = entry.status === 'absent';
                const isLeave = entry.status === 'leave';

                const hourlyWage = Math.round(w.rate / 8);
                const computedWage = isPresent
                  ? w.rate
                  : isHalfDay
                  ? Math.round(w.rate / 2)
                  : isHourly
                  ? Math.round((Number(entry.hoursWorked) || 0) * hourlyWage)
                  : 0;
                const effectiveWage =
                  entry.isWageOverridden && entry.overrideWage !== ''
                    ? Number(entry.overrideWage)
                    : computedWage;

                const otherSiteShifts = otherSitesByWorker[w.id] || [];

                return (
                  <div
                    key={w.id}
                    className={`p-3.5 sm:p-4 transition flex flex-col gap-3 ${
                      isAbsent
                        ? 'bg-rose-950/10'
                        : isHalfDay
                        ? 'bg-amber-950/10'
                        : isHourly
                        ? 'bg-sky-950/10'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    {/* Worker Info Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setProfileWorker(w)}
                          className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-amber-500/40 shrink-0 cursor-pointer hover:scale-105 transition"
                          title="Click to view full Hisab-Kitaab profile"
                        >
                          {w.photo ? (
                            <img src={w.photo} alt={w.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm bg-slate-800">
                              {w.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded">
                              {w.id}
                            </span>
                            <h4
                              onClick={() => setProfileWorker(w)}
                              className="text-xs sm:text-sm font-bold text-white hover:text-amber-400 cursor-pointer"
                            >
                              {w.name}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {w.workCategory} • Daily Rate: <strong className="text-white">₹{w.rate}</strong> (₹{hourlyWage}/hr)
                          </p>
                        </div>
                      </div>

                      {/* Multi-site worked indication */}
                      {otherSiteShifts.length > 0 && (
                        <div className="flex items-center gap-1 text-[11px] bg-sky-500/15 border border-sky-500/30 text-sky-300 px-2.5 py-1 rounded-xl">
                          <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>
                            Also at: {otherSiteShifts.map((s) => `${s.siteName} (${s.hours}h)`).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Toggle Row */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateWorker(w.id, 'status', 'present')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          isPresent
                            ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Full Day (8h)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateWorker(w.id, 'status', 'present_hourly')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          isHourly
                            ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Hourly Work (घंटेवार)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateWorker(w.id, 'status', 'half_day')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          isHalfDay
                            ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Half Day (4h)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateWorker(w.id, 'status', 'absent')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          isAbsent
                            ? 'bg-rose-500 text-white shadow-md font-extrabold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Absent</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateWorker(w.id, 'status', 'leave')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                          isLeave
                            ? 'bg-purple-500 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        Leave
                      </button>
                    </div>

                    {/* Detailed Inputs: Hours, Wage calculation, Overtime, Food Allowance, Remarks */}
                    {(isPresent || isHourly || isHalfDay) && (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        {/* Hours Worked (editable for hourly work) */}
                        <div>
                          <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                            Hours Worked
                          </label>
                          {isHourly ? (
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              max="24"
                              value={entry.hoursWorked}
                              onChange={(e) =>
                                handleUpdateWorker(w.id, 'hoursWorked', parseFloat(e.target.value) || 0)
                              }
                              className="w-full bg-slate-800 border border-sky-500/50 rounded-lg px-2 py-1 text-xs text-white text-center font-bold focus:outline-hidden"
                            />
                          ) : (
                            <span className="block w-full py-1 text-xs text-slate-300 font-bold bg-slate-800/50 rounded-lg text-center border border-slate-700">
                              {isPresent ? '8 hrs' : '4 hrs'}
                            </span>
                          )}
                        </div>

                        {/* Overtime (OT) */}
                        <div>
                          <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                            OT Hours (1.5x)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="12"
                            value={entry.overtimeHours}
                            onChange={(e) =>
                              handleUpdateWorker(w.id, 'overtimeHours', parseFloat(e.target.value) || 0)
                            }
                            placeholder="0"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-semibold focus:outline-hidden focus:border-amber-500"
                          />
                        </div>

                        {/* Calculated / Effective Wage */}
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="text-[10px] text-slate-400 font-semibold">Wage (₹)</label>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateWorker(w.id, 'isWageOverridden', !entry.isWageOverridden)
                              }
                              className="text-[9px] text-amber-400 underline font-medium"
                            >
                              {entry.isWageOverridden ? 'Auto' : 'Override'}
                            </button>
                          </div>
                          {entry.isWageOverridden ? (
                            <input
                              type="number"
                              value={entry.overrideWage}
                              onChange={(e) =>
                                handleUpdateWorker(
                                  w.id,
                                  'overrideWage',
                                  e.target.value === '' ? '' : Number(e.target.value)
                                )
                              }
                              placeholder="₹ manual"
                              className="w-full bg-slate-800 border border-amber-500 rounded-lg px-2 py-1 text-xs text-amber-300 font-bold focus:outline-hidden"
                            />
                          ) : (
                            <span className="block w-full py-1 text-xs text-emerald-400 font-bold bg-slate-800/50 rounded-lg text-center border border-slate-700">
                              ₹{effectiveWage}
                            </span>
                          )}
                        </div>

                        {/* Food Allowance (Khoraki) for this shift */}
                        <div>
                          <label className="block text-[10px] text-purple-300 font-semibold mb-0.5 flex items-center gap-1">
                            <Utensils className="w-3 h-3 text-purple-400" />
                            <span>Food (खोराकी)</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={entry.foodAllowance || ''}
                            onChange={(e) =>
                              handleUpdateWorker(w.id, 'foodAllowance', Number(e.target.value) || 0)
                            }
                            placeholder="₹0"
                            className="w-full bg-slate-800 border border-purple-500/40 rounded-lg px-2 py-1 text-xs text-purple-300 font-semibold text-center focus:outline-hidden focus:border-purple-400"
                          />
                        </div>

                        {/* Remarks */}
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                            Remarks / Shift Notes
                          </label>
                          <input
                            type="text"
                            value={entry.remarks}
                            onChange={(e) => handleUpdateWorker(w.id, 'remarks', e.target.value)}
                            placeholder="e.g. Beam shuttering"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Override reason prompt if overridden */}
                    {entry.isWageOverridden && (
                      <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl text-xs flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-300 shrink-0">Override Reason:</span>
                        <input
                          type="text"
                          value={entry.overrideReason}
                          onChange={(e) => handleUpdateWorker(w.id, 'overrideReason', e.target.value)}
                          placeholder="e.g. Extra height shuttering bonus / special task approved by Kalindra Kumar Singh"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white placeholder-slate-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Save Bar Sticky Footer */}
            <div className="p-4 bg-slate-800/95 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky bottom-14 z-20 shadow-xl backdrop-blur-md">
              <div className="text-xs text-slate-300">
                <span>Site: <strong className="text-white">{selectedSite?.name}</strong> • Marked by: <strong className="text-amber-400">{user?.name}</strong></span>
              </div>

              <button
                onClick={handleSaveAttendance}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Attendance...' : 'Save & Sync Attendance Records'}</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* HISTORY VIEW */
        <div className="space-y-4">
          {/* History Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">Filter by Site</label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
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
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">Filter by Worker</label>
              <select
                value={historyWorkerFilter}
                onChange={(e) => setHistoryWorkerFilter(e.target.value)}
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
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">Search Record</label>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search by worker name, site, or date..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Worker Name</th>
                  <th className="p-3">Site Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Hours</th>
                  <th className="p-3 text-right">Wage Earned</th>
                  <th className="p-3 text-center">Food (खोराकी)</th>
                  <th className="p-3">Remarks / Reason</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filteredHistory.map((att) => {
                  const w = workers.find((item) => item.id === att.workerId);
                  const isHourly = att.status === 'present_hourly';
                  const isHalf = att.status === 'half_day';
                  const isPresent = att.status === 'present' || att.status === 'present_full';
                  const hrs = isHourly ? att.hoursWorked : isHalf ? 4 : isPresent ? 8 : 0;

                  return (
                    <tr key={att.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 font-mono font-medium text-slate-300">{att.date}</td>
                      <td className="p-3">
                        <button
                          onClick={() => w && setProfileWorker(w)}
                          className="font-bold text-white hover:text-amber-400 text-left"
                        >
                          {att.workerName}
                        </button>
                        <span className="block text-[10px] text-slate-500 font-mono">{att.workerId}</span>
                      </td>
                      <td className="p-3 text-slate-300 font-medium">{att.siteName}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isHourly
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : isPresent
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isHalf
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {isHourly ? `Hourly (${hrs}h)` : att.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white">{hrs} hrs</td>
                      <td className="p-3 text-right font-bold text-emerald-400">
                        ₹{att.calculatedWage || 0}
                      </td>
                      <td className="p-3 text-center text-purple-300 font-medium">
                        {att.foodAllowanceEarned ? `₹${att.foodAllowanceEarned}` : '—'}
                      </td>
                      <td className="p-3 text-slate-400 text-[11px] max-w-xs truncate">
                        {att.remarks || (att.isWageOverridden ? `Overridden: ${att.overrideReason}` : '—')}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => w && setProfileWorker(w)}
                          className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold transition mr-1"
                        >
                          Ledger
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete attendance record for ${att.workerName} on ${att.date}?`)) {
                              deleteAttendanceRecord(att.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Worker Profile Modal */}
      <WorkerProfileModal
        isOpen={!!profileWorker}
        onClose={() => setProfileWorker(null)}
        worker={profileWorker}
      />
    </div>
  );
};
