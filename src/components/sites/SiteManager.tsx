import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ConstructionSite, SiteStatus } from '../../types';
import {
  Building2,
  Plus,
  MapPin,
  Calendar,
  User,
  Layers,
  Edit,
  X,
  AlertCircle,
  Save,
  Clock,
  CheckCircle2,
  Pencil,
  RotateCcw,
} from 'lucide-react';

const ALL_WORK_CATEGORIES = [
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

export const SiteManager: React.FC = () => {
  const { sites, createSite, updateSite, renameSite, resetToStandardSites } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<ConstructionSite | null>(null);

  // Quick Rename states
  const [quickRenameSite, setQuickRenameSite] = useState<ConstructionSite | null>(null);
  const [quickRenameName, setQuickRenameName] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form states
  const [siteId, setSiteId] = useState('');
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [completeAddress, setCompleteAddress] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('');
  const [status, setStatus] = useState<SiteStatus>('active');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Column Shuttering',
    'Beam Shuttering',
    'Slab Shuttering',
  ]);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingSite(null);
    setSiteId(`SITE-0${sites.length + 1}`);
    setName('');
    setClientName('');
    setCompleteAddress('');
    setSupervisor('Ramesh Sharma');
    setStartDate(new Date().toISOString().split('T')[0]);
    setExpectedCompletionDate('');
    setStatus('active');
    setSelectedCategories(['Column Shuttering', 'Beam Shuttering', 'Slab Shuttering']);
    setRemarks('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (site: ConstructionSite) => {
    setEditingSite(site);
    setSiteId(site.id);
    setName(site.name);
    setClientName(site.clientName);
    setCompleteAddress(site.completeAddress || site.siteAddress || '');
    setSupervisor(site.supervisor || site.supervisorName || '');
    setStartDate(site.startDate);
    setExpectedCompletionDate(site.expectedCompletionDate || '');
    setStatus(site.status);
    setSelectedCategories(site.workCategories || []);
    setRemarks(site.remarks || '');
    setIsModalOpen(true);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !completeAddress.trim()) {
      setError('Site name and complete address are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      id: siteId.trim(),
      name: name.trim(),
      clientName: clientName.trim(),
      completeAddress: completeAddress.trim(),
      supervisor: supervisor.trim(),
      startDate,
      expectedCompletionDate,
      status,
      workCategories: selectedCategories,
      remarks: remarks.trim(),
    };

    try {
      if (editingSite) {
        await updateSite(editingSite.id, payload);
      } else {
        await createSite(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuickRename = (site: ConstructionSite) => {
    setQuickRenameSite(site);
    setQuickRenameName(site.name);
  };

  const handleSaveQuickRename = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickRenameSite || !quickRenameName.trim()) return;

    try {
      const res = await renameSite(quickRenameSite.id, quickRenameName.trim());
      setSuccessToast(`✓ Site renamed to "${res.name}" successfully!`);
      setQuickRenameSite(null);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      setError(err?.message || 'Failed to rename site');
    }
  };

  const handleResetStandard = async () => {
    if (confirm('Reset to 6 standard KKSInfraWorks sites (Indoor gymnasium, Type 4, M.B.B.S balapar, S.R 2, Balapar ramp, Other)?')) {
      await resetToStandardSites();
      setSuccessToast('✓ Standard 6 sites restored successfully!');
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-bold text-white">Construction Sites Register • निर्माण स्थल</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage active projects, civil shuttering categories, supervisors, and site locations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetStandard}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Restore 6 Sites (मानक 6 साइट्स)</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Construction Site (नई साइट)</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successToast && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* 6 Standard Sites Quick Chips */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
            All 6 Project Sites (सभी 6 निर्माण स्थल - नाम बदलने के लिए पेंसिल पर टैप करें):
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {sites.map((s) => (
            <div
              key={s.id}
              onClick={() => handleOpenQuickRename(s)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs cursor-pointer hover:border-amber-500/50 transition group"
            >
              <span className="font-mono text-[10px] text-amber-400">{s.id}:</span>
              <span className="font-semibold text-white">{s.name}</span>
              <Pencil className="w-3 h-3 text-slate-400 group-hover:text-amber-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.map((site) => (
          <div
            key={site.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                  {site.id}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                    site.status === 'active' || site.status === 'in_progress'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : site.status === 'completed'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {site.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-white leading-snug">{site.name}</h3>
                <button
                  type="button"
                  onClick={() => handleOpenQuickRename(site)}
                  title="Rename Site (नाम बदलें)"
                  className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition shrink-0"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              {site.clientName && (
                <p className="text-xs text-slate-400 mt-0.5">Client: {site.clientName}</p>
              )}

              <p className="text-xs text-slate-300 mt-2 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{site.completeAddress}</span>
              </p>

              <div className="mt-3 pt-3 border-t border-slate-800 space-y-1 text-xs text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Site Supervisor:</span>
                  <span className="font-semibold text-white">{site.supervisor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Assigned Workers:</span>
                  <span className="font-semibold text-amber-400">{site.assignedWorkerCount || 0} active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Duration:</span>
                  <span className="text-slate-300">
                    {site.startDate} {site.expectedCompletionDate ? `to ${site.expectedCompletionDate}` : ''}
                  </span>
                </div>
              </div>

              {/* Work categories badges */}
              <div className="mt-3">
                <label className="block text-[10px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Work Categories:
                </label>
                <div className="flex flex-wrap gap-1">
                  {(site.workCategories || []).map((cat) => (
                    <span
                      key={cat}
                      className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/80"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {site.remarks && (
                <p className="text-[11px] text-slate-400 italic mt-3 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  {site.remarks}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleOpenQuickRename(site)}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Rename (नाम बदलें)</span>
              </button>

              <button
                onClick={() => handleOpenEdit(site)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Edit className="w-3.5 h-3.5 text-blue-400" />
                <span>Edit Site Info</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Site Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl my-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingSite ? `Edit Site: ${editingSite.name}` : 'Add Construction Site'}
              </h3>
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

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Site ID *
                  </label>
                  <input
                    type="text"
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                    placeholder="e.g. SITE-04"
                    disabled={!!editingSite}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500 disabled:opacity-60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Project Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SiteStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="active">Active (चालू साइट)</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed (पूर्ण)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Site Name (साइट का नाम) *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mairwa Commercial Complex G+4"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Client / Developer Name
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Mairwa Plaza Dev Corp"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Complete Site Address (पूरा पता) *
                  </label>
                  <textarea
                    rows={2}
                    value={completeAddress}
                    onChange={(e) => setCompleteAddress(e.target.value)}
                    placeholder="e.g. Bargawn Road, Near Railway Crossing, Mairwa, Bihar – 841239"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Site Supervisor
                  </label>
                  <input
                    type="text"
                    value={supervisor}
                    onChange={(e) => setSupervisor(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Civil & Shuttering Work Categories (कार्य श्रेणियां)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_WORK_CATEGORIES.map((cat) => {
                      const selected = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                            selected
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Site Remarks
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Heavy shuttering props deployed on site"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                  />
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
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {loading ? 'Saving Site...' : 'Save Construction Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Quick Rename Modal */}
      {quickRenameSite && (
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
                onClick={() => setQuickRenameSite(null)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 mb-1">
                Site ID: <strong className="text-slate-200">{quickRenameSite.id}</strong> (वर्तमान नाम: {quickRenameSite.name})
              </p>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Site Name (नया नाम दर्ज करें) *
              </label>
              <input
                type="text"
                value={quickRenameName}
                onChange={(e) => setQuickRenameName(e.target.value)}
                placeholder="e.g. Indoor gymnasium / Type 4 / M.B.B.S balapar"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setQuickRenameSite(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel (रद्द करें)
              </button>
              <button
                type="button"
                onClick={handleSaveQuickRename}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-sm"
              >
                Save Name (नाम बदलें)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
