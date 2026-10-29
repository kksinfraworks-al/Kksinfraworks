import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Worker } from '../../types';
import { WorkerModal } from './WorkerModal';
import { WorkerProfileModal } from './WorkerProfileModal';
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  Briefcase,
  IndianRupee,
  Edit,
  Trash2,
  Building2,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react';

export const WorkerList: React.FC<{ initialCreateOpen?: boolean }> = ({ initialCreateOpen = false }) => {
  const { workers, sites, createWorker, updateWorker, deleteWorker } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('active');
  const [selectedTradeFilter, setSelectedTradeFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(initialCreateOpen);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [selectedProfileWorker, setSelectedProfileWorker] = useState<Worker | null>(null);

  // Available unique trade categories
  const trades = useMemo(() => {
    const set = new Set<string>();
    workers.forEach((w) => w.workCategory && set.add(w.workCategory));
    return Array.from(set);
  }, [workers]);

  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const matchSearch =
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.villageAddress || w.village || w.fullAddress || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.mobile.includes(searchTerm) ||
        w.workCategory.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSite =
        selectedSiteFilter === 'all' || w.assignedSiteId === selectedSiteFilter;

      const matchStatus =
        selectedStatusFilter === 'all' || w.status === selectedStatusFilter;

      const matchTrade =
        selectedTradeFilter === 'all' || w.workCategory === selectedTradeFilter;

      return matchSearch && matchSite && matchStatus && matchTrade;
    });
  }, [workers, searchTerm, selectedSiteFilter, selectedStatusFilter, selectedTradeFilter]);

  const handleEdit = (w: Worker) => {
    setEditingWorker(w);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingWorker(null);
    setIsModalOpen(true);
  };

  const handleSaveWorker = async (workerData: Partial<Worker>) => {
    if (editingWorker) {
      await updateWorker(editingWorker.id, workerData);
    } else {
      await createWorker(workerData);
    }
  };

  const handleDelete = async (w: Worker) => {
    if (window.confirm(`Deactivate worker ${w.name} (${w.id})? This will mark their profile as inactive.`)) {
      await deleteWorker(w.id);
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <h1 className="text-lg font-bold text-white">Worker Management • मजदूर विवरण</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Total {workers.length} workers registered ({workers.filter((w) => w.status === 'active').length} active)
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Worker (नया मजदूर)</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by worker name, ID (e.g. KKS001), village, mobile, or trade..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Site filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">
              Filter by Site
            </label>
            <select
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
            >
              <option value="all">All Construction Sites</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Trade filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">
              Filter by Trade
            </label>
            <select
              value={selectedTradeFilter}
              onChange={(e) => setSelectedTradeFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
            >
              <option value="all">All Trades / श्रेणी</option>
              {trades.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">
              Status
            </label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (सक्रिय)</option>
              <option value="inactive">Inactive (निष्क्रिय)</option>
              <option value="left">Left Firm</option>
            </select>
          </div>
        </div>
      </div>

      {/* Worker Cards Grid */}
      {filteredWorkers.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <Users className="w-12 h-12 mx-auto text-slate-600 mb-2" />
          <h3 className="text-sm font-bold text-slate-300">No workers match your filter</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search criteria or add a new worker.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredWorkers.map((w) => (
            <div
              key={w.id}
              className={`bg-slate-900/90 border rounded-2xl p-4 transition shadow-sm flex flex-col justify-between ${
                w.status === 'active'
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-slate-800/50 opacity-60'
              }`}
            >
              <div>
                {/* Header: Photo, Name, ID, Status */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-13 h-13 rounded-xl overflow-hidden bg-slate-800 border border-amber-500/40 shrink-0">
                    {w.photo ? (
                      <img src={w.photo} alt={w.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm bg-slate-800">
                        {w.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
                        {w.id}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          w.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white truncate mt-0.5">{w.name}</h3>
                    {w.fatherName && (
                      <p className="text-[11px] text-slate-400 truncate">
                        S/o {w.fatherName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                      <span>Trade & Skill:</span>
                    </span>
                    <span className="font-semibold text-amber-300 text-right text-[11px]">
                      {w.workCategory} ({w.skillLevel})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
                      <span>Rate:</span>
                    </span>
                    <span className="font-bold text-white text-[11px]">
                      ₹{w.rate} / {w.wageType === 'daily' ? 'day' : 'month'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Assigned Site:</span>
                    </span>
                    <span className="text-slate-300 truncate max-w-[160px] text-[11px] font-medium text-right">
                      {w.assignedSiteName}
                    </span>
                  </div>

                  {w.villageAddress && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{w.villageAddress}</span>
                    </div>
                  )}

                  {w.mobile && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{w.mobile}</span>
                      </span>
                      <a
                        href={`tel:${w.mobile}`}
                        className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg hover:bg-emerald-500/20 transition flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => setSelectedProfileWorker(w)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                  title="Open Complete Worker Profile & 8-Tab Hisab-Kitaab"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Profile & Ledger</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEdit(w)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit</span>
                  </button>
                  {w.status === 'active' && (
                    <button
                      onClick={() => handleDelete(w)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                      title="Deactivate worker"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Worker Profile Modal (8-Tab Complete Hisab-Kitaab) */}
      <WorkerProfileModal
        isOpen={!!selectedProfileWorker}
        onClose={() => setSelectedProfileWorker(null)}
        worker={selectedProfileWorker}
      />

      {/* Worker Edit/Create Modal */}
      <WorkerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWorker}
        worker={editingWorker}
        sites={sites}
      />
    </div>
  );
};
