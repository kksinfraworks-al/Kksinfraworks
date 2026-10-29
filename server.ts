import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Setup multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    const uniqueName = `kks_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeBase}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for photos/videos
});

// In-memory + persistent database interface
interface DatabaseSchema {
  users: any[];
  workers: any[];
  sites: any[];
  attendance: any[];
  advances: any[];
  siteReports: any[];
  nextDayPlans: any[];
  expenses: any[];
  media: any[];
  auditLogs: any[];
  sessions: { [token: string]: { userId: string; createdAt: number; expiresAt: number } };
  lastUpdated: number;
}

// Password hashing with salt
function hashPassword(password: string, salt = 'kks_infra_secure_salt_2002'): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Initial seed data with authentic Bihar construction details
function getInitialSeedData(): DatabaseSchema {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
  const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().split('T')[0];

  const adminPasswordHash = hashPassword('KKS@Admin2002');
  const managerPasswordHash = hashPassword('KKS@Site2026');

  return {
    lastUpdated: Date.now(),
    sessions: {},
    users: [
      {
        id: 'usr_kalindra',
        username: 'kalindra',
        email: 'kalindra@kksinfraworks.com',
        name: 'Kalindra Kumar Singh',
        role: 'admin',
        phone: '+91 98350 41239',
        passwordHash: adminPasswordHash,
        active: true,
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
        lastLoginIp: '192.168.1.101 (Android Chrome)',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'usr_ramesh',
        username: 'sitemanager',
        email: 'manager@kksinfraworks.com',
        name: 'Ramesh Sharma',
        role: 'manager',
        phone: '+91 94314 88762',
        passwordHash: managerPasswordHash,
        active: true,
        lastLogin: new Date(Date.now() - 7200000).toISOString(),
        lastLoginIp: '192.168.1.105 (Android Chrome)',
        createdAt: '2026-01-05T00:00:00.000Z',
      },
    ],
    sites: [
      {
        id: 'SITE-01',
        name: 'Mairwa Commercial Complex G+4',
        clientName: 'Mairwa Plaza Dev Corp',
        completeAddress: 'Bargawn Road, Near Railway Crossing, Mairwa, Bihar – 841239',
        supervisor: 'Ramesh Sharma',
        startDate: '2026-01-15',
        expectedCompletionDate: '2026-12-30',
        status: 'active',
        workCategories: ['Column Shuttering', 'Beam Shuttering', 'Slab Shuttering', 'Staircase Shuttering', 'Slab Concreting', 'Steel Fixing'],
        assignedWorkerCount: 8,
        remarks: 'Proprietor Kalindra Singh direct oversight. Shuttering material stocked on site.',
        createdAt: '2026-01-15T08:00:00.000Z',
        updatedAt: '2026-01-15T08:00:00.000Z',
      },
      {
        id: 'SITE-02',
        name: 'Siwan Railway Bypass Overbridge Approach',
        clientName: 'Bihar State Bridge Construction Corp',
        completeAddress: 'Siwan Station Outer Bypass Road, Siwan, Bihar – 841226',
        supervisor: 'Ramesh Sharma',
        startDate: '2026-02-01',
        expectedCompletionDate: '2026-08-31',
        status: 'in_progress',
        workCategories: ['Column Concreting', 'Beam Shuttering', 'Steel Fixing', 'De-shuttering', 'Material Shifting'],
        assignedWorkerCount: 6,
        remarks: 'Heavy shuttering plates and props deployed.',
        createdAt: '2026-02-01T08:00:00.000Z',
        updatedAt: '2026-02-01T08:00:00.000Z',
      },
      {
        id: 'SITE-03',
        name: 'Gopalganj Agro Cold Storage & Warehouse',
        clientName: 'Kisan Agro Logistics Ltd',
        completeAddress: 'NH 531, Thawe Road, Gopalganj, Bihar – 841428',
        supervisor: 'Kalindra Kumar Singh',
        startDate: '2026-03-10',
        expectedCompletionDate: '2026-11-15',
        status: 'active',
        workCategories: ['Slab Shuttering', 'Column Shuttering', 'Slab Concreting', 'Other Civil Work'],
        assignedWorkerCount: 5,
        remarks: 'Large span shuttering with telescopic steel props.',
        createdAt: '2026-03-10T08:00:00.000Z',
        updatedAt: '2026-03-10T08:00:00.000Z',
      },
    ],
    workers: [
      {
        id: 'KKS001',
        name: 'Dharmendra Kumar Yadav',
        fatherName: 'Ram Bachan Yadav',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        mobile: '9835123451',
        villageAddress: 'Village Siswa, PO Mairwa, Siwan, Bihar',
        emergencyContact: '9835123459 (Brother)',
        joiningDate: '2023-04-10',
        workCategory: 'Shuttering Carpenter',
        skillLevel: 'Master Mistri',
        designation: 'Head Shuttering Mistri',
        wageType: 'daily',
        rate: 850,
        assignedSiteId: 'SITE-01',
        assignedSiteName: 'Mairwa Commercial Complex G+4',
        bankDetails: { bankName: 'State Bank of India', accountNo: '34512987102', ifsc: 'SBIN0002974', upiId: 'dharmendra@sbi' },
        status: 'active',
        remarks: 'Specialist in curved staircase shuttering and beam bottom leveling.',
        createdAt: '2023-04-10T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'KKS002',
        name: 'Subhash Chandra Verma',
        fatherName: 'Dinanath Verma',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        mobile: '9431422188',
        villageAddress: 'Village Bargawn, Mairwa, Bihar',
        emergencyContact: '9431422190 (Wife)',
        joiningDate: '2024-01-12',
        workCategory: 'Steel Fixer',
        skillLevel: 'Skilled',
        designation: 'Head Bar Bender',
        wageType: 'daily',
        rate: 750,
        assignedSiteId: 'SITE-01',
        assignedSiteName: 'Mairwa Commercial Complex G+4',
        bankDetails: { bankName: 'Punjab National Bank', accountNo: '18920001882', ifsc: 'PUNB0189200', upiId: 'subhash@pnb' },
        status: 'active',
        remarks: 'Column cage fabrication & slab rebar binding specialist.',
        createdAt: '2024-01-12T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'KKS003',
        name: 'Mukesh Sahani',
        fatherName: 'Gopal Sahani',
        photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        mobile: '9709844310',
        villageAddress: 'Village Dhamahi, Nautan, Siwan, Bihar',
        emergencyContact: '9709844319 (Father)',
        joiningDate: '2024-05-20',
        workCategory: 'Shuttering Carpenter',
        skillLevel: 'Skilled',
        designation: 'Shuttering Mistri',
        wageType: 'daily',
        rate: 700,
        assignedSiteId: 'SITE-01',
        assignedSiteName: 'Mairwa Commercial Complex G+4',
        bankDetails: { bankName: 'Bank of Baroda', accountNo: '44520199182', ifsc: 'BARB0MAIRWA', upiId: 'mukesh@barodampay' },
        status: 'active',
        remarks: 'Fast ply cutting and column box assembly.',
        createdAt: '2024-05-20T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'KKS004',
        name: 'Pappu Kumar Manjhi',
        fatherName: 'Bipat Manjhi',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        mobile: '8877112233',
        villageAddress: 'Village Semaria, Mairwa, Bihar',
        emergencyContact: '8877112230 (Uncle)',
        joiningDate: '2024-08-15',
        workCategory: 'Helper / Beldar',
        skillLevel: 'Semi-Skilled',
        designation: 'Shuttering Helper',
        wageType: 'daily',
        rate: 500,
        assignedSiteId: 'SITE-01',
        assignedSiteName: 'Mairwa Commercial Complex G+4',
        status: 'active',
        remarks: 'Material shifting and de-shuttering prop handling.',
        createdAt: '2024-08-15T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'KKS005',
        name: 'Vinod Kumar Giri',
        fatherName: 'Mahadev Giri',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        mobile: '9122334455',
        villageAddress: 'Village Gopalpur, Guthani Road, Bihar',
        emergencyContact: '9122334450 (Son)',
        joiningDate: '2023-11-01',
        workCategory: 'Rajmistri / Mason',
        skillLevel: 'Skilled',
        designation: 'Concrete Mason',
        wageType: 'daily',
        rate: 800,
        assignedSiteId: 'SITE-02',
        assignedSiteName: 'Siwan Railway Bypass Overbridge Approach',
        bankDetails: { bankName: 'Central Bank of India', accountNo: '2288119022', ifsc: 'CBIN0280145' },
        status: 'active',
        remarks: 'Expert in surface finishing and screed vibration.',
        createdAt: '2023-11-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'KKS006',
        name: 'Akhilesh Chauhan',
        fatherName: 'Lalta Chauhan',
        photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        mobile: '9631223344',
        villageAddress: 'Village Darauli, Siwan, Bihar',
        emergencyContact: '9631223340 (Brother)',
        joiningDate: '2025-02-10',
        workCategory: 'Mixer / Vibrator Operator',
        skillLevel: 'Skilled',
        designation: 'Equipment Operator',
        wageType: 'daily',
        rate: 650,
        assignedSiteId: 'SITE-02',
        assignedSiteName: 'Siwan Railway Bypass Overbridge Approach',
        status: 'active',
        remarks: 'Diesel concrete mixer maintenance and operation.',
        createdAt: '2025-02-10T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'KKS007',
        name: 'Santosh Kumar Bind',
        fatherName: 'Ramji Bind',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        mobile: '9570112244',
        villageAddress: 'Village Pipra, Gopalganj, Bihar',
        emergencyContact: '9570112240 (Wife)',
        joiningDate: '2025-03-01',
        workCategory: 'Shuttering Carpenter',
        skillLevel: 'Skilled',
        designation: 'Slab Shuttering Mistri',
        wageType: 'daily',
        rate: 720,
        assignedSiteId: 'SITE-03',
        assignedSiteName: 'Gopalganj Agro Cold Storage & Warehouse',
        status: 'active',
        remarks: 'Specialized in large grid steel staging and spans.',
        createdAt: '2025-03-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'KKS008',
        name: 'Chandan Kumar Paswan',
        fatherName: 'Sukhari Paswan',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        mobile: '9308112299',
        villageAddress: 'Village Bairia, Mairwa, Bihar',
        emergencyContact: '9308112290 (Father)',
        joiningDate: '2025-04-12',
        workCategory: 'Helper / Beldar',
        skillLevel: 'Semi-Skilled',
        designation: 'General Labour',
        wageType: 'daily',
        rate: 480,
        assignedSiteId: 'SITE-03',
        assignedSiteName: 'Gopalganj Agro Cold Storage & Warehouse',
        status: 'active',
        remarks: 'Scaffolding pipe erection and tie wire assistance.',
        createdAt: '2025-04-12T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    attendance: [
      {
        id: 'att_01',
        date: todayStr,
        siteId: 'SITE-01',
        siteName: 'Mairwa Commercial Complex G+4',
        workerId: 'KKS001',
        workerName: 'Dharmendra Kumar Yadav',
        workerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        workerTrade: 'Shuttering Carpenter',
        status: 'present',
        checkInTime: '08:00 AM',
        checkOutTime: '06:00 PM',
        overtimeHours: 1.5,
        remarks: 'Staircase shuttering work',
        markedBy: 'usr_ramesh',
        markedByName: 'Ramesh Sharma',
        createdAt: `${todayStr}T08:15:00.000Z`,
        updatedAt: `${todayStr}T08:15:00.000Z`,
      },
      {
        id: 'att_02',
        date: todayStr,
        siteId: 'SITE-01',
        siteName: 'Mairwa Commercial Complex G+4',
        workerId: 'KKS002',
        workerName: 'Subhash Chandra Verma',
        workerPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        workerTrade: 'Steel Fixer',
        status: 'present',
        checkInTime: '08:00 AM',
        checkOutTime: '05:30 PM',
        overtimeHours: 1.0,
        remarks: 'Beam bottom rebar layout',
        markedBy: 'usr_ramesh',
        markedByName: 'Ramesh Sharma',
        createdAt: `${todayStr}T08:15:00.000Z`,
        updatedAt: `${todayStr}T08:15:00.000Z`,
      },
      {
        id: 'att_03',
        date: todayStr,
        siteId: 'SITE-01',
        siteName: 'Mairwa Commercial Complex G+4',
        workerId: 'KKS003',
        workerName: 'Mukesh Sahani',
        workerPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        workerTrade: 'Shuttering Carpenter',
        status: 'present',
        checkInTime: '08:10 AM',
        checkOutTime: '',
        overtimeHours: 0,
        remarks: 'Cutting shuttering plywood',
        markedBy: 'usr_ramesh',
        markedByName: 'Ramesh Sharma',
        createdAt: `${todayStr}T08:15:00.000Z`,
        updatedAt: `${todayStr}T08:15:00.000Z`,
      },
      {
        id: 'att_04',
        date: todayStr,
        siteId: 'SITE-01',
        siteName: 'Mairwa Commercial Complex G+4',
        workerId: 'KKS004',
        workerName: 'Pappu Kumar Manjhi',
        workerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        workerTrade: 'Helper / Beldar',
        status: 'half_day',
        checkInTime: '08:00 AM',
        checkOutTime: '01:00 PM',
        overtimeHours: 0,
        remarks: 'Left early for family emergency',
        markedBy: 'usr_ramesh',
        markedByName: 'Ramesh Sharma',
        createdAt: `${todayStr}T08:15:00.000Z`,
        updatedAt: `${todayStr}T13:00:00.000Z`,
      },
      {
        id: 'att_05',
        date: todayStr,
        siteId: 'SITE-02',
        siteName: 'Siwan Railway Bypass Overbridge Approach',
        workerId: 'KKS005',
        workerName: 'Vinod Kumar Giri',
        workerPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        workerTrade: 'Rajmistri / Mason',
        status: 'present',
        checkInTime: '08:00 AM',
        checkOutTime: '',
        overtimeHours: 0,
        remarks: 'Column concreting level check',
        markedBy: 'usr_kalindra',
        markedByName: 'Kalindra Kumar Singh',
        createdAt: `${todayStr}T08:30:00.000Z`,
        updatedAt: `${todayStr}T08:30:00.000Z`,
      },
      {
        id: 'att_06',
        date: todayStr,
        siteId: 'SITE-02',
        siteName: 'Siwan Railway Bypass Overbridge Approach',
        workerId: 'KKS006',
        workerName: 'Akhilesh Chauhan',
        workerPhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        workerTrade: 'Mixer / Vibrator Operator',
        status: 'absent',
        checkInTime: '',
        checkOutTime: '',
        overtimeHours: 0,
        remarks: 'Informed via phone, sick leave',
        markedBy: 'usr_kalindra',
        markedByName: 'Kalindra Kumar Singh',
        createdAt: `${todayStr}T08:30:00.000Z`,
        updatedAt: `${todayStr}T08:30:00.000Z`,
      },
    ],
    advances: [
      {
        id: 'adv_01',
        workerId: 'KKS001',
        workerName: 'Dharmendra Kumar Yadav',
        date: yesterdayStr,
        type: 'advance',
        amount: 2500,
        paymentMethod: 'UPI',
        purpose: 'Holi Festival advance for family ration',
        siteId: 'SITE-01',
        siteName: 'Mairwa Commercial Complex G+4',
        referenceNumber: 'UPI/602981048821',
        receiptUrl: '',
        enteredBy: 'usr_kalindra',
        enteredByName: 'Kalindra Kumar Singh',
        remarks: 'Approved by Proprietor Kalindra Singh directly',
        createdAt: `${yesterdayStr}T17:00:00.000Z`,
        updatedAt: `${yesterdayStr}T17:00:00.000Z`,
      },
      {
        id: 'adv_02',
        workerId: 'KKS003',
        workerName: 'Mukesh Sahani',
        date: yesterdayStr,
        type: 'advance',
        amount: 1500,
        paymentMethod: 'Cash',
        purpose: 'Doctor fees and medical medicines',
        siteId: 'SITE-01',
        siteName: 'Mairwa Commercial Complex G+4',
        referenceNumber: 'CASH-SITE1-92',
        receiptUrl: '',
        enteredBy: 'usr_ramesh',
        enteredByName: 'Ramesh Sharma',
        remarks: 'Site cash petty advance',
        createdAt: `${yesterdayStr}T11:20:00.000Z`,
        updatedAt: `${yesterdayStr}T11:20:00.000Z`,
      },
      {
        id: 'adv_03',
        workerId: 'KKS002',
        workerName: 'Subhash Chandra Verma',
        date: todayStr,
        type: 'advance',
        amount: 3000,
        paymentMethod: 'Bank Transfer',
        purpose: 'Children school tuition fee payment',
        siteId: 'SITE-01',
        siteName: 'Mairwa Commercial Complex G+4',
        referenceNumber: 'IMPS/602983192837',
        enteredBy: 'usr_kalindra',
        enteredByName: 'Kalindra Kumar Singh',
        remarks: 'Transferred directly to PNB account',
        createdAt: `${todayStr}T10:00:00.000Z`,
        updatedAt: `${todayStr}T10:00:00.000Z`,
      },
    ],
    siteReports: [
      {
        id: 'rep_01',
        reportDate: todayStr,
        siteId: 'SITE-01',
        siteName: 'Mairwa Commercial Complex G+4',
        workLocation: 'Indoor Gymnasium & 2nd Floor Staircase',
        workCategory: 'Staircase Shuttering',
        workCompletedToday: 'Staircase waist slab and riser shuttering 14 steps completed',
        workInProgress: 'Landing reinforcement and handrail starter bar fixing',
        quantityCompleted: 180,
        unit: 'sq ft',
        workersCount: 4,
        supervisorName: 'Ramesh Sharma',
        materialsUsed: '12mm shuttering ply 14 sheets, 3.5m adjustable steel props 24 pcs, tie rods 12 nos',
        equipmentUsed: 'Level tube, circular wood cutter, plumb bob',
        workStartTime: '08:30 AM',
        workEndTime: '05:30 PM',
        qualitySafetyObservations: 'Line, level and plumb checked thoroughly with Kalindra Sir. Propping spacing maintained at 900mm center-to-center.',
        hasProblemsOrDelays: false,
        delayReason: '',
        descriptionHindiEnglish: 'Indoor Gymnasium: Staircase shuttering completed. Concrete work is pending. The shuttering material will be removed after approval and reused near the lift staircase.\n(इंडोर जिमनेजियम: सीढ़ी की शटरिंग का काम पूरा कर लिया गया है। कंक्रीटिंग का काम शेष है। कंक्रीट सूखने के बाद शटरिंग खोलकर लिफ्ट डक्ट के पास इस्तेमाल किया जाएगा।)',
        mediaItems: [
          {
            id: 'med_01',
            type: 'photo',
            url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=600&auto=format&fit=crop&q=80',
            fileName: 'staircase_shuttering_inspection.jpg',
            caption: '2nd Floor Staircase Waist Slab & Riser Shuttering checked',
            siteId: 'SITE-01',
            siteName: 'Mairwa Commercial Complex G+4',
            uploadedBy: 'usr_ramesh',
            uploadedByName: 'Ramesh Sharma',
            uploadedAt: `${todayStr}T14:30:00.000Z`,
            fileSize: 420000,
          },
        ],
        submittedBy: 'usr_ramesh',
        submittedByName: 'Ramesh Sharma',
        createdAt: `${todayStr}T17:45:00.000Z`,
        updatedAt: `${todayStr}T17:45:00.000Z`,
      },
      {
        id: 'rep_02',
        reportDate: todayStr,
        siteId: 'SITE-02',
        siteName: 'Siwan Railway Bypass Overbridge Approach',
        workLocation: 'Pier P-3 and Retaining Abutment Wall A1',
        workCategory: 'Column Concreting',
        workCompletedToday: 'Concreting of Pier P-3 cap (M30 grade)',
        workInProgress: 'Abutment wall rebar tying and side shuttering',
        quantityCompleted: 350,
        unit: 'cubic ft',
        workersCount: 6,
        supervisorName: 'Kalindra Kumar Singh',
        materialsUsed: 'Ready cement 85 bags, 20mm coarse aggregate 2.5 brass, sand 1.5 brass',
        equipmentUsed: 'Concrete mixer 10/7, 60mm needle vibrator, cube moulds 6 nos',
        workStartTime: '09:00 AM',
        workEndTime: '04:30 PM',
        qualitySafetyObservations: 'Concrete slump maintained at 100mm. Cube specimens taken for 7 & 28 days compressive testing.',
        hasProblemsOrDelays: false,
        descriptionHindiEnglish: 'Pier P-3 concreting completed satisfactorily with mechanical compaction. Curing burlap bags wrapped immediately.\n(पियर P-3 की कंक्रीटिंग सुचारू रूप से पूरी हुई। तराई के लिए बोरे लपेट दिए गए हैं।)',
        mediaItems: [
          {
            id: 'med_02',
            type: 'photo',
            url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
            fileName: 'pier_concreting_siwan.jpg',
            caption: 'Pier P-3 M30 Concreting with Needle Vibrator',
            siteId: 'SITE-02',
            siteName: 'Siwan Railway Bypass Overbridge Approach',
            uploadedBy: 'usr_kalindra',
            uploadedByName: 'Kalindra Kumar Singh',
            uploadedAt: `${todayStr}T15:10:00.000Z`,
            fileSize: 512000,
          },
        ],
        submittedBy: 'usr_kalindra',
        submittedByName: 'Kalindra Kumar Singh',
        createdAt: `${todayStr}T16:50:00.000Z`,
        updatedAt: `${todayStr}T16:50:00.000Z`,
      },
    ],
    nextDayPlans: [
      {
        id: 'plan_01',
        planDate: tomorrowStr,
        siteId: 'SITE-01',
        siteName: 'Mairwa Commercial Complex G+4',
        expectedWork: 'Complete staircase shuttering inspection, arrange required shuttering material near lift staircase, proceed with concrete work after approval.',
        workLocation: 'Lift Shaft & 2nd Floor Gymnasium Slab Extension',
        plannedActivities: [
          'Inspection of staircase reinforcement with client engineer at 9:30 AM',
          'Shift 20 shuttering plates and 30 props from ground stock to lift well',
          'Erect scaffold staging for lift wall formwork',
          'Check rebar cover blocks (25mm) on landing slab',
        ],
        expectedWorkersCount: 5,
        assignedTeam: 'Dharmendra Mistri (Lead), Mukesh (Carpenter), Pappu (Helper), Subhash (Fitter)',
        materialsRequired: 'Shuttering oil 15 liters, binding wire 10 kg, 20mm cover blocks 100 pcs, 40mm steel clamps',
        toolsEquipmentRequired: 'Mechanical winch, concrete vibrator, spanners, plumb bob',
        concreteShutteringRequirements: '1:1.5:3 concrete mix ready for 2 PM pour upon engineer sign-off',
        priority: 'high',
        dependenciesOrApprovals: 'Client structural engineer approval required before 11:00 AM pour',
        expectedStartTime: '08:00 AM',
        expectedCompletionTime: '06:00 PM',
        responsibleSupervisor: 'Ramesh Sharma',
        specialInstructions: 'Ensure safety harnesses for workers staging inside lift well. Barricade floor opening.',
        safetyPrecautions: 'Safety helmets, safety shoes, safety harness mandatory on lift shaft edge.',
        status: 'planned',
        delayReason: '',
        actualCompletedNotes: '',
        createdBy: 'usr_ramesh',
        createdByName: 'Ramesh Sharma',
        createdAt: `${todayStr}T18:00:00.000Z`,
        updatedAt: `${todayStr}T18:00:00.000Z`,
      },
      {
        id: 'plan_02',
        planDate: tomorrowStr,
        siteId: 'SITE-02',
        siteName: 'Siwan Railway Bypass Overbridge Approach',
        expectedWork: 'Abutment wall rebar tying and start shuttering assembly with M.S. plates.',
        workLocation: 'Abutment Wall A1 South Wing',
        plannedActivities: [
          'De-shutter side faces of Pier P-3 cap',
          'Bind 16mm vertical tor steel at 150mm spacing on Abutment A1',
          'Install tie rods and PVC spacer cones',
        ],
        expectedWorkersCount: 6,
        assignedTeam: 'Vinod Giri (Mason), Bar Benders (2), Helpers (3)',
        materialsRequired: 'M.S. Shuttering plates 80 sq m, water curing hose pipe 50m',
        toolsEquipmentRequired: 'Water booster pump for Pier P-3 curing, scaffold pipes',
        priority: 'medium',
        dependenciesOrApprovals: 'Curing approval from Railway liaison officer',
        expectedStartTime: '08:00 AM',
        expectedCompletionTime: '05:30 PM',
        responsibleSupervisor: 'Kalindra Kumar Singh',
        specialInstructions: 'Continuous ponding/burlap wet curing on P-3 cap from 7:00 AM.',
        safetyPrecautions: 'High-visibility fluorescent safety vests mandatory near bypass traffic.',
        status: 'planned',
        createdBy: 'usr_kalindra',
        createdByName: 'Kalindra Kumar Singh',
        createdAt: `${todayStr}T18:15:00.000Z`,
        updatedAt: `${todayStr}T18:15:00.000Z`,
      },
    ],
    expenses: [
      {
        id: 'exp_01',
        date: todayStr,
        siteId: 'SITE-01',
        siteName: 'Mairwa Commercial Complex G+4',
        category: 'Hardware & Fasteners',
        description: 'Shuttering tie rod nuts, 3-inch wire nails & binding wire roll 25kg',
        amount: 2450,
        paymentMethod: 'UPI',
        paidBy: 'Ramesh Sharma',
        referenceNumber: 'UPI/602984102938',
        remarks: 'Purchased from Mairwa Hardware Mart, cash memo #841',
        enteredBy: 'usr_ramesh',
        enteredByName: 'Ramesh Sharma',
        createdAt: `${todayStr}T12:30:00.000Z`,
        updatedAt: `${todayStr}T12:30:00.000Z`,
      },
      {
        id: 'exp_02',
        date: yesterdayStr,
        siteId: 'SITE-02',
        siteName: 'Siwan Railway Bypass Overbridge Approach',
        category: 'Fuel',
        description: 'Diesel for concrete mixer and 5kVA backup generator (35 Litres)',
        amount: 3290,
        paymentMethod: 'Cash',
        paidBy: 'Kalindra Kumar Singh',
        referenceNumber: 'PETROL-PUMP-INV-710',
        remarks: 'Bharat Petroleum Outlet Siwan Highway',
        enteredBy: 'usr_kalindra',
        enteredByName: 'Kalindra Kumar Singh',
        createdAt: `${yesterdayStr}T16:15:00.000Z`,
        updatedAt: `${yesterdayStr}T16:15:00.000Z`,
      },
    ],
    media: [
      {
        id: 'med_01',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=800&auto=format&fit=crop&q=80',
        fileName: 'staircase_shuttering_inspection.jpg',
        caption: '2nd Floor Staircase Waist Slab & Riser Shuttering inspection',
        siteId: 'SITE-01',
        siteName: 'Mairwa Commercial Complex G+4',
        reportId: 'rep_01',
        reportLocation: 'Indoor Gymnasium & 2nd Floor Staircase',
        workCategory: 'Staircase Shuttering',
        uploadedBy: 'usr_ramesh',
        uploadedByName: 'Ramesh Sharma',
        uploadedAt: `${todayStr}T14:30:00.000Z`,
        fileSize: 420000,
      },
      {
        id: 'med_02',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
        fileName: 'pier_concreting_siwan.jpg',
        caption: 'Pier P-3 M30 Concreting with Needle Vibrator',
        siteId: 'SITE-02',
        siteName: 'Siwan Railway Bypass Overbridge Approach',
        reportId: 'rep_02',
        reportLocation: 'Pier P-3 and Retaining Abutment Wall A1',
        workCategory: 'Column Concreting',
        uploadedBy: 'usr_kalindra',
        uploadedByName: 'Kalindra Kumar Singh',
        uploadedAt: `${todayStr}T15:10:00.000Z`,
        fileSize: 512000,
      },
    ],
    auditLogs: [
      {
        id: 'aud_01',
        timestamp: `${todayStr}T08:15:00.000Z`,
        userId: 'usr_ramesh',
        userName: 'Ramesh Sharma',
        userRole: 'Site Manager',
        action: 'create',
        entityType: 'attendance',
        entityId: 'att_01',
        summary: 'Marked daily attendance for Dharmendra Kumar Yadav (Present, 1.5h OT)',
        siteId: 'SITE-01',
        workerId: 'KKS001',
      },
      {
        id: 'aud_02',
        timestamp: `${todayStr}T10:00:00.000Z`,
        userId: 'usr_kalindra',
        userName: 'Kalindra Kumar Singh',
        userRole: 'Proprietor / Admin',
        action: 'create',
        entityType: 'advance',
        entityId: 'adv_03',
        summary: 'Recorded advance of ₹3,000 via Bank Transfer to Subhash Chandra Verma',
        siteId: 'SITE-01',
        workerId: 'KKS002',
      },
      {
        id: 'aud_03',
        timestamp: `${todayStr}T17:45:00.000Z`,
        userId: 'usr_ramesh',
        userName: 'Ramesh Sharma',
        userRole: 'Site Manager',
        action: 'create',
        entityType: 'work_report',
        entityId: 'rep_01',
        summary: 'Submitted Daily Work Report for Mairwa Commercial Complex: Staircase Shuttering (180 sq ft)',
        siteId: 'SITE-01',
      },
      {
        id: 'aud_04',
        timestamp: `${todayStr}T18:00:00.000Z`,
        userId: 'usr_ramesh',
        userName: 'Ramesh Sharma',
        userRole: 'Site Manager',
        action: 'create',
        entityType: 'next_day_plan',
        entityId: 'plan_01',
        summary: 'Created Tomorrow Work Plan for Mairwa Commercial Complex (Gymnasium slab & lift staging)',
        siteId: 'SITE-01',
      },
    ],
  };
}

// In-memory DB with atomic save
let db: DatabaseSchema;

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.workers) && Array.isArray(parsed.users)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading DB file, re-seeding:', err);
  }
  const seed = getInitialSeedData();
  saveDatabaseSync(seed);
  return seed;
}

function saveDatabaseSync(dataToSave: DatabaseSchema) {
  try {
    dataToSave.lastUpdated = Date.now();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

db = loadDatabase();

// Helper to record audit log
function recordAuditLog(
  user: { id: string; name: string; role: string },
  action: 'create' | 'update' | 'delete' | 'login' | 'status_change',
  entityType: 'worker' | 'attendance' | 'advance' | 'site' | 'work_report' | 'next_day_plan' | 'expense' | 'media' | 'user',
  entityId: string,
  summary: string,
  previousValues?: any,
  newValues?: any,
  siteId?: string,
  workerId?: string
) {
  const log = {
    id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role === 'admin' ? 'Proprietor / Admin' : 'Site Manager',
    action,
    entityType,
    entityId,
    summary,
    previousValues,
    newValues,
    siteId,
    workerId,
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) db.auditLogs.pop(); // Keep recent 500 logs
}

// Authentication middleware
function getAuthUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  const session = db.sessions[token];
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    delete db.sessions[token];
    return null;
  }
  const user = db.users.find((u) => u.id === session.userId && u.active);
  return user || null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Please log in with valid credentials.' });
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Only Proprietor / Admin can perform this action.' });
  }
  (req as any).user = user;
  next();
}

async function startServer() {
  const app = express();

  // Basic middlewares
  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ extended: true, limit: '60mb' }));

  // Static uploads directory
  app.use('/uploads', express.static(UPLOADS_DIR));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      firm: 'KKSInfraWorks',
      proprietor: 'Kalindra Kumar Singh',
      established: 2002,
      time: new Date().toISOString(),
    });
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Username/Email and Password are required.' });
    }

    const cleanInput = usernameOrEmail.trim().toLowerCase();
    const user = db.users.find(
      (u) => (u.username.toLowerCase() === cleanInput || u.email.toLowerCase() === cleanInput) && u.active
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found or inactive.' });
    }

    const inputHash = hashPassword(password);
    if (user.passwordHash !== inputHash) {
      return res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
    }

    // Generate session token (valid for 30 days for mobile convenience)
    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000;

    db.sessions[token] = {
      userId: user.id,
      createdAt: now,
      expiresAt,
    };

    // Update last login info
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Mobile Client';
    const userAgent = req.headers['user-agent'] || 'Android / Chrome';
    user.lastLogin = new Date().toISOString();
    user.lastLoginIp = `${String(ip).split(',')[0]} (${userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'})`;

    recordAuditLog(
      user,
      'login',
      'user',
      user.id,
      `${user.name} (${user.role === 'admin' ? 'Proprietor' : 'Site Manager'}) logged in from ${user.lastLoginIp}`
    );

    saveDatabaseSync(db);

    const safeUser = { ...user };
    delete safeUser.passwordHash;

    res.json({
      token,
      user: safeUser,
    });
  });

  // Auth: Logout
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      delete db.sessions[token];
      saveDatabaseSync(db);
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // Auth: Current User
  app.get('/api/auth/me', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    const safeUser = { ...user };
    delete safeUser.passwordHash;
    res.json({ user: safeUser });
  });

  // Auth: Forgot / Reset Password flow
  app.post('/api/auth/forgot-password', (req, res) => {
    const { usernameOrEmail } = req.body;
    const clean = (usernameOrEmail || '').trim().toLowerCase();
    const user = db.users.find(
      (u) => (u.username.toLowerCase() === clean || u.email.toLowerCase() === clean) && u.active
    );

    if (!user) {
      return res.status(404).json({ error: 'No authorized account found with this username or email.' });
    }

    // In a proprietary firm setting, generate a reset authorization code or allow proprietor approval
    res.json({
      success: true,
      message: `Password reset request authorized for ${user.name} (${user.role}). Enter your new password.`,
      userId: user.id,
      promptText: `Enter new secure password for ${user.name}`,
    });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const user = db.users.find((u) => u.id === userId && u.active);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.passwordHash = hashPassword(newPassword);
    recordAuditLog(
      user,
      'update',
      'user',
      user.id,
      `Password was reset for ${user.name} (${user.role})`
    );
    saveDatabaseSync(db);

    res.json({ success: true, message: 'Password has been updated successfully. Please log in with new password.' });
  });

  // Users: List & Add (for adding future authorized users)
  app.get('/api/users', requireAuth, (_req, res) => {
    const safeUsers = db.users.map((u) => {
      const copy = { ...u };
      delete copy.passwordHash;
      return copy;
    });
    res.json(safeUsers);
  });

  app.post('/api/users', requireAdmin, (req, res) => {
    const { username, email, name, role, password, phone } = req.body;
    const currentUser = (req as any).user;

    if (!username || !email || !name || !role || !password) {
      return res.status(400).json({ error: 'All fields (username, email, name, role, password) are required.' });
    }

    const existing = db.users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() || u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existing) {
      return res.status(400).json({ error: 'A user with this username or email already exists.' });
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      username: username.trim(),
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role: role === 'admin' ? 'admin' : 'manager',
      phone: phone || '',
      passwordHash: hashPassword(password),
      active: true,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    recordAuditLog(currentUser, 'create', 'user', newUser.id, `Created new authorized user ${newUser.name} as ${newUser.role}`);
    saveDatabaseSync(db);

    const safe = { ...newUser };
    delete (safe as any).passwordHash;
    res.status(201).json(safe);
  });

  // REALTIME SYNC ENDPOINT: Returns all modified data since a timestamp
  // Used by both phones to synchronize changes automatically
  app.get('/api/sync', requireAuth, (req, res) => {
    const since = parseInt((req.query.since as string) || '0', 10);
    const isFull = since === 0 || since < db.lastUpdated - 86400000;

    res.json({
      timestamp: db.lastUpdated,
      isFullSync: isFull,
      data: {
        workers: db.workers,
        sites: db.sites,
        attendance: db.attendance,
        advances: db.advances,
        siteReports: db.siteReports,
        nextDayPlans: db.nextDayPlans,
        expenses: db.expenses,
        media: db.media,
        auditLogs: db.auditLogs.slice(0, 100),
      },
    });
  });

  // Dashboard Metrics
  app.get('/api/metrics', requireAuth, (_req, res) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttendance = db.attendance.filter((a) => a.date === todayStr);

    const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
    const absentCount = todayAttendance.filter((a) => a.status === 'absent').length;
    const halfDayCount = todayAttendance.filter((a) => a.status === 'half_day').length;
    const leaveCount = todayAttendance.filter((a) => a.status === 'leave').length;

    const totalWorkers = db.workers.filter((w) => w.status === 'active').length;
    const activeSites = db.sites.filter((s) => s.status === 'active' || s.status === 'in_progress').length;

    // Advances calculations
    const totalAdvances = db.advances
      .filter((a) => a.type === 'advance')
      .reduce((sum, a) => sum + Number(a.amount || 0), 0);
    const totalRepayments = db.advances
      .filter((a) => a.type === 'repayment' || a.type === 'salary_deduction')
      .reduce((sum, a) => sum + Number(a.amount || 0), 0);
    const outstanding = Math.max(0, totalAdvances - totalRepayments);

    const todayReports = db.siteReports.filter((r) => r.reportDate === todayStr);
    const completedWorkCount = todayReports.length;
    const inProgressCount = db.siteReports.filter((r) => r.workInProgress && r.workInProgress.trim() !== '').length;

    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const tomorrowPlans = db.nextDayPlans.filter((p) => p.planDate === tomorrow || p.planDate === todayStr);
    const pendingTasks = db.nextDayPlans.filter((p) => p.status === 'planned' || p.status === 'in_progress').length;

    const todayExpenses = db.expenses
      .filter((e) => e.date === todayStr)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    res.json({
      totalWorkers,
      workersPresentToday: presentCount + halfDayCount,
      workersAbsentToday: absentCount,
      workersOnLeaveToday: leaveCount,
      activeSitesCount: activeSites,
      todayCompletedCount: completedWorkCount,
      inProgressCount,
      totalAdvancesGiven: totalAdvances,
      totalOutstandingAdvance: outstanding,
      pendingWorkCount: pendingTasks,
      tomorrowPlannedTasksCount: tomorrowPlans.length,
      totalTodayExpenses: todayExpenses,
    });
  });

  // --- WORKERS CRUD ---
  app.get('/api/workers', requireAuth, (_req, res) => {
    res.json(db.workers);
  });

  app.post('/api/workers', requireAuth, (req, res) => {
    const user = (req as any).user;
    const data = req.body;

    if (!data.name || !data.workCategory) {
      return res.status(400).json({ error: 'Worker full name and trade category are required.' });
    }

    // Generate unique worker ID like KKS001, KKS002...
    let nextId = data.id;
    if (!nextId) {
      const highestNum = db.workers.reduce((max, w) => {
        const match = w.id.match(/^KKS(\d+)$/i);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      nextId = `KKS${String(highestNum + 1).padStart(3, '0')}`;
    }

    // Check duplicate ID
    if (db.workers.some((w) => w.id === nextId)) {
      return res.status(400).json({ error: `Worker ID ${nextId} already exists.` });
    }

    const assignedSite = db.sites.find((s) => s.id === data.assignedSiteId);

    const newWorker = {
      id: nextId,
      name: data.name.trim(),
      fatherName: (data.fatherName || '').trim(),
      photo: data.photo || '',
      mobile: (data.mobile || '').trim(),
      villageAddress: (data.villageAddress || '').trim(),
      emergencyContact: (data.emergencyContact || '').trim(),
      joiningDate: data.joiningDate || new Date().toISOString().split('T')[0],
      workCategory: data.workCategory || 'Shuttering Carpenter',
      skillLevel: data.skillLevel || 'Skilled',
      designation: data.designation || 'Shuttering Mistri',
      wageType: data.wageType || 'daily',
      rate: Number(data.rate) || 600,
      assignedSiteId: data.assignedSiteId || (db.sites[0]?.id || 'SITE-01'),
      assignedSiteName: assignedSite ? assignedSite.name : (db.sites[0]?.name || 'Default Site'),
      bankDetails: data.bankDetails || {},
      status: data.status || 'active',
      remarks: data.remarks || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.workers.push(newWorker);
    recordAuditLog(user, 'create', 'worker', newWorker.id, `Added new worker ${newWorker.name} (${newWorker.id}, ${newWorker.designation})`, null, newWorker, newWorker.assignedSiteId, newWorker.id);
    saveDatabaseSync(db);

    res.status(201).json(newWorker);
  });

  app.put('/api/workers/:id', requireAuth, (req, res) => {
    const user = (req as any).user;
    const workerId = req.params.id;
    const index = db.workers.findIndex((w) => w.id === workerId);
    if (index === -1) return res.status(404).json({ error: 'Worker not found.' });

    const existing = db.workers[index];
    const updateData = req.body;

    const assignedSite = db.sites.find((s) => s.id === updateData.assignedSiteId);

    const updatedWorker = {
      ...existing,
      ...updateData,
      id: existing.id, // Immutable ID
      assignedSiteName: assignedSite ? assignedSite.name : existing.assignedSiteName,
      updatedAt: new Date().toISOString(),
    };

    db.workers[index] = updatedWorker;
    recordAuditLog(user, 'update', 'worker', workerId, `Updated profile for ${existing.name} (${workerId})`, existing, updatedWorker, updatedWorker.assignedSiteId, workerId);
    saveDatabaseSync(db);

    res.json(updatedWorker);
  });

  app.delete('/api/workers/:id', requireAuth, (req, res) => {
    const user = (req as any).user;
    const workerId = req.params.id;
    const index = db.workers.findIndex((w) => w.id === workerId);
    if (index === -1) return res.status(404).json({ error: 'Worker not found.' });

    const worker = db.workers[index];
    worker.status = 'inactive';
    worker.updatedAt = new Date().toISOString();

    recordAuditLog(user, 'delete', 'worker', workerId, `Deactivated worker ${worker.name} (${workerId})`, null, null, worker.assignedSiteId, workerId);
    saveDatabaseSync(db);

    res.json({ success: true, message: 'Worker marked as inactive.' });
  });

  // --- SITES CRUD ---
  app.get('/api/sites', requireAuth, (_req, res) => {
    // Update worker counts dynamically
    const sitesWithCounts = db.sites.map((site) => ({
      ...site,
      assignedWorkerCount: db.workers.filter((w) => w.assignedSiteId === site.id && w.status === 'active').length,
    }));
    res.json(sitesWithCounts);
  });

  app.post('/api/sites', requireAuth, (req, res) => {
    const user = (req as any).user;
    const data = req.body;
    if (!data.name || !data.completeAddress) {
      return res.status(400).json({ error: 'Site name and address are required.' });
    }

    const nextId = data.id || `SITE-0${db.sites.length + 1}`;
    const newSite = {
      id: nextId,
      name: data.name.trim(),
      clientName: (data.clientName || '').trim(),
      completeAddress: data.completeAddress.trim(),
      supervisor: data.supervisor || user.name,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      expectedCompletionDate: data.expectedCompletionDate || '',
      status: data.status || 'active',
      workCategories: data.workCategories || ['Column Shuttering', 'Beam Shuttering', 'Slab Shuttering', 'Steel Fixing'],
      assignedWorkerCount: 0,
      remarks: data.remarks || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.sites.push(newSite);
    recordAuditLog(user, 'create', 'site', newSite.id, `Created construction site: ${newSite.name} (${newSite.id})`, null, newSite, newSite.id);
    saveDatabaseSync(db);

    res.status(201).json(newSite);
  });

  app.put('/api/sites/:id', requireAuth, (req, res) => {
    const user = (req as any).user;
    const siteId = req.params.id;
    const index = db.sites.findIndex((s) => s.id === siteId);
    if (index === -1) return res.status(404).json({ error: 'Site not found.' });

    const existing = db.sites[index];
    const updated = {
      ...existing,
      ...req.body,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };

    db.sites[index] = updated;
    recordAuditLog(user, 'update', 'site', siteId, `Updated site information for ${existing.name}`, existing, updated, siteId);
    saveDatabaseSync(db);

    res.json(updated);
  });

  // --- ATTENDANCE CRUD & BATCH MARKING ---
  app.get('/api/attendance', requireAuth, (req, res) => {
    const { date, siteId, workerId } = req.query;
    let list = db.attendance;
    if (date) list = list.filter((a) => a.date === date);
    if (siteId) list = list.filter((a) => a.siteId === siteId);
    if (workerId) list = list.filter((a) => a.workerId === workerId);
    res.json(list);
  });

  // Batch mark attendance for a site on a date (prevents duplicates, updates existing or inserts new)
  app.post('/api/attendance/batch', requireAuth, (req, res) => {
    const user = (req as any).user;
    const { siteId, date, records } = req.body;

    if (!siteId || !date || !Array.isArray(records)) {
      return res.status(400).json({ error: 'siteId, date, and records array are required.' });
    }

    const site = db.sites.find((s) => s.id === siteId);
    const siteName = site ? site.name : 'Unknown Site';
    const nowIso = new Date().toISOString();

    const createdOrUpdated: any[] = [];

    records.forEach((rec) => {
      const worker = db.workers.find((w) => w.id === rec.workerId);
      const workerName = worker ? worker.name : rec.workerName || rec.workerId;
      const workerPhoto = worker?.photo || '';
      const workerTrade = worker?.workCategory || '';

      // Check if attendance already exists for worker + site + date
      const existingIndex = db.attendance.findIndex(
        (a) => a.workerId === rec.workerId && a.siteId === siteId && a.date === date
      );

      if (existingIndex >= 0) {
        // Update existing record with audit
        const old = db.attendance[existingIndex];
        const updated = {
          ...old,
          status: rec.status,
          checkInTime: rec.checkInTime !== undefined ? rec.checkInTime : old.checkInTime,
          checkOutTime: rec.checkOutTime !== undefined ? rec.checkOutTime : old.checkOutTime,
          overtimeHours: Number(rec.overtimeHours) || 0,
          remarks: rec.remarks !== undefined ? rec.remarks : old.remarks,
          updatedBy: user.id,
          updatedAt: nowIso,
        };
        db.attendance[existingIndex] = updated;
        createdOrUpdated.push(updated);
        recordAuditLog(user, 'update', 'attendance', updated.id, `Corrected attendance for ${workerName} on ${date}: ${rec.status}`, old, updated, siteId, rec.workerId);
      } else {
        // Create new record
        const newRecord = {
          id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          date,
          siteId,
          siteName,
          workerId: rec.workerId,
          workerName,
          workerPhoto,
          workerTrade,
          status: rec.status || 'present',
          checkInTime: rec.checkInTime || '08:00 AM',
          checkOutTime: rec.checkOutTime || '',
          overtimeHours: Number(rec.overtimeHours) || 0,
          remarks: rec.remarks || '',
          markedBy: user.id,
          markedByName: user.name,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        db.attendance.push(newRecord);
        createdOrUpdated.push(newRecord);
      }
    });

    recordAuditLog(user, 'create', 'attendance', `batch_${date}`, `Saved batch attendance for ${records.length} workers at ${siteName} on ${date}`, null, null, siteId);
    saveDatabaseSync(db);

    res.json({
      success: true,
      count: createdOrUpdated.length,
      records: createdOrUpdated,
    });
  });

  app.put('/api/attendance/:id', requireAuth, (req, res) => {
    const user = (req as any).user;
    const id = req.params.id;
    const index = db.attendance.findIndex((a) => a.id === id);
    if (index === -1) return res.status(404).json({ error: 'Attendance record not found.' });

    const existing = db.attendance[index];
    const updated = {
      ...existing,
      ...req.body,
      id: existing.id,
      updatedBy: user.id,
      updatedAt: new Date().toISOString(),
    };

    db.attendance[index] = updated;
    recordAuditLog(user, 'update', 'attendance', id, `Updated attendance for ${existing.workerName} on ${existing.date}`, existing, updated, existing.siteId, existing.workerId);
    saveDatabaseSync(db);

    res.json(updated);
  });

  // --- ADVANCES CRUD ---
  app.get('/api/advances', requireAuth, (req, res) => {
    const { workerId, siteId } = req.query;
    let list = db.advances;
    if (workerId) list = list.filter((a) => a.workerId === workerId);
    if (siteId) list = list.filter((a) => a.siteId === siteId);
    res.json(list);
  });

  app.post('/api/advances', requireAuth, (req, res) => {
    const user = (req as any).user;
    const data = req.body;

    if (!data.workerId || !data.amount || !data.purpose) {
      return res.status(400).json({ error: 'Worker, Amount (₹), and Purpose are required.' });
    }

    const worker = db.workers.find((w) => w.id === data.workerId);
    const workerName = worker ? worker.name : data.workerName || data.workerId;
    const site = db.sites.find((s) => s.id === data.siteId) || db.sites[0];

    const newAdvance = {
      id: `adv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      workerId: data.workerId,
      workerName,
      date: data.date || new Date().toISOString().split('T')[0],
      type: data.type || 'advance', // 'advance' | 'repayment' | 'salary_deduction'
      amount: Number(data.amount),
      paymentMethod: data.paymentMethod || 'Cash',
      purpose: data.purpose.trim(),
      siteId: site?.id || 'SITE-01',
      siteName: site?.name || 'Main Site',
      referenceNumber: data.referenceNumber || '',
      receiptUrl: data.receiptUrl || '',
      enteredBy: user.id,
      enteredByName: user.name,
      remarks: data.remarks || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.advances.push(newAdvance);
    recordAuditLog(
      user,
      'create',
      'advance',
      newAdvance.id,
      `Recorded ${newAdvance.type} of ₹${newAdvance.amount} for ${workerName} (${newAdvance.paymentMethod})`,
      null,
      newAdvance,
      newAdvance.siteId,
      newAdvance.workerId
    );
    saveDatabaseSync(db);

    res.status(201).json(newAdvance);
  });

  app.put('/api/advances/:id', requireAuth, (req, res) => {
    const user = (req as any).user;
    const id = req.params.id;
    const index = db.advances.findIndex((a) => a.id === id);
    if (index === -1) return res.status(404).json({ error: 'Advance record not found.' });

    const existing = db.advances[index];
    const updated = {
      ...existing,
      ...req.body,
      id: existing.id,
      amount: Number(req.body.amount || existing.amount),
      updatedAt: new Date().toISOString(),
    };

    db.advances[index] = updated;
    recordAuditLog(
      user,
      'update',
      'advance',
      id,
      `Edited advance record for ${existing.workerName}: ₹${existing.amount} -> ₹${updated.amount}`,
      existing,
      updated,
      existing.siteId,
      existing.workerId
    );
    saveDatabaseSync(db);

    res.json(updated);
  });

  // --- DAILY SITE WORK REPORTS ---
  app.get('/api/site-reports', requireAuth, (req, res) => {
    const { siteId, date } = req.query;
    let list = db.siteReports;
    if (siteId) list = list.filter((r) => r.siteId === siteId);
    if (date) list = list.filter((r) => r.reportDate === date);
    res.json(list);
  });

  app.post('/api/site-reports', requireAuth, (req, res) => {
    const user = (req as any).user;
    const data = req.body;

    if (!data.siteId || !data.workLocation || !data.workCategory) {
      return res.status(400).json({ error: 'Site, Location within site, and Work Category are required.' });
    }

    const site = db.sites.find((s) => s.id === data.siteId);
    const siteName = site ? site.name : 'Site';

    const newReport = {
      id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      reportDate: data.reportDate || new Date().toISOString().split('T')[0],
      siteId: data.siteId,
      siteName,
      workLocation: data.workLocation.trim(),
      workCategory: data.workCategory,
      workCompletedToday: (data.workCompletedToday || '').trim(),
      workInProgress: (data.workInProgress || '').trim(),
      quantityCompleted: Number(data.quantityCompleted) || 0,
      unit: data.unit || 'sq ft',
      workersCount: Number(data.workersCount) || 1,
      supervisorName: data.supervisorName || user.name,
      materialsUsed: data.materialsUsed || '',
      equipmentUsed: data.equipmentUsed || '',
      workStartTime: data.workStartTime || '08:00 AM',
      workEndTime: data.workEndTime || '05:30 PM',
      qualitySafetyObservations: data.qualitySafetyObservations || '',
      hasProblemsOrDelays: Boolean(data.hasProblemsOrDelays),
      delayReason: data.delayReason || '',
      descriptionHindiEnglish: data.descriptionHindiEnglish || '',
      mediaItems: Array.isArray(data.mediaItems) ? data.mediaItems : [],
      submittedBy: user.id,
      submittedByName: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.siteReports.push(newReport);

    // Also register media items if any attached
    if (newReport.mediaItems && newReport.mediaItems.length > 0) {
      newReport.mediaItems.forEach((m: any) => {
        if (!db.media.some((item) => item.id === m.id)) {
          db.media.unshift({
            ...m,
            reportId: newReport.id,
            reportLocation: newReport.workLocation,
            siteId: newReport.siteId,
            siteName: newReport.siteName,
            workCategory: newReport.workCategory,
          });
        }
      });
    }

    recordAuditLog(
      user,
      'create',
      'work_report',
      newReport.id,
      `Submitted daily work report for ${siteName} (${newReport.workLocation} - ${newReport.workCategory})`,
      null,
      newReport,
      newReport.siteId
    );
    saveDatabaseSync(db);

    res.status(201).json(newReport);
  });

  app.put('/api/site-reports/:id', requireAuth, (req, res) => {
    const user = (req as any).user;
    const id = req.params.id;
    const index = db.siteReports.findIndex((r) => r.id === id);
    if (index === -1) return res.status(404).json({ error: 'Report not found.' });

    const existing = db.siteReports[index];
    const updated = {
      ...existing,
      ...req.body,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };

    db.siteReports[index] = updated;
    recordAuditLog(user, 'update', 'work_report', id, `Updated daily work report at ${existing.siteName}`, existing, updated, existing.siteId);
    saveDatabaseSync(db);

    res.json(updated);
  });

  // --- TOMORROW'S NEXT-DAY WORK PLANNING ---
  app.get('/api/next-day-plans', requireAuth, (req, res) => {
    const { siteId, planDate } = req.query;
    let list = db.nextDayPlans;
    if (siteId) list = list.filter((p) => p.siteId === siteId);
    if (planDate) list = list.filter((p) => p.planDate === planDate);
    res.json(list);
  });

  app.post('/api/next-day-plans', requireAuth, (req, res) => {
    const user = (req as any).user;
    const data = req.body;

    if (!data.siteId || !data.expectedWork) {
      return res.status(400).json({ error: 'Site and Expected Work Description are required.' });
    }

    const site = db.sites.find((s) => s.id === data.siteId);
    const siteName = site ? site.name : 'Site';

    const newPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      planDate: data.planDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      siteId: data.siteId,
      siteName,
      expectedWork: data.expectedWork.trim(),
      workLocation: (data.workLocation || '').trim(),
      plannedActivities: Array.isArray(data.plannedActivities) ? data.plannedActivities : [data.expectedWork],
      expectedWorkersCount: Number(data.expectedWorkersCount) || 1,
      assignedTeam: data.assignedTeam || '',
      materialsRequired: data.materialsRequired || '',
      toolsEquipmentRequired: data.toolsEquipmentRequired || '',
      concreteShutteringRequirements: data.concreteShutteringRequirements || '',
      priority: data.priority || 'high',
      dependenciesOrApprovals: data.dependenciesOrApprovals || '',
      expectedStartTime: data.expectedStartTime || '08:00 AM',
      expectedCompletionTime: data.expectedCompletionTime || '06:00 PM',
      responsibleSupervisor: data.responsibleSupervisor || user.name,
      specialInstructions: data.specialInstructions || '',
      safetyPrecautions: data.safetyPrecautions || '',
      status: data.status || 'planned',
      delayReason: data.delayReason || '',
      actualCompletedNotes: data.actualCompletedNotes || '',
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.nextDayPlans.push(newPlan);
    recordAuditLog(user, 'create', 'next_day_plan', newPlan.id, `Created plan for ${siteName} on ${newPlan.planDate}: ${newPlan.expectedWork.slice(0, 40)}...`, null, newPlan, newPlan.siteId);
    saveDatabaseSync(db);

    res.status(201).json(newPlan);
  });

  app.put('/api/next-day-plans/:id', requireAuth, (req, res) => {
    const user = (req as any).user;
    const id = req.params.id;
    const index = db.nextDayPlans.findIndex((p) => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Plan not found.' });

    const existing = db.nextDayPlans[index];
    const updated = {
      ...existing,
      ...req.body,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };

    db.nextDayPlans[index] = updated;
    recordAuditLog(user, 'update', 'next_day_plan', id, `Updated plan status to ${updated.status} for ${existing.siteName}`, existing, updated, existing.siteId);
    saveDatabaseSync(db);

    res.json(updated);
  });

  // Copy incomplete or delayed tasks to next day
  app.post('/api/next-day-plans/copy-incomplete', requireAuth, (req, res) => {
    const user = (req as any).user;
    const { fromDate, toDate } = req.body;
    const targetToDate = toDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const incomplete = db.nextDayPlans.filter(
      (p) => (p.planDate === fromDate || !fromDate) && (p.status === 'delayed' || p.status === 'planned' || p.status === 'in_progress')
    );

    const copiedPlans: any[] = [];
    incomplete.forEach((p) => {
      const copy = {
        ...p,
        id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        planDate: targetToDate,
        status: 'planned',
        delayReason: p.delayReason ? `Carried forward from ${p.planDate}: ${p.delayReason}` : `Carried forward from ${p.planDate}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.id,
        createdByName: user.name,
      };
      db.nextDayPlans.push(copy);
      copiedPlans.push(copy);
    });

    recordAuditLog(user, 'create', 'next_day_plan', 'batch_copy', `Copied ${copiedPlans.length} incomplete tasks to ${targetToDate}`);
    saveDatabaseSync(db);

    res.json({ success: true, count: copiedPlans.length, copiedPlans });
  });

  // --- SITE EXPENSES ---
  app.get('/api/expenses', requireAuth, (req, res) => {
    const { siteId } = req.query;
    let list = db.expenses;
    if (siteId) list = list.filter((e) => e.siteId === siteId);
    res.json(list);
  });

  app.post('/api/expenses', requireAuth, (req, res) => {
    const user = (req as any).user;
    const data = req.body;

    if (!data.siteId || !data.amount || !data.description || !data.category) {
      return res.status(400).json({ error: 'Site, Category, Amount, and Description are required.' });
    }

    const site = db.sites.find((s) => s.id === data.siteId);
    const siteName = site ? site.name : 'Site';

    const newExpense = {
      id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      date: data.date || new Date().toISOString().split('T')[0],
      siteId: data.siteId,
      siteName,
      category: data.category,
      description: data.description.trim(),
      amount: Number(data.amount),
      paymentMethod: data.paymentMethod || 'Cash',
      paidBy: data.paidBy || user.name,
      receiptUrl: data.receiptUrl || '',
      referenceNumber: data.referenceNumber || '',
      remarks: data.remarks || '',
      enteredBy: user.id,
      enteredByName: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.expenses.push(newExpense);
    recordAuditLog(user, 'create', 'expense', newExpense.id, `Recorded site expense ₹${newExpense.amount} (${newExpense.category}) at ${siteName}`, null, newExpense, newExpense.siteId);
    saveDatabaseSync(db);

    res.status(201).json(newExpense);
  });

  // --- MEDIA: PHOTOS & VIDEOS ---
  app.get('/api/media', requireAuth, (req, res) => {
    const { siteId, type } = req.query;
    let list = db.media;
    if (siteId) list = list.filter((m) => m.siteId === siteId);
    if (type) list = list.filter((m) => m.type === type);
    res.json(list);
  });

  // Multipart upload endpoint for mobile camera and gallery files
  app.post('/api/media/upload', requireAuth, upload.array('files', 10), (req, res) => {
    const user = (req as any).user;
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const { siteId, caption, reportId } = req.body;
    const site = db.sites.find((s) => s.id === siteId);
    const siteName = site ? site.name : 'Construction Site';

    const uploadedItems = files.map((file) => {
      const isVideo = file.mimetype.startsWith('video/');
      const mediaItem = {
        id: `med_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: (isVideo ? 'video' : 'photo') as 'photo' | 'video',
        url: `/uploads/${file.filename}`,
        fileName: file.originalname,
        caption: caption || file.originalname,
        siteId: siteId || 'SITE-01',
        siteName,
        reportId: reportId || '',
        uploadedBy: user.id,
        uploadedByName: user.name,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size,
      };
      db.media.unshift(mediaItem);
      return mediaItem;
    });

    recordAuditLog(user, 'create', 'media', uploadedItems[0].id, `Uploaded ${uploadedItems.length} media file(s) for ${siteName}`, null, null, siteId);
    saveDatabaseSync(db);

    res.status(201).json(uploadedItems);
  });

  // Base64 upload endpoint for captured canvas / camera photos directly
  app.post('/api/media/upload-base64', requireAuth, (req, res) => {
    const user = (req as any).user;
    const { dataUrl, caption, siteId, reportId } = req.body;

    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image data URL.' });
    }

    const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Malformed base64 data.' });
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    const filename = `kks_cam_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
    const filePath = path.resolve(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, imageBuffer);

    const site = db.sites.find((s) => s.id === siteId);
    const siteName = site ? site.name : 'Construction Site';

    const mediaItem = {
      id: `med_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'photo' as const,
      url: `/uploads/${filename}`,
      fileName: filename,
      caption: caption || 'Camera photo',
      siteId: siteId || 'SITE-01',
      siteName,
      reportId: reportId || '',
      uploadedBy: user.id,
      uploadedByName: user.name,
      uploadedAt: new Date().toISOString(),
      fileSize: imageBuffer.length,
    };

    db.media.unshift(mediaItem);
    recordAuditLog(user, 'create', 'media', mediaItem.id, `Captured site camera photo for ${siteName}`, null, null, siteId);
    saveDatabaseSync(db);

    res.status(201).json(mediaItem);
  });

  app.delete('/api/media/:id', requireAuth, (req, res) => {
    const user = (req as any).user;
    const id = req.params.id;
    const index = db.media.findIndex((m) => m.id === id);
    if (index === -1) return res.status(404).json({ error: 'Media not found.' });

    const item = db.media[index];
    db.media.splice(index, 1);

    recordAuditLog(user, 'delete', 'media', id, `Deleted media item ${item.caption || item.fileName} from ${item.siteName}`, null, null, item.siteId);
    saveDatabaseSync(db);

    res.json({ success: true, message: 'Media removed.' });
  });

  // --- AUDIT LOGS ---
  app.get('/api/audit-logs', requireAuth, (req, res) => {
    const { entityType, siteId, workerId } = req.query;
    let list = db.auditLogs;
    if (entityType) list = list.filter((l) => l.entityType === entityType);
    if (siteId) list = list.filter((l) => l.siteId === siteId);
    if (workerId) list = list.filter((l) => l.workerId === workerId);
    res.json(list.slice(0, 200));
  });

  // --- SYSTEM: RESET DEMO DATA ---
  app.post('/api/system/reset-demo', requireAdmin, (req, res) => {
    const user = (req as any).user;
    const seed = getInitialSeedData();
    db = seed;
    saveDatabaseSync(db);
    recordAuditLog(user, 'status_change', 'user', user.id, 'Reset application data to initial verified benchmark data.');
    res.json({ success: true, message: 'Sample construction site data refreshed.' });
  });

  // --- VITE DEV MIDDLEWARE OR PRODUCTION SERVE ---
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Dynamic import of vite in dev mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` KKSInfraWorks Construction Management Server`);
    console.log(` Proprietor: Kalindra Kumar Singh (Estd. 2002)`);
    console.log(` Bargawn Road, Mairwa, Bihar - 841239`);
    console.log(` Server active on http://0.0.0.0:${PORT}`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start KKSInfraWorks server:', err);
  process.exit(1);
});
