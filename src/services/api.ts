import {
  User,
  Worker,
  ConstructionSite,
  AttendanceRecord,
  AdvancePayment,
  DailyWorkReport,
  NextDayPlan,
  SiteExpense,
  MediaItem,
  AuditLog,
  DashboardMetrics,
} from '../types';

const TOKEN_KEY = 'kks_auth_token';
const USER_KEY = 'kks_auth_user';
const CACHE_KEY = 'kks_offline_cache';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser(): User | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type to JSON if not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      setStoredToken(null);
      setStoredUser(null);
      window.dispatchEvent(new CustomEvent('kks_auth_unauthorized'));
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Request failed with status ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error: any) {
    // If offline, check if we have cached data for GET requests
    if (options.method === 'GET' || !options.method) {
      const cached = localStorage.getItem(`${CACHE_KEY}_${endpoint}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          // ignore
        }
      }
    }
    throw error;
  }
}

export const api = {
  // --- AUTH ---
  async login(usernameOrEmail: string, password: string):Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    setStoredToken(res.token);
    setStoredUser(res.user);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setStoredToken(null);
      setStoredUser(null);
    }
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async forgotPassword(usernameOrEmail: string): Promise<any> {
    return request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail }),
    });
  },

  async resetPassword(userId: string, newPassword: string): Promise<any> {
    return request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ userId, newPassword }),
    });
  },

  async getUsers(): Promise<User[]> {
    return request<User[]>('/api/users');
  },

  async createUser(data: any): Promise<User> {
    return request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // --- SYNC ---
  async sync(since = 0): Promise<{
    timestamp: number;
    isFullSync: boolean;
    data: {
      workers: Worker[];
      sites: ConstructionSite[];
      attendance: AttendanceRecord[];
      advances: AdvancePayment[];
      siteReports: DailyWorkReport[];
      nextDayPlans: NextDayPlan[];
      expenses: SiteExpense[];
      media: MediaItem[];
      auditLogs: AuditLog[];
    };
  }> {
    const res = await request<any>(`/api/sync?since=${since}`);
    try {
      localStorage.setItem(`${CACHE_KEY}_full`, JSON.stringify(res.data));
    } catch {
      // quota or private mode
    }
    return res;
  },

  // --- METRICS ---
  async getMetrics(): Promise<DashboardMetrics> {
    return request<DashboardMetrics>('/api/metrics');
  },

  // --- WORKERS ---
  async getWorkers(): Promise<Worker[]> {
    return request<Worker[]>('/api/workers');
  },

  async createWorker(worker: Partial<Worker>): Promise<Worker> {
    return request<Worker>('/api/workers', {
      method: 'POST',
      body: JSON.stringify(worker),
    });
  },

  async updateWorker(id: string, updates: Partial<Worker>): Promise<Worker> {
    return request<Worker>(`/api/workers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteWorker(id: string): Promise<any> {
    return request(`/api/workers/${id}`, { method: 'DELETE' });
  },

  // --- SITES ---
  async getSites(): Promise<ConstructionSite[]> {
    return request<ConstructionSite[]>('/api/sites');
  },

  async createSite(site: Partial<ConstructionSite>): Promise<ConstructionSite> {
    return request<ConstructionSite>('/api/sites', {
      method: 'POST',
      body: JSON.stringify(site),
    });
  },

  async updateSite(id: string, updates: Partial<ConstructionSite>): Promise<ConstructionSite> {
    return request<ConstructionSite>(`/api/sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // --- ATTENDANCE ---
  async getAttendance(filters?: { date?: string; siteId?: string; workerId?: string }): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (filters?.date) params.set('date', filters.date);
    if (filters?.siteId) params.set('siteId', filters.siteId);
    if (filters?.workerId) params.set('workerId', filters.workerId);
    return request<AttendanceRecord[]>(`/api/attendance?${params.toString()}`);
  },

  async batchSaveAttendance(
    siteId: string,
    date: string,
    records: Array<{
      workerId: string;
      workerName?: string;
      status: string;
      checkInTime?: string;
      checkOutTime?: string;
      overtimeHours?: number;
      remarks?: string;
    }>
  ): Promise<{ success: boolean; count: number; records: AttendanceRecord[] }> {
    return request('/api/attendance/batch', {
      method: 'POST',
      body: JSON.stringify({ siteId, date, records }),
    });
  },

  async updateAttendance(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    return request<AttendanceRecord>(`/api/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // --- ADVANCES ---
  async getAdvances(filters?: { workerId?: string; siteId?: string }): Promise<AdvancePayment[]> {
    const params = new URLSearchParams();
    if (filters?.workerId) params.set('workerId', filters.workerId);
    if (filters?.siteId) params.set('siteId', filters.siteId);
    return request<AdvancePayment[]>(`/api/advances?${params.toString()}`);
  },

  async createAdvance(advance: Partial<AdvancePayment>): Promise<AdvancePayment> {
    return request<AdvancePayment>('/api/advances', {
      method: 'POST',
      body: JSON.stringify(advance),
    });
  },

  async updateAdvance(id: string, updates: Partial<AdvancePayment>): Promise<AdvancePayment> {
    return request<AdvancePayment>(`/api/advances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // --- SITE WORK REPORTS ---
  async getSiteReports(filters?: { siteId?: string; date?: string }): Promise<DailyWorkReport[]> {
    const params = new URLSearchParams();
    if (filters?.siteId) params.set('siteId', filters.siteId);
    if (filters?.date) params.set('date', filters.date);
    return request<DailyWorkReport[]>(`/api/site-reports?${params.toString()}`);
  },

  async createSiteReport(report: Partial<DailyWorkReport>): Promise<DailyWorkReport> {
    return request<DailyWorkReport>('/api/site-reports', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  },

  async updateSiteReport(id: string, updates: Partial<DailyWorkReport>): Promise<DailyWorkReport> {
    return request<DailyWorkReport>(`/api/site-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // --- NEXT DAY PLANS ---
  async getNextDayPlans(filters?: { siteId?: string; planDate?: string }): Promise<NextDayPlan[]> {
    const params = new URLSearchParams();
    if (filters?.siteId) params.set('siteId', filters.siteId);
    if (filters?.planDate) params.set('planDate', filters.planDate);
    return request<NextDayPlan[]>(`/api/next-day-plans?${params.toString()}`);
  },

  async createNextDayPlan(plan: Partial<NextDayPlan>): Promise<NextDayPlan> {
    return request<NextDayPlan>('/api/next-day-plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  },

  async updateNextDayPlan(id: string, updates: Partial<NextDayPlan>): Promise<NextDayPlan> {
    return request<NextDayPlan>(`/api/next-day-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async copyIncompletePlans(fromDate?: string, toDate?: string): Promise<{ success: boolean; count: number; copiedPlans: NextDayPlan[] }> {
    return request('/api/next-day-plans/copy-incomplete', {
      method: 'POST',
      body: JSON.stringify({ fromDate, toDate }),
    });
  },

  // --- SITE EXPENSES ---
  async getExpenses(siteId?: string): Promise<SiteExpense[]> {
    const params = new URLSearchParams();
    if (siteId) params.set('siteId', siteId);
    return request<SiteExpense[]>(`/api/expenses?${params.toString()}`);
  },

  async createExpense(expense: Partial<SiteExpense>): Promise<SiteExpense> {
    return request<SiteExpense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  },

  // --- MEDIA ---
  async getMedia(filters?: { siteId?: string; type?: string }): Promise<MediaItem[]> {
    const params = new URLSearchParams();
    if (filters?.siteId) params.set('siteId', filters.siteId);
    if (filters?.type) params.set('type', filters.type);
    return request<MediaItem[]>(`/api/media?${params.toString()}`);
  },

  async uploadMedia(formData: FormData): Promise<MediaItem[]> {
    return request<MediaItem[]>('/api/media/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async uploadCameraBase64(dataUrl: string, caption: string, siteId: string, reportId?: string): Promise<MediaItem> {
    return request<MediaItem>('/api/media/upload-base64', {
      method: 'POST',
      body: JSON.stringify({ dataUrl, caption, siteId, reportId }),
    });
  },

  async deleteMedia(id: string): Promise<any> {
    return request(`/api/media/${id}`, { method: 'DELETE' });
  },

  // --- AUDIT LOGS ---
  async getAuditLogs(filters?: { entityType?: string; siteId?: string; workerId?: string }): Promise<AuditLog[]> {
    const params = new URLSearchParams();
    if (filters?.entityType) params.set('entityType', filters.entityType);
    if (filters?.siteId) params.set('siteId', filters.siteId);
    if (filters?.workerId) params.set('workerId', filters.workerId);
    return request<AuditLog[]>(`/api/audit-logs?${params.toString()}`);
  },

  // --- SYSTEM ---
  async resetDemoData(): Promise<any> {
    return request('/api/system/reset-demo', { method: 'POST' });
  },
};
