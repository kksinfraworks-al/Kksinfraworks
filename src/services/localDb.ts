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
  AppSettings,
  DashboardMetrics,
  FoodAllowanceRecord,
} from '../types';

const DB_NAME = 'kks_infra_db';
const DB_VERSION = 2;

export const DEFAULT_SETTINGS: AppSettings = {
  firmName: 'KKSInfraWorks – Civil & Shuttering Contractor Supplier',
  proprietorName: 'Kalindra Kumar Singh',
  proprietorPhone: '919835000000', // Configurable in settings
  supervisorName: 'Site Supervisor / Manager',
  address: 'Bargawn Road, Mairwa, Bihar – 841239',
  established: 2002,
  pinLockEnabled: true,
  pinCode: '2002', // Established 2002 default PIN
  autoLockMinutes: 10,
  enableBiometrics: false,
  overtimeHourlyMultiplier: 1.5,
  standardDailyHours: 8,
  lastBackupDate: undefined,
};

// SVG data URI avatars for realistic offline worker photos
const createWorkerAvatar = (initials: string, bg: string) => {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="${bg}"/><text x="50" y="58" font-size="34" font-weight="bold" fill="%23ffffff" text-anchor="middle" font-family="sans-serif">${initials}</text></svg>`;
};

export const DEFAULT_KKS_SITES: ConstructionSite[] = [
  {
    id: 'SITE-01',
    name: 'Indoor gymnasium',
    clientName: 'Sports Authority / Local Complex',
    siteAddress: 'Sports Stadium & Indoor Hall, Siwan - Mairwa, Bihar',
    supervisorName: 'Kalindra Kumar Singh',
    startDate: '2026-01-10',
    expectedCompletionDate: '2026-12-31',
    status: 'in_progress',
    workCategories: ['Column Shuttering', 'Beam Shuttering', 'Slab Shuttering', 'Staircase Shuttering', 'Helper / Beldar'],
    assignedWorkersCount: 3,
    remarks: 'Indoor gymnasium hall column & high-roof beam shuttering.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'SITE-02',
    name: 'Type 4',
    clientName: 'Government Residential Colony',
    siteAddress: 'Staff Quarters Type 4 Block, Bihar',
    supervisorName: 'Authorized Site Supervisor',
    startDate: '2026-01-20',
    expectedCompletionDate: '2026-11-30',
    status: 'in_progress',
    workCategories: ['Shuttering Carpenter', 'Steel Fixer', 'Rajmistri / Mason', 'Helper / Beldar'],
    assignedWorkersCount: 2,
    remarks: 'Type 4 residential quarters slab and beam shuttering.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'SITE-03',
    name: 'M.B.B.S balapar',
    clientName: 'Medical College & Hospital Project',
    siteAddress: 'Balapar Campus, Siwan / Gopalganj, Bihar',
    supervisorName: 'Kalindra Kumar Singh',
    startDate: '2026-02-01',
    expectedCompletionDate: '2027-03-31',
    status: 'in_progress',
    workCategories: ['Column Shuttering', 'Beam Shuttering', 'Slab Concreting', 'Steel Fixing', 'Helper / Beldar'],
    assignedWorkersCount: 2,
    remarks: 'M.B.B.S Balapar medical college hostel & hospital block.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'SITE-04',
    name: 'S.R 2',
    clientName: 'Road & Bridge Division',
    siteAddress: 'State Road Section S.R 2, Bihar',
    supervisorName: 'Authorized Site Supervisor',
    startDate: '2026-02-15',
    expectedCompletionDate: '2026-10-31',
    status: 'active',
    workCategories: ['Shuttering Carpenter', 'Bar Bender', 'Mixer / Vibrator Operator', 'Helper / Beldar'],
    assignedWorkersCount: 1,
    remarks: 'Culvert & retaining wall shuttering at S.R 2.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'SITE-05',
    name: 'Balapar ramp',
    clientName: 'Infrastructure & Flyover Wing',
    siteAddress: 'Balapar Approach Road & Ramp, Bihar',
    supervisorName: 'Kalindra Kumar Singh',
    startDate: '2026-03-01',
    expectedCompletionDate: '2026-12-15',
    status: 'active',
    workCategories: ['Column Shuttering', 'Staircase Shuttering', 'Steel Fixing', 'Helper / Beldar'],
    assignedWorkersCount: 0,
    remarks: 'Ramp slope foundation and retaining wall shuttering.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'SITE-06',
    name: 'Other',
    clientName: 'Custom / Other Sites',
    siteAddress: 'Mairwa & Surrounding Sites, Bihar',
    supervisorName: 'Site Supervisor',
    startDate: '2026-01-01',
    expectedCompletionDate: '',
    status: 'active',
    workCategories: ['Shuttering Carpenter', 'Steel Fixer', 'Helper / Beldar', 'Other Civil Work'],
    assignedWorkersCount: 0,
    remarks: 'Other site work (Name can be changed / renamed).',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_SITES = DEFAULT_KKS_SITES;

const SEED_WORKERS: Worker[] = [
  {
    id: 'KKS001',
    name: 'Ramesh Kumar Sah',
    fatherName: 'Ramchandra Sah',
    photo: createWorkerAvatar('RS', '%23b45309'),
    mobile: '9835100001',
    village: 'Bargawn',
    district: 'Siwan',
    state: 'Bihar',
    fullAddress: 'Village Bargawn, PO Mairwa, Dist Siwan, Bihar - 841239',
    emergencyContact: '9835100002 (Brother)',
    joiningDate: '2020-04-10',
    workCategory: 'Shuttering Carpenter',
    skillLevel: 'Master Mistri',
    designation: 'Head Shuttering Mistri',
    wageType: 'daily',
    rate: 850,
    assignedSiteId: 'SITE-01',
    assignedSiteName: 'Indoor gymnasium',
    bankDetails: { bankName: 'State Bank of India', accountNo: '30291823901', ifsc: 'SBIN0001234', upiId: 'rameshsah@upi' },
    status: 'active',
    remarks: 'Senior beam and column shuttering specialist with KKS since 2020.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'KKS002',
    name: 'Manoj Kumar Yadav',
    fatherName: 'Dinesh Yadav',
    photo: createWorkerAvatar('MY', '%230369a1'),
    mobile: '9835100003',
    village: 'Guthani',
    district: 'Siwan',
    state: 'Bihar',
    fullAddress: 'Village Belaur, Block Guthani, Dist Siwan, Bihar - 841435',
    emergencyContact: '9835100004 (Father)',
    joiningDate: '2021-08-01',
    workCategory: 'Steel Fixer',
    skillLevel: 'Skilled',
    designation: 'Steel & Bar Bending Mistri',
    wageType: 'daily',
    rate: 750,
    assignedSiteId: 'SITE-01',
    assignedSiteName: 'Indoor gymnasium',
    bankDetails: { bankName: 'Punjab National Bank', accountNo: '48391000293', ifsc: 'PUNB0048390', upiId: '9835100003@ybl' },
    status: 'active',
    remarks: 'Expert in slab mesh and foundation ring binding.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'KKS003',
    name: 'Surendra Prasad',
    fatherName: 'Baban Prasad',
    photo: createWorkerAvatar('SP', '%23047857'),
    mobile: '9835100005',
    village: 'Darauli',
    district: 'Siwan',
    state: 'Bihar',
    fullAddress: 'Ward 4, Darauli Ghat, Dist Siwan, Bihar - 841272',
    emergencyContact: '9835100006 (Wife)',
    joiningDate: '2022-01-15',
    workCategory: 'Rajmistri / Mason',
    skillLevel: 'Skilled',
    designation: 'Civil Rajmistri',
    wageType: 'daily',
    rate: 800,
    assignedSiteId: 'SITE-01',
    assignedSiteName: 'Indoor gymnasium',
    bankDetails: { bankName: 'Uttar Bihar Gramin Bank', accountNo: '10029384756', ifsc: 'CBIN0R10001' },
    status: 'active',
    remarks: 'Precision brickwork and beam column plaster.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'KKS004',
    name: 'Anil Bind',
    fatherName: 'Subhash Bind',
    photo: createWorkerAvatar('AB', '%234338ca'),
    mobile: '9835100007',
    village: 'Bargawn',
    district: 'Siwan',
    state: 'Bihar',
    fullAddress: 'Bargawn Road, Near Petrol Pump, Mairwa, Bihar - 841239',
    emergencyContact: '9835100008 (Brother)',
    joiningDate: '2023-02-10',
    workCategory: 'Shuttering Carpenter',
    skillLevel: 'Skilled',
    designation: 'Ply & Iron Plate Fitter',
    wageType: 'daily',
    rate: 750,
    assignedSiteId: 'SITE-01',
    assignedSiteName: 'Indoor gymnasium',
    bankDetails: { bankName: 'Canara Bank', accountNo: '99283746152', ifsc: 'CNRB0001928' },
    status: 'active',
    remarks: 'Shuttering plywood alignment and prop staging.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'KKS005',
    name: 'Pappu Manjhi',
    fatherName: 'Lakhiram Manjhi',
    photo: createWorkerAvatar('PM', '%23c026d3'),
    mobile: '9835100009',
    village: 'Mairwa Dham',
    district: 'Siwan',
    state: 'Bihar',
    fullAddress: 'Harijan Tola, Mairwa, Siwan, Bihar - 841239',
    emergencyContact: '9835100010 (Neighbor)',
    joiningDate: '2023-05-20',
    workCategory: 'Helper / Beldar',
    skillLevel: 'Unskilled',
    designation: 'General Labour / Helper',
    wageType: 'daily',
    rate: 500,
    assignedSiteId: 'SITE-01',
    assignedSiteName: 'Indoor gymnasium',
    status: 'active',
    remarks: 'Hardworking concrete transport and staging helper.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'KKS006',
    name: 'Sunil Chauhan',
    fatherName: 'Ramdev Chauhan',
    photo: createWorkerAvatar('SC', '%23d97706'),
    mobile: '9835100011',
    village: 'Jiradei',
    district: 'Siwan',
    state: 'Bihar',
    fullAddress: 'Village Jiradei (Rajendra Babu Dham), Dist Siwan, Bihar - 841238',
    emergencyContact: '9835100012 (Father)',
    joiningDate: '2024-01-10',
    workCategory: 'Helper / Beldar',
    skillLevel: 'Semi-Skilled',
    designation: 'Shuttering Helper',
    wageType: 'daily',
    rate: 550,
    assignedSiteId: 'SITE-02',
    assignedSiteName: 'Type 4',
    status: 'active',
    remarks: 'Assists iron pipe staging and scaffolding.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'KKS007',
    name: 'Dharmendra Sharma',
    fatherName: 'Shivpujan Sharma',
    photo: createWorkerAvatar('DS', '%23059669'),
    mobile: '9835100013',
    village: 'Mirganj',
    district: 'Gopalganj',
    state: 'Bihar',
    fullAddress: 'Station Road, Mirganj, Dist Gopalganj, Bihar - 841438',
    emergencyContact: '9835100014 (Brother)',
    joiningDate: '2023-11-01',
    workCategory: 'Mixer / Vibrator Operator',
    skillLevel: 'Skilled',
    designation: 'Machine Operator & Vibrator Mistri',
    wageType: 'daily',
    rate: 700,
    assignedSiteId: 'SITE-02',
    assignedSiteName: 'Type 4',
    bankDetails: { bankName: 'Bank of Baroda', accountNo: '77281900192', ifsc: 'BARB0MIRGAN' },
    status: 'active',
    remarks: 'Operates 10/7 diesel concrete mixer and needle vibrator.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'KKS008',
    name: 'Vikram Kumar',
    fatherName: 'Hira Singh',
    photo: createWorkerAvatar('VK', '%23dc2626'),
    mobile: '9835100015',
    village: 'Barharia',
    district: 'Siwan',
    state: 'Bihar',
    fullAddress: 'Main Chowk, Barharia, Dist Siwan, Bihar - 841232',
    emergencyContact: '9835100016 (Uncle)',
    joiningDate: '2024-02-15',
    workCategory: 'Bar Bender',
    skillLevel: 'Skilled',
    designation: 'Steel Cutting & Ring Specialist',
    wageType: 'daily',
    rate: 750,
    assignedSiteId: 'SITE-02',
    assignedSiteName: 'Type 4',
    status: 'active',
    remarks: 'Rebar cutting machine and column stirrups bending.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

const SEED_ATTENDANCE: AttendanceRecord[] = [
  {
    id: `att_${getTodayDateStr()}_KKS001`,
    date: getTodayDateStr(),
    siteId: 'SITE-01',
    siteName: 'Indoor gymnasium',
    workerId: 'KKS001',
    workerName: 'Ramesh Kumar Sah',
    workerTrade: 'Shuttering Carpenter',
    status: 'present',
    checkInTime: '08:00',
    checkOutTime: '17:00',
    overtimeHours: 2,
    remarks: '2nd floor front canopy shuttering staging completed.',
    markedBy: 'Site Supervisor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `att_${getTodayDateStr()}_KKS002`,
    date: getTodayDateStr(),
    siteId: 'SITE-01',
    siteName: 'Indoor gymnasium',
    workerId: 'KKS002',
    workerName: 'Manoj Kumar Yadav',
    workerTrade: 'Steel Fixer',
    status: 'present',
    checkInTime: '08:00',
    checkOutTime: '17:00',
    overtimeHours: 1,
    remarks: 'Main beam steel cage binding.',
    markedBy: 'Site Supervisor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `att_${getTodayDateStr()}_KKS003`,
    date: getTodayDateStr(),
    siteId: 'SITE-01',
    siteName: 'Indoor gymnasium',
    workerId: 'KKS003',
    workerName: 'Surendra Prasad',
    workerTrade: 'Rajmistri / Mason',
    status: 'present',
    checkInTime: '08:15',
    checkOutTime: '17:00',
    overtimeHours: 0,
    remarks: 'Boundary wall brick masonry.',
    markedBy: 'Site Supervisor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `att_${getTodayDateStr()}_KKS004`,
    date: getTodayDateStr(),
    siteId: 'SITE-01',
    siteName: 'Indoor gymnasium',
    workerId: 'KKS004',
    workerName: 'Anil Bind',
    workerTrade: 'Shuttering Carpenter',
    status: 'present',
    checkInTime: '08:00',
    checkOutTime: '17:00',
    overtimeHours: 2,
    remarks: 'Assisting Ramesh on beam bottom leveling.',
    markedBy: 'Site Supervisor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `att_${getTodayDateStr()}_KKS005`,
    date: getTodayDateStr(),
    siteId: 'SITE-01',
    siteName: 'Indoor gymnasium',
    workerId: 'KKS005',
    workerName: 'Pappu Manjhi',
    workerTrade: 'Helper / Beldar',
    status: 'present',
    checkInTime: '08:00',
    checkOutTime: '17:00',
    overtimeHours: 1,
    remarks: 'Prop shifting and shuttering oiling.',
    markedBy: 'Site Supervisor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `att_${getTodayDateStr()}_KKS006`,
    date: getTodayDateStr(),
    siteId: 'SITE-02',
    siteName: 'Type 4',
    workerId: 'KKS006',
    workerName: 'Sunil Chauhan',
    workerTrade: 'Helper / Beldar',
    status: 'present',
    checkInTime: '08:00',
    checkOutTime: '17:00',
    overtimeHours: 0,
    remarks: 'Pier cap cleaning and material loading.',
    markedBy: 'Authorized Site Supervisor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `att_${getTodayDateStr()}_KKS007`,
    date: getTodayDateStr(),
    siteId: 'SITE-02',
    siteName: 'Type 4',
    workerId: 'KKS007',
    workerName: 'Dharmendra Sharma',
    workerTrade: 'Mixer / Vibrator Operator',
    status: 'present',
    checkInTime: '08:00',
    checkOutTime: '17:00',
    overtimeHours: 2,
    remarks: 'Retaining wall batching concrete pouring.',
    markedBy: 'Authorized Site Supervisor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `att_${getTodayDateStr()}_KKS008`,
    date: getTodayDateStr(),
    siteId: 'SITE-02',
    siteName: 'Type 4',
    workerId: 'KKS008',
    workerName: 'Vikram Kumar',
    workerTrade: 'Bar Bender',
    status: 'leave',
    overtimeHours: 0,
    remarks: 'Family function at Barharia village.',
    markedBy: 'Authorized Site Supervisor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_ADVANCES: AdvancePayment[] = [
  {
    id: 'ADV-101',
    workerId: 'KKS001',
    workerName: 'Ramesh Kumar Sah',
    date: getTodayDateStr(),
    type: 'advance',
    amount: 1500,
    paymentMethod: 'Cash',
    purpose: 'Weekly ration & children school fee at Mairwa',
    siteId: 'SITE-01',
    siteName: 'Indoor gymnasium',
    enteredBy: 'Kalindra Kumar Singh',
    remarks: 'Paid in cash at site office.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ADV-102',
    workerId: 'KKS002',
    workerName: 'Manoj Kumar Yadav',
    date: getTodayDateStr(),
    type: 'advance',
    amount: 1000,
    paymentMethod: 'UPI',
    referenceNumber: 'UPI/61928374920',
    purpose: 'Bike fuel and family emergency',
    siteId: 'SITE-01',
    siteName: 'Indoor gymnasium',
    enteredBy: 'Kalindra Kumar Singh',
    remarks: 'Transferred directly to Manoj UPI.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ADV-103',
    workerId: 'KKS005',
    workerName: 'Pappu Manjhi',
    date: getTodayDateStr(),
    type: 'advance',
    amount: 500,
    paymentMethod: 'Cash',
    purpose: 'Medicine for mother',
    siteId: 'SITE-01',
    siteName: 'Indoor gymnasium',
    enteredBy: 'Site Supervisor',
    remarks: 'Handed over by supervisor on site.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_REPORTS: DailyWorkReport[] = [
  {
    id: 'REP-001',
    reportDate: getTodayDateStr(),
    siteId: 'SITE-01',
    siteName: 'Indoor gymnasium',
    workLocation: 'First Floor Rear Slab & Beam Section B-3',
    workCategory: 'Shuttering Carpenter',
    workCompletedToday: 'Second beam bottom prop staging and side plywood fixing completed. 850 sq ft shuttering area ready for inspection.',
    workInProgress: 'Leveling of cantilever balcony shuttering and oiling of metal plates ongoing.',
    quantityCompleted: 850,
    unit: 'sq ft',
    workersCount: 5,
    supervisorName: 'Kalindra Kumar Singh',
    materialsUsed: '32 sheets 12mm Film-faced Plywood, 45 Acrow Props, 15 Runner battens (3x4 inch), 8 kg 2-inch wire nails.',
    equipmentUsed: 'Leveling tube, circular saw, plumb bob, measuring tape.',
    workStartTime: '08:00 AM',
    workEndTime: '05:30 PM',
    qualitySafetyObservations: 'All scaffolding checked for stability. Safety helmets & boots worn by all 5 workers.',
    hasProblemsOrDelays: false,
    descriptionHindiEnglish: 'आज प्रथम तल पर 850 वर्ग फीट शटरिंग का कार्य पूरा हुआ। बीम बॉटम और साइड प्लाई फिक्सिंग पूरी कर ली गई है।',
    submittedBy: 'Kalindra Kumar Singh',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REP-002',
    reportDate: getTodayDateStr(),
    siteId: 'SITE-02',
    siteName: 'Type 4',
    workLocation: 'Retaining Wall Pier 4 East Side',
    workCategory: 'Bar Bender & Shuttering',
    workCompletedToday: '120 running feet retaining wall steel cage binding and heavy steel shuttering panel erection completed.',
    workInProgress: 'Tie rod fixing and wing wall prop bracing.',
    quantityCompleted: 120,
    unit: 'running ft',
    workersCount: 3,
    supervisorName: 'Authorized Site Supervisor',
    materialsUsed: '16mm and 20mm TMT steel bars (approx 1.8 ton), 20kg binding wire, 24 shuttering steel plates.',
    equipmentUsed: 'Diesel bar cutter, hydraulic bending machine.',
    workStartTime: '08:00 AM',
    workEndTime: '05:00 PM',
    qualitySafetyObservations: 'Cover blocks (50mm) placed properly before panel closing.',
    hasProblemsOrDelays: false,
    descriptionHindiEnglish: 'पियर 4 रिटेनिंग वाल की 120 रनिंग फीट स्टील बाइंडिंग और शटरिंग पूरी हुई। कंक्रीटिंग कल सुबह होगी।',
    submittedBy: 'Authorized Site Supervisor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_PLANS: NextDayPlan[] = [
  {
    id: 'PLAN-001',
    planDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    siteId: 'SITE-01',
    siteName: 'Indoor gymnasium',
    expectedWork: 'Complete slab shuttering staging & start steel rebar placement on Section B-3.',
    workLocation: 'First Floor Section B-3 and Front Cantilever Balcony',
    plannedActivities: [
      'Finalize cantilever balcony shuttering supports and check levels',
      'Start top mesh 10mm TMT bar cutting and spacing at 6-inch centers',
      'Install beam chairs and 25mm PVC cover blocks',
      'Apply shuttering release agent oil over entire 850 sq ft area',
    ],
    expectedWorkersCount: 6,
    assignedTeam: 'Ramesh Mistri, Manoj Yadav, Anil Bind, Surendra, Pappu + 1 Extra Helper',
    materialsRequired: '60 kg 18-gauge binding wire, 15 litres shuttering oil, 200 pcs 25mm cover blocks.',
    toolsEquipmentRequired: 'Bar bending keys, wire cutters, hammer, chalk line, spirit level.',
    priority: 'high',
    dependenciesOrApprovals: 'Client structural engineer slab shuttering clearance inspection at 11:30 AM.',
    expectedStartTime: '08:00 AM',
    expectedCompletionTime: '05:30 PM',
    responsibleSupervisor: 'Kalindra Kumar Singh',
    safetyPrecautions: 'Edge guard rails along building perimeter, harness for cantilever workers.',
    status: 'planned',
    createdBy: 'Kalindra Kumar Singh',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_EXPENSES: SiteExpense[] = [
  {
    id: 'EXP-001',
    date: getTodayDateStr(),
    siteId: 'SITE-01',
    siteName: 'Indoor gymnasium',
    category: 'Material',
    description: 'Wire nails (2-inch, 2.5-inch) 15 kg + Binding wire 2 rolls from Mairwa Hardware',
    amount: 2350,
    paymentMethod: 'Cash',
    paidBy: 'Kalindra Kumar Singh',
    referenceNumber: 'BILL/MHW/482',
    remarks: 'Direct cash purchase for immediate beam shuttering.',
    enteredBy: 'Kalindra Kumar Singh',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'EXP-002',
    date: getTodayDateStr(),
    siteId: 'SITE-02',
    siteName: 'Type 4',
    category: 'Fuel',
    description: 'Diesel 35 Litres for Concrete Mixer & Vibrator generator',
    amount: 3290,
    paymentMethod: 'UPI',
    paidBy: 'Authorized Site Supervisor',
    referenceNumber: 'IOCL/SIWAN/8291',
    remarks: 'Indian Oil petrol pump near bypass.',
    enteredBy: 'Authorized Site Supervisor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'EXP-003',
    date: getTodayDateStr(),
    siteId: 'SITE-01',
    siteName: 'Indoor gymnasium',
    category: 'Food',
    description: 'Afternoon tea and snacks for 5 site workers during overtime',
    amount: 180,
    paymentMethod: 'Cash',
    paidBy: 'Site Supervisor',
    remarks: 'Tea stall near Mairwa market.',
    enteredBy: 'Site Supervisor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class LocalDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported on this device.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Workers store
        if (!db.objectStoreNames.contains('workers')) {
          const workerStore = db.createObjectStore('workers', { keyPath: 'id' });
          workerStore.createIndex('by_site', 'assignedSiteId', { unique: false });
          workerStore.createIndex('by_status', 'status', { unique: false });
        }

        // 2. Sites store
        if (!db.objectStoreNames.contains('sites')) {
          const siteStore = db.createObjectStore('sites', { keyPath: 'id' });
          siteStore.createIndex('by_status', 'status', { unique: false });
        }

        // 3. Attendance store
        if (!db.objectStoreNames.contains('attendance')) {
          const attStore = db.createObjectStore('attendance', { keyPath: 'id' });
          attStore.createIndex('by_date', 'date', { unique: false });
          attStore.createIndex('by_site', 'siteId', { unique: false });
          attStore.createIndex('by_worker', 'workerId', { unique: false });
        }

        // 4. Advances store
        if (!db.objectStoreNames.contains('advances')) {
          const advStore = db.createObjectStore('advances', { keyPath: 'id' });
          advStore.createIndex('by_worker', 'workerId', { unique: false });
          advStore.createIndex('by_date', 'date', { unique: false });
          advStore.createIndex('by_site', 'siteId', { unique: false });
        }

        // 5. Salary Payments store
        if (!db.objectStoreNames.contains('salaryPayments')) {
          const salStore = db.createObjectStore('salaryPayments', { keyPath: 'id' });
          salStore.createIndex('by_worker', 'workerId', { unique: false });
          salStore.createIndex('by_month', 'month', { unique: false });
        }

        // 6. Site Work Reports store
        if (!db.objectStoreNames.contains('siteReports')) {
          const repStore = db.createObjectStore('siteReports', { keyPath: 'id' });
          repStore.createIndex('by_date', 'reportDate', { unique: false });
          repStore.createIndex('by_site', 'siteId', { unique: false });
        }

        // 7. Next Day Plans store
        if (!db.objectStoreNames.contains('nextDayPlans')) {
          const planStore = db.createObjectStore('nextDayPlans', { keyPath: 'id' });
          planStore.createIndex('by_date', 'planDate', { unique: false });
          planStore.createIndex('by_site', 'siteId', { unique: false });
        }

        // 8. Site Expenses store
        if (!db.objectStoreNames.contains('expenses')) {
          const expStore = db.createObjectStore('expenses', { keyPath: 'id' });
          expStore.createIndex('by_date', 'date', { unique: false });
          expStore.createIndex('by_site', 'siteId', { unique: false });
          expStore.createIndex('by_category', 'category', { unique: false });
        }

        // 9. Media items store (photos & videos stored locally)
        if (!db.objectStoreNames.contains('media')) {
          const mediaStore = db.createObjectStore('media', { keyPath: 'id' });
          mediaStore.createIndex('by_date', 'date', { unique: false });
          mediaStore.createIndex('by_site', 'siteId', { unique: false });
          mediaStore.createIndex('by_report', 'reportId', { unique: false });
        }

        // 10. App Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // 11. Food Allowances store (Earned & Paid Khoraki)
        if (!db.objectStoreNames.contains('foodAllowances')) {
          const faStore = db.createObjectStore('foodAllowances', { keyPath: 'id' });
          faStore.createIndex('by_worker', 'workerId', { unique: false });
          faStore.createIndex('by_date', 'date', { unique: false });
          faStore.createIndex('by_site', 'siteId', { unique: false });
        }
      };

      request.onsuccess = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
        // Seed if empty
        await this.ensureSeedData(db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  private async ensureSeedData(db: IDBDatabase): Promise<void> {
    try {
      const countWorkers = await this.countStore(db, 'workers');
      if (countWorkers === 0) {
        // Seed initial data
        await this.bulkInsert(db, 'workers', SEED_WORKERS);
        await this.bulkInsert(db, 'sites', SEED_SITES);
        await this.bulkInsert(db, 'attendance', SEED_ATTENDANCE);
        await this.bulkInsert(db, 'advances', SEED_ADVANCES);
        await this.bulkInsert(db, 'siteReports', SEED_REPORTS);
        await this.bulkInsert(db, 'nextDayPlans', SEED_PLANS);
        await this.bulkInsert(db, 'expenses', SEED_EXPENSES);
        await this.setSetting('app_config', DEFAULT_SETTINGS);
      } else {
        // Migration / sync: Ensure the 6 required sites exist and upgrade old placeholder names
        const existingSites: ConstructionSite[] = await new Promise((resolve) => {
          const tx = db.transaction('sites', 'readonly');
          const store = tx.objectStore('sites');
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        });

        const tx = db.transaction('sites', 'readwrite');
        const store = tx.objectStore('sites');

        for (const defaultSite of DEFAULT_KKS_SITES) {
          const existing = existingSites.find((s) => s.id === defaultSite.id);
          if (!existing) {
            store.put(defaultSite);
          } else if (
            existing.name.includes('Mairwa Commercial Market Complex') ||
            existing.name.includes('Siwan Railway Bypass Flyover') ||
            existing.name.includes('Gopalganj Residential Villa')
          ) {
            store.put({
              ...existing,
              name: defaultSite.name,
              remarks: defaultSite.remarks,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }
    } catch (e) {
      console.warn('Seed initialization error (ignorable if existing):', e);
    }
  }

  private countStore(db: IDBDatabase, storeName: string): Promise<number> {
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(0);
    });
  }

  private bulkInsert(db: IDBDatabase, storeName: string, items: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      items.forEach((item) => store.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Generic CRUD
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getById<T>(storeName: string, id: string): Promise<T | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async put<T>(storeName: string, item: T): Promise<T> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clearStore(storeName: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Settings
  async getSettings(): Promise<AppSettings> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get('app_config');
      req.onsuccess = () => {
        if (req.result && req.result.value) {
          resolve({ ...DEFAULT_SETTINGS, ...req.result.value });
        } else {
          resolve(DEFAULT_SETTINGS);
        }
      };
      req.onerror = () => resolve(DEFAULT_SETTINGS);
    });
  }

  async setSetting(key: string, value: any): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const req = store.put({ key, value });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Backup & Restore
  async exportFullBackup(): Promise<string> {
    const db = await this.getDB();
    const storeNames = [
      'workers',
      'sites',
      'attendance',
      'foodAllowances',
      'advances',
      'salaryPayments',
      'siteReports',
      'nextDayPlans',
      'expenses',
      'media',
      'settings',
    ];

    const backupData: Record<string, any> = {
      app: 'KKSInfraWorks Construction Management',
      version: '2.0.0-offline',
      exportedAt: new Date().toISOString(),
      firm: 'KKSInfraWorks (Kalindra Kumar Singh)',
    };

    for (const name of storeNames) {
      backupData[name] = await this.getAll(name);
    }

    return JSON.stringify(backupData, null, 2);
  }

  async importFullBackup(jsonString: string): Promise<{ success: boolean; message: string; count: number }> {
    try {
      const data = JSON.parse(jsonString);
      if (!data.app && !data.workers && !data.sites) {
        throw new Error('Invalid KKSInfraWorks backup file structure.');
      }

      const db = await this.getDB();
      const stores = [
        'workers',
        'sites',
        'attendance',
        'foodAllowances',
        'advances',
        'salaryPayments',
        'siteReports',
        'nextDayPlans',
        'expenses',
        'media',
      ];

      let totalRecords = 0;

      for (const store of stores) {
        if (Array.isArray(data[store])) {
          await this.clearStore(store);
          await this.bulkInsert(db, store, data[store]);
          totalRecords += data[store].length;
        }
      }

      if (data.settings && Array.isArray(data.settings)) {
        await this.clearStore('settings');
        await this.bulkInsert(db, 'settings', data.settings);
      }

      return {
        success: true,
        message: `Successfully restored ${totalRecords} records into local storage.`,
        count: totalRecords,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to parse or restore backup file.',
        count: 0,
      };
    }
  }

  // Storage Quota
  async getStorageEstimate(): Promise<{ usedBytes: number; quotaBytes: number; percent: number }> {
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        const used = est.usage || 0;
        const quota = est.quota || 1;
        return {
          usedBytes: used,
          quotaBytes: quota,
          percent: Math.min(100, Math.round((used / quota) * 100)),
        };
      } catch {
        // fallback
      }
    }
    return { usedBytes: 0, quotaBytes: 0, percent: 0 };
  }
}

export const localDb = new LocalDatabase();
