import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Worker,
  ConstructionSite,
  AttendanceRecord,
  AdvancePayment,
  SalaryPayment,
  DailyWorkReport,
  NextDayPlan,
  SiteExpense,
  MediaItem,
  AuditLog,
  DashboardMetrics,
  WorkerAccountStatement,
  FoodAllowanceRecord,
  WorkerLedgerEntry,
} from '../types';
import { localDb, DEFAULT_KKS_SITES } from '../services/localDb';
import { useAuth } from './AuthContext';

interface DataContextType {
  workers: Worker[];
  sites: ConstructionSite[];
  attendance: AttendanceRecord[];
  advances: AdvancePayment[];
  salaryPayments: SalaryPayment[];
  siteReports: DailyWorkReport[];
  nextDayPlans: NextDayPlan[];
  expenses: SiteExpense[];
  media: MediaItem[];
  auditLogs: AuditLog[];
  metrics: DashboardMetrics | null;
  foodAllowances: FoodAllowanceRecord[];
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  triggerSync: () => Promise<void>;

  // Worker actions
  createWorker: (data: Partial<Worker>) => Promise<Worker>;
  updateWorker: (id: string, data: Partial<Worker>) => Promise<Worker>;
  deleteWorker: (id: string) => Promise<void>;

  // Site actions
  createSite: (data: Partial<ConstructionSite>) => Promise<ConstructionSite>;
  updateSite: (id: string, data: Partial<ConstructionSite>) => Promise<ConstructionSite>;
  deleteSite: (id: string) => Promise<void>;
  renameSite: (siteId: string, newName: string) => Promise<ConstructionSite>;
  resetToStandardSites: () => Promise<void>;

  // Attendance actions
  saveAttendanceBatch: (
    siteId: string,
    date: string,
    records: Array<{
      workerId: string;
      workerName?: string;
      status: string;
      hoursWorked?: number;
      dailyWage?: number;
      hourlyWage?: number;
      calculatedWage?: number;
      isWageOverridden?: boolean;
      overrideWage?: number;
      overrideReason?: string;
      foodAllowanceEarned?: number;
      linkedSiteWorkId?: string;
      checkInTime?: string;
      checkOutTime?: string;
      overtimeHours?: number;
      remarks?: string;
    }>
  ) => Promise<void>;
  deleteAttendanceRecord: (id: string) => Promise<void>;

  // Food Allowance actions
  createFoodAllowance: (data: Partial<FoodAllowanceRecord>) => Promise<FoodAllowanceRecord>;
  updateFoodAllowance: (id: string, data: Partial<FoodAllowanceRecord>) => Promise<FoodAllowanceRecord>;
  deleteFoodAllowance: (id: string) => Promise<void>;

  // Advance actions
  createAdvance: (data: Partial<AdvancePayment>) => Promise<AdvancePayment>;
  updateAdvance: (id: string, data: Partial<AdvancePayment>) => Promise<AdvancePayment>;
  deleteAdvance: (id: string) => Promise<void>;

  // Site Reports actions
  createSiteReport: (data: Partial<DailyWorkReport>) => Promise<DailyWorkReport>;
  updateSiteReport: (id: string, data: Partial<DailyWorkReport>) => Promise<DailyWorkReport>;
  deleteSiteReport: (id: string) => Promise<void>;

  // Next Day Plans actions
  createNextDayPlan: (data: Partial<NextDayPlan>) => Promise<NextDayPlan>;
  updateNextDayPlan: (id: string, data: Partial<NextDayPlan>) => Promise<NextDayPlan>;
  deleteNextDayPlan: (id: string) => Promise<void>;
  copyIncompleteTasks: (fromDate?: string, toDate?: string) => Promise<number>;

  // Expenses actions
  createExpense: (data: Partial<SiteExpense>) => Promise<SiteExpense>;
  updateExpense: (id: string, data: Partial<SiteExpense>) => Promise<SiteExpense>;
  deleteExpense: (id: string) => Promise<void>;

  // Media actions
  uploadMediaFiles: (formData: FormData) => Promise<MediaItem[]>;
  uploadCameraPhoto: (dataUrl: string, caption: string, siteId: string, reportId?: string) => Promise<MediaItem>;
  deleteMediaItem: (id: string) => Promise<void>;

  // Salary & Worker Account Statements
  createSalaryPayment: (data: Partial<SalaryPayment>) => Promise<SalaryPayment>;
  getWorkerStatement: (workerId: string, monthStr?: string) => WorkerAccountStatement | null;
  getWorkerStatementWithRange: (
    workerId: string,
    rangeKey?: string,
    customStart?: string,
    customEnd?: string
  ) => WorkerAccountStatement | null;

  // Reset / Demo
  resetDemoData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [foodAllowances, setFoodAllowances] = useState<FoodAllowanceRecord[]>([]);
  const [advances, setAdvances] = useState<AdvancePayment[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [siteReports, setSiteReports] = useState<DailyWorkReport[]>([]);
  const [nextDayPlans, setNextDayPlans] = useState<NextDayPlan[]>([]);
  const [expenses, setExpenses] = useState<SiteExpense[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());
  const [syncError, setSyncError] = useState<string | null>(null);

  // Monitor network status for UI indication
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Compute metrics from local state
  const computeMetricsLocally = useCallback(
    (
      wList: Worker[],
      sList: ConstructionSite[],
      attList: AttendanceRecord[],
      advList: AdvancePayment[],
      repList: DailyWorkReport[],
      planList: NextDayPlan[],
      expList: SiteExpense[]
    ): DashboardMetrics => {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayAtt = attList.filter((a) => a.date === todayStr);

      const presentCount = todayAtt.filter((a) => a.status === 'present').length;
      const absentCount = todayAtt.filter((a) => a.status === 'absent').length;
      const halfDayCount = todayAtt.filter((a) => a.status === 'half_day').length;
      const leaveCount = todayAtt.filter((a) => a.status === 'leave').length;

      const totalAdvances = advList
        .filter((a) => a.type === 'advance')
        .reduce((sum, a) => sum + Number(a.amount || 0), 0);
      const totalRepayments = advList
        .filter((a) => a.type === 'repayment' || a.type === 'salary_deduction')
        .reduce((sum, a) => sum + Number(a.amount || 0), 0);

      const activeSites = sList.filter((s) => s.status === 'active' || s.status === 'in_progress').length;
      const todayReportsCount = repList.filter((r) => r.reportDate === todayStr).length;
      const pendingTasksCount = planList.filter((p) => p.status === 'planned' || p.status === 'in_progress').length;

      const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const tomorrowPlans = planList.filter((p) => p.planDate === tomorrowStr || p.planDate === todayStr).length;

      const todayExp = expList
        .filter((e) => e.date === todayStr)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      // Labour cost calculation
      const workerRateMap = new Map<string, number>();
      wList.forEach((w) => workerRateMap.set(w.id, Number(w.rate || 0)));

      let labourCost = 0;
      todayAtt.forEach((rec) => {
        const rate = workerRateMap.get(rec.workerId) || 0;
        const otHours = rec.overtimeHours || 0;
        const otPay = otHours * ((rate / 8) * 1.5);

        if (rec.status === 'present') {
          labourCost += rate + otPay;
        } else if (rec.status === 'half_day') {
          labourCost += rate / 2 + otPay;
        }
      });

      const totalWorkersCount = wList.filter((w) => w.status === 'active').length;
      const outstandingAdvance = Math.max(0, totalAdvances - totalRepayments);

      return {
        totalRegisteredWorkers: totalWorkersCount,
        totalWorkers: totalWorkersCount,
        workersPresentToday: presentCount,
        workersAbsentToday: absentCount,
        workersHalfDayToday: halfDayCount,
        workersOnLeaveToday: leaveCount,
        activeSitesCount: activeSites,
        workCompletedTodayCount: todayReportsCount,
        workPendingCount: pendingTasksCount,
        pendingWorkCount: pendingTasksCount,
        totalAdvancesRecorded: totalAdvances,
        totalAdvancesGiven: totalAdvances,
        outstandingWorkerAdvances: outstandingAdvance,
        totalOutstandingAdvance: outstandingAdvance,
        todaySiteExpenses: todayExp,
        tomorrowPlannedTasksCount: tomorrowPlans,
        totalDailyLabourCost: Math.round(labourCost),
      };
    },
    []
  );

  // Load all data from IndexedDB
  const loadData = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const [w, s, a, adv, sal, rep, p, exp, m, fa] = await Promise.all([
        localDb.getAll<Worker>('workers'),
        localDb.getAll<ConstructionSite>('sites'),
        localDb.getAll<AttendanceRecord>('attendance'),
        localDb.getAll<AdvancePayment>('advances'),
        localDb.getAll<SalaryPayment>('salaryPayments'),
        localDb.getAll<DailyWorkReport>('siteReports'),
        localDb.getAll<NextDayPlan>('nextDayPlans'),
        localDb.getAll<SiteExpense>('expenses'),
        localDb.getAll<MediaItem>('media'),
        localDb.getAll<FoodAllowanceRecord>('foodAllowances'),
      ]);

      // Sort reports and plans by date descending
      rep.sort((x, y) => (y.reportDate || '').localeCompare(x.reportDate || ''));
      p.sort((x, y) => (y.planDate || '').localeCompare(x.planDate || ''));
      adv.sort((x, y) => (y.date || '').localeCompare(x.date || ''));
      exp.sort((x, y) => (y.date || '').localeCompare(x.date || ''));
      m.sort((x, y) => (y.date || '').localeCompare(x.date || ''));
      fa.sort((x, y) => (y.date || '').localeCompare(x.date || ''));

      setWorkers(w);
      setSites(s);
      setAttendance(a);
      setAdvances(adv);
      setSalaryPayments(sal);
      setSiteReports(rep);
      setNextDayPlans(p);
      setExpenses(exp);
      setMedia(m);
      setFoodAllowances(fa);

      const mLoc = computeMetricsLocally(w, s, a, adv, rep, p, exp);
      setMetrics(mLoc);
      setLastSyncTime(new Date());
    } catch (err: any) {
      console.error('Failed to load local IndexedDB data:', err);
      setSyncError(err?.message || 'Failed to read local storage');
    } finally {
      setIsSyncing(false);
    }
  }, [computeMetricsLocally]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const triggerSync = async () => {
    await loadData();
  };

  // Log audit locally
  const addLocalAudit = (action: string, entityType: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      userName: user?.name || 'Local User',
      userRole: user?.role || 'user',
      action,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  // Worker CRUD
  const createWorker = async (data: Partial<Worker>): Promise<Worker> => {
    // Generate next worker ID (e.g. KKS009)
    let nextNum = 1;
    workers.forEach((w) => {
      const match = w.id.match(/KKS(\d+)/i);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val >= nextNum) nextNum = val + 1;
      }
    });
    const id = data.id || `KKS${nextNum.toString().padStart(3, '0')}`;

    const newWorker: Worker = {
      id,
      name: data.name || 'New Worker',
      fatherName: data.fatherName || '',
      photo: data.photo,
      mobile: data.mobile || '',
      village: data.village || '',
      district: data.district || 'Siwan',
      state: data.state || 'Bihar',
      fullAddress: data.fullAddress || '',
      emergencyContact: data.emergencyContact || '',
      joiningDate: data.joiningDate || new Date().toISOString().split('T')[0],
      workCategory: data.workCategory || 'Shuttering Carpenter',
      skillLevel: data.skillLevel || 'Skilled',
      designation: data.designation || 'Mistri',
      wageType: data.wageType || 'daily',
      rate: Number(data.rate) || 750,
      assignedSiteId: data.assignedSiteId || (sites[0]?.id || ''),
      assignedSiteName: data.assignedSiteName || (sites[0]?.name || ''),
      bankDetails: data.bankDetails,
      status: data.status || 'active',
      remarks: data.remarks || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await localDb.put('workers', newWorker);
    setWorkers((prev) => {
      const updated = [...prev, newWorker];
      setMetrics(computeMetricsLocally(updated, sites, attendance, advances, siteReports, nextDayPlans, expenses));
      return updated;
    });

    addLocalAudit('CREATE', 'Worker', newWorker.id, `Created worker ${newWorker.name} (${newWorker.id})`);
    return newWorker;
  };

  const updateWorker = async (id: string, data: Partial<Worker>): Promise<Worker> => {
    const existing = workers.find((w) => w.id === id);
    if (!existing) throw new Error('Worker not found');

    const updatedWorker: Worker = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await localDb.put('workers', updatedWorker);
    setWorkers((prev) => {
      const updated = prev.map((w) => (w.id === id ? updatedWorker : w));
      setMetrics(computeMetricsLocally(updated, sites, attendance, advances, siteReports, nextDayPlans, expenses));
      return updated;
    });

    addLocalAudit('UPDATE', 'Worker', id, `Updated worker ${updatedWorker.name}`);
    return updatedWorker;
  };

  const deleteWorker = async (id: string): Promise<void> => {
    await localDb.delete('workers', id);
    setWorkers((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      setMetrics(computeMetricsLocally(updated, sites, attendance, advances, siteReports, nextDayPlans, expenses));
      return updated;
    });
    addLocalAudit('DELETE', 'Worker', id, `Deleted worker ID ${id}`);
  };

  // Site CRUD
  const createSite = async (data: Partial<ConstructionSite>): Promise<ConstructionSite> => {
    const id = data.id || `SITE-0${sites.length + 1}`;
    const newSite: ConstructionSite = {
      id,
      name: data.name || 'New Project Site',
      clientName: data.clientName || 'Private Client',
      siteAddress: data.siteAddress || 'Mairwa, Bihar',
      supervisorName: data.supervisorName || user?.name || 'Supervisor',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      expectedCompletionDate: data.expectedCompletionDate || '',
      status: data.status || 'active',
      workCategories: data.workCategories || ['Shuttering Carpenter', 'Helper / Beldar'],
      assignedWorkersCount: data.assignedWorkersCount || 0,
      remarks: data.remarks || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await localDb.put('sites', newSite);
    setSites((prev) => {
      const updated = [...prev, newSite];
      setMetrics(computeMetricsLocally(workers, updated, attendance, advances, siteReports, nextDayPlans, expenses));
      return updated;
    });

    addLocalAudit('CREATE', 'Site', newSite.id, `Created site ${newSite.name}`);
    return newSite;
  };

  const updateSite = async (id: string, data: Partial<ConstructionSite>): Promise<ConstructionSite> => {
    const existing = sites.find((s) => s.id === id);
    if (!existing) throw new Error('Site not found');

    const updatedSite: ConstructionSite = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await localDb.put('sites', updatedSite);
    setSites((prev) => {
      const updated = prev.map((s) => (s.id === id ? updatedSite : s));
      setMetrics(computeMetricsLocally(workers, updated, attendance, advances, siteReports, nextDayPlans, expenses));
      return updated;
    });

    addLocalAudit('UPDATE', 'Site', id, `Updated site ${updatedSite.name}`);
    return updatedSite;
  };

  const deleteSite = async (id: string): Promise<void> => {
    await localDb.delete('sites', id);
    setSites((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      setMetrics(computeMetricsLocally(workers, updated, attendance, advances, siteReports, nextDayPlans, expenses));
      return updated;
    });
  };

  const renameSite = async (siteId: string, newName: string): Promise<ConstructionSite> => {
    const trimmedName = newName.trim();
    if (!trimmedName) throw new Error('Site name cannot be empty');

    const existing = sites.find((s) => s.id === siteId);
    if (!existing) throw new Error('Site not found');

    const updatedSite: ConstructionSite = {
      ...existing,
      name: trimmedName,
      updatedAt: new Date().toISOString(),
    };

    await localDb.put('sites', updatedSite);

    // Update workers assigned to this site
    const updatedWorkers = workers.map((w) =>
      w.assignedSiteId === siteId ? { ...w, assignedSiteName: trimmedName } : w
    );
    for (const w of updatedWorkers) {
      if (w.assignedSiteId === siteId) {
        await localDb.put('workers', w);
      }
    }
    setWorkers(updatedWorkers);

    // Update reports referencing this site
    const updatedReports = siteReports.map((r) =>
      r.siteId === siteId ? { ...r, siteName: trimmedName } : r
    );
    for (const r of updatedReports) {
      if (r.siteId === siteId) {
        await localDb.put('siteReports', r);
      }
    }
    setSiteReports(updatedReports);

    // Update attendance referencing this site
    const updatedAtt = attendance.map((a) =>
      a.siteId === siteId ? { ...a, siteName: trimmedName } : a
    );
    for (const a of updatedAtt) {
      if (a.siteId === siteId) {
        await localDb.put('attendance', a);
      }
    }
    setAttendance(updatedAtt);

    // Update next day plans
    const updatedPlans = nextDayPlans.map((p) =>
      p.siteId === siteId ? { ...p, siteName: trimmedName } : p
    );
    for (const p of updatedPlans) {
      if (p.siteId === siteId) {
        await localDb.put('nextDayPlans', p);
      }
    }
    setNextDayPlans(updatedPlans);

    // Update expenses
    const updatedExp = expenses.map((e) =>
      e.siteId === siteId ? { ...e, siteName: trimmedName } : e
    );
    for (const e of updatedExp) {
      if (e.siteId === siteId) {
        await localDb.put('expenses', e);
      }
    }
    setExpenses(updatedExp);

    setSites((prev) => {
      const updated = prev.map((s) => (s.id === siteId ? updatedSite : s));
      setMetrics(computeMetricsLocally(updatedWorkers, updated, updatedAtt, advances, updatedReports, updatedPlans, updatedExp));
      return updated;
    });

    addLocalAudit('UPDATE', 'Site', siteId, `Renamed site from "${existing.name}" to "${trimmedName}"`);
    return updatedSite;
  };

  const resetToStandardSites = async (): Promise<void> => {
    for (const site of DEFAULT_KKS_SITES) {
      await localDb.put('sites', site);
    }
    const freshSites = await localDb.getAll<ConstructionSite>('sites');
    setSites(freshSites);
    setMetrics(computeMetricsLocally(workers, freshSites, attendance, advances, siteReports, nextDayPlans, expenses));
    addLocalAudit('UPDATE', 'Site', 'ALL', 'Reset sites to 6 standard KKSInfraWorks sites');
  };

  // Attendance
  const saveAttendanceBatch = async (
    siteId: string,
    date: string,
    records: Array<{
      workerId: string;
      workerName?: string;
      status: string;
      hoursWorked?: number;
      dailyWage?: number;
      hourlyWage?: number;
      calculatedWage?: number;
      isWageOverridden?: boolean;
      overrideWage?: number;
      overrideReason?: string;
      foodAllowanceEarned?: number;
      linkedSiteWorkId?: string;
      checkInTime?: string;
      checkOutTime?: string;
      overtimeHours?: number;
      remarks?: string;
    }>
  ): Promise<void> => {
    const siteObj = sites.find((s) => s.id === siteId);
    const siteName = siteObj ? siteObj.name : 'Site';

    const updatedList = [...attendance];
    const newFoodAllowances: FoodAllowanceRecord[] = [...foodAllowances];

    for (const rec of records) {
      const wObj = workers.find((w) => w.id === rec.workerId);
      const baseDailyWage = rec.dailyWage !== undefined ? rec.dailyWage : (wObj?.rate || 750);
      const standardHourlyWage = rec.hourlyWage !== undefined ? rec.hourlyWage : Math.round(baseDailyWage / 8);

      let computedHours = 0;
      let computedWage = 0;

      const normStatus = rec.status as any;
      if (normStatus === 'present' || normStatus === 'present_full') {
        computedHours = 8;
        computedWage = baseDailyWage;
      } else if (normStatus === 'half_day') {
        computedHours = 4;
        computedWage = Math.round(baseDailyWage / 2);
      } else if (normStatus === 'present_hourly') {
        computedHours = Number(rec.hoursWorked) || 0;
        computedWage = Math.round(computedHours * standardHourlyWage);
      } else {
        // absent, leave, holiday
        computedHours = 0;
        computedWage = 0;
      }

      if (rec.isWageOverridden && rec.overrideWage !== undefined) {
        computedWage = Number(rec.overrideWage);
      }

      // Check existing by date + siteId + workerId OR date + workerId (if migrating from old single-site structure)
      const id = `att_${date}_${siteId}_${rec.workerId}`;
      const existingIdx = updatedList.findIndex(
        (a) => a.id === id || (a.date === date && a.siteId === siteId && a.workerId === rec.workerId)
      );

      const recordItem: AttendanceRecord = {
        id,
        date,
        siteId,
        siteName,
        workerId: rec.workerId,
        workerName: rec.workerName || wObj?.name || 'Worker',
        workerPhoto: wObj?.photo,
        workerTrade: wObj?.workCategory,
        status: normStatus,
        hoursWorked: computedHours,
        dailyWage: baseDailyWage,
        hourlyWage: standardHourlyWage,
        calculatedWage: computedWage,
        isWageOverridden: !!rec.isWageOverridden,
        overrideWage: rec.overrideWage,
        overrideReason: rec.overrideReason,
        foodAllowanceEarned: Number(rec.foodAllowanceEarned) || 0,
        linkedSiteWorkId: rec.linkedSiteWorkId,
        checkInTime: rec.checkInTime || '08:00 AM',
        checkOutTime: rec.checkOutTime || '05:00 PM',
        overtimeHours: Number(rec.overtimeHours) || 0,
        remarks: rec.remarks || '',
        markedBy: user?.name || 'Site Supervisor',
        createdAt: existingIdx >= 0 ? updatedList[existingIdx].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await localDb.put('attendance', recordItem);

      if (existingIdx >= 0) {
        updatedList[existingIdx] = recordItem;
      } else {
        updatedList.push(recordItem);
      }

      // Auto-sync food allowance earned if specified
      if (rec.foodAllowanceEarned && rec.foodAllowanceEarned > 0) {
        const faId = `fa_earn_${date}_${siteId}_${rec.workerId}`;
        const existingFaIdx = newFoodAllowances.findIndex((f) => f.id === faId);
        const faItem: FoodAllowanceRecord = {
          id: faId,
          workerId: rec.workerId,
          workerName: rec.workerName || wObj?.name || 'Worker',
          date,
          type: 'earned',
          amount: Number(rec.foodAllowanceEarned),
          siteId,
          siteName,
          remarks: `Earned with attendance on ${date} at ${siteName}`,
          enteredBy: user?.name || 'Site Supervisor',
          createdAt: existingFaIdx >= 0 ? newFoodAllowances[existingFaIdx].createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await localDb.put('foodAllowances', faItem);
        if (existingFaIdx >= 0) {
          newFoodAllowances[existingFaIdx] = faItem;
        } else {
          newFoodAllowances.push(faItem);
        }
      }
    }

    setAttendance(updatedList);
    setFoodAllowances(newFoodAllowances);
    setMetrics(computeMetricsLocally(workers, sites, updatedList, advances, siteReports, nextDayPlans, expenses));
    addLocalAudit('BATCH_ATTENDANCE', 'Attendance', date, `Saved ${records.length} records for ${siteName} on ${date}`);
  };

  const deleteAttendanceRecord = async (id: string): Promise<void> => {
    await localDb.delete('attendance', id);
    setAttendance((prev) => {
      const list = prev.filter((a) => a.id !== id);
      setMetrics(computeMetricsLocally(workers, sites, list, advances, siteReports, nextDayPlans, expenses));
      return list;
    });
    addLocalAudit('DELETE', 'Attendance', id, `Deleted attendance record ${id}`);
  };

  // Food Allowance Actions
  const createFoodAllowance = async (data: Partial<FoodAllowanceRecord>): Promise<FoodAllowanceRecord> => {
    const id = data.id || `FA-${Date.now().toString().slice(-5)}`;
    const wObj = workers.find((w) => w.id === data.workerId);
    const sObj = sites.find((s) => s.id === data.siteId) || sites[0];

    const newFa: FoodAllowanceRecord = {
      id,
      workerId: data.workerId || '',
      workerName: data.workerName || wObj?.name || 'Worker',
      date: data.date || new Date().toISOString().split('T')[0],
      type: data.type || 'earned',
      amount: Number(data.amount) || 0,
      siteId: data.siteId || (sObj?.id || ''),
      siteName: data.siteName || (sObj?.name || ''),
      paymentMethod: data.paymentMethod || 'Cash',
      remarks: data.remarks || '',
      enteredBy: user?.name || 'Site Supervisor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await localDb.put('foodAllowances', newFa);
    setFoodAllowances((prev) => [newFa, ...prev]);
    addLocalAudit('CREATE', 'FoodAllowance', newFa.id, `Recorded food allowance ₹${newFa.amount} (${newFa.type}) for ${newFa.workerName}`);
    return newFa;
  };

  const updateFoodAllowance = async (id: string, data: Partial<FoodAllowanceRecord>): Promise<FoodAllowanceRecord> => {
    const existing = foodAllowances.find((f) => f.id === id);
    if (!existing) throw new Error('Food allowance record not found');

    const updated: FoodAllowanceRecord = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await localDb.put('foodAllowances', updated);
    setFoodAllowances((prev) => prev.map((f) => (f.id === id ? updated : f)));
    return updated;
  };

  const deleteFoodAllowance = async (id: string): Promise<void> => {
    await localDb.delete('foodAllowances', id);
    setFoodAllowances((prev) => prev.filter((f) => f.id !== id));
    addLocalAudit('DELETE', 'FoodAllowance', id, `Deleted food allowance record ${id}`);
  };

  // Advances
  const createAdvance = async (data: Partial<AdvancePayment>): Promise<AdvancePayment> => {
    const id = data.id || `ADV-${Date.now().toString().slice(-5)}`;
    const wObj = workers.find((w) => w.id === data.workerId);
    const sObj = sites.find((s) => s.id === data.siteId) || sites[0];

    const newAdvance: AdvancePayment = {
      id,
      workerId: data.workerId || '',
      workerName: data.workerName || wObj?.name || 'Worker',
      date: data.date || new Date().toISOString().split('T')[0],
      type: data.type || 'advance',
      amount: Number(data.amount) || 0,
      paymentMethod: data.paymentMethod || 'Cash',
      purpose: data.purpose || 'Personal / Site Need',
      siteId: data.siteId || (sObj?.id || ''),
      siteName: data.siteName || (sObj?.name || ''),
      referenceNumber: data.referenceNumber,
      receiptUrl: data.receiptUrl,
      enteredBy: user?.name || 'Kalindra Kumar Singh',
      remarks: data.remarks || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await localDb.put('advances', newAdvance);
    setAdvances((prev) => {
      const updated = [newAdvance, ...prev];
      setMetrics(computeMetricsLocally(workers, sites, attendance, updated, siteReports, nextDayPlans, expenses));
      return updated;
    });

    addLocalAudit('CREATE', 'Advance', newAdvance.id, `Paid ₹${newAdvance.amount} to ${newAdvance.workerName}`);
    return newAdvance;
  };

  const updateAdvance = async (id: string, data: Partial<AdvancePayment>): Promise<AdvancePayment> => {
    const existing = advances.find((a) => a.id === id);
    if (!existing) throw new Error('Advance not found');

    const updated: AdvancePayment = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await localDb.put('advances', updated);
    setAdvances((prev) => {
      const list = prev.map((a) => (a.id === id ? updated : a));
      setMetrics(computeMetricsLocally(workers, sites, attendance, list, siteReports, nextDayPlans, expenses));
      return list;
    });

    return updated;
  };

  const deleteAdvance = async (id: string): Promise<void> => {
    await localDb.delete('advances', id);
    setAdvances((prev) => {
      const list = prev.filter((a) => a.id !== id);
      setMetrics(computeMetricsLocally(workers, sites, attendance, list, siteReports, nextDayPlans, expenses));
      return list;
    });
  };

  // Site Reports
  const createSiteReport = async (data: Partial<DailyWorkReport>): Promise<DailyWorkReport> => {
    const id = data.id || `REP-${Date.now().toString().slice(-4)}`;
    const sObj = sites.find((s) => s.id === data.siteId) || sites[0];

    const newReport: DailyWorkReport = {
      id,
      reportDate: data.reportDate || new Date().toISOString().split('T')[0],
      siteId: data.siteId || (sObj?.id || ''),
      siteName: data.siteName || (sObj?.name || ''),
      workLocation: data.workLocation || 'Site',
      workCategory: data.workCategory || 'Civil / Shuttering',
      workCompletedToday: data.workCompletedToday || '',
      workInProgress: data.workInProgress || '',
      quantityCompleted: Number(data.quantityCompleted) || 0,
      unit: data.unit || 'sq ft',
      workersCount: Number(data.workersCount) || 0,
      supervisorName: data.supervisorName || user?.name || 'Kalindra Kumar Singh',
      materialsUsed: data.materialsUsed || '',
      equipmentUsed: data.equipmentUsed || '',
      workStartTime: data.workStartTime || '08:00 AM',
      workEndTime: data.workEndTime || '05:00 PM',
      qualitySafetyObservations: data.qualitySafetyObservations || '',
      hasProblemsOrDelays: !!data.hasProblemsOrDelays,
      delayReason: data.delayReason || '',
      descriptionHindiEnglish: data.descriptionHindiEnglish || '',
      mediaItems: data.mediaItems || [],
      submittedBy: user?.name || 'Site Supervisor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await localDb.put('siteReports', newReport);
    setSiteReports((prev) => {
      const updated = [newReport, ...prev];
      setMetrics(computeMetricsLocally(workers, sites, attendance, advances, updated, nextDayPlans, expenses));
      return updated;
    });

    addLocalAudit('CREATE', 'DailyWorkReport', newReport.id, `Created site report for ${newReport.siteName}`);
    return newReport;
  };

  const updateSiteReport = async (id: string, data: Partial<DailyWorkReport>): Promise<DailyWorkReport> => {
    const existing = siteReports.find((r) => r.id === id);
    if (!existing) throw new Error('Report not found');

    const updated: DailyWorkReport = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await localDb.put('siteReports', updated);
    setSiteReports((prev) => {
      const list = prev.map((r) => (r.id === id ? updated : r));
      setMetrics(computeMetricsLocally(workers, sites, attendance, advances, list, nextDayPlans, expenses));
      return list;
    });

    return updated;
  };

  const deleteSiteReport = async (id: string): Promise<void> => {
    await localDb.delete('siteReports', id);
    setSiteReports((prev) => {
      const list = prev.filter((r) => r.id !== id);
      setMetrics(computeMetricsLocally(workers, sites, attendance, advances, list, nextDayPlans, expenses));
      return list;
    });
  };

  // Next Day Plans
  const createNextDayPlan = async (data: Partial<NextDayPlan>): Promise<NextDayPlan> => {
    const id = data.id || `PLAN-${Date.now().toString().slice(-4)}`;
    const sObj = sites.find((s) => s.id === data.siteId) || sites[0];

    const newPlan: NextDayPlan = {
      id,
      planDate: data.planDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      siteId: data.siteId || (sObj?.id || ''),
      siteName: data.siteName || (sObj?.name || ''),
      expectedWork: data.expectedWork || '',
      workLocation: data.workLocation || '',
      plannedActivities: data.plannedActivities || [],
      expectedWorkersCount: Number(data.expectedWorkersCount) || 4,
      assignedTeam: data.assignedTeam || 'Carpenters and Helpers',
      materialsRequired: data.materialsRequired || '',
      toolsEquipmentRequired: data.toolsEquipmentRequired || '',
      concreteShutteringRequirements: data.concreteShutteringRequirements || '',
      priority: data.priority || 'high',
      dependenciesOrApprovals: data.dependenciesOrApprovals || '',
      expectedStartTime: data.expectedStartTime || '08:00 AM',
      expectedCompletionTime: data.expectedCompletionTime || '05:30 PM',
      responsibleSupervisor: data.responsibleSupervisor || user?.name || 'Kalindra Kumar Singh',
      specialInstructions: data.specialInstructions || '',
      safetyPrecautions: data.safetyPrecautions || '',
      status: data.status || 'planned',
      createdBy: user?.name || 'Kalindra Kumar Singh',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await localDb.put('nextDayPlans', newPlan);
    setNextDayPlans((prev) => {
      const updated = [newPlan, ...prev];
      setMetrics(computeMetricsLocally(workers, sites, attendance, advances, siteReports, updated, expenses));
      return updated;
    });

    addLocalAudit('CREATE', 'NextDayPlan', newPlan.id, `Created plan for ${newPlan.planDate} at ${newPlan.siteName}`);
    return newPlan;
  };

  const updateNextDayPlan = async (id: string, data: Partial<NextDayPlan>): Promise<NextDayPlan> => {
    const existing = nextDayPlans.find((p) => p.id === id);
    if (!existing) throw new Error('Plan not found');

    const updated: NextDayPlan = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await localDb.put('nextDayPlans', updated);
    setNextDayPlans((prev) => {
      const list = prev.map((p) => (p.id === id ? updated : p));
      setMetrics(computeMetricsLocally(workers, sites, attendance, advances, siteReports, list, expenses));
      return list;
    });

    return updated;
  };

  const deleteNextDayPlan = async (id: string): Promise<void> => {
    await localDb.delete('nextDayPlans', id);
    setNextDayPlans((prev) => {
      const list = prev.filter((p) => p.id !== id);
      setMetrics(computeMetricsLocally(workers, sites, attendance, advances, siteReports, list, expenses));
      return list;
    });
  };

  const copyIncompleteTasks = async (fromDate?: string, toDate?: string): Promise<number> => {
    const sourceDate = fromDate || new Date().toISOString().split('T')[0];
    const targetDate = toDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const incomplete = nextDayPlans.filter(
      (p) => p.planDate === sourceDate && (p.status === 'delayed' || p.status === 'in_progress' || p.status === 'planned')
    );

    let count = 0;
    for (const p of incomplete) {
      await createNextDayPlan({
        ...p,
        id: undefined,
        planDate: targetDate,
        expectedWork: `[Carried Forward] ${p.expectedWork}`,
        status: 'planned',
      });
      count++;
    }
    return count;
  };

  // Expenses
  const createExpense = async (data: Partial<SiteExpense>): Promise<SiteExpense> => {
    const id = data.id || `EXP-${Date.now().toString().slice(-4)}`;
    const sObj = sites.find((s) => s.id === data.siteId) || sites[0];

    const newExpense: SiteExpense = {
      id,
      date: data.date || new Date().toISOString().split('T')[0],
      siteId: data.siteId || (sObj?.id || ''),
      siteName: data.siteName || (sObj?.name || ''),
      category: data.category || 'Material',
      description: data.description || '',
      amount: Number(data.amount) || 0,
      paymentMethod: data.paymentMethod || 'Cash',
      paidBy: data.paidBy || user?.name || 'Site Supervisor',
      receiptUrl: data.receiptUrl,
      referenceNumber: data.referenceNumber,
      remarks: data.remarks || '',
      enteredBy: user?.name || 'Site Supervisor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await localDb.put('expenses', newExpense);
    setExpenses((prev) => {
      const updated = [newExpense, ...prev];
      setMetrics(computeMetricsLocally(workers, sites, attendance, advances, siteReports, nextDayPlans, updated));
      return updated;
    });

    addLocalAudit('CREATE', 'Expense', newExpense.id, `Logged expense ₹${newExpense.amount} for ${newExpense.description}`);
    return newExpense;
  };

  const updateExpense = async (id: string, data: Partial<SiteExpense>): Promise<SiteExpense> => {
    const existing = expenses.find((e) => e.id === id);
    if (!existing) throw new Error('Expense not found');

    const updated: SiteExpense = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await localDb.put('expenses', updated);
    setExpenses((prev) => {
      const list = prev.map((e) => (e.id === id ? updated : e));
      setMetrics(computeMetricsLocally(workers, sites, attendance, advances, siteReports, nextDayPlans, list));
      return list;
    });

    return updated;
  };

  const deleteExpense = async (id: string): Promise<void> => {
    await localDb.delete('expenses', id);
    setExpenses((prev) => {
      const list = prev.filter((e) => e.id !== id);
      setMetrics(computeMetricsLocally(workers, sites, attendance, advances, siteReports, nextDayPlans, list));
      return list;
    });
  };

  // Media (Photos & Videos)
  const uploadMediaFiles = async (formData: FormData): Promise<MediaItem[]> => {
    const files = formData.getAll('files') as File[];
    const siteId = (formData.get('siteId') as string) || sites[0]?.id || '';
    const sObj = sites.find((s) => s.id === siteId);
    const caption = (formData.get('caption') as string) || '';
    const reportId = (formData.get('reportId') as string) || undefined;

    const createdItems: MediaItem[] = [];

    for (const file of files) {
      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();

      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const mediaItem: MediaItem = {
        id: `med_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: isVideo ? 'video' : 'photo',
        dataUrl,
        fileName: file.name,
        caption: caption || file.name,
        siteId,
        siteName: sObj?.name || 'Site',
        reportId,
        date: new Date().toISOString().split('T')[0],
        uploadedBy: user?.name || 'Site Supervisor',
        uploadedAt: new Date().toISOString(),
        fileSize: file.size,
      };

      await localDb.put('media', mediaItem);
      createdItems.push(mediaItem);
    }

    setMedia((prev) => [...createdItems, ...prev]);
    return createdItems;
  };

  const uploadCameraPhoto = async (
    dataUrl: string,
    caption: string,
    siteId: string,
    reportId?: string
  ): Promise<MediaItem> => {
    const sObj = sites.find((s) => s.id === siteId) || sites[0];
    const mediaItem: MediaItem = {
      id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'photo',
      dataUrl,
      fileName: `capture_${Date.now()}.jpg`,
      caption: caption || 'Site Photo',
      siteId: sObj?.id || '',
      siteName: sObj?.name || 'Site',
      reportId,
      date: new Date().toISOString().split('T')[0],
      uploadedBy: user?.name || 'Site Supervisor',
      uploadedAt: new Date().toISOString(),
      fileSize: Math.round((dataUrl.length * 3) / 4),
    };

    await localDb.put('media', mediaItem);
    setMedia((prev) => [mediaItem, ...prev]);
    return mediaItem;
  };

  const deleteMediaItem = async (id: string): Promise<void> => {
    await localDb.delete('media', id);
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  // Salary & Worker Account Statement
  const createSalaryPayment = async (data: Partial<SalaryPayment>): Promise<SalaryPayment> => {
    const id = data.id || `SAL-${Date.now().toString().slice(-4)}`;
    const newSal: SalaryPayment = {
      id,
      workerId: data.workerId || '',
      workerName: data.workerName || '',
      month: data.month || new Date().toISOString().slice(0, 7),
      paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
      presentDays: Number(data.presentDays) || 0,
      halfDays: Number(data.halfDays) || 0,
      absentDays: Number(data.absentDays) || 0,
      overtimeHours: Number(data.overtimeHours) || 0,
      baseEarnings: Number(data.baseEarnings) || 0,
      overtimeEarnings: Number(data.overtimeEarnings) || 0,
      foodAllowance: Number(data.foodAllowance) || 0,
      travelAllowance: Number(data.travelAllowance) || 0,
      grossEarnings: Number(data.grossEarnings) || 0,
      advancesDeducted: Number(data.advancesDeducted) || 0,
      otherDeductions: Number(data.otherDeductions) || 0,
      netPayable: Number(data.netPayable) || 0,
      amountPaid: Number(data.amountPaid) || 0,
      remainingBalance: Number(data.remainingBalance) || 0,
      paymentMethod: data.paymentMethod || 'Cash',
      referenceNumber: data.referenceNumber,
      remarks: data.remarks || '',
      createdAt: new Date().toISOString(),
    };

    await localDb.put('salaryPayments', newSal);
    setSalaryPayments((prev) => [newSal, ...prev]);

    // Also record repayment in advances if advance was deducted
    if (newSal.advancesDeducted > 0) {
      await createAdvance({
        workerId: newSal.workerId,
        workerName: newSal.workerName,
        date: newSal.paymentDate,
        type: 'salary_deduction',
        amount: newSal.advancesDeducted,
        paymentMethod: newSal.paymentMethod,
        purpose: `Salary settlement deduction for ${newSal.month}`,
        remarks: `Adjusted during salary payout ref ${newSal.id}`,
      });
    }

    addLocalAudit('SALARY_PAYOUT', 'Salary', newSal.id, `Paid net ₹${newSal.amountPaid} to ${newSal.workerName} for ${newSal.month}`);
    return newSal;
  };

  const getWorkerStatementWithRange = (
    workerId: string,
    rangeKey: string = 'this_month',
    customStart?: string,
    customEnd?: string
  ): WorkerAccountStatement | null => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return null;

    const today = new Date();
    const currentMonthStr = today.toISOString().slice(0, 7);

    // Compute date boundaries
    let startDate = '';
    let endDate = '';
    let periodLabel = '';

    if (rangeKey === 'this_week') {
      const day = today.getDay(); // 0 is Sunday
      const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diffToMonday));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      startDate = monday.toISOString().split('T')[0];
      endDate = sunday.toISOString().split('T')[0];
      periodLabel = `This Week (${startDate} to ${endDate})`;
    } else if (rangeKey === 'prev_month') {
      const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const prevEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      startDate = prev.toISOString().split('T')[0];
      endDate = prevEnd.toISOString().split('T')[0];
      periodLabel = `Previous Month (${prev.toLocaleString('default', { month: 'long', year: 'numeric' })})`;
    } else if (rangeKey === 'custom' && customStart && customEnd) {
      startDate = customStart;
      endDate = customEnd;
      periodLabel = `Custom Period (${customStart} to ${customEnd})`;
    } else if (rangeKey === 'all_time') {
      startDate = '1970-01-01';
      endDate = '2099-12-31';
      periodLabel = 'All Time Record';
    } else {
      // Month string e.g. "2026-10" or "this_month"
      const mStr = rangeKey.length === 7 && rangeKey.includes('-') ? rangeKey : currentMonthStr;
      const [y, m] = mStr.split('-').map(Number);
      const firstDay = new Date(y, m - 1, 1);
      const lastDay = new Date(y, m, 0);
      startDate = firstDay.toISOString().split('T')[0];
      endDate = lastDay.toISOString().split('T')[0];
      periodLabel = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    const inRange = (d: string) => {
      if (!d) return false;
      return d >= startDate && d <= endDate;
    };

    // Filter attendance
    const workerAtt = attendance.filter((a) => a.workerId === workerId && inRange(a.date));
    let presentDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let totalHoursWorked = 0;
    let otHours = 0;
    let baseEarnings = 0;
    let otEarnings = 0;

    workerAtt.forEach((att) => {
      const hourlyRate = att.hourlyWage || Math.round(worker.rate / 8);
      let dayHours = 0;
      let dayBase = 0;

      if (att.status === 'present' || att.status === 'present_full') {
        presentDays++;
        dayHours = att.hoursWorked || 8;
        dayBase = att.isWageOverridden && att.overrideWage !== undefined ? att.overrideWage : (att.calculatedWage || worker.rate);
      } else if (att.status === 'half_day') {
        halfDays++;
        dayHours = att.hoursWorked || 4;
        dayBase = att.isWageOverridden && att.overrideWage !== undefined ? att.overrideWage : (att.calculatedWage || Math.round(worker.rate / 2));
      } else if (att.status === 'present_hourly') {
        dayHours = att.hoursWorked || 0;
        dayBase = att.isWageOverridden && att.overrideWage !== undefined ? att.overrideWage : (att.calculatedWage || Math.round(dayHours * hourlyRate));
        if (dayHours >= 8) presentDays++;
        else if (dayHours >= 4) halfDays++;
      } else {
        absentDays++;
      }

      const dayOt = (att.overtimeHours || 0) * (hourlyRate * 1.5);

      totalHoursWorked += dayHours;
      otHours += att.overtimeHours || 0;
      baseEarnings += dayBase;
      otEarnings += dayOt;
    });

    const totalEarnings = Math.round(baseEarnings + otEarnings);

    // Food allowances
    const workerFa = foodAllowances.filter((f) => f.workerId === workerId && inRange(f.date));
    const foodAllowanceEarned = workerFa
      .filter((f) => f.type === 'earned')
      .reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const foodAllowancePaid = workerFa
      .filter((f) => f.type === 'paid')
      .reduce((sum, f) => sum + Number(f.amount || 0), 0);

    // Advances
    const workerAdvances = advances.filter((a) => a.workerId === workerId && inRange(a.date));
    const totalAdvancesTaken = workerAdvances
      .filter((a) => a.type === 'advance')
      .reduce((sum, a) => sum + Number(a.amount || 0), 0);
    const totalAdvancesAdjusted = workerAdvances
      .filter((a) => a.type === 'repayment' || a.type === 'salary_deduction')
      .reduce((sum, a) => sum + Number(a.amount || 0), 0);

    // Payments made
    const workerSalaries = salaryPayments.filter(
      (s) => s.workerId === workerId && inRange(s.paymentDate || `${s.month}-15`)
    );
    const totalPaymentsMade = workerSalaries.reduce((sum, s) => sum + Number(s.amountPaid || 0), 0);

    // Hisab-Kitaab formula:
    // Balance = (Wages Earned + Food Allowance Earned) - (Food Allowance Paid + Advances Taken - Advances Adjusted + Salary Payments)
    const netAdvances = Math.max(0, totalAdvancesTaken - totalAdvancesAdjusted);
    const closingBalance = Math.round(
      totalEarnings + foodAllowanceEarned - foodAllowancePaid - netAdvances - totalPaymentsMade
    );

    // Build unified chronological ledger transactions
    const rawTransactions: WorkerLedgerEntry[] = [];

    // 1. Attendance shifts
    workerAtt.forEach((att) => {
      const isHourly = att.status === 'present_hourly';
      const isPresent = att.status === 'present' || att.status === 'present_full';
      const isHalf = att.status === 'half_day';

      if (isPresent || isHalf || isHourly) {
        const hourlyRate = att.hourlyWage || Math.round(worker.rate / 8);
        const shiftBase =
          att.isWageOverridden && att.overrideWage !== undefined
            ? att.overrideWage
            : att.calculatedWage ||
              (isHourly ? Math.round((att.hoursWorked || 0) * hourlyRate) : isHalf ? Math.round(worker.rate / 2) : worker.rate);
        const shiftOt = Math.round((att.overtimeHours || 0) * hourlyRate * 1.5);
        const totalShiftCredit = shiftBase + shiftOt;

        const label = isHourly
          ? `Hourly Shift (${att.hoursWorked} hrs @ ₹${hourlyRate}/hr)`
          : isHalf
          ? `Half Day (4 hrs @ ₹${hourlyRate}/hr)`
          : `Full Day (8 hrs @ ₹${worker.rate}/day)`;

        rawTransactions.push({
          id: att.id,
          date: att.date,
          siteName: att.siteName || 'Construction Site',
          siteId: att.siteId,
          transactionType: isHourly ? 'Hourly Wage' : 'Wage',
          description: `${label}${att.overtimeHours ? ` + ${att.overtimeHours}h OT (₹${shiftOt})` : ''}${
            att.isWageOverridden ? ` [Overridden: ${att.overrideReason || 'Manual'}]` : ''
          }${att.remarks ? ` - ${att.remarks}` : ''}`,
          hours: isHourly ? att.hoursWorked : isHalf ? 4 : 8,
          credit: totalShiftCredit,
          debit: 0,
          runningBalance: 0,
          referenceId: att.id,
        });
      }
    });

    // 2. Food Allowances
    workerFa.forEach((fa) => {
      if (fa.type === 'earned') {
        rawTransactions.push({
          id: fa.id,
          date: fa.date,
          siteName: fa.siteName || 'Site',
          siteId: fa.siteId,
          transactionType: 'Food Allowance Earned',
          description: `Food Allowance (Khoraki) Earned${fa.remarks ? `: ${fa.remarks}` : ''}`,
          credit: fa.amount,
          debit: 0,
          runningBalance: 0,
          referenceId: fa.id,
        });
      } else {
        rawTransactions.push({
          id: fa.id,
          date: fa.date,
          siteName: fa.siteName || 'Site',
          siteId: fa.siteId,
          transactionType: 'Food Allowance Paid',
          description: `Food Allowance Paid / Advance (${fa.paymentMethod || 'Cash'})${fa.remarks ? `: ${fa.remarks}` : ''}`,
          credit: 0,
          debit: fa.amount,
          runningBalance: 0,
          referenceId: fa.id,
        });
      }
    });

    // 3. Advances
    workerAdvances.forEach((adv) => {
      if (adv.type === 'advance') {
        rawTransactions.push({
          id: adv.id,
          date: adv.date,
          siteName: adv.siteName || 'Site',
          siteId: adv.siteId,
          transactionType: 'Advance',
          description: `Advance Given: ${adv.purpose} (${adv.paymentMethod})${adv.remarks ? ` - ${adv.remarks}` : ''}`,
          credit: 0,
          debit: adv.amount,
          runningBalance: 0,
          referenceId: adv.id,
        });
      }
    });

    // 4. Payments
    workerSalaries.forEach((sal) => {
      rawTransactions.push({
        id: sal.id,
        date: sal.paymentDate || `${sal.month}-15`,
        siteName: 'Head Office / Accounts',
        transactionType: 'Payment',
        description: `Salary & Wage Payment for ${sal.month} (${sal.paymentMethod})${
          sal.referenceNumber ? ` Ref: ${sal.referenceNumber}` : ''
        }${sal.remarks ? ` - ${sal.remarks}` : ''}`,
        credit: 0,
        debit: sal.amountPaid,
        runningBalance: 0,
        referenceId: sal.id,
      });
    });

    // Sort chronologically ascending
    rawTransactions.sort((x, y) => x.date.localeCompare(y.date));

    // Calculate chronological running balance
    let curBalance = 0;
    const transactions = rawTransactions.map((tx) => {
      curBalance = curBalance + tx.credit - tx.debit;
      return {
        ...tx,
        runningBalance: curBalance,
      };
    });

    return {
      worker,
      period: periodLabel,
      presentDays,
      halfDays,
      absentDays,
      overtimeHours: otHours,
      totalHoursWorked,
      openingBalance: 0,
      totalEarnings,
      foodAllowanceEarned,
      foodAllowancePaid,
      foodAllowance: foodAllowanceEarned - foodAllowancePaid,
      travelAllowance: 0,
      totalAdvancesTaken,
      totalAdvancesAdjusted,
      totalPaymentsMade,
      closingBalance,
      transactions,
    };
  };

  const getWorkerStatement = (workerId: string, monthStr?: string): WorkerAccountStatement | null => {
    return getWorkerStatementWithRange(workerId, monthStr || 'this_month');
  };

  const resetDemoData = async () => {
    await localDb.clearStore('workers');
    await localDb.clearStore('sites');
    await localDb.clearStore('attendance');
    await localDb.clearStore('foodAllowances');
    await localDb.clearStore('advances');
    await localDb.clearStore('salaryPayments');
    await localDb.clearStore('siteReports');
    await localDb.clearStore('nextDayPlans');
    await localDb.clearStore('expenses');
    await localDb.clearStore('media');
    await loadData();
  };

  return (
    <DataContext.Provider
      value={{
        workers,
        sites,
        attendance,
        foodAllowances,
        advances,
        salaryPayments,
        siteReports,
        nextDayPlans,
        expenses,
        media,
        auditLogs,
        metrics,
        isSyncing,
        isOnline,
        lastSyncTime,
        syncError,
        triggerSync,
        createWorker,
        updateWorker,
        deleteWorker,
        createSite,
        updateSite,
        deleteSite,
        renameSite,
        resetToStandardSites,
        saveAttendanceBatch,
        deleteAttendanceRecord,
        createFoodAllowance,
        updateFoodAllowance,
        deleteFoodAllowance,
        createAdvance,
        updateAdvance,
        deleteAdvance,
        createSiteReport,
        updateSiteReport,
        deleteSiteReport,
        createNextDayPlan,
        updateNextDayPlan,
        deleteNextDayPlan,
        copyIncompleteTasks,
        createExpense,
        updateExpense,
        deleteExpense,
        uploadMediaFiles,
        uploadCameraPhoto,
        deleteMediaItem,
        createSalaryPayment,
        getWorkerStatement,
        getWorkerStatementWithRange,
        resetDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
};
