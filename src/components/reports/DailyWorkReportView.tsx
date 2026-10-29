import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { DailyWorkReport, MediaItem, ConstructionSite } from '../../types';
import {
  ClipboardPen,
  Plus,
  Calendar,
  Building2,
  Camera,
  Upload,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Clock,
  Layers,
  Wrench,
  ShieldAlert,
  Play,
  X,
  Languages,
  ChevronDown,
  Pencil,
  RotateCcw,
  Check,
  Edit,
} from 'lucide-react';

const WORK_CATEGORIES = [
  'Column Shuttering',
  'Beam Shuttering',
  'Slab Shuttering',
  'Staircase Shuttering',
  'Slab Concreting',
  'Column Concreting',
  'Beam Concreting',
  'Steel Fixing',
  'De-shuttering',
  'Material Shifting',
  'Other Civil Work',
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

export const DailyWorkReportView: React.FC<{ initialCreateOpen?: boolean }> = ({
  initialCreateOpen = false,
}) => {
  const { user } = useAuth();
  const {
    sites,
    siteReports,
    createSiteReport,
    uploadCameraPhoto,
    uploadMediaFiles,
    renameSite,
    resetToStandardSites,
  } = useData();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(initialCreateOpen);

  // Form states
  const [reportDate, setReportDate] = useState(todayStr);
  const [siteId, setSiteId] = useState(sites[0]?.id || 'SITE-01');
  const [workLocation, setWorkLocation] = useState('');
  const [workCategory, setWorkCategory] = useState('Staircase Shuttering');
  const [workCompletedToday, setWorkCompletedToday] = useState('');
  const [workInProgress, setWorkInProgress] = useState('');
  const [quantityCompleted, setQuantityCompleted] = useState<number>(0);
  const [unit, setUnit] = useState('sq ft');
  const [workersCount, setWorkersCount] = useState<number>(4);
  const [supervisorName, setSupervisorName] = useState(user?.name || 'Kalindra Kumar Singh');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [equipmentUsed, setEquipmentUsed] = useState('');
  const [workStartTime, setWorkStartTime] = useState('08:30 AM');
  const [workEndTime, setWorkEndTime] = useState('05:30 PM');
  const [qualitySafetyObservations, setQualitySafetyObservations] = useState('');
  const [hasProblemsOrDelays, setHasProblemsOrDelays] = useState(false);
  const [delayReason, setDelayReason] = useState('');
  const [descriptionHindiEnglish, setDescriptionHindiEnglish] = useState('');

  // Media attachments state
  const [attachedMedia, setAttachedMedia] = useState<MediaItem[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Site Rename States
  const [siteToRename, setSiteToRename] = useState<ConstructionSite | null>(null);
  const [renameInputVal, setRenameInputVal] = useState('');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isManageSitesOpen, setIsManageSitesOpen] = useState(false);
  const [renameSuccessMsg, setRenameSuccessMsg] = useState<string | null>(null);
  const [customOtherName, setCustomOtherName] = useState('');
  const [bulkEditNames, setBulkEditNames] = useState<Record<string, string>>({});
  const [savingSiteId, setSavingSiteId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Filtered reports
  const filteredReports = siteReports.filter((r) => {
    const matchSite = selectedSiteFilter === 'all' || r.siteId === selectedSiteFilter;
    const matchDate = !selectedDateFilter || r.reportDate === selectedDateFilter;
    return matchSite && matchDate;
  });

  const handleOpenRename = (targetSiteId: string, currentName?: string) => {
    const s = sites.find((item) => item.id === targetSiteId);
    if (s) {
      setSiteToRename(s);
      setRenameInputVal(s.name);
      setIsRenameModalOpen(true);
    }
  };

  const handleSaveRename = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!siteToRename || !renameInputVal.trim()) return;

    try {
      const updated = await renameSite(siteToRename.id, renameInputVal.trim());
      setRenameSuccessMsg(`✓ Site name updated to "${updated.name}"`);
      setIsRenameModalOpen(false);
      setTimeout(() => setRenameSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err?.message || 'Failed to rename site');
    }
  };

  const handleSaveSingleSiteFromManager = async (targetId: string) => {
    const newName = bulkEditNames[targetId];
    if (!newName || !newName.trim()) return;
    setSavingSiteId(targetId);
    try {
      const updated = await renameSite(targetId, newName.trim());
      setRenameSuccessMsg(`✓ Updated: ${updated.name}`);
      setTimeout(() => setRenameSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Update failed');
    } finally {
      setSavingSiteId(null);
    }
  };

  const handleOpenManageSites = () => {
    const initialMap: Record<string, string> = {};
    sites.forEach((s) => {
      initialMap[s.id] = s.name;
    });
    setBulkEditNames(initialMap);
    setIsManageSitesOpen(true);
  };

  const handleOpenCreate = () => {
    setReportDate(todayStr);
    setSiteId(sites[0]?.id || 'SITE-01');
    setWorkLocation('');
    setWorkCategory('Staircase Shuttering');
    setWorkCompletedToday('');
    setWorkInProgress('');
    setQuantityCompleted(0);
    setUnit('sq ft');
    setWorkersCount(4);
    setSupervisorName(user?.name || 'Ramesh Sharma');
    setMaterialsUsed('');
    setEquipmentUsed('');
    setQualitySafetyObservations('Line, plumb, and shuttering support checked.');
    setHasProblemsOrDelays(false);
    setDelayReason('');
    setDescriptionHindiEnglish('');
    setAttachedMedia([]);
    setIsModalOpen(true);
  };

  const handleCameraCapture = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setUploadingMedia(true);
        try {
          const item = await uploadCameraPhoto(
            dataUrl,
            workLocation ? `${workLocation} site photo` : 'Site Work Photo',
            siteId
          );
          setAttachedMedia((prev) => [...prev, item]);
        } catch (err: any) {
          setError(err.message || 'Failed to upload photo');
        } finally {
          setUploadingMedia(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async (files: FileList) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('siteId', siteId);
    formData.append('caption', workLocation || 'Work progress');

    setUploadingMedia(true);
    try {
      const items = await uploadMediaFiles(formData);
      setAttachedMedia((prev) => [...prev, ...items]);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workLocation.trim() || !descriptionHindiEnglish.trim()) {
      setError('Work location and bilingual description are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const site = sites.find((s) => s.id === siteId);

    const payload: Partial<DailyWorkReport> = {
      reportDate,
      siteId,
      siteName: site?.name || 'Site',
      workLocation: workLocation.trim(),
      workCategory,
      workCompletedToday: workCompletedToday.trim(),
      workInProgress: workInProgress.trim(),
      quantityCompleted: Number(quantityCompleted) || 0,
      unit,
      workersCount: Number(workersCount) || 1,
      supervisorName: supervisorName.trim(),
      materialsUsed: materialsUsed.trim(),
      equipmentUsed: equipmentUsed.trim(),
      workStartTime,
      workEndTime,
      qualitySafetyObservations: qualitySafetyObservations.trim(),
      hasProblemsOrDelays,
      delayReason: hasProblemsOrDelays ? delayReason.trim() : '',
      descriptionHindiEnglish: descriptionHindiEnglish.trim(),
      mediaItems: attachedMedia,
    };

    try {
      await createSiteReport(payload);
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to submit site report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardPen className="w-5 h-5 text-amber-500" />
            <h1 className="text-lg font-bold text-white">Daily Site Work Report • दैनिक कार्य प्रगति</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Log completed shuttering/civil quantities, delays, materials, and Hindi/English descriptions
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Daily Work Report (नई रिपोर्ट)</span>
        </button>
      </div>

      {/* Rename Success Toast */}
      {renameSuccessMsg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="font-semibold">{renameSuccessMsg}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-semibold text-slate-400">
              Filter by Construction Site (साइट फ़िल्टर)
            </label>
            <button
              type="button"
              onClick={handleOpenManageSites}
              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit / Rename All Sites (साइट्स का नाम बदलें)</span>
            </button>
          </div>
          <select
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">All Sites (सभी 6 साइट्स)</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
            Filter by Date (तारीख फ़िल्टर)
          </label>
          <input
            type="date"
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <ClipboardPen className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-300">No work reports found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Click the button above to record today's site work progress.
            </p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 hover:border-slate-700 transition"
            >
              {/* Header: Date, Site, Category, Quantity */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                      {report.workCategory}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Date: <strong className="text-slate-200">{report.reportDate}</strong>
                    </span>
                    {report.hasProblemsOrDelays && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Delay Reported
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{report.siteName}</h3>
                    <button
                      type="button"
                      onClick={() => handleOpenRename(report.siteId, report.siteName)}
                      title="Rename Site (साइट का नाम बदलें)"
                      className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-medium text-slate-300">{report.workLocation}</span>
                  </p>
                </div>

                {report.quantityCompleted > 0 && (
                  <div className="sm:text-right shrink-0 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                    <span className="text-lg font-black text-emerald-400">
                      {report.quantityCompleted} {report.unit}
                    </span>
                    <p className="text-[10px] text-slate-400">Quantity Completed</p>
                  </div>
                )}
              </div>

              {/* Bilingual Description Card */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-1">
                  <Languages className="w-4 h-4" />
                  <span>Work Description (Hindi & English)</span>
                </div>
                <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                  {report.descriptionHindiEnglish}
                </p>
              </div>

              {/* Progress & Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {report.workCompletedToday && (
                  <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Completed Today:</span>
                    <p className="text-slate-200 font-medium mt-0.5">{report.workCompletedToday}</p>
                  </div>
                )}
                {report.workInProgress && (
                  <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">In Progress:</span>
                    <p className="text-amber-300 font-medium mt-0.5">{report.workInProgress}</p>
                  </div>
                )}
                {report.materialsUsed && (
                  <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Materials Used:</span>
                    <p className="text-slate-200 mt-0.5">{report.materialsUsed}</p>
                  </div>
                )}
                {report.equipmentUsed && (
                  <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Equipment:</span>
                    <p className="text-slate-200 mt-0.5">{report.equipmentUsed}</p>
                  </div>
                )}
              </div>

              {/* Delay Reason Notice */}
              {report.hasProblemsOrDelays && report.delayReason && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Reason for Delay: </strong>
                    <span>{report.delayReason}</span>
                  </div>
                </div>
              )}

              {/* Attached Photos / Videos */}
              {report.mediaItems && report.mediaItems.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                    Attached Site Photos / Videos ({report.mediaItems.length}):
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {report.mediaItems.map((m) => (
                      <div
                        key={m.id}
                        className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 group"
                      >
                        {m.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-slate-950">
                            <Play className="w-6 h-6 text-amber-400" />
                          </div>
                        ) : (
                          <img src={m.url} alt={m.caption} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer details */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                <span>Supervisor: <strong className="text-slate-200">{report.supervisorName}</strong></span>
                <span>Workers: <strong className="text-slate-200">{report.workersCount}</strong></span>
                <span>Shift: {report.workStartTime} - {report.workEndTime}</span>
                <span>Submitted by: {report.submittedByName}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Site Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl my-6 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Create Daily Site Work Report • दैनिक कार्य रिपोर्ट
                </h3>
                <p className="text-xs text-slate-400">KKSInfraWorks Daily Site Work Register</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-3 p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Construction Site (निर्माण स्थल) *
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenRename(siteId)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Rename Site (नाम बदलें)</span>
                    </button>
                  </div>
                  <select
                    value={siteId}
                    onChange={(e) => {
                      setSiteId(e.target.value);
                      setCustomOtherName('');
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    required
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id})
                      </option>
                    ))}
                  </select>

                  {(sites.find((s) => s.id === siteId)?.name?.toLowerCase() === 'other' || siteId === 'SITE-06') && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                        <span>Custom Site Name (अन्य साइट का नाम बदलें):</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customOtherName}
                          onChange={(e) => setCustomOtherName(e.target.value)}
                          placeholder="e.g. Balapar Hospital Wing / NH Bypass"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!customOtherName.trim()) return;
                            try {
                              const res = await renameSite(siteId, customOtherName.trim());
                              setRenameSuccessMsg(`✓ Site name updated to "${res.name}"`);
                              setTimeout(() => setRenameSuccessMsg(null), 3500);
                            } catch (err: any) {
                              setError(err.message || 'Failed to rename');
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm shrink-0"
                        >
                          Save Name (नाम बदलें)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Report Date *
                  </label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Work Location within Site (साइट पर कार्य का स्थान) *
                  </label>
                  <input
                    type="text"
                    value={workLocation}
                    onChange={(e) => setWorkLocation(e.target.value)}
                    placeholder="e.g. Indoor Gymnasium: Staircase shuttering & 2nd floor lift well"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Work Category *
                  </label>
                  <select
                    value={workCategory}
                    onChange={(e) => setWorkCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    {WORK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Quantity Completed & Unit
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      value={quantityCompleted}
                      onChange={(e) => setQuantityCompleted(Number(e.target.value))}
                      placeholder="e.g. 180"
                      className="w-28 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    >
                      {MEASUREMENT_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Work Completed Today (आज का पूरा हुआ कार्य)
                  </label>
                  <input
                    type="text"
                    value={workCompletedToday}
                    onChange={(e) => setWorkCompletedToday(e.target.value)}
                    placeholder="e.g. Staircase shuttering 14 risers completed"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Work Currently In Progress (प्रगति पर कार्य)
                  </label>
                  <input
                    type="text"
                    value={workInProgress}
                    onChange={(e) => setWorkInProgress(e.target.value)}
                    placeholder="e.g. Concrete work pending approval"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Workers Involved & Supervisor
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={workersCount}
                      onChange={(e) => setWorkersCount(Number(e.target.value))}
                      className="w-20 bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white text-center focus:outline-hidden focus:border-amber-500"
                      title="Workers Count"
                    />
                    <input
                      type="text"
                      value={supervisorName}
                      onChange={(e) => setSupervisorName(e.target.value)}
                      placeholder="Supervisor name"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Shift Timings (Start - End)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={workStartTime}
                      onChange={(e) => setWorkStartTime(e.target.value)}
                      placeholder="08:30 AM"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    />
                    <input
                      type="text"
                      value={workEndTime}
                      onChange={(e) => setWorkEndTime(e.target.value)}
                      placeholder="05:30 PM"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Materials Used (सामग्री)
                  </label>
                  <input
                    type="text"
                    value={materialsUsed}
                    onChange={(e) => setMaterialsUsed(e.target.value)}
                    placeholder="e.g. 12mm ply 14 sheets, steel props 24 pcs"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Equipment Used (उपकरण / मशीनें)
                  </label>
                  <input
                    type="text"
                    value={equipmentUsed}
                    onChange={(e) => setEquipmentUsed(e.target.value)}
                    placeholder="e.g. Circular saw, Level tube, needle vibrator"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Quality & Safety Observations (गुणवत्ता व सुरक्षा निरीक्षण)
                  </label>
                  <input
                    type="text"
                    value={qualitySafetyObservations}
                    onChange={(e) => setQualitySafetyObservations(e.target.value)}
                    placeholder="e.g. Line, level and plumb checked thoroughly. Propping spacing 900mm."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                {/* Delay toggle */}
                <div className="col-span-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasProblemsOrDelays}
                      onChange={(e) => setHasProblemsOrDelays(e.target.checked)}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <span className="text-xs font-bold text-amber-300">
                      Did this work encounter any problem, bottleneck or delay? (कोई समस्या / विलंब?)
                    </span>
                  </label>

                  {hasProblemsOrDelays && (
                    <div className="mt-2.5">
                      <label className="block text-[11px] font-semibold text-rose-300 mb-1">
                        Reason for Delay (विलंब का कारण) *
                      </label>
                      <input
                        type="text"
                        value={delayReason}
                        onChange={(e) => setDelayReason(e.target.value)}
                        placeholder="e.g. Heavy rain interrupted concrete pour; client drawing revision awaited"
                        className="w-full bg-slate-900 border border-rose-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-rose-500"
                        required={hasProblemsOrDelays}
                      />
                    </div>
                  )}
                </div>

                {/* Large Bilingual Description Box */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Daily Work Description (Hindi or English) *</span>
                    <span className="text-[10px] text-amber-400">विस्तृत दैनिक विवरण</span>
                  </label>
                  <textarea
                    rows={4}
                    value={descriptionHindiEnglish}
                    onChange={(e) => setDescriptionHindiEnglish(e.target.value)}
                    placeholder="Example: Indoor Gymnasium: Staircase shuttering completed. Concrete work is pending. The shuttering material will be removed after approval and reused near the lift staircase.&#10;&#10;(इंडोर जिमनेजियम: सीढ़ी की शटरिंग का काम पूरा कर लिया गया है। कंक्रीट के बाद इसे लिफ्ट के पास इस्तेमाल किया जाएगा।)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 leading-relaxed font-sans"
                    required
                  />
                </div>

                {/* Photo & Video Attachment Buttons */}
                <div className="col-span-2 bg-slate-800/40 p-3 rounded-xl border border-slate-700/60">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Attach Site Photos & Videos (साइट फोटो/वीडियो संलग्न करें)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Files</span>
                    </button>

                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleCameraCapture(e.target.files[0])}
                    />

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    />
                  </div>

                  {uploadingMedia && (
                    <p className="text-xs text-amber-400 mt-2 animate-pulse">
                      Uploading and compressing media...
                    </p>
                  )}

                  {attachedMedia.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {attachedMedia.map((m, idx) => (
                        <div
                          key={idx}
                          className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-amber-500/50 group"
                        >
                          <img src={m.url} alt="Attached" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() =>
                              setAttachedMedia((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition disabled:opacity-50"
                >
                  {loading ? 'Submitting Report...' : 'Submit Daily Work Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Single Site Rename Modal */}
      {isRenameModalOpen && siteToRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-white">
                  Rename Construction Site • साइट का नाम बदलें
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRenameModalOpen(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 mb-1">
                Site ID: <strong className="text-slate-200">{siteToRename.id}</strong> (वर्तमान नाम: {siteToRename.name})
              </p>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Site Name (नया नाम दर्ज करें) *
              </label>
              <input
                type="text"
                value={renameInputVal}
                onChange={(e) => setRenameInputVal(e.target.value)}
                placeholder="e.g. Indoor gymnasium / Type 4 / M.B.B.S balapar"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsRenameModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel (रद्द करें)
              </button>
              <button
                type="button"
                onClick={handleSaveRename}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-sm"
              >
                Save Name (नाम बदलें)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage & Rename All Sites Modal */}
      {isManageSitesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl my-6 max-h-[90vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-white">
                    Rename All Construction Sites • सभी साइट्स का नाम बदलें
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Change names of Indoor gymnasium, Type 4, M.B.B.S balapar, S.R 2, Balapar ramp, Other
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsManageSitesOpen(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {sites.map((site, index) => (
                <div
                  key={site.id}
                  className="p-3 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono bg-slate-900 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                        {site.id}
                      </span>
                      <span className="text-[11px] text-slate-400">Site #{index + 1}</span>
                    </div>
                    <input
                      type="text"
                      value={bulkEditNames[site.id] !== undefined ? bulkEditNames[site.id] : site.name}
                      onChange={(e) =>
                        setBulkEditNames((prev) => ({ ...prev, [site.id]: e.target.value }))
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-500 font-semibold"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={savingSiteId === site.id}
                    onClick={() => handleSaveSingleSiteFromManager(site.id)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm shrink-0 self-end sm:self-auto disabled:opacity-50"
                  >
                    {savingSiteId === site.id ? 'Saving...' : 'Save Name (नाम बदलें)'}
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Reset to 6 standard KKSInfraWorks sites (Indoor gymnasium, Type 4, M.B.B.S balapar, S.R 2, Balapar ramp, Other)?')) {
                    await resetToStandardSites();
                    const initialMap: Record<string, string> = {
                      'SITE-01': 'Indoor gymnasium',
                      'SITE-02': 'Type 4',
                      'SITE-03': 'M.B.B.S balapar',
                      'SITE-04': 'S.R 2',
                      'SITE-05': 'Balapar ramp',
                      'SITE-06': 'Other',
                    };
                    setBulkEditNames(initialMap);
                    setRenameSuccessMsg('✓ Standard 6 sites restored successfully!');
                    setTimeout(() => setRenameSuccessMsg(null), 3000);
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore 6 Default Standard Sites (मानक 6 नाम रीसेट करें)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsManageSitesOpen(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close (बंद करें)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
