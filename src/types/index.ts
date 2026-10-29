export type WorkCategoryType =
  | 'Shuttering Carpenter'
  | 'Steel Fixer'
  | 'Rajmistri / Mason'
  | 'Helper / Beldar'
  | 'Mixer / Vibrator Operator'
  | 'Shuttering Supervisor'
  | 'Bar Bender'
  | 'Plumber / Electrician'
  | 'Other Civil Work';

export type SkillLevel = 'Master Mistri' | 'Skilled' | 'Semi-Skilled' | 'Unskilled';

export interface BankDetails {
  bankName?: string;
  accountNo?: string;
  ifsc?: string;
  upiId?: string;
}

export interface Worker {
  id: string; // e.g. KKS001
  name: string;
  fatherName: string;
  photo?: string; // Data URL or Blob URL stored in IndexedDB
  mobile: string;
  village: string;
  villageAddress?: string; // alias
  district: string;
  state: string;
  fullAddress: string;
  emergencyContact: string;
  joiningDate: string;
  workCategory: string; // Shuttering Carpenter, Steel Fixer, etc.
  skillLevel: SkillLevel;
  designation: string; // Head Mistri, Shuttering Mistri, Helper
  wageType: 'daily' | 'monthly';
  rate: number; // ₹ per day or per month
  assignedSiteId: string;
  assignedSiteName: string;
  bankDetails?: BankDetails;
  status: 'active' | 'inactive' | 'left';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus =
  | 'present'
  | 'present_full'
  | 'present_hourly'
  | 'absent'
  | 'half_day'
  | 'leave'
  | 'weekly_off'
  | 'holiday';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  siteId: string;
  siteName: string;
  workerId: string;
  workerName: string;
  workerPhoto?: string;
  workerTrade?: string;
  status: AttendanceStatus;
  hoursWorked?: number; // e.g. 1, 2, 2.5, 3, 5, 7, 8
  dailyWage?: number; // base daily wage at attendance time
  hourlyWage?: number; // daily wage / 8
  calculatedWage?: number; // earned wage for this shift/hours
  isWageOverridden?: boolean;
  overrideWage?: number;
  overrideReason?: string;
  foodAllowanceEarned?: number; // khoraki earned on this shift
  linkedSiteWorkId?: string; // links to site work entry
  checkInTime?: string;
  checkOutTime?: string;
  overtimeHours: number;
  remarks?: string;
  correctionReason?: string;
  markedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type AdvancePaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer';

export interface FoodAllowanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  date: string; // YYYY-MM-DD
  type: 'earned' | 'paid'; // 'earned' is Credit (income), 'paid' is Debit (advance/payout)
  amount: number; // ₹
  siteId: string;
  siteName: string;
  paymentMethod?: AdvancePaymentMethod;
  remarks?: string;
  enteredBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WorkerLedgerEntry {
  id: string;
  date: string;
  siteName: string;
  siteId?: string;
  transactionType:
    | 'Wage'
    | 'Hourly Wage'
    | 'Overtime'
    | 'Food Allowance Earned'
    | 'Food Allowance Paid'
    | 'Advance'
    | 'Payment';
  description: string;
  hours?: number;
  credit: number; // Income for worker (+)
  debit: number; // Payment or advance given to worker (-)
  runningBalance: number;
  referenceId?: string;
}

export interface AdvancePayment {
  id: string;
  workerId: string;
  workerName: string;
  date: string; // YYYY-MM-DD
  type: 'advance' | 'repayment' | 'salary_deduction';
  amount: number; // ₹
  paymentMethod: AdvancePaymentMethod;
  purpose: string;
  siteId: string;
  siteName: string;
  referenceNumber?: string;
  receiptUrl?: string;
  enteredBy: string;
  enteredByName?: string; // alias
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryPayment {
  id: string;
  workerId: string;
  workerName: string;
  month: string; // YYYY-MM
  paymentDate: string; // YYYY-MM-DD
  presentDays: number;
  halfDays: number;
  absentDays: number;
  overtimeHours: number;
  baseEarnings: number; // ₹
  overtimeEarnings: number; // ₹
  foodAllowance: number; // ₹
  travelAllowance: number; // ₹
  grossEarnings: number; // ₹
  advancesDeducted: number; // ₹
  otherDeductions: number; // ₹
  netPayable: number; // ₹
  amountPaid: number; // ₹
  remainingBalance: number; // ₹
  paymentMethod: AdvancePaymentMethod;
  referenceNumber?: string;
  remarks?: string;
  createdAt: string;
}

export interface WorkerAccountStatement {
  worker: Worker;
  period: string; // e.g. "October 2026"
  presentDays: number;
  halfDays: number;
  absentDays: number;
  overtimeHours: number;
  totalHoursWorked?: number;
  openingBalance: number;
  totalEarnings: number;
  foodAllowanceEarned: number;
  foodAllowancePaid: number;
  foodAllowance: number; // net food allowance
  travelAllowance: number;
  totalAdvancesTaken: number;
  totalAdvancesAdjusted: number;
  totalPaymentsMade: number;
  closingBalance: number;
  transactions: WorkerLedgerEntry[];
}

export type SiteStatus = 'active' | 'in_progress' | 'on_hold' | 'completed';

export interface ConstructionSite {
  id: string; // SITE-01
  name: string;
  clientName: string;
  siteAddress: string;
  completeAddress?: string; // alias
  supervisorName: string;
  supervisor?: string; // alias
  startDate: string;
  expectedCompletionDate: string;
  status: SiteStatus;
  workCategories: string[];
  assignedWorkersCount: number;
  assignedWorkerCount?: number; // alias
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  dataUrl?: string; // Local Base64 or Blob URL stored in IndexedDB
  url?: string; // alias for dataUrl
  blobKey?: string; // Key in IndexedDB media blob store
  fileName: string;
  caption: string;
  siteId: string;
  siteName: string;
  reportId?: string;
  reportLocation?: string;
  workCategory?: string;
  date: string;
  uploadedBy: string;
  uploadedByName?: string; // alias
  uploadedAt: string;
  fileSize: number;
}

export interface DailyWorkReport {
  id: string;
  reportDate: string; // YYYY-MM-DD
  siteId: string;
  siteName: string;
  projectName?: string;
  workLocation: string; // e.g. "Indoor Gymnasium: Staircase shuttering"
  workCategory: string;
  workDescription?: string; // alias/full description
  workCompletedToday: string;
  workInProgress: string;
  workStatus?: 'Planned' | 'In Progress' | 'Completed' | 'On Hold';
  quantityCompleted: number;
  unit: string; // sq ft, sq m, running ft, cubic ft, cubic metre, pieces, brass
  workersCount: number;
  workerIds?: string[];
  workerNames?: string[];
  supervisorName: string;
  materialsUsed?: string;
  equipmentUsed?: string;
  workStartTime?: string;
  workEndTime?: string;
  qualitySafetyObservations?: string;
  hasProblemsOrDelays: boolean;
  delayReason?: string;
  descriptionHindiEnglish: string;
  mediaItems?: MediaItem[];
  remarks?: string;
  submittedBy: string;
  submittedByName?: string; // alias
  createdAt: string;
  updatedAt: string;
}

export type PlanPriority = 'high' | 'medium' | 'normal';
export type PlanStatus = 'planned' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';

export interface NextDayPlan {
  id: string;
  planDate: string; // target execution date YYYY-MM-DD
  siteId: string;
  siteName: string;
  expectedWork: string;
  workLocation: string;
  plannedActivities: string[];
  expectedWorkersCount: number;
  assignedTeam: string;
  materialsRequired: string;
  toolsEquipmentRequired: string;
  concreteShutteringRequirements?: string;
  priority: PlanPriority;
  dependenciesOrApprovals?: string;
  expectedStartTime?: string;
  expectedCompletionTime?: string;
  responsibleSupervisor: string;
  specialInstructions?: string;
  safetyPrecautions?: string;
  status: PlanStatus;
  delayReason?: string;
  actualCompletedNotes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'Material'
  | 'Materials'
  | 'Transport'
  | 'Equipment rental'
  | 'Equipment Rental'
  | 'Fuel'
  | 'Food'
  | 'Food & Tea'
  | 'Hardware & Fasteners'
  | 'Safety Gear'
  | 'Labor Overtime'
  | 'Miscellaneous'
  | 'Travel'
  | 'Other expenses'
  | 'Other'
  | string;

export interface SiteExpense {
  id: string;
  date: string; // YYYY-MM-DD
  siteId: string;
  siteName: string;
  category: ExpenseCategory;
  description: string;
  amount: number; // ₹
  paymentMethod: AdvancePaymentMethod;
  paidBy: string;
  receiptUrl?: string;
  referenceNumber?: string;
  remarks?: string;
  enteredBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  firmName: string;
  proprietorName: string;
  proprietorPhone: string; // WhatsApp destination
  supervisorName: string;
  address: string;
  established: number;
  pinLockEnabled: boolean;
  pinCode: string; // Default '2002'
  autoLockMinutes: number; // 0 = disabled, 5 = 5 mins
  enableBiometrics: boolean;
  overtimeHourlyMultiplier: number; // default 1.5x or wage/8
  standardDailyHours: number; // default 8 hrs
  lastBackupDate?: string;
}

export interface DashboardMetrics {
  totalRegisteredWorkers: number;
  totalWorkers?: number; // alias
  workersPresentToday: number;
  workersAbsentToday: number;
  workersHalfDayToday: number;
  workersOnLeaveToday: number;
  activeSitesCount: number;
  workCompletedTodayCount: number;
  workPendingCount: number;
  pendingWorkCount?: number; // alias
  totalAdvancesRecorded: number;
  totalAdvancesGiven?: number; // alias
  outstandingWorkerAdvances: number;
  totalOutstandingAdvance?: number; // alias
  todaySiteExpenses: number;
  tomorrowPlannedTasksCount: number;
  totalDailyLabourCost: number; // Sum of wages + OT for present/half-day workers
}

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: 'admin' | 'manager' | 'supervisor' | 'worker';
  workerId?: string;
  mobile?: string;
  siteId?: string;
  lastLogin?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  summary?: string;
  workerId?: string;
  siteId?: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
}

