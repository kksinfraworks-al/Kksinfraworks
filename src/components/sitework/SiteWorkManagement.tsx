import React, { useState, useRef, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { DailyWorkReport, ConstructionSite, Worker, MediaItem } from '../../types';
import { WorkerProfileModal } from '../workers/WorkerProfileModal';
import {
  ClipboardList,
  Plus,
  Calendar,
  Building2,
  Users,
  Camera,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Wrench,
  X,
  Edit,
  Trash2,
  Printer,
  Download,
  Share2,
  Play,
  Images,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

const STANDARD_WORK_CATEGORIES = [
  'Staircase shuttering',
  'Lift area shuttering',
  'Column reinforcement and shuttering',
  'Slab shuttering',
  'Beam shuttering',
  'De-shuttering',
  'Concrete pouring',
  'Scaffolding',
  'Material shifting',
  'Custom / Other',
];

const MEASUREMENT_UNITS = [
  'sq ft',
  'sq m',
  'running ft',
  'cubic ft',
  'cubic metre',
  'pieces',
  'brass',
  'tonnes',
];

export const SiteWorkManagement: React.FC<{ initialCreateOpen?: boolean }> = ({
  initialCreateOpen = false,
}) => {
  const { user, isAdmin } = useAuth();
  const {
    sites,
    workers,
    attendance,
    siteReports,
    createSiteReport,
    updateSiteReport,
    deleteSiteReport,
    createSite,
    updateSite,
    renameSite,
    uploadCameraPhoto,
    uploadMediaFiles,
    saveAttendanceBatch,
  } = useData();

  const todayStr = new Date().toISOString().split('T')[0];

  // Navigation / Views
  const [activeTab, setActiveTab] = useState<'records' | 'sites'>('records');
  const [isAddWorkModalOpen, setIsAddWorkModalOpen] = useState(initialCreateOpen);
  const [editingReport, setEditingReport] = useState<DailyWorkReport | null>(null);

  // Filters
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State for Add / Edit Daily Site Work
  const [workDate, setWorkDate] = useState(todayStr);
  const [siteId, setSiteId] = useState(sites[0]?.id || 'SITE-01');
  const [workCategory, setWorkCategory] = useState(STANDARD_WORK_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [workStatus, setWorkStatus] = useState<'Planned' | 'In Progress' | 'Completed' | 'On Hold'>('Completed');
  const [workStartTime, setWorkStartTime] = useState('08:00 AM');
  const [workEndTime, setWorkEndTime] = useState('05:00 PM');
  const [materialUsed, setMaterialUsed] = useState('');
  const [quantityCompleted, setQuantityCompleted] = useState<number>(0);
  const [unit, setUnit] = useState('sq ft');
  const [remarks, setRemarks] = useState('');
  const [linkWithAttendance, setLinkWithAttendance] = useState(true);

  // Media
  const [attachedMedia, setAttachedMedia] = useState<MediaItem[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Site Creation / Edit Modal
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<ConstructionSite | null>(null);
  const [siteFormName, setSiteFormName] = useState('');
  const [siteFormAddress, setSiteFormAddress] = useState('');
  const [siteFormProject, setSiteFormProject] = useState('');
  const [siteFormSupervisor, setSiteFormSupervisor] = useState(user?.name || 'Kalindra Kumar Singh');
  const [siteFormStatus, setSiteFormStatus] = useState<'active' | 'in_progress' | 'on_hold' | 'completed'>('active');
  const [siteFormStartDate, setSiteFormStartDate] = useState(todayStr);
  const [siteFormRemarks, setSiteFormRemarks] = useState('');

  // Profile Modal
  const [viewWorker, setViewWorker] = useState<Worker | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Active sites
  const activeSites = useMemo(() => sites, [sites]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return siteReports.filter((r) => {
      const matchSite = selectedSiteFilter === 'all' || r.siteId === selectedSiteFilter;
      const matchCat =
        selectedCategoryFilter === 'all' ||
        r.workCategory?.toLowerCase().includes(selectedCategoryFilter.toLowerCase());
      const matchStatus =
        selectedStatusFilter === 'all' || (r.workStatus || 'Completed') === selectedStatusFilter;

      let matchDate = true;
      if (dateFilterStart && dateFilterEnd) {
        matchDate = r.reportDate >= dateFilterStart && r.reportDate <= dateFilterEnd;
      } else if (dateFilterStart) {
        matchDate = r.reportDate >= dateFilterStart;
      }

      let matchSearch = true;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        matchSearch =
          r.siteName.toLowerCase().includes(q) ||
          r.workCategory.toLowerCase().includes(q) ||
          (r.workDescription || r.workCompletedToday || '').toLowerCase().includes(q) ||
          (r.materialsUsed || '').toLowerCase().includes(q) ||
          (r.workerNames && r.workerNames.some((name) => name.toLowerCase().includes(q))) ||
          r.reportDate.includes(q);
      }

      return matchSite && matchCat && matchStatus && matchDate && matchSearch;
    });
  }, [
    siteReports,
    selectedSiteFilter,
    selectedCategoryFilter,
    selectedStatusFilter,
    dateFilterStart,
    dateFilterEnd,
    searchTerm,
  ]);

  // Open Add Work form
  const handleOpenAddWork = (rep?: DailyWorkReport) => {
    if (rep) {
      setEditingReport(rep);
      setWorkDate(rep.reportDate);
      setSiteId(rep.siteId);
      const isKnown = STANDARD_WORK_CATEGORIES.includes(rep.workCategory);
      setWorkCategory(isKnown ? rep.workCategory : 'Custom / Other');
      setCustomCategory(isKnown ? '' : rep.workCategory);
      setWorkDescription(rep.workDescription || rep.workCompletedToday);
      setSelectedWorkerIds(rep.workerIds || []);
      setWorkStatus(rep.workStatus || 'Completed');
      setWorkStartTime(rep.workStartTime || '08:00 AM');
      setWorkEndTime(rep.workEndTime || '05:00 PM');
      setMaterialUsed(rep.materialsUsed || '');
      setQuantityCompleted(rep.quantityCompleted || 0);
      setUnit(rep.unit || 'sq ft');
      setRemarks(rep.remarks || '');
      setAttachedMedia(rep.mediaItems || []);
    } else {
      setEditingReport(null);
      setWorkDate(todayStr);
      setSiteId(sites[0]?.id || 'SITE-01');
      setWorkCategory(STANDARD_WORK_CATEGORIES[0]);
      setCustomCategory('');
      setWorkDescription('');
      setSelectedWorkerIds([]);
      setWorkStatus('Completed');
      setWorkStartTime('08:00 AM');
      setWorkEndTime('05:00 PM');
      setMaterialUsed('');
      setQuantityCompleted(0);
      setUnit('sq ft');
      setRemarks('');
      setAttachedMedia([]);
    }
    setIsAddWorkModalOpen(true);
  };

  // Toggle worker tagging
  const handleToggleWorker = (wId: string) => {
    setSelectedWorkerIds((prev) =>
      prev.includes(wId) ? prev.filter((id) => id !== wId) : [...prev, wId]
    );
  };

  // Save Daily Site Work
  const handleSaveDailyWork = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory =
      workCategory === 'Custom / Other' && customCategory.trim()
        ? customCategory.trim()
        : workCategory;
    const targetSite = sites.find((s) => s.id === siteId);
    const taggedWorkers = workers.filter((w) => selectedWorkerIds.includes(w.id));
    const workerNames = taggedWorkers.map((w) => w.name);

    const reportPayload: Partial<DailyWorkReport> = {
      reportDate: workDate,
      siteId,
      siteName: targetSite?.name || 'Site',
      projectName: targetSite?.clientName || 'Civil Project',
      workLocation: `${targetSite?.name}: ${finalCategory}`,
      workCategory: finalCategory,
      workDescription,
      workCompletedToday: workDescription,
      workInProgress: '',
      workStatus,
      quantityCompleted: Number(quantityCompleted) || 0,
      unit,
      workersCount: selectedWorkerIds.length,
      workerIds: selectedWorkerIds,
      workerNames,
      supervisorName: targetSite?.supervisorName || user?.name || 'Kalindra Kumar Singh',
      materialsUsed: materialUsed,
      workStartTime,
      workEndTime,
      remarks,
      mediaItems: attachedMedia,
      descriptionHindiEnglish: `${targetSite?.name} - ${finalCategory}: ${workDescription}`,
    };

    let savedReportId = editingReport?.id;
    if (editingReport) {
      await updateSiteReport(editingReport.id, reportPayload);
    } else {
      const created = await createSiteReport(reportPayload);
      savedReportId = created.id;
    }

    // Bi-directional Link: automatically ensure worker attendance is linked with this site work!
    if (linkWithAttendance && selectedWorkerIds.length > 0) {
      const attendanceBatch = taggedWorkers.map((w) => ({
        workerId: w.id,
        workerName: w.name,
        status: 'present_full',
        hoursWorked: 8,
        dailyWage: w.rate,
        hourlyWage: Math.round(w.rate / 8),
        calculatedWage: w.rate,
        linkedSiteWorkId: savedReportId,
        remarks: `Assigned to ${finalCategory} (${workDescription.slice(0, 30)})`,
      }));
      await saveAttendanceBatch(siteId, workDate, attendanceBatch);
    }

    setIsAddWorkModalOpen(false);
  };

  // Site Master Handlers
  const handleOpenSiteModal = (siteToEdit?: ConstructionSite) => {
    if (siteToEdit) {
      setEditingSite(siteToEdit);
      setSiteFormName(siteToEdit.name);
      setSiteFormAddress(siteToEdit.siteAddress);
      setSiteFormProject(siteToEdit.clientName);
      setSiteFormSupervisor(siteToEdit.supervisorName);
      setSiteFormStatus(siteToEdit.status);
      setSiteFormStartDate(siteToEdit.startDate);
      setSiteFormRemarks(siteToEdit.remarks || '');
    } else {
      setEditingSite(null);
      setSiteFormName('');
      setSiteFormAddress('Mairwa, Bihar');
      setSiteFormProject('Civil & Shuttering Project');
      setSiteFormSupervisor(user?.name || 'Kalindra Kumar Singh');
      setSiteFormStatus('active');
      setSiteFormStartDate(todayStr);
      setSiteFormRemarks('');
    }
    setIsSiteModalOpen(true);
  };

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteFormName.trim()) return;

    if (editingSite) {
      await updateSite(editingSite.id, {
        name: siteFormName.trim(),
        siteAddress: siteFormAddress,
        clientName: siteFormProject,
        supervisorName: siteFormSupervisor,
        status: siteFormStatus,
        startDate: siteFormStartDate,
        remarks: siteFormRemarks,
      });
      // also ensure site rename propagation
      await renameSite(editingSite.id, siteFormName.trim());
    } else {
      await createSite({
        name: siteFormName.trim(),
        siteAddress: siteFormAddress,
        clientName: siteFormProject,
        supervisorName: siteFormSupervisor,
        status: siteFormStatus,
        startDate: siteFormStartDate,
        remarks: siteFormRemarks,
      });
    }

    setIsSiteModalOpen(false);
  };

  // Media capture and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingMedia(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append('files', f));
      formData.append('siteId', siteId);
      formData.append('caption', `${workCategory} progress`);
      const newMedia = await uploadMediaFiles(formData);
      setAttachedMedia((prev) => [...prev, ...newMedia]);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleExportPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-24 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      {/* Title & Top Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-500" />
            <h1 className="text-lg font-bold text-white">Site Work Management • साइट कार्य प्रबंधन</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Daily work records, shuttering & civil categories, worker tagging, photos/videos, and site register
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub tabs */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
            <button
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'records'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily Work Records ({siteReports.length})
            </button>
            <button
              onClick={() => setActiveTab('sites')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'sites'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Site Details ({sites.length})
            </button>
          </div>

          {activeTab === 'records' ? (
            <button
              onClick={() => handleOpenAddWork()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Daily Site Work</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenSiteModal()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Construction Site</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'records' ? (
        /* DAILY WORK RECORDS TAB */
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search daily site work by task description, site name, category, worker name..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Filter Site</label>
                <select
                  value={selectedSiteFilter}
                  onChange={(e) => setSelectedSiteFilter(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                >
                  <option value="all">All Sites (सभी साइट्स)</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Category</label>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                >
                  <option value="all">All Categories</option>
                  {STANDARD_WORK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Status</label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                >
                  <option value="all">All Statuses</option>
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">From Date</label>
                  <input
                    type="date"
                    value={dateFilterStart}
                    onChange={(e) => setDateFilterStart(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">To Date</label>
                  <input
                    type="date"
                    value={dateFilterEnd}
                    onChange={(e) => setDateFilterEnd(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Records List / Grid */}
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <ClipboardList className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <h3 className="text-sm font-bold text-slate-300">No daily site work records found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Click "Add Daily Site Work" to log completed shuttering, reinforcement, or concreting work.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.map((report) => {
                const statusColor =
                  report.workStatus === 'Completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : report.workStatus === 'In Progress'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    : report.workStatus === 'Planned'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

                return (
                  <div
                    key={report.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header: Date, Status, Site */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                            {report.reportDate}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusColor}`}>
                            {report.workStatus || 'Completed'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-amber-500" />
                          <span>{report.siteName}</span>
                        </span>
                      </div>

                      {/* Category Badge & Task Description */}
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md inline-block mb-1.5">
                          {report.workCategory}
                        </span>
                        <h3 className="text-sm font-bold text-white leading-snug">
                          {report.workDescription || report.workCompletedToday}
                        </h3>
                      </div>

                      {/* Work Metrics: Quantity, Time, Materials */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800/60 mt-2">
                        {report.quantityCompleted > 0 && (
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="text-slate-400">Quantity:</span>
                            <strong className="text-white">
                              {report.quantityCompleted} {report.unit}
                            </strong>
                          </div>
                        )}
                        {report.workStartTime && (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>
                              {report.workStartTime} - {report.workEndTime || '05:00 PM'}
                            </span>
                          </div>
                        )}
                        {report.materialsUsed && (
                          <div className="col-span-2 text-[11px] text-slate-400">
                            <span className="text-slate-500">Materials: </span>
                            <span className="text-slate-300">{report.materialsUsed}</span>
                          </div>
                        )}
                      </div>

                      {/* Tagged Workers List */}
                      {report.workerNames && report.workerNames.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                            Workers Involved ({report.workerNames.length}):
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {report.workerNames.map((name, i) => {
                              const wId = report.workerIds?.[i];
                              const workerObj = workers.find((item) => item.id === wId || item.name === name);
                              return (
                                <button
                                  key={i}
                                  onClick={() => workerObj && setViewWorker(workerObj)}
                                  className="text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1 transition"
                                >
                                  <Users className="w-2.5 h-2.5 text-amber-400" />
                                  <span>{name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Photos & Videos attached */}
                      {report.mediaItems && report.mediaItems.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-semibold text-slate-400 block mb-1">Site Media:</span>
                          <div className="flex items-center gap-2 overflow-x-auto py-1">
                            {report.mediaItems.map((m) => (
                              <div
                                key={m.id}
                                className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0 shadow relative group"
                              >
                                {m.type === 'video' ? (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-amber-400">
                                    <Play className="w-5 h-5" />
                                  </div>
                                ) : (
                                  <img src={m.dataUrl} alt={m.caption} className="w-full h-full object-cover" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-2">
                      <span className="text-[10px] text-slate-500">
                        Supervisor: {report.supervisorName}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenAddWork(report)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Edit className="w-3 h-3 text-amber-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete site work record for ${report.siteName} on ${report.reportDate}?`)) {
                              await deleteSiteReport(report.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                          title="Delete work record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* SITES DETAILS TAB */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeSites.map((site) => (
              <div
                key={site.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-sm space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                      {site.id}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      {site.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base mt-1">{site.name}</h3>
                  <p className="text-xs text-slate-400">{site.siteAddress}</p>

                  <div className="pt-2 space-y-1 text-xs text-slate-300 border-t border-slate-800/60 mt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Project / Client:</span>
                      <span className="text-white font-medium">{site.clientName || 'Civil Contractor'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Site Supervisor:</span>
                      <span className="text-amber-400 font-medium">{site.supervisorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Start Date:</span>
                      <span className="text-slate-300 font-mono">{site.startDate || '—'}</span>
                    </div>
                    {site.remarks && (
                      <p className="text-[11px] text-slate-400 pt-1 italic">
                        "{site.remarks}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenSiteModal(site)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit / Rename</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT DAILY SITE WORK */}
      {isAddWorkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleSaveDailyWork}
            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl my-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">
                  {editingReport ? 'Edit Daily Site Work' : 'Add Daily Site Work • दैनिक साइट कार्य'}
                </h3>
                <p className="text-xs text-slate-400">
                  Log shuttering, civil work, worker tagging, and progress measurements
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddWorkModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Work Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Work Date (तारीख) *
                </label>
                <input
                  type="date"
                  required
                  value={workDate}
                  onChange={(e) => setWorkDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Site Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Site Name (साइट का चयन) *
                </label>
                <select
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-hidden focus:border-amber-500"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Work Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Work Category (कार्य की श्रेणी) *
              </label>
              <select
                value={workCategory}
                onChange={(e) => setWorkCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-hidden focus:border-amber-500"
              >
                {STANDARD_WORK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {workCategory === 'Custom / Other' && (
                <input
                  type="text"
                  required
                  placeholder="Enter custom work category..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full mt-2 bg-slate-800 border border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white"
                />
              )}
            </div>

            {/* Work Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Work Description (कार्य का पूरा विवरण) *
              </label>
              <textarea
                required
                rows={3}
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="e.g. Staircase shuttering completed from 1st to 2nd landing with iron pipe staging and ply bottom alignment."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Tag Workers Involved */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  <span>Workers Involved ({selectedWorkerIds.length} Selected)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedWorkerIds(workers.map((w) => w.id))}
                    className="text-[10px] text-amber-400 underline font-semibold"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedWorkerIds([])}
                    className="text-[10px] text-slate-400 underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                {workers.map((w) => {
                  const isSelected = selectedWorkerIds.includes(w.id);
                  return (
                    <button
                      type="button"
                      key={w.id}
                      onClick={() => handleToggleWorker(w.id)}
                      className={`p-2 rounded-lg text-left text-xs transition border flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{w.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-1">{w.id}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="linkAtt"
                  checked={linkWithAttendance}
                  onChange={(e) => setLinkWithAttendance(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="linkAtt" className="text-xs text-slate-400">
                  Automatically mark Full Day Attendance for selected workers on {workDate}
                </label>
              </div>
            </div>

            {/* Status, Time, Quantity */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={workStatus}
                  onChange={(e) => setWorkStatus(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white"
                >
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Planned">Planned</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Start Time</label>
                <input
                  type="text"
                  value={workStartTime}
                  onChange={(e) => setWorkStartTime(e.target.value)}
                  placeholder="08:00 AM"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
                <input
                  type="number"
                  value={quantityCompleted}
                  onChange={(e) => setQuantityCompleted(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white"
                >
                  {MEASUREMENT_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Material & Remarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Materials Used (सामग्री)
                </label>
                <input
                  type="text"
                  value={materialUsed}
                  onChange={(e) => setMaterialUsed(e.target.value)}
                  placeholder="e.g. 12mm ply 10 sheets, 2-inch nails, props 40 pcs"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Ready for rebar inspection"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            {/* Media Uploads */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-500" />
                <span>Upload Site Photographs / Video Clips</span>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose Photos / Videos</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {uploadingMedia && <span className="text-xs text-amber-400">Processing media...</span>}
              </div>

              {attachedMedia.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pt-2">
                  {attachedMedia.map((m, idx) => (
                    <div key={idx} className="w-14 h-14 rounded-xl overflow-hidden border border-slate-700 relative shrink-0">
                      <img src={m.dataUrl} alt={m.caption} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAttachedMedia((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddWorkModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Save Site Work Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT CONSTRUCTION SITE */}
      {isSiteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSaveSite}
            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingSite ? `Edit Site: ${editingSite.name}` : 'Add Construction Site'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSiteModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Site Name *</label>
              <input
                type="text"
                required
                value={siteFormName}
                onChange={(e) => setSiteFormName(e.target.value)}
                placeholder="e.g. Indoor gymnasium / Type 4 / M.B.B.S balapar / S.R 2 / Balapar ramp"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Site Address / Location</label>
              <input
                type="text"
                value={siteFormAddress}
                onChange={(e) => setSiteFormAddress(e.target.value)}
                placeholder="e.g. Bargawn Road, Mairwa / Siwan, Bihar"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  value={siteFormProject}
                  onChange={(e) => setSiteFormProject(e.target.value)}
                  placeholder="e.g. Hospital Block / Sports Complex"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Supervisor</label>
                <input
                  type="text"
                  value={siteFormSupervisor}
                  onChange={(e) => setSiteFormSupervisor(e.target.value)}
                  placeholder="e.g. Kalindra Kumar Singh"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={siteFormStatus}
                  onChange={(e) => setSiteFormStatus(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="active">Active</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={siteFormStartDate}
                  onChange={(e) => setSiteFormStartDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Remarks</label>
              <textarea
                rows={2}
                value={siteFormRemarks}
                onChange={(e) => setSiteFormRemarks(e.target.value)}
                placeholder="Site scope, special shuttering requirements..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsSiteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Save Site
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WORKER PROFILE MODAL */}
      <WorkerProfileModal
        isOpen={!!viewWorker}
        onClose={() => setViewWorker(null)}
        worker={viewWorker}
      />
    </div>
  );
};
